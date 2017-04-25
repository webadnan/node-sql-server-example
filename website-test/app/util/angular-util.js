define(['app'], function(app){
    [['ngEsc', 27], ['ngEnter', 13]].forEach(function (e) {
        (function (name, keyCode) {
            app.directive(name, ['$document', function ($document) {
                return function (scope, element, attrs) {
                    var component = element;

                    function onKeydown(event) {
                        if (element.prop('tagName').toUpperCase() === 'INPUT' && !element.is(':focus')) return;
                        if (component.is(':visible') && event.keyCode === keyCode) {
                            scope.$event = event;
                            scope.$apply(attrs[name]);
                        }
                    }

                    $document.on('keydown', onKeydown);
                    element.on('$destroy', function () {
                        $document.off('keydown', onKeydown);
                    });
                };
            }]);
        }).apply(this, e);
    });
});