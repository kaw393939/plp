ipident - IP identification lookup using redis
==============================================

This module provides a simple Node.js API interface to identify city information from a given IP Address.
The module will setup a redis data store and load the IP lookup data there.

Installation
------------

You have to install redis and node.js in order to use this module.

Install with:

```sh
$ npm install ipident
```

Or get it from the source: [ipident]

The IP lookup data is available at [lookup data]. Extract them into `node_modules/ipident/data/` directory.

Usage
-----

```javascript
var ipident = require('ipident');

function doLookup() {
    ipident.retrieveCityInfo('125.163.49.39', function (data) {
        console.log(data);
    });
}

// loads data into redis
ipident.autoLoad(doLookup);

```

API
---

### loadData(callback)

Read the data from csv file and load them to redis data store. This application only use 1 key, `ipident:ipaddress`.
Usually this function isn't used directly, use `autoLoad` instead.

### autoLoad(callback)

Check the data in redis and load them if necessary. This function is used in starting up the application to ensure the data is ready.

```javascript
var ipident = require('ipident');

ipident.autoLoad();
```

### retrieveCityInfo(ip_address, callback(data))

This is the main function to lookup city information. The returned data is an object with the following fields:
 * city
 * region_name
 * country
 * postal_code
 * latitude
 * longitude
 * metro_code
 * area_code

### clearData(callback)

Deletes all data from redis

### countData(callback)

Count all data from redis

Sample Web Application using `ipident`
--------------------------------------

Sample of usage inside a web application using express framework. The web application will prepare the data and load it to redis. On browser request, the remote ip of the requester will be identified, and by using `ipident.retrieveCityInfo` it will find the city and displays it in the browser.

Install express
```sh
$ npm install express
```

server.js:

```javascript
var express = require('express'),
    ipident = require('ipident');
var app = express();

ipident.autoLoad();

app.get('/', function(req, res) {
    var body = 'IP Address: ' + req.ip + "\n",
        start = process.hrtime();

    ipident.retrieveCityInfo(req.ip, function (data) {

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
            body += city_info;
            diff = process.hrtime(start);
            body += "\n\nIdentification process took " +
                (diff[0] * 1e9 + diff[1]).toString() +
                " nanoseconds\n";
        } else {
            body += "No location identified for your IP Address.\n";
        }
        
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
});

app.listen(3001);
console.log('Listening on port 3001');
```

  [ipident]: https://github.com/Webizly/plp/tree/master/ipident/
  [lookup data]: https://github.com/valmy/IPtoCountry-Mapping/raw/master/data/master_ip_address.csv.gz

