var config = require('../config/config')
  , should = require('should');

describe('Config', function () {
  describe('development configuration', function () {
    it('mdb should use anl_dev', function () {
      config.development.mdb.should.equal('mongodb://localhost/anl_dev');
    });
  });

  describe('test configuration', function () {
    it('mdb should use anl_test', function () {
      config.test.mdb.should.equal('mongodb://localhost/anl_test');
    });
  });
});
