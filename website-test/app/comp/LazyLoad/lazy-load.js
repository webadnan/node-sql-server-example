define(['app'], function(app){
    app.directive('lazyLoad', function(){
        return {
            restrict: 'EA',
            scope: {},
            template: 'lazy load blah blah',
            link: function(scope, el, attr){
                console.log('lazy load');
            }
        };
    });
});