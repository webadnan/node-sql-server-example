define([], function () {
    var app = angular.module('app', [
        'ngRoute',
        'ui.bootstrap'
    ]);

    app.service('_Promise', $q => {
        return callback => {
            var defer = $q.defer()
            callback(value => {
                defer.resolve(value)
            }, reason => {
                defer.reject(reason)
            })
            return defer.promise
        }
    })

    app.config(function ($routeProvider, $controllerProvider, $compileProvider, $filterProvider, $provide) {
        app.lazy = {
            controller: $controllerProvider.register,
            directive: $compileProvider.directive,
            filter: $filterProvider.register,
            factory: $provide.factory,
            service: $provide.service
        };

        function whenConfig(options){
            if (options.require === void 0){
                return options;
            }

            var dep = options.require;

            options.resolve = {
                load: ['$q', function($q){
                    var defer = $q.defer();
                    require(dep, function(){
                        defer.resolve('success');
                    });
                    return defer.promise;
                }]
            };

            return options;
        }

        $routeProvider.when('/', whenConfig({
            controller: 'HomeController',
            templateUrl: 'app/controllers/home-controller/home-controller.html',
            require: ['HomeController'],
            reloadOnSearch: false
        }));
        $routeProvider.when('/home', whenConfig({
            controller: 'HomeController',
            templateUrl: 'app/controllers/home-controller/home-controller.html',
            require: ['HomeController'],
            reloadOnSearch: false
        }));
        $routeProvider.when('/prod-basic', whenConfig({
            controller: 'ProdBasic',
            templateUrl: 'app/controllers/prod-basic/prod-basic.html',
            require: ['ProdBasic'],
            reloadOnSearch: false
        }));
        $routeProvider.when('/prod-settings', whenConfig({
            controller: 'ProdSettings',
            templateUrl: 'app/controllers/prod-settings/prod-settings.html',
            require: ['ProdSettings'],
            reloadOnSearch: false
        }));
        $routeProvider.when('/book-controller', whenConfig({
            controller: 'BookController',
            templateUrl: 'app/controllers/book-controller/book-controller.html',
            require: ['BookController'],
            reloadOnSearch: false
        }));
        $routeProvider.when('/lazy', whenConfig({
            controller: 'HomeController',
            templateUrl: 'app/views/lazy-load-test.html',
            reloadOnSearch: false,
            require: ['HomeController', 'lazyLoad']
        }));
        // @CODE_GENERATOR:ADD_ROUTE_PROVIDER
        $routeProvider.otherwise({
            redirectTo: '/'
        });

    });

    var lazyApp = {
        controller: function() { (app.lazy || app).controller.apply(null, arguments); },
        directive:  function() { (app.lazy || app).directive.apply(null, arguments); },
        service:    function() { (app.lazy || app).service.apply(null, arguments); },
        factory:    function() { (app.lazy || app).factory.apply(null, arguments); },
        filter:     function() { (app.lazy || app).filter.apply(null, arguments); },
        config:     function() { (app.lazy || app).config.apply(null, arguments); }
    };

    return lazyApp;
});


//var app = angular.module('pms-server', []);

//app.controller('HomeController', function($scope, $http){
//    $scope.name = 'Adnan';
//
//    $scope.sections = [];
//
//    $scope.request = function(){
//        $http({
//            method: 'get',
//            url: document.location.origin + '/api/sections'
//        }).then(function(res){
//            console.log(res);
//            $scope.sections = res.data;
//        }, function(){});
//    };
//});

