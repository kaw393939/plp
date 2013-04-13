/*global describe, it, before, beforeEach, after*/
"use strict";

var ipident = require('../lib/ipident'),
    should = require('should'),
    ipidentInst = ipident.ipidentSingleton.getInstance();

describe('ipident start with empty data', function () {

    beforeEach(function (done) {
        this.timeout(0);
        ipidentInst.clearData(done);
    });

    after(function (done) {
        this.timeout(0);
        ipidentInst.clearData(done);
    });

    describe('#clearData', function () {
        it('Clear Data should empty the database', function (done) {
            ipidentInst.clearData(function () {
                ipidentInst.countData(function (data) {
                    data.should.equal(0);
                    done();
                });
            });
        });
    });

    describe('#loadData', function () {
        it('Load Data should fill the database', function (done) {
            this.timeout(0);

            ipidentInst.loadData(function () {
                ipidentInst.countData(function (data) {
                    // $ wc data/master_ip_address.csv should provide the correct number
                    data.should.equal(2254131);
                    done();
                });
            });
        });
    });

    describe('#autoLoad', function () {
        it('Auto Load with empty data should call loadData', function (done) {
            this.timeout(0);
            ipidentInst.autoLoad(function () {
                ipidentInst.countData(function (data) {
                    data.should.equal(2254131);
                    done();
                });
            });
        });
    });
});

describe('ipident start with filled data', function () {

    before(function (done) {
        this.timeout(0);
        ipidentInst.loadData(done);
    });

    after(function (done) {
        setTimeout(done, 10000);
        ipidentInst.clearData(done);
    });

    describe('autoLoad', function () {
        it('Auto Load with data already in redis should do nothing', function (done) {
            setTimeout(done, 5000);
            ipidentInst.autoLoad(done);
        });
    });

    describe('#countData', function () {
        it('Count Data with filled data should provide the correct count', function (done) {
            ipidentInst.countData(function (data) {
                data.should.equal(2254131);
                done();
            });
        });
    });

    describe('#retrieveCityInfo', function () {
        it('IP Address 125.163.49.39 should point to Bandung', function (done) {
            ipidentInst.retrieveCityInfo('125.163.49.39', function (data) {
                data.city.should.equal('Bandung');
                done();
            });
        });

        it('IP Address 127.0.0.1 should not exist', function (done) {
            ipidentInst.retrieveCityInfo('127.0.0.1', function (data) {
                should.not.exist(data);
                done();
            });
        });
    });

});
