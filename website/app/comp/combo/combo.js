/**
 * Created by webadnan on 9/5/15.
 */
define(['app'], app => {
    app.factory('Combo', (Rest, $compile, _Promise) => {
        var self = {
            buyer: () => self.fetchData('codefile.buyers', 'cd', ['name', 'remark']),
            style: () => self.fetchData('codefile.styles', 'cd', 'name'),
            rate: () => self.fetchData('codefile.rates', 'name', 'name', false),

            fetchData: (api, keyField, displayFields, showKeyField = true) => {
                if (!(displayFields instanceof Array)){
                    displayFields = [displayFields]
                }
                return new _Promise((resolve, reject) => {
                    Rest.api(api).then(data => {
                        data = data.map(e => {
                            var display = displayFields.map(df => e[df]).filter(e => e.length).join(', ')
                            return {cd: e[keyField], display: display, showCd: showKeyField}
                        })
                        data = _.sortByOrder(data, ['display'], ['asc'])
                        resolve(text => {
                            text = text.toUpperCase()
                            return new _Promise((resolve, reject) => {
                                var filtered = data.filter(e => {
                                    return (e.display.toUpperCase() == text)
                                })
                                if (filtered.length > 0) resolve(filtered)
                                else resolve(data.filter(e => {
                                    return e.display.toUpperCase().indexOf(text) >= 0
                                }))
                            })
                        })
                    }, reject)
                })
            }
        }

        return self
    })

    app.directive('combo', (Combo, $document) => {
        return {
            restrict: 'EA',
            templateUrl: _templateUrl('app/comp/combo/combo.html'),
            scope: {},
            link: (scope, el, attr) => {

                scope.filterText = ''
                scope.selectedIndex = -1
                scope.parentScope = null
                scope.data = null

                function init(){
                    scope.selectedIndex = -1
                    el.find('.combo-table-row-selected').removeClass('combo-table-row-selected')
                }

                scope.dispatcher = new EventDispatcher()

                scope.filter = text => {
                    if (scope.filterText === text) {
                        $('.drop-down-cont').hide()
                        return
                    }
                    scope.filterText = text
                    if (text.length === 0){
                        $('.drop-down-cont').hide()
                    } else {
                        scope.doFilter()
                    }
                }

                function highlight(index) {
                    scope.selectedIndex = index
                    scope.dispatcher.fire('selected', scope.data[index])
                    el.find('.combo-table-row-selected').removeClass('combo-table-row-selected')
                    el.find('.combo-table-row').eq(scope.selectedIndex).addClass('combo-table-row-selected')
                }

                scope.doFilter = () => {
                    if (scope.filterText === '') return
                    init()
                    if (!scope.dataProvider) return
                    scope.dataProvider(scope.filterText).then(data => {
                        scope.data = data
                        if (data.length > 0){
                            $('.drop-down-cont').show()
                        } else {
                            $('.drop-down-cont').hide()
                        }
                    })
                }

                scope.keydown = evt => {
                    if (scope.data.length === 0) return;
                    if (evt.keyCode === 38) { // up arrow
                        if (scope.selectedIndex === -1){
                            scope.selectedIndex = 0;
                        } else {
                            scope.selectedIndex = Math.max(scope.selectedIndex-1, 0)
                        }
                    } else if (evt.keyCode === 40) { // down arrow
                        if (scope.selectedIndex === -1){
                            scope.selectedIndex = 0;
                        } else {
                            scope.selectedIndex = Math.min(scope.selectedIndex+1, scope.data.length-1)
                        }
                    }
                    highlight(scope.selectedIndex)
                }

                scope.mouseOver = evt => {
                    highlight(+$(evt.currentTarget).attr('index'))
                }

                Combo[attr.type]().then(dataProvider => {
                    scope.dataProvider = dataProvider;
                    scope.doFilter()
                })

                var documentClick = evt => {
                    if (isParent(el, $(evt.target))) {
                        scope.dispatcher.fire('close', (scope.selectedIndex >= 0 ? scope.data[scope.selectedIndex] : null))
                    } else if (!scope.parentScope) {
                        scope.dispatcher.fire('close')
                    } else if (isParent($('.floating-text'), $(evt.target))) {
                        // ignore
                    } else {
                        scope.dispatcher.fire('close')
                    }
                }

                /**
                 * If number of item is 1 then that will be selected item by default
                 */
                scope.getSelectedItem = () => {
                    if (scope.data && scope.data.length === 1) {
                        return scope.data[0]
                    }
                    return null
                }

                $document.on('click', documentClick)
                console.log('combo-created');
                el.on('$destroy', () => {
                    console.log('combo-destroyed');
                    $document.off('click', documentClick)
                })
                scope.$emit('combo-created', scope)
            }
        }
    })
})
