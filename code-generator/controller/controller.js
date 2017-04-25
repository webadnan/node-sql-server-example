define(['app'], function(app){
    app.controller('${ControllerName}', function($scope){
        console.log('${ControllerName}');
        $scope.$on('$destroy', function(){
            console.log('destroying ${ControllerName}');
        });
    });
});
