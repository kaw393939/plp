"use strict";

var fs = require('fs');
var csv = require('csv');
var redis = require('redis');
var async = require('async');
var inet = require('inet');

// ipident is a Singleton
var ipidentSingleton = (function () {

    // reference to the Singleton
    var instance;

    function init() {

        var client = redis.createClient();

        client.on('error', function (error) {
            console.log(error.message);
        });

        function loadLocation(callback) {
            var i = 0;
            csv()
                .from.stream(fs.createReadStream(__dirname + '/data/GeoLiteCity-Location.csv'), {
                    columns: ['id', 'country_code', 'region_code', 'city_name', 'postal_code',
                              'latitude', 'longitude', 'metro_code', 'area_code']
                })
                .on('record', function (data) {
                    if (data.id !== 'locId') {
                        client.hmset('ipident:location:' + data.id, 
                                     'country_code', data.country_code,
                                     'region_code', data.region_code,
                                     'city_name', data.city_name,
                                     'postal_code', data.postal_code,
                                     'latitude', data.latitude,
                                     'longitude', data.longitude,
                                     'metro_code', data.metro_code,
                                     'area_code', data.area_code);
                        i = i + 1;
                    }
                })
                .on('end', function () {
                    callback(null, i);
                })
                .on('error', function (err) {
                    console.log(err.message);
                    callback(err, i);
                });
        }

        function clearLocation(callback) {
            client.del('ipident:location', callback);
        }

        function loadBlock(callback) {
            var i = 0, line = 0;
            csv()
                .from.stream(fs.createReadStream(__dirname + '/data/GeoLiteCity-Blocks.csv'))
                .on('record', function (data) {
                    if (line > 1) {
                        client.hgetall('ipident:location:' + data[2], function (err, city) {
                            city.ip_start_num = data[0];
                            city.ip_end_num = data[1];
                            client.zadd('ipident:ipaddress', data[1], JSON.stringify(city));
                        });
                        i = i + 1;
                    }
                    line = line + 1;
                })
                .on('end', function () {
                    callback(null, i);
                })
                .on('error', function (err) {
                    console.log(err.message);
                    callback(err, i);
                });
        }

        return {

            clearData: function (callback) {
                client.del('ipident:ipaddress', callback);
            },

            // loadData to redis
            loadData: function (callback) {
                async.series([loadLocation, loadBlock, clearLocation],
                            callback);
            },

            autoLoad: function (callback) {

                client.zcount('ipident:ipaddress', '-inf', 'inf', function (err, reply) {
                    if (reply < 1) {
                        console.log('loading data');
                        instance.loadData(callback);
                    } else {
                        console.log('data loaded');
                        if (callback) {
                            callback(err);
                        }
                    }
                });
            },

            countData: function (callback) {
                client.zcount('ipident:ipaddress', '-inf', 'inf', function (err, reply) {
                    if (callback) {
                        callback(reply);
                    }
                });
            },

            setRedisConfig: function (args) {
            },

            retrieveCityInfo: function (ip_address, callback) {
                var long_ip = inet.aton(ip_address);
                client.zrangebyscore("ipident:ipaddress", long_ip, "inf", 'limit', 0, 1, function (err, reply) {
                    if (callback && reply.length === 1) {
                        var data = JSON.parse(reply[0]);

                        // make sure the ip_address is within range
                        if (parseInt(data.ip_start_num, 10) <= long_ip) {
                            callback(data);
                        } else {
                            data = null;
                            callback(data);
                        }
                    }
                });
            },
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

module.exports = ipidentSingleton.getInstance();

