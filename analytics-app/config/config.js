var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')

module.exports = {
  development: {
    mdb: 'mongodb://localhost/anl_dev',
    redis_host: null,
    redis_port: null,
    root: rootPath,
    app: {
      name: 'Analytics Application (Dev)'
    },
  },
  test: {
    mdb: 'mongodb://localhost/anl_test',
    redis_host: null,
    redis_port: null,
    root: rootPath,
    app: {
      name: 'Analytics Application (Test)'
    },
  },
  production: {}
}
