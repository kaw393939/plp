var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')

module.exports = {
  development: {
    mdb: 'mongodb://localhost/anl_dev',
    redis_host: null,
    redis_port: null,
    root: rootPath,
    site: 'localhost',
    app: {
      name: 'Analytics Application (Dev)'
    },
  },
  test: {
    mdb: 'mongodb://localhost/anl_test',
    redis_host: null,
    redis_port: null,
    root: rootPath,
    site: 'invention.org',
    app: {
      name: 'Analytics Application (Test)'
    },
  },
  production: {}
}
