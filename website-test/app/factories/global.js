/**
 * Created by SM on 5/12/2015.
 */
define(['app'], function(app){
    app.factory('Global', function($q){
        function resolve(data){
            var defer = $q.defer();
            defer.resolve(data);
            return defer.promise;
        }

        return {
            resolve: resolve
        };
    });
});
