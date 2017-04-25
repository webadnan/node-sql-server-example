app.directive('apiTester', function($http){
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'app/comp/APITester/api-tester.html',
        link: function(scope, element, attr){
            scope.data = {
                request: localStorage.pms_server_request || '',
                response: ''
            };

            var editor = ace.edit("editor");
            editor.getSession().setMode("ace/mode/javascript");
            editor.setValue(scope.data.request);

            scope.onRequestChange = function(){
                localStorage.pms_server_request = scope.data.request;
            };

            function _getBody(){
                localStorage.pms_server_request = editor.getValue();
                try {
                    return JSON.parse(editor.getValue());
                }catch(err){
                    return void 0;
                }
            }

            //scope.onParam = function(){
            //    $http({
            //        method: 'post',
            //        url: document.location.origin + '/api/sections',
            //        params: {
            //            mynameis: 'alibaba'
            //        },
            //        data: {
            //            yournameis: 'kopasamsu'
            //        }
            //    }).then(function(res){
            //        console.log(res);
            //        scope.data.response = JSON.stringify(res.data, undefined, 4);
            //    }, function(){});
            //};


/*
            Example
            [
                {
                    "api": "codefile.sections",
                    "cd": "3"
                },
                {
                    "api": "codefile.cross"
                },
                {
                    "api": "master-data.get"
                },
                {
                    "api": "employee.get",
                    "sectionCd": "10"
                }
            ]
*/
            scope.onBatch = function(){
                var body = _getBody();
                if (!body){
                    scope.data.response = "Error on parsing request.";
                    return;
                }
                scope.data.response = 'Wait...';
                $http({
                    method: 'post',
                    url: document.location.origin + '/api/batch',
                    data: body
                }).then(function(res){
                    scope.data.response = JSON.stringify(res.data, undefined, 4);
                }, function(err){
                    console.log(err);
                    scope.data.response = 'Error...';
                });
            };

            scope.onClear = function(){
                scope.data.response = '';
            };
        }
    };
});