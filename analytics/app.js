
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , dashboard = require('./routes/dashboard')
  , http = require('http')
  , path = require('path')
  , io = require('socket.io')
  , moment = require('moment')
  , redis = require('redis')
  , useragent = require('express-useragent');

var app = express(),
    db = redis.createClient();

// all environments
app.use(useragent.express());
app.use(function (req, res, next) {
    var site = req.host,
        page = req.path,
        ip = req.ip,
        browser = req.useragent.Browser,
        os = req.useragent.OS,
        platform = req.useragent.Platform,
        version = req.useragent.Version,
        time = moment().format('YYYYMMDDHHmmss');

    db.sadd('anl:browser', browser);
    db.sadd('anl:os', os);
    db.sadd('anl:platform', platform);
    db.sadd('anl:version', version);
    db.sadd('anl:ip', ip);
    db.incr('anl:' + site + ':' + page + ':total');
    db.incr('anl:' + site + ':' + page + ':time:' + time);
    db.incr('anl:' + site + ':' + page + ':browser:' + browser);
    db.incr('anl:' + site + ':' + page + ':os:' + os);
    db.incr('anl:' + site + ':' + page + ':platform:' + platform);
    db.incr('anl:' + site + ':' + page + ':version:' + version);
    db.incr('anl:' + site + ':' + page + ':ip:' + ip);

    console.log('hit: ' + time);
    io.sockets.in('dashboard').emit('hit', {time: time, browser: browser, page: page});

    next();
});

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

