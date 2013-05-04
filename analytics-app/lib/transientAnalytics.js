var redis = require('redis'),
    moment = require('moment'),
    async = require('async');

var transientAnalyticsSingleton = (function () {

    // reference to the Singleton
    var instance;

    function init() {

        var client = redis.createClient();

        client.on('error', function (error) {
            console.log(error.message);
        });

        return {

            store: function (req, res, next) {
                var site = req.host,
                    page = req.path,
                    ip = req.ip,
                    browser = req.useragent.Browser,
                    os = req.useragent.OS,
                    platform = req.useragent.Platform,
                    version = req.useragent.Version,
                    time = moment().format('YYYYMMDDHHmmss');

                client.sadd('anl:site', site);
                client.sadd('anl:browser', browser);
                client.sadd('anl:os', os);
                client.sadd('anl:platform', platform);
                client.sadd('anl:version', version);
                client.sadd('anl:ip', ip);

                // total
                client.incr('anl:' + site)

                // total / time
                client.incr('anl:' + site + ':' + time)

                //page
                client.incr('anl:' + site + ':' + page + ':total');

                //page / time
                client.incr('anl:' + site + ':' + page + ':time:' + time);

                // browser
                client.incr('anl:' + site + ':browser:' + browser);
                client.incr('anl:' + site + ':browser:' + browser + ':time:' + time);  

                client.incr('anl:os:' + os);
                client.incr('anl:platform:' + platform);
                client.incr('anl:version:' + version);
                client.incr('anl:' + site + ':' + page + ':ip:' + ip);

                next();
            },


            getTime: function () {
                return moment().format('YYYYMMDDHHmmss');
            },

            getTimeAsync: function (callback) {
                var time = instance.getTime();
                callback(null, time);
            },

            getTotal: function (callback) {
                client.get('anl:localhost', function (err, total) {
                    callback(err, total);
                });
            },

            totalBySecondFactory: function (time) {
                return function (callback) {
                    client.get('anl:localhost:' + time, function (err, total) {
                        callback(err, total);
                    });
                };
            },

            browserFunc: function (callback) {
                client.smembers('anl:browser', function (err, members) {
                    var browserQueries = [], i;

                    function makeFunc(brw) {
                        return function (callback) {
                            client.get('anl:localhost:browser:' + brw, function (err, brwcount) {
                                callback(err, brwcount);
                            });
                        };
                    }

                    for (i = 0; i < members.length; i += 1) {
                        browserQueries.push(makeFunc(members[i]));
                    }

                    async.parallel(browserQueries, function (err, results) {
                        var browsers = {};
                        for (i = 0; i < members.length; i += 1) {
                            browsers[members[i]] = results[i];
                        }
                        console.log(browsers);
                        callback(err, browsers);
                    });
                });
            },

            pageFunc: function (callback) {
                client.keys('anl:localhost:*:total', function (err, keys) {
                    var pages = [], i;

                    function makeFunc(page) {
                        return function (callback) {
                            client.get(page, function (err, pgcount) {
                                callback(err, pgcount);
                            });
                        };
                    }

                    for (i = 0; i < keys.length; i += 1) {
                        pages.push(makeFunc(keys[i]));
                    }

                    async.parallel(pages, function (err, results) {
                        var data = [],
                        i,
                        keyparts,
                        page;

                        for (i = 0; i < keys.length; i += 1) {
                            page = {};
                            keyparts = /^anl:localhost:(.+):total$/.exec(keys[i]);
                            if (keyparts !== null) {
                                page.name = keyparts[1];
                                page.pgcount = results[i];
                                data.push(page);
                            } else {
                                console.log("Error: " + keys[i]);
                            }
                        }
                        callback(err, data);
                    });
                });
            },

            broadcastFactory: function (socket) {
                return function broadcast(callback) {
                    async.parallel(
                        [instance.getTimeAsync, instance.getTotal, instance.browserFunc, instance.pageFunc, 
                         instance.totalBySecondFactory(instance.getTime())],
                        function (err, results) {
                            socket.in('dashboard').emit('send:dashboard', {time: results[0], 
                                                        total: results[1],
                                                        browser: results[2], 
                                                        page: results[3],
                                                        current: results[4]});
                        }
                    );
                };
            }
    
        }
    }

    return {
        // get instance if exists, create one if doesn't

        getInstance: function () {

            if (!instance) {
                instance = init();
            }

            return instance;
        }
    };

}());

module.exports = transientAnalyticsSingleton.getInstance();
