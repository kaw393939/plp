var config = require('../config/config').test,
    mongoose = require('mongoose'),
    fs = require('fs'),
    should = require('should'),
    request = require('supertest');

// Bootstrap db connection
mongoose.connect(config.mdb);

// Bootstrap models
var models_path = __dirname + '/../models';
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file);
});

var persistentAnalytics = require('../lib/persistentAnalytics');

describe('PersistentAnalytics', function () {

  it('should be a singleton object', function () {
    persistentAnalytics.should.be.an.instanceOf(Object);
  });

  describe('#startTimer(syncTime)', function () {

    before(function (done) {
      this.timeout(config.syncTime + 2000);
      persistentAnalytics.startTimer(config.syncTime);
      setTimeout(done, config.syncTime + 1000);
    });

    after(function (done) {
      persistentAnalytics.stopTimer();
      mongoose.disconnect(done);
    });

    it('should start storing total data to the test database', function (done) {
      var Total = mongoose.model('Total');
      Total.findOne({ site: config.site }, function (err, total) {
        if (err) throw err;
        should.exist(total);
        total.should.have.property('hits');
        total.hits.should.be.above(0);
        done();
      });
    });

    it('should start storing totalminutes data to the test database', function (done) {
      var TotalMinute = mongoose.model('TotalMinute');
      TotalMinute.findOne({ site: config.site }).sort({ jsdate: -1 }).
        limit(1).exec(function (err, totalMinute) {
        if (err) throw err;
        should.exist(totalMinute);
        totalMinute.should.have.property('hits');
        totalMinute.hits.should.be.a('number');
        done();
      });
    });

  });

  describe('#minutely(start, end, callback)', function () {
  });

  describe('#total(res, req)', function () {

    it('should return the total hits in JSON', function (done) {
      var app = require('../app');
      request(app)
        .get('/api/total')
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) throw err;
          var timeseries = res.body;
          timeseries.should.be.an.instanceOf(Array);
          timeseries.length.should.be.above(0);
          timeseries[0].should.have.property('hits');
          timeseries[0].should.have.property('jsdate');
          timeseries[0].should.have.property('site');
          done();
        });
    });

  });

});
