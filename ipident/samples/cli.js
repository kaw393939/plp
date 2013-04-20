"use strict";

var ipident = require('ipident');

function doLookup() {
    ipident.retrieveCityInfo('125.163.49.39', function (data) {
        console.log(data);
    });
}

// loads data into redis
ipident.autoLoad(doLookup);
