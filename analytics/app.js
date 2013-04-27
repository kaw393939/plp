
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , dashboard = require('./routes/dashboard')
  , analytics = require('./lib/analytics')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , moment = require('moment')
  , redis = require('redis')
  , useragent = require('express-useragent')
  , async = require('async');

var app = express(),
    db = redis.createClient();

// all environments
app.use(useragent.express());
app.use(analytics.store);

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
app.get('/dashboard', dashboard.index);

var server = http.createServer(app);
io = io.listen(server);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

io.sockets.on('connection', function (socket) {

    socket.join('dashboard');

});

var broadcast = analytics.broadcastFactory(io); 
setInterval(broadcast, 10000);
