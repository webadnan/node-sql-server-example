/**
 * Created by smadnan on 8/19/15.
 */
define(['app'], app => {
    app.directive('pmsHeader', () => {
        return {
            restrict: 'EA',
            scope: {},
            transclude: true,
            templateUrl: _templateUrl('app/comp/pms-header/pms-header.html'),
            link: (scope, element, attr) => {
                console.log('inside pms-header');

                ['left', 'center', 'right'].forEach(e => {
                    var $e = element.find(e)
                    if (!$e.length) return;
                    $e.addClass(`${e} common`)
                })
            }
        }
    })
})
