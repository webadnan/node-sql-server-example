/**
 * Created by SM on 5/8/2015.
 */
define(['app'], function(app){
    app.factory('Rest', function ($http, $q) {
        return {
            batch: batch,
            api: api
        };

        function _http(param){
            return $http(param).then(_commonSuccess, _commonFailure);
        }

        function _commonSuccess(res){
            return res;
        }

        function _commonFailure(err){
            console.log(err);
            return $q.reject(err);
        }

        function batch(data){
            var isArray = data instanceof Array;
            if (!isArray) data = [data];
            return _http({
                method: 'post',
                url: document.location.origin + '/api/batch',
                data: data
            }).then(function(res){
                //return isArray ? res.data : res.data[0];
                return res.data
            });
        }

        function api(apiName, param = {}) {
            param = angular.extend(param, {api: apiName})
            return batch(param)
        }
    });
});
