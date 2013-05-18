/*jshint multistr:true, evil:true*/
var redis = require('redis'),
    moment = require('moment'),
    async = require('async'),
    _s = require('underscore.string');

var transientAnalyticsSingleton = (function () {

  // reference to the Singleton
  var instance;

  function init(port, host) {
    var client;
    port = (typeof port === "undefined") ? null : port;
    host = (typeof host === "undefined") ? null : host;
    client = redis.createClient(port, host);

    client.on('error', function (error) {
      console.log(error.message);
    });

    return {
      // public property
      site: 'localhost',

      configure: function (post, host) {
        port = (typeof port === "undefined") ? null : port;
        host = (typeof host === "undefined") ? null : host;
        client.quit();
        client = redis.createClient(port, host);
      },

      store: function (req, res, next) {
        var site = req.host,
            page = req.path,
            ip = req.ip,
            browser = req.useragent.Browser,
            os = req.useragent.OS,
            platform = req.useragent.Platform,
            version = req.useragent.Version,
            time = moment().format('YYYYMMDDHHmmss');

        browser = _s.classify(browser);
        platform = _s.classify(platform);
        version = _s.classify(version);

        client.sadd('anl:site', site);
        client.sadd('anl:sitepage:' + site, page);
        client.sadd('anl:browser', browser);
        client.sadd('anl:os', os);
        client.sadd('anl:platform', platform);
        client.sadd('anl:version', version);
        client.sadd('anl:ip', ip);

        // total
        client.incr('anl:' + site);

        // total / time
        client.incr('anl:' + site + ':' + time);

        //page
        client.incr('anl:' + site + ':' + page + ':total');

        //page / time
        client.incr('anl:' + site + ':' + page + ':time:' + time);

        // browser
        client.incr('anl:' + site + ':browser:' + browser);
        client.incr('anl:' + site + ':browser:' + browser + ':time:' + time);

        client.incr('anl:' + site + ':os:' + os);
        client.incr('anl:' + site + ':platform:' + platform);
        client.incr('anl:' + site + ':version:' + version);
        client.incr('anl:' + site + ':ip:' + ip);
        client.incr('anl:' + site + ':' + page + ':ip:' + ip);

        next();
      },


      getTime: function () {
        return moment().format('YYYYMMDDHHmmss');
      },

      getTimeAsync: function (callback) {
        var time = instance.getTime();
        if (callback !== undefined) {
          callback(null, time);
        }
      },

      getTotal: function (callback) {
        client.get('anl:' + instance.site, function (err, total) {
          if (callback !== undefined) {
            callback(err, total);
          }
        });
      },

      // dataType: ['browser', 'platform', 'os', 'ip', 'version']
      getData: function (dataType, callback) {
        var script =
              'local items = redis.call("smembers", KEYS[1])\n' +
              'for i=1,# items do\n' +
              '  local hits = tonumber(redis.call("get", "anl:" .. ARGV[1] .. ":' + dataType + ':" .. items[i]))\n' +
              '  table.insert(items, hits)\n' +
              'end\n' +
              'return items';
        client.eval(script, 1, 'anl:' + dataType, instance.site, function (err, items) {
          var len = items.length;
          var item = {};
          for (var i=0; i<len/2; i+=1) {
            item[items[i]] = (items[i+len/2] == "Unknown") ? 0 : items[i+len/2];
          }
          if (callback !== undefined) {
            callback(err, item);
          }
        });
      },

      getBrowsers: function (callback) {
        instance.getData('browser', callback);
      },

      getVersions: function (callback) {
        instance.getData('version', callback);
      },

      getOperatingSystems: function (callback) {
        instance.getData('os', callback);
      },

      getPlatforms: function (callback) {
        instance.getData('platform', callback);
      },

      getIPs: function (callback) {
        instance.getData('ip', callback);
      },

      getPages: function (callback) {
        var script = '\
local pages = redis.call("keys", "anl:".. ARGV[1] .. ":*:total") \
local pagetable= {} \
for i=1,# pages do \
local prefixlen = string.len("anl: " .. ARGV[1] .. ":") \
local postfixlen = string.len(":total") + 1 \
local page = string.sub(pages[i], prefixlen, -1 * postfixlen) \
  table.insert(pagetable, page) \
end \
for i=1,# pages do \
local hits = tonumber(redis.call("get", pages[i])) \
  table.insert(pagetable, hits) \
end \
return pagetable';
        client.eval(script, 0, instance.site, function (err, pages) {
          var pagesobj = {};
          var len = pages.length;
          for (var i=0; i<len/2; i+=1) {
            pagesobj[pages[i]] = pages[i+len/2];
          }
          if (callback !== undefined) {
            callback(err, pagesobj);
          }
        });
      },

      getTotalMinute: function (minute, callback) {
        var script = '\
local total = 0 \
local keys = redis.call("keys", KEYS[1]) \
for i=1,# keys do \
    local hits = tonumber(redis.call("get", keys[i])) \
    total = total + hits \
end \
return total';
        client.eval(script, 1, 'anl:' + instance.site + ':' + minute + '*', function (err, total) {
          if (callback !== undefined) {
            callback(err, total);
          }
        });
      },

      getBrowserMinute: function (minute, callback) {
        var script = '\
local browsers = redis.call("smembers", KEYS[1]) \
for i=1,# browsers do \
    local keys = redis.call("keys", "anl:" .. ARGV[1] .. ":browser:" .. browsers[i] .. ":time:" .. ARGV[2] .. "*") \
    local total = 0 \
    for j=1,# keys do \
        local hits = tonumber(redis.call("get", keys[j])) \
        total = total + hits \
    end \
    table.insert(browsers, total) \
end \
return browsers';
        client.eval(script, 1, 'anl:browser', instance.site, minute, function (err, browsers) {
          var len = browsers.length;
          var browser = {};
          for (var i=0; i<len/2; i+=1) {
            browser[browsers[i]] = browsers[i+len/2];
          }
          if (callback !== undefined) {
            callback(err, browser);
          }
        });
      },

      getPagesMinute: function (minute, callback) {
        var script = '\
local pages = redis.call("keys", "anl:" .. ARGV[1] .. ":*:total") \
local pagetable = {} \
for i=1,# pages do \
  local prefixlen = string.len("anl: " .. ARGV[1] .. ":") \
  local postfixlen = string.len(":total") + 1 \
  local pagekey = string.sub(pages[i], 1, -1 * postfixlen) .. ":time:" .. ARGV[2] .. "*" \
  table.insert(pagetable, string.sub(pages[i], prefixlen, -1 * postfixlen)) \
  local keys = redis.call("keys", pagekey) \
  local total = 0 \
  for j=1,# keys do \
    local hits = tonumber(redis.call("get", keys[j])) \
    total = total + hits \
  end \
  table.insert(pagetable, total) \
end \
return pagetable';
        client.eval(script, 0, instance.site, minute, function (err, pagetable) {
          var pages = {};
          for (var i=0; i<pagetable.length; i+=1) {
            pages[pagetable[i]] = pagetable[i+1];
            i += 1;
          }
          if (callback !== undefined) {
            callback(err, pages);
          }
        });
      },

      totalBySecondTaskFactory: function (time) {
        return function (callback) {
          client.get('anl:' + instance.site + ':' + time, function (err, total) {
            if (callback !== undefined) {
              callback(err, total);
            }
          });
        };
      },

      browserTaskFactory: function (callback) {
        client.smembers('anl:browser', function (err, members) {
          var browserQueries = [], i;

          function makeFunc(brw) {
            return function (callback) {
              client.get('anl:' + instance.site + ':browser:' + brw, function (err, brwcount) {
                callback(err, brwcount);
              });
            };
          }

          for (i = 0; i < members.length; i += 1) {
            browserQueries.push(makeFunc(members[i]));
          }

          async.parallel(browserQueries, function (err, results) {
            var browsers = {};
            for (i = 0; i < members.length; i += 1) {
              browsers[members[i]] = results[i];
            }
            callback(err, browsers);
          });
        });
      },

      pageTaskFactory: function (callback) {
        client.keys('anl:' + instance.site + ':*:total', function (err, keys) {
          var pages = [], i;

          function makeFunc(page) {
            return function (callback) {
              client.get(page, function (err, pgcount) {
                callback(err, pgcount);
              });
            };
          }

          for (i = 0; i < keys.length; i += 1) {
            pages.push(makeFunc(keys[i]));
          }

          async.parallel(pages, function (err, results) {
            var data = [],
                i, re,
                keyparts,
                page;

            for (i = 0; i < keys.length; i += 1) {
              page = {};
              re = new RegExp("^anl:" + instance.site + ":(.+):total$");
              keyparts = re.exec(keys[i]);
              if (keyparts !== null) {
                page.name = keyparts[1];
                page.pgcount = results[i];
                data.push(page);
              } else {
                console.log("Error: " + keys[i]);
              }
            }
            callback(err, data);
          });
        });
      },

      broadcastFactory: function (sockets) {
        return function broadcast(callback) {
          async.parallel(
            [instance.getTimeAsync,
             instance.getTotal,
             instance.browserTaskFactory,
             instance.pageTaskFactory,
             instance.totalBySecondTaskFactory(instance.getTime())
            ],
            function (err, results) {
              sockets.in('dashboard').emit('send:dashboard', {time: results[0],
                                                              total: results[1],
                                                              browsers: results[2],
                                                              pages: results[3],
                                                              current: results[4]});
            }
          );
        };
      }

    };
  }

  return {
    // get instance if exists, create one if doesn't

    getInstance: function () {

      if (!instance) {
        instance = init();
      }

      return instance;
    }
  };

}());

module.exports = transientAnalyticsSingleton.getInstance();
