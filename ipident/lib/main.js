"use strict";

(function () {
    var ipident = require('./ipident'),
        ipidentInst = ipident.ipidentSingleton.getInstance();

    ipidentInst.startHttpd();

}).call(this);
