"use strict";
var moment = require('moment'),
    redis = require('redis'),
    async = require('async'),
    db = redis.createClient();

function store(req, res, next) {
    var site = req.host,
        page = req.path,
        ip = req.ip,
        browser = req.useragent.Browser,
        os = req.useragent.OS,
        platform = req.useragent.Platform,
        version = req.useragent.Version,
        time = moment().format('YYYYMMDDHHmmss');

    db.sadd('anl:browser', browser);
    db.sadd('anl:os', os);
    db.sadd('anl:platform', platform);
    db.sadd('anl:version', version);
    db.sadd('anl:ip', ip);
    db.incr('anl:' + site + ':' + page + ':total');
    db.incr('anl:' + site + ':' + page + ':time:' + time);
    db.incr('anl:browser:' + browser);
    db.incr('anl:os:' + os);
    db.incr('anl:platform:' + platform);
    db.incr('anl:version:' + version);
    db.incr('anl:' + site + ':' + page + ':ip:' + ip);

    console.log('hit: ' + time);

    next();
}

exports.store = store;

function timeFunc(callback) {
    var time = moment().format('YYYYMMDDHHmmss');
    callback(null, time);
}

function browserFunc(callback) {
    db.smembers('anl:browser', function (err, members) {
        var browserQueries = [], i;

        function makeFunc(brw) {
            return function (callback) {
                db.get('anl:browser:' + brw, function (err, brwcount) {
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
                keyparts = /^anl:localhost:(\.+):total$/.exec(keys[i]);
                page.name = keyparts[1];
                page.pgcount = results[i];
                data.push(page);
            }
            callback(err, data);
        });
    });
}

function broadcastFactory(io) {
    return function broadcast(callback) {
        async.parallel(
            [timeFunc, browserFunc, pageFunc],
            function (err, results) {
                io.sockets.in('dashboard').emit('hit', {time: results[0], browser: results[1], page: results[2]});
            }
        );
    };
}

exports.broadcastFactory = broadcastFactory;
