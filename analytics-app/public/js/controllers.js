'use strict';

/* Controllers */

function AppCtrl($scope, socket) {
  socket.on('send:name', function (data) {
    $scope.name = data.name;
  });
}

function MyCtrl1($scope, socket) {
  socket.on('send:time', function (data) {
    $scope.time = data.time;
  });
}
MyCtrl1.$inject = ['$scope', 'socket'];


function MyCtrl2() {
}
MyCtrl2.$inject = [];

function DashboardCtrl($scope, socket) {
    socket.emit('subscribe:dashboard');

    socket.on('send:dashboard', function (data) {
        $scope.total = data.total;
    });
    socket.on('send:time', function (data) {
        $scope.time = data.time;
    });
}
DashboardCtrl.$inject = ['$scope', 'socket'];
