
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  socket = require('./routes/socket.js');

var app = module.exports = express();
var server = require('http').createServer(app);

// Hook Socket.io into Express
var io = require('socket.io').listen(server);

// Configuration
var config = require('./config/config')[app.get('env')]
  , useragent = require('express-useragent')
  , transientAnalytics = require('./lib/transientAnalytics')
  , mongoose = require('mongoose')
  , fs = require('fs')

// Reconfigure redis if necessary
if (config.redisPort !== null || config.redisHost !== null) {
    transientAnalytics.configure(config.redisPort, config.redisHost);
}
transientAnalytics.site = config.site;

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(useragent.express());
app.use(transientAnalytics.store);
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/public'));
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
}

// production only
if ('production' == app.get('env')) {
  app.use(express.errorHandler());
}

// Bootstrap db connection
mongoose.connect(config.mdb)

// Bootstrap models
var models_path = __dirname + '/models'
fs.readdirSync(models_path).forEach(function (file) {
  require(models_path+'/'+file)
})

var persistentAnalytics = require('./lib/persistentAnalytics')
persistentAnalytics.startTimer(config.syncTime);

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Socket.io Communication

io.sockets.on('connection', socket);

// Start server

server.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", this.address().port, app.get('env'));
});
