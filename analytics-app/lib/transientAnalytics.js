var redis = require('redis'),
    moment = require('moment'),
    async = require('async');

var transientAnalyticsSingleton = (function () {

    // reference to the Singleton
    var instance;

    function init(port, host) {
        var client;
        port = (typeof port === "undefined") ? null : port;
        host = (typeof host === "undefined") ? null : host;
        client = redis.createClient(port, host);

        client.on('error', function (error) {
            console.log(error.message);
        });

        return {
            // public property
            site: 'localhost',

            configure: function (post, host) {
                port = (typeof port === "undefined") ? null : port;
                host = (typeof host === "undefined") ? null : host;
                client.quit();
                client = redis.createClient(port, host);
            },

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
                client.get('anl:' + instance.site, function (err, total) {
                    callback(err, total);
                });
            },

            totalBySecondTaskFactory: function (time) {
                return function (callback) {
                    client.get('anl:' + instance.site + ':' + time, function (err, total) {
                        callback(err, total);
                    });
                };
            },

            browserTaskFactory: function (callback) {
                client.smembers('anl:browser', function (err, members) {
                    var browserQueries = [], i;

                    function makeFunc(brw) {
                        return function (callback) {
                            client.get('anl:' + instance.site + ':browser:' + brw, function (err, brwcount) {
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
                        callback(err, browsers);
                    });
                });
            },

            pageTaskFactory: function (callback) {
                client.keys('anl:' + instance.site + ':*:total', function (err, keys) {
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
                        i, re,
                        keyparts,
                        page;

                        for (i = 0; i < keys.length; i += 1) {
                            page = {};
                            re = new RegExp("^anl:" + instance.site + ":(.+):total$");
                            keyparts = re.exec(keys[i]);
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

            broadcastFactory: function (sockets) {
                return function broadcast(callback) {
                    async.parallel(
                        [instance.getTimeAsync, 
                         instance.getTotal, 
                         instance.browserTaskFactory, 
                         instance.pageTaskFactory, 
                         instance.totalBySecondTaskFactory(instance.getTime())
                        ],
                        function (err, results) {
                            sockets.in('dashboard').emit('send:dashboard', {time: results[0], 
                                                        total: results[1],
                                                        browsers: results[2], 
                                                        pages: results[3],
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
