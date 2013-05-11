/* Controllers */

function AppCtrl($scope, $http) {
  $http({method: 'GET', url: '/api/name'}).
  success(function(data, status, headers, config) {
    $scope.name = data.name;
  }).
  error(function(data, status, headers, config) {
    $scope.name = 'Error!';
  });

  $http({method: 'GET', url: '/api/total'}).
    success(function(data, status, headers, config) {
      $scope.total = JSON.stringify(data);
    }).
    error(function(data, status, headers, config) {
      $scope.total = 'Error!';
    });

/*
  socket.on('send:name', function (data) {
    $scope.name = data.name;
  });
*/
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
    $scope.browsers = JSON.stringify(data.browsers, undefined, 2);
    $scope.pages = JSON.stringify(data.pages, undefined, 2);
  });
  socket.on('send:time', function (data) {
    $scope.time = data.time;
  });
}
DashboardCtrl.$inject = ['$scope', 'socket'];

function TotalCtrl($scope) {
}
TotalCtrl.$inject = ['$scope'];
