var config = require('../config/config').test
  , transientAnalytics = require('../lib/transientAnalytics')
  , moment = require('moment')
  , should = require('should')
  , assert = require('assert');

describe('TransientAnalytics', function () {
  describe('#configure()', function () {
  });

  describe('#store()', function () {
  });

  describe('#getTime()', function () {
    it('should return the current time', function () {
      transientAnalytics.getTime().should.equal(moment().format('YYYYMMDDHHmmss'));
    });
  });

  describe('#getTimeAsync()', function () {
    it('should return the current time', function (done) {
      transientAnalytics.getTimeAsync(function (err, time) {
        if (err) throw err;
        time.should.equal(moment().format('YYYYMMDDHHmmss'));
        done();
      });
    });
  });

  describe('#getTotal()', function () {
    it('should return a Number', function (done) {
      transientAnalytics.getTotal(function (err, total) {
        if (err) throw err;
        total.should.be.a('number');
        done();
      });
    });

    it('should return the total number of hits', function (done) {
      transientAnalytics.getTotal(function (err, total) {
        if (err) throw err;
        total.should.be.above(0);
        done();
      });
    });
  });

  describe('#getData()', function () {
    it("getData('browser') should return the browser hits", function (done) {
      transientAnalytics.getData('browser', function (err, data) {
        if (err) throw err;
        data.should.be.an.instanceOf(Object);
        data.should.have.property('Chrome');
        data.Chrome.should.be.a('number');
        data.Chrome.should.be.above(0);
        done();
      });
    });

    it("getData('os') should return the operating system hits", function (done) {
      transientAnalytics.getData('os', function (err, data) {
        if (err) throw err;
        data.should.be.an.instanceOf(Object);
        data.should.have.property('Linux');
        data.Linux.should.be.a('number');
        data.Linux.should.be.above(0);
        done();
      });
    });

    it("getData('platform') should return the platform hits", function (done) {
      transientAnalytics.getData('platform', function (err, data) {
        if (err) throw err;
        data.should.be.an.instanceOf(Object);
        data.should.have.property('Linux');
        data.Linux.should.be.a('number');
        data.Linux.should.be.above(0);
        done();
      });
    });

    it("getData('ip') should return the ip hits", function (done) {
      transientAnalytics.getData('ip', function (err, data) {
        if (err) throw err;
        data.should.be.an.instanceOf(Object);
        data.should.have.property('127.0.0.1');
        data['127.0.0.1'].should.be.a('number');
        data['127.0.0.1'].should.be.above(0);
        done();
      });
    });

    it("getData('xxx') should throws an error", function (done) {
      transientAnalytics.getData('xxx', function (err, data) {
        should.exist(err);
        done();
      });
    });

  });

  describe('#getPages()', function () {
    it('should return the pages hits', function (done) {
      transientAnalytics.getPages(function (err, pages) {
        if (err) throw err;
        pages.should.be.an.instanceOf(Object);
        pages.should.have.property('/');
        pages['/'].should.be.a('number');
        pages['/'].should.be.above(0);
        done();
      });
    });
  });

  describe('#getTotalMinute()', function () {
    it("getTotalMinute('201305181742') should return the total hits for that minute", function (done) {
      transientAnalytics.getTotalMinute('201305181742', function (err, data) {
        if (err) throw err;
        data.should.be.a('number');
        data.should.equal(23);
        done();
      });
    });
  });

  describe('#getDataMinute()', function () {

    it("getDataMinute('browser', '201305181742') should return hits in that minute", function (done) {
      transientAnalytics.getDataMinute('browser', '201305181742', function (err, data) {
        if (err) throw err;
        data.should.be.an.instanceOf(Object);
        data.should.have.property('Safari');
        data.Safari.should.be.a('number');
        data.Safari.should.equal(23);
        done();
      });
    });

    it("getDataMinute('os', '201305181742') should return hits in that minute", function (done) {
      transientAnalytics.getDataMinute('os', '201305181742', function (err, data) {
        if (err) throw err;
        data.should.be.an.instanceOf(Object);
        data.should.have.property('Linux');
        data.Linux.should.be.a('number');
        data.Linux.should.equal(0);
        done();
      });
    });

    it("getDataMinute('platform', '201305181742') should return hits in that minute", function (done) {
      transientAnalytics.getDataMinute('platform', '201305181742', function (err, data) {
        if (err) throw err;
        data.should.be.an.instanceOf(Object);
        data.should.have.property('Linux');
        data.Linux.should.be.a('number');
        data.Linux.should.equal(0);
        done();
      });
    });

    it("getDataMinute('ip', '201305181742') should return hits in that minute", function (done) {
      transientAnalytics.getDataMinute('ip', '201305181742', function (err, data) {
        if (err) throw err;
        data.should.be.an.instanceOf(Object);
        data.should.have.property('127.0.0.1');
        data['127.0.0.1'].should.be.a('number');
        data['127.0.0.1'].should.equal(23);
        done();
      });
    });

    it("getDataMinute('xxx', '201305181742') should throws an error", function (done) {
      transientAnalytics.getDataMinute('xxx', '201305181742', function (err, data) {
        should.exist(err);
        done();
      });
    });

  });

  describe('#getPagesMinute()', function () {
    it("getPagesMinute('201305181742') should return the pages hits", function (done) {
      transientAnalytics.getPagesMinute('201305181742', function (err, pages) {
        if (err) throw err;
        pages.should.be.an.instanceOf(Object);
        pages.should.have.property('/');
        pages['/'].should.be.a('number');
        pages['/'].should.equal(0);
        done();
      });
    });
  });

});
