"use strict";

var fs = require('fs');
var csv = require('csv');
var redis = require('redis');
var inet = require('./lib/inet');

// ipident is a Singleton
var ipidentSingleton = (function () {

    // reference to the Singleton
    var instance;

    function init() {

        var client = redis.createClient();

        client.on('error', function (error) {
            console.log(error.message);
        });

        return {

            clearData: function (callback) {
                client.del('ipident:ipaddress', callback);
            },

            // loadData to redis
            loadData: function (callback) {

                client.del('ipident:ipaddress');

                csv()
                    .from.stream(fs.createReadStream(__dirname + '/data/master_ip_address.csv'), {
                        columns: ['ip_start_num', 'ip_end_num', 'city', 'region_name',
                                  'country_name', 'postal_code', 'latitude', 'longitude', 'metro_code',
                                  'area_code']
                    })
                    .on('record', function (data) {
                        client.zadd("ipident:ipaddress", data.ip_end_num, JSON.stringify(data));
                    })
                    .on('end', function () {
                        console.log('finished loading data');
                        if (callback) { 
                            callback();
                        }
                    })
                    .on('error', function (error) {
                        console.log(error.message);
                        if (callback) { 
                            callback(error);
                        }
                    });
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

