/*global describe, it*/
"use strict";
var inet = require("../lib/inet"),
    should = require("should");


describe('inet', function () {
    describe('#aton()', function () {
        it('should calculate the network representation as integer', function () {
            inet.aton('125.163.49.39').should.equal(2107846951);
        });
        it('should calculate 0.0.0.0 to 0', function () {
            inet.aton('0.0.0.0').should.equal(0);
        });
        it('should calculate 255.255.255.255 to 4294967295', function () {
            inet.aton('255.255.255.255').should.equal(4294967295);
        });
        it('should return null for bad input string', function () {
            should.not.exist(inet.aton('123.123.123'));
        });
    });
    describe('#ntoa()', function () {
        it('should calculate the network representation', function () {
            inet.ntoa(2107846951).should.equal('125.163.49.39');
        });
        it('should calculate 0 to 0.0.0.0', function () {
            inet.ntoa(0).should.equal('0.0.0.0');
        });
        it('should calculate 4294967295 to 255.255.255.255', function () {
            inet.ntoa(4294967295).should.equal('255.255.255.255');
        });
    });
});
