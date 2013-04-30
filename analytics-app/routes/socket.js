/*
 * Serve content over a socket
 */
var redisStore = require('../lib/redisStore');

module.exports = function (socket) {

  socket.join('dashboard');

  socket.emit('send:name', {
    name: 'Bob'
  });

  setInterval(function () {
    socket.emit('send:time', {
      time: (new Date()).toString()
    });
  }, 1000);

    setInterval(function () {
        redisStore.broadcastFactory(socket)();
    }, 5000);
};
