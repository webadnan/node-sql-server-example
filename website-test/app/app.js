define([], function () {
    var app = angular.module('app', [
        'ngRoute',
        'ui.bootstrap'
    ]);

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
            templateUrl: 'app/controllers/home-controller.html',
            require: ['HomeController']
        })).when('/lazy', whenConfig({
            controller: 'HomeController',
            templateUrl: 'app/views/lazy-load-test.html',
            reloadOnSearch: false,
            require: ['HomeController', 'lazyLoad']
        })).otherwise({
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
