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

The IP lookup data is available at [master_ip_address.csv.gz]. Extract them into `node_modules/ipident/data/` directory.

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
ipident.loadData(doLookup);

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

### retrieveCityInfo(ip_address, callback)

This is the main function to lookup city information.

### clearData(callback)

Deletes all data from redis

### countData(callback)

Count all data from redis

  [ipident]: https://github.com/Webizly/plp/tree/master/ipident/
  [master_ip_address.csv]: https://github.com/valmy/IPtoCountry-Mapping/raw/master/data/master_ip_address.csv.gz
