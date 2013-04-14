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

In this tutorial we will write several application involving IP identification. We have a csv file containing the IP ranges for all cities in the world, with a few information about that city. The objective is to create a IP lookup, where the application should identify the city from a given IP Address. We'll create a simple web application which will identify the IP address of the request and then display the city information. In order to achieve this in a very fast way, we'll use redis as our database of IP addresses. Since this is a fairly simple and straightforward application, we'll also try to do this using the Test-Driven Development methodology, which requires us to create the unit tests first.


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

Redis Data
----------

Before we move forward with node.js programming, we should look and design our data structure first. Here, we have a csv file which contain the information of the IP Range and the city information, such as city name, country, postal code, latitude and longitude. The first 10 rows of the data looks like this:

```
"16777216","16777471","","","AUSTRALIA","0","-27.0000","133.0000","",""
"16777472","16777727","Fuzhou","7","CHINA","0","26.0614","119.3061","",""
"16777728","16778239","","","CHINA","0","35.0000","105.0000","",""
"16778240","16778751","Melbourne","7","AUSTRALIA","0","-37.8139","144.9634","",""
"16778752","16779263","","","AUSTRALIA","0","-27.0000","133.0000","",""
"16779264","16781311","","","CHINA","0","35.0000","105.0000","",""
"16781312","16785407","Tokyo","40","JAPAN","0","35.6850","139.7514","",""
"16785408","16793599","Guangzhou","30","CHINA","0","23.1167","113.2500","",""
"16793600","16809983","","","JAPAN","0","36.0000","138.0000","",""
"16809984","16811007","","","THAILAND","0","15.0000","100.0000","",""
```

This file is large, almost 200 MB in size with more than 2 million rows of data. To simplify our calculations, the IP Addresses are not expressed in the usual dot notation like '125.163.49.39' but expressed in its numeric representation. The conversion was done using `inet_aton` function found in standard MySQL library or in C network library.

It seems that entering this data into redis should be quite straightforward, we could store it in a hash type. But the real problem is how do we retrieve them back. Redis uses a key to retrieve the data, but here the we'll have an IP Address which needs to be identified but we won't have that IP Address as a key, since our data is only in IP Ranges. And Redis can't query the data using comparison operators, unlike in an SQL database where we could use `BETWEEN ... AND ...` in our query.

So we'll store the data using the sorted set, and use one of the IP range boundary as the score. That way we can retrieve the data by using `ZRANGEBYSCORE key min max LIMIT offset count`. Say we'll use the upper boundary as score for our data. We'll convert our IP Address to numeric notation, and use it as our minimal score. Since we're only need one data, we could limit the results to only 1 item. Of course if there's a gap in the ranges, we're not actually guaranteed that the result is within the limit, since we didn't check its lower boundary. Since speed is essential here, it could be checked by the application easily later.

How about the data itself? We could still use the hash data type, and connecting the sorted set and the hash using a unique value. But another alternative we used here is we store the data in a single JSON string, since it could immediately parsed by our node.js application.

Using Modules
-------------

So the first task is to read the data from csv file, and we're going to use `csv` module for that. Using a module is quite simple, by adding
a `require` import to a variable and accessing the provided functions through that variable.

```javascript
var fs = require('fs');
var csv = require('csv');
```

`fs` is a filesystem module and one of the core modules already available in a standard installation of node.js.

We can usually find how we should use a node module by reading the README.md file in its github repository ([Node CSV]). In this case the csv module works like this: 

```javascript
                csv()
                    .from.stream(fs.createReadStream(__dirname + '/../data/master_ip_address.csv'), {
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
```

The `fs.createReadStream` is used to create an open stream of file. Since the the csv file is very large, we don't really want to process the whole thing in a synchronous way and freeze everything else waiting for this lengthy process. A file stream would do just that, accessing the file contents asynchronously and feeding the results line-by-line to the csv module for processing. That's why we use csv().from.stream()


References
----------
 1. [Node CSV]
 2. [Node Redis]
 3. [Mocha]

  [plp]: https://github.com/Webizly/plp/tree/master/ipident/
  [Node CSV]: http://www.adaltas.com/projects/node-csv/
  [Node Redis]: https://github.com/mranney/node_redis
  [mocha]: http://visionmedia.github.io/mocha/
