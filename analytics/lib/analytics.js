"use strict";
var moment = require('moment'),
    redis = require('redis'),
    async = require('async'),
    mongoose = require('mongoose'),
    db = redis.createClient(),
    mdb = mongoose.connection;

function mongoconnect(callback) {
    mongoose.connect('mongodb://localhost/anl');

    mdb.on('error', console.error.bind(console, 'connection error'));

    db.once('open', function (callback) {
        console.log("Mongodb database: anl");
    });
}

exports.mongoconnect = mongoconnect;

function store(req, res, next) {
    var site = req.host,
        page = req.path,
        ip = req.ip,
        browser = req.useragent.Browser,
        os = req.useragent.OS,
        platform = req.useragent.Platform,
        version = req.useragent.Version,
        time = moment().format('YYYYMMDDHHmmss');

    db.sadd('anl:site', site);
    db.sadd('anl:browser', browser);
    db.sadd('anl:os', os);
    db.sadd('anl:platform', platform);
    db.sadd('anl:version', version);
    db.sadd('anl:ip', ip);

    // total
    db.incr('anl:' + site)

    // total / time
    db.incr('anl:' + site + ':' + time)

    //page
    db.incr('anl:' + site + ':' + page + ':total');

    //page / time
    db.incr('anl:' + site + ':' + page + ':time:' + time);

    // browser
    db.incr('anl:' + site + ':browser:' + browser);
    db.incr('anl:' + site + ':browser:' + browser + ':time:' + time);  


    db.incr('anl:os:' + os);
    db.incr('anl:platform:' + platform);
    db.incr('anl:version:' + version);
    db.incr('anl:' + site + ':' + page + ':ip:' + ip);

    console.log('hit: ' + time);

    next();
}

exports.store = store;

function getTime() {
    return moment().format('YYYYMMDDHHmmss');
}

function getTimeAsync(callback) {
    var time = getTime();
    callback(null, time);
}

function getTotal(callback) {
    db.get('anl:localhost', function (err, total) {
        callback(err, total);
    });
}

function totalBySecondFactory(time) {
    return function (callback) {
        db.get('anl:localhost:' + time, function (err, total) {
            callback(err, total);
        });
    };
}

function browserFunc(callback) {
    db.smembers('anl:browser', function (err, members) {
        var browserQueries = [], i;

        function makeFunc(brw) {
            return function (callback) {
                db.get('anl:localhost:browser:' + brw, function (err, brwcount) {
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
}

function pageFunc(callback) {
    db.keys('anl:localhost:*:total', function (err, keys) {
        var pages = [], i;

        function makeFunc(page) {
            return function (callback) {
                db.get(page, function (err, pgcount) {
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
}

function broadcastFactory(io) {
    return function broadcast(callback) {
        async.parallel(
            [getTimeAsync, getTotal, browserFunc, pageFunc, totalBySecondFactory(getTime())],
            function (err, results) {
                io.sockets.in('dashboard').emit('hit', {time: results[0], 
                                                        total: results[1],
                                                        browser: results[2], 
                                                        page: results[3],
                                                        current: results[4]});
            }
        );
    };
}

exports.broadcastFactory = broadcastFactory;


// Mongodb stuff
function storeTotal(callback) {
    getTotal(function (err, totalcount) {
        var totalSchema = mongoose.Schema({ site: String, hits: Number }),
            Total = mdb.model('Total', totalSchema);
        Total.findOne({ site: 'localhost' }, function (err, total) {
            if (total === null) {
                total = new Total({ site: 'localhost' });
            }
            if (totalcount !== null) {
                total.hits = totalcount;
            }
            total.save(function (err, total) {
                callback(err, total);
            });
        });
    });
}

function browserMongo(callback) {
    console.log('browser mongo');
    db.smembers('anl:browser', function (err, members) {
        var minute = moment().subtract('m', 1).format('YYYYMMDDhhmm'),
            minuteSchema = mongoose.Schema({ site: String, time: String }),
            i = 0;

        for (i = 0; i < members.length; i += 1) {
            minuteSchema[members[i]] = String;
        }

        browserFunc(function (err, browsers) {
            callback(err, browsers);
        });
    });
}

function storeMongo(callback) {
    console.log('storeMongo');
    async.parallel([storeTotal], callback);
}

exports.storeMongo = storeMongo;
