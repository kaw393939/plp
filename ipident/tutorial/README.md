EVENT-DRIVEN PROGRAMMING WITH NODE.JS AND REDIS
===============================================

T. Budiman

tbudiman@gmail.com

@tbudiman


Bala

Prerequisite
------------

In order to follow this tutorial, the reader should read Introduction to Node.js and Introduction to Redis.
This tutorial, the source code and sample data are available at [plp] 

IP Identification
-----------------

In this tutorial we will write several application involving IP identification. We have a csv file containing the IP ranges for all cities in the world, with a few information about that city. The objective is to create a IP lookup, where the application should identify the city from a given IP Address. We'll create a simple web application which will identify the IP address of the request and then display the city information. In order to achieve this in a very fast way, we'll use redis as our database of IP addresses. Since this is a fairly simple and straightforward application, we'll also try to do this using mocha as our unit testing framework.


Installing node.js modules
--------------------------

We need several node.js modules to complete this tutorial. First, we'll create
a directory and enter it.

```sh
$ mkdir ipident
$ cd ipident
```

The csv module is needed to read a csv file.

```sh
$ npm install csv
```

The redis module is needed to access the redis database.
```sh
$ npm install hiredis redis
```

Mocha and should modules are needed to do unit testing. We'll install mocha globally, so other projects can use it too.

```sh
$ sudo npm install -g mocha
$ npm install should
```

And we'll use underscore.string module to help us with some string manipulation functions.

```sh
$ npm install underscore.string
```

One more module we're using is `async` module to help us control the application flow.

Redis Data
----------

Before we move forward with node.js programming, we should look and design our data structure first. Here, we have a csv file which contain the information of the IP Range and the city information, such as city name, country, postal code, latitude and longitude. The original data comes in 2 csv files. This is the location list which contains the data about a location. The format is: 

```
Copyright (c) 2012 MaxMind LLC.  All Rights Reserved.
locId,country,region,city,postalCode,latitude,longitude,metroCode,areaCode
1,"O1","","","",0.0000,0.0000,,
2,"AP","","","",35.0000,105.0000,,
3,"EU","","","",47.0000,8.0000,,
4,"AD","","","",42.5000,1.5000,,
5,"AE","","","",24.0000,54.0000,,
6,"AF","","","",33.0000,65.0000,,
7,"AG","","","",17.0500,-61.8000,,
8,"AI","","","",18.2500,-63.1667,,
```

And the second file contains the IP Blocks data. The format is:

```
Copyright (c) 2011 MaxMind Inc.  All Rights Reserved.
startIpNum,endIpNum,locId
"16777216","16777471","17"
"16777472","16777727","104084"
"16777728","16778239","49"
"16778240","16778751","14409"
"16778752","16779263","17"
"16779264","16781311","49"
"16781312","16785407","14614"
"16785408","16793599","47667"
```

This file is large quite with more than 2 million rows of data. To simplify our calculations, the IP Addresses are not expressed in the usual dot notation like '125.163.49.39' but expressed in its numeric representation. The conversion was done using `inet_aton` function found in standard MySQL library or in C network library.

It seems that entering this data into redis should be quite straightforward, we could store the location data in a hash type using the location id as the key. But the real problem is how do we retrieve them back. Redis uses a key to retrieve the data, but here the we'll have an IP Address which needs to be identified but we won't have that IP Address as a key, since our data is only in IP Ranges. And Redis can't query the data using comparison operators, unlike in an SQL database where we could use `BETWEEN ... AND ...` in our query.

So we'll store the data using the sorted set, and use one of the IP range boundary as the score. That way we can retrieve the data by using `ZRANGEBYSCORE key min max LIMIT offset count`. Say we'll use the upper boundary as score for our data. We'll convert our IP Address to numeric notation, and use it as our minimal score. Since we're only need one data, we could limit the results to only 1 item. Of course if there's a gap in the ranges, we're not actually guaranteed that the result is within the limit, since we didn't check its lower boundary. Since speed is essential here, it could be checked by the application easily later.

How about the data itself? We could still use the hash data type, and connecting the sorted set and the hash using the location id as value. But a careful study of the data would reveals that the multiplicity of the location to blocks is one to many. So several different and non-contiguous IP Blocks would refer to the same location. But if we're using a sorted set then redis could only store one score (= ip boundary) for each location id. So instead of storing the data from those two files in two differents key schema, we should combine them in a sorted set and store the whole city information data as the value for the sorted set in a JSON format.

Using Modules
-------------

Combining two csv files requires a little trick. We should read the location data first, then read the blocks data and storing the blocks data with its location data. Then why don't we use redis itself to store the location data? So the first task is to read the location data from csv file, and we're going to use `csv` module for that. Using a module is quite simple, by adding a `require` import to a variable and accessing the provided functions through that variable.

```javascript
var fs = require('fs');
var csv = require('csv');
```

`fs` is a filesystem module and one of the core modules already available in a standard installation of node.js.

We can usually find how we should use a node module by reading the README.md file in its github repository ([Node CSV]). In this case the csv module works like this: 

```javascript
            var line = 0;
            csv()
                .from.stream(fs.createReadStream(__dirname + '/data/GeoLiteCity-Location.csv'), {
                    columns: ['id', 'country_code', 'region_code', 'city_name', 'postal_code',
                              'latitude', 'longitude', 'metro_code', 'area_code']
                })
                .on('record', function (data) {
                    if (line > 1) {
                    
                    ...
                    
                    }
                    line = line + 1
                })
                .on('end', function () {
                    callback(null, i);
                })
                .on('error', function (err) {
                    console.log(err.message);
                    callback(err, i);
                });

```

The `fs.createReadStream` is used to create an open stream of the file. Since the the csv file is very large, we don't really want to process the whole thing in a synchronous way and freeze everything else while waiting for this lengthy process. A file stream would do just that, accessing the file contents asynchronously and feeding the results line-by-line to the csv module for processing. That's why we use csv().from.stream(). After the csv().from.stream() command above, the execution flow would immediately move forward to the next command. The ReadStream object would send out 'events' when the streaming process is running, and we can attach a 'listener' to those events. A listener is a function that would be executed only when an event is happening. There are several events defined by the ReadStream, 'record', 'end' and 'error'. We attach them to their listener by using the `on` function. When each line is read, the 'record' event is fired (or emitted) and we can do something in the function block. Notice that the csv file contains a copyright information in the first line and the field headers in the second line. The data itself begins in the third line. The `line` variable would contain the line number of the data and the conditional `if (line > 1)` statement would force the processing block to not be executed for the first and second line. The 'end' event told us that the whole process has finished, so we can call the callback function to let them know that.

We store the data into redis by using the redis module. Here is the importing command and the connection initialization.

```javascript
var redis = require("redis");
var client = redis.createClient();
```

Then, we can put these in the block:


```javascript
                        client.hmset('ipident:location:' + data.id, 
                                     'country_code', data.country_code,
                                     'region_code', data.region_code,
                                     'city_name', data.city_name,
                                     'postal_code', data.postal_code,
                                     'latitude', data.latitude,
                                     'longitude', data.longitude,
                                     'metro_code', data.metro_code,
                                     'area_code', data.area_code);
```

Now we have to read the second table with similar method, only the handler inside the block would be different.
In this case the code is:

```javascript
                        client.hgetall('ipident:location:' + data[2], function (err, city) {
                            city.ip_start_num = data[0];
                            city.ip_end_num = data[1];
                            client.zadd('ipident:ipaddress', data[1], JSON.stringify(city))
                        };

```
See how we nested two asynchronous commands by using their callback function. `hgetall` function would try to fetch the data based on the location id as part of the key. Then after that process is finished and the reply came, we add the ip starting address and ending address to our city data and put them back in redis by using `client.zadd`. 


References
----------
 1. [Node CSV]
 2. [Node Redis]
 3. [Mocha]

  [plp]: https://github.com/Webizly/plp/tree/master/ipident/
  [Node CSV]: http://www.adaltas.com/projects/node-csv/
  [Node Redis]: https://github.com/mranney/node_redis
  [mocha]: http://visionmedia.github.io/mocha/
