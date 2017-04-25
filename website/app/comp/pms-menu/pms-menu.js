/**
 * Created by webadnan on 9/6/15.
 */

define(['app'], app => {
    app.factory('PmsMenu', ($rootScope, Global, _Promise) => {
        var self = {
            resolve: null,
            reject: null,
            promise: null,
            menuInfo: null,

            showWithTarget: ($target, menuInfo) => {
                // destroy previous menu
                if (self.reject) {
                    return new _Promise((resolve, reject) => {
                        self.promise.finally(() => {
                            self.resolve = self.reject = null
                            self.showWithTarget($target, menuInfo).then(resolve, reject)
                        })
                        self.reject()
                    })
                }

                self.menuInfo = menuInfo
                var x = $target.offset().left, y = $target.offset().top + $target.height() + 10
                var left = x, right = $(window).width() - (x + $target.width())

                //$(window).width() - x < 200
                if (right <= left) {
                    Global.initDropDownCont().css({
                        width: 'auto',
                        minWidth: '100px',
                        textAlign: 'left',
                        overflow: 'auto',
                        top: `${y}px`,
                        right: `${$(window).width() - x - $target.width()}px`
                    }).show().html('wait...')
                } else {
                    Global.initDropDownCont().css({
                        width: 'auto',
                        minWidth: '100px',
                        textAlign: 'left',
                        overflow: 'auto',
                        top: `${y}px`,
                        left: `${x}px`
                    }).show().html('wait...')
                }

                self.promise = new _Promise((resolve, reject) => {
                    Global.createCombo(`<pms-menu></pms-menu>`, $rootScope).then(scope => {
                        self.resolve = resolve
                        self.reject = reject
                    })
                }). finally(() => {
                        Global.destroyCombo()
                        console.log('PmsMenu factory, finally');
                        self.resolve = self.reject = null
                    })

                return self.promise
            }
        }
        return self
    })

    app.directive('pmsMenu', (PmsMenu, $document) => {
        return {
            restrict: 'EA',
            templateUrl: _templateUrl('app/comp/pms-menu/pms-menu.html'),
            scope: {},
            link: (scope, el, attr) => {

                scope.menuInfo = PmsMenu.menuInfo

                scope.onMenu = evt => {
                    if (PmsMenu.resolve) PmsMenu.resolve($(evt.target).scope().e);
                    else el.remove()
                }

                var documentClick = evt => {
                    if (!isParent(el, $(evt.target))) {
                        console.log('outside click')
                        if (PmsMenu.reject) PmsMenu.reject()
                    }
                }

                setTimeout(() => {
                    $document.on('click', documentClick)
                }, 0)

                console.log('pms-menu created');
                el.on('$destroy', () => {
                    console.log('pms-menu destroyed');
                    $document.off('click', documentClick)
                })
                scope.$emit('combo-created', scope)
            }
        }
    })
})
