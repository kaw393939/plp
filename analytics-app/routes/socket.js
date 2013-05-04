/*
 * Serve content over a socket
 */
var transientAnalytics = require('../lib/transientAnalytics');

module.exports = function (socket) {

    socket.on('subscribe:dashboard', function(data) { 
        socket.join('dashboard'); 
    });

    socket.on('unsubscribe:dashboard', function(data) { 
        socket.leave('dashboard'); 
    });

/*
    socket.emit('send:name', {
        name: 'Bob'
    });
*/
    setInterval(function () {
        socket.emit('send:time', {
            time: (new Date()).toString()
        });
    }, 1000);

    setInterval(function () {
        transientAnalytics.broadcastFactory(socket.manager.sockets)();
    }, 5000);
};
