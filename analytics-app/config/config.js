var path = require('path')
  , rootPath = path.normalize(__dirname + '/..');

module.exports = {
  development: {
    mdb: 'mongodb://localhost/anl_dev',
    redisHost: null,
    redisPort: null,
    root: rootPath,
    site: 'localhost',
    app: {
      name: 'Analytics Application (Dev)'
    },
    syncTime: 10000
  },
  test: {
    mdb: 'mongodb://localhost/anl_test',
    redisHost: null,
    redisPort: null,
    root: rootPath,
    site: 'invention.org',
    app: {
      name: 'Analytics Application (Test)'
    },
    syncTime: 10000
  },
  production: {}
};
