"use strict";

var fs = require('fs');
var csv = require('csv');
var redis = require('redis');
var http = require('http');
var inet = require('./inet');

// ipident is a Singleton
exports.ipidentSingleton = (function () {

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
                    .from.stream(fs.createReadStream('./data/master_ip_address.csv'), {
                        columns: ['ip_start_num', 'ip_end_num', 'city', 'region_name',
                                  'country_name', 'postal_code', 'latitude', 'longitude', 'metro_code',
                                  'area_code']
                    })
                    .on('record', function (data) {
                        client.zadd("ipident:ipaddress", data.ip_end_num, JSON.stringify(data));
                    })
                    .on('end', function () {
                        console.log('finished loading data');
                        callback();
                    })
                    .on('error', function (error) {
                        console.log(error.message);
                        callback(error);
                    });
            },

            autoLoad: function (callback) {
                client.zcount('ipident:ipaddress', '-inf', 'inf', function (err, reply) {
                    if (reply < 1) {
                        console.log('loading data');
                        instance.loadData(callback);
                    } else {
                        console.log('data loaded');
                        callback(err);
                    }
                });
            },

            countData: function (callback) {
                client.zcount('ipident:ipaddress', '-inf', 'inf', function (err, reply) {
                    callback(reply);
                });
            },

            setRedisConfig: function (args) {
            },

            retrieveCityInfo: function (ip_address, callback) {
                var long_ip = inet.aton(ip_address);
                client.zrangebyscore("ipident:ipaddress", long_ip, "inf", 'limit', 0, 1, function (err, reply) {
                    if (reply.length === 1) {
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

            httpPort: 3001,
            startHttpd: function (port) {
                var server;

                console.log("start httpd");
                if (port) {
                    instance.httpPort = port;
                }

                console.log("checking data");
                instance.autoLoad();

                console.log("starting http server");
                server = http.createServer(function (request, response) {
                    var redis_info, remote_ip,
                        start = process.hrtime();

                    response.writeHead(200, {
                        "Content-Type": "text/plain"
                    });

                    client.info(function (err, reply) {
                        redis_info = reply; // stash response in outer scope
                        if (err) {
                            console.log(err.message);
                        }
                    });

                    remote_ip = request.connection.remoteAddress;

                    instance.retrieveCityInfo(remote_ip, function (data) {

                        response.write("IP Address: " + remote_ip + "\n");
                        if (data) {
                            var city_info, diff;

                            city_info = "City: " + data.city + "\n";
                            city_info += "Region Name: " + data.region_name + "\n";
                            city_info += "Country: " + data.country_name + "\n";
                            city_info += "Postal Code: " + data.postal_code + "\n";
                            city_info += "Latitude: " + data.latitude + "\n";
                            city_info += "Longitude: " + data.longitude + "\n";
                            city_info += "Metro Code: " + data.metro_code + "\n";
                            city_info += "Area Code: " + data.area_code + "\n";
                            response.write(city_info);
                            diff = process.hrtime(start);
                            response.write("\n\nIdentification process took " +
                                           (diff[0] * 1e9 + diff[1]).toString() +
                                           " nanoseconds\n");
                        } else {
                            response.write("No location identified for your IP Address.\n");
                        }

                        response.write("\nThis page was generated after talking to redis.\n\n" +
                                       "Redis info:\n" + redis_info + "\n");
                        response.end();
                    });
                }).listen(instance.httpPort);

            }
        };
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
