/*global describe, it, before, beforeEach, after*/
"use strict";

var ipident = require('../index'),
    should = require('should');

describe('ipident start with empty data', function () {

    beforeEach(function (done) {
        this.timeout(0);
        ipident.clearData(done);
    });

    after(function (done) {
        this.timeout(0);
        ipident.clearData(done);
    });

    describe('#clearData', function () {
        it('Clear Data should empty the database', function (done) {
            ipident.clearData(function () {
                ipident.countData(function (data) {
                    data.should.equal(0);
                    done();
                });
            });
        });
    });

    describe('#loadData', function () {
        it('Load Data should fill the database', function (done) {
            this.timeout(0);

            ipident.loadData(function () {
                ipident.countData(function (data) {
                    // $ wc data/GeoLiteCity-Blocks.csv should provide the correct number
                    data.should.equal(2244372);
                    done();
                });
            });
        });
    });

    describe('#autoLoad', function () {
        it('Auto Load with empty data should call loadData', function (done) {
            this.timeout(0);
            ipident.autoLoad(function () {
                ipident.countData(function (data) {
                    data.should.equal(2244372);
                    done();
                });
            });
        });
    });
});

describe('ipident start with filled data', function () {

    before(function (done) {
        this.timeout(0);
        ipident.loadData(done);
    });

    after(function (done) {
        setTimeout(done, 10000);
        ipident.clearData(done);
    });

    describe('#autoLoad', function () {
        it('Auto Load with data already in redis should do nothing', function (done) {
            setTimeout(done, 5000);
            ipident.autoLoad(done);
        });
    });

    describe('#countData', function () {
        it('Count Data with filled data should provide the correct count', function (done) {
            ipident.countData(function (data) {
                data.should.equal(2244372);
                done();
            });
        });
    });

    describe('#retrieveCityInfo', function () {
        it('IP Address 125.163.49.39 should point to Bandung', function (done) {
            ipident.retrieveCityInfo('125.163.49.39', function (data) {
                data.city_name.should.equal('Bandung');
                done();
            });
        });

        it('IP Address 127.0.0.1 should not exist', function (done) {
            ipident.retrieveCityInfo('127.0.0.1', function (data) {
                should.not.exist(data);
                done();
            });
        });
    });

});
