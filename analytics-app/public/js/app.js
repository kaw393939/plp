/*global MyCtrl1:false, MyCtrl2:false, DashboardCtrl:false, TotalCtrl:false */
// Declare app level module which depends on filters, and services
var app = angular.module('analyticsApp', ['analyticsApp.filters', 'analyticsApp.services', 'analyticsApp.directives']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.when('/view1', {templateUrl: 'partials/partial1', controller: MyCtrl1});
    $routeProvider.when('/view2', {templateUrl: 'partials/partial2', controller: MyCtrl2});
    $routeProvider.when('/dashboard', {templateUrl: 'partials/dashboard', controller: DashboardCtrl});
    $routeProvider.when('/total', {templateUrl: 'partials/total', controller: TotalCtrl});
    $routeProvider.otherwise({redirectTo: '/view1'});
    $locationProvider.html5Mode(true);
  }]);
