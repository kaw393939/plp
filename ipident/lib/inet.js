"use strict";

var _s = require("underscore.string");

function aton(str) {
    var parts = str.split("."), laddr, i;

    if (parts.length !== 4) {
        return null;
    }

    laddr = 0;
    for (i = 0; i < parts.length; i++) {
        if (i > 0) {
            laddr = laddr * 256;
        }
        laddr += parseInt(parts[i], 10);
    }

    return laddr;
}

function ntoa(laddr) {
    var i, data = [];
    for (i = 3; i >= 0; i--) {
        data[i] = laddr % 256;
        laddr = Math.floor(laddr / 256);
    }
    return _s.join('.', data[0], data[1], data[2], data[3]);
}

// console.log(aton("192.168.0.196"));
// console.log(ntoa(3232235716));

exports.aton = aton;
exports.ntoa = ntoa;
