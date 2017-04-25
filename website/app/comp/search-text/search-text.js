/**
 * Created by webadnan on 9/2/15.
 */

define(['app'], app => {
    app.directive('searchText', () => {
        return {
            restrict: 'EA',
            scope: {
                ngModel: '='
            },
            templateUrl: _templateUrl('app/comp/search-text/search-text.html'),
            link: (scope, el, attr) => {
                var [minWidth, maxWidth] = ['100px', '150px']

                scope.focus = () => {
                    if (el.find('input').is(':focus')) return
                    el.find('input').focus()
                }

                scope.onFocus = () => {
                    el.find('.comp-search-text').animate({width: maxWidth}, 300)
                }

                scope.onBlur = () => {
                    el.find('.comp-search-text').animate({width: minWidth}, 300)
                }
            }
        }
    })
})
