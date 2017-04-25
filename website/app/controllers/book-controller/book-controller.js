/**
 * Created by webadnan on 9/22/15.
 */
define(['app'], app => {
    var TabViewMode = {
        STYLES: 'nav-styles',
        DETAILS: 'nav-details',
        CLOSED: 'nav-closed'
    }

    app.controller('BookController', ($scope, Global, Rest, PmsMenu) => {
        var scope = $scope, data = scope.data = {}
        data.section = 'Knitting'
        scope.Global = Global
        data.tabViewMode = TabViewMode.STYLES
        data.wait = false
        data.orders = []
        data.openedOrders = []
        data.closedOrders = []
        data.filteredOrders = []
        data.filter = ''
        //data.appliedFilter = void 0
        data.section = 'knitting'
        var styleDetailMenuItems = new PmsMenuItems([
            {key: 'select', value: 'Select', icon: 'fa fa-check'}
        ])

        var setTabContHeight = percent => {
            var availableHeight = $(window).height() - $('.tab-view-cont').offset().top
            var height = availableHeight * percent / 100
            $('.tab-view-cont').height(height)
            //$('.tab-view-cont').animate({
            //    height: `${height}px`
            //}, 100)
        }

        var resize = () => setTabContHeight(25)
        var _resize = _.debounce(resize, 100)

        WaitFor(scope, () => $('.tab-view-cont').length, () => {
            resize()
        })

        var loadData = () => {
            data.wait = true
            Rest.api('codefile.orders').then(orders => {
                orders = _.sortByOrder(orders, ['create_date'], ['desc'])
                data.openedOrders = []
                data.closedOrders = []
                orders.forEach(e => {
                    e.create_date = e.create_date.substr(0, 10)
                    e.cssClass = 'style'
                    if (e.status == 'o' && e['status_' + data.section] == 'o') data.openedOrders.push(e)
                    else data.closedOrders.push(e)
                })
                data.orders = data.openedOrders
                data.appliedFilter = void 0
            }).finally(() => {
                data.wait = false
            })
        }

        loadData()

        scope.getOrders = () => {
            //if (data.filter === data.appliedFilter) return data.filteredOrders
            //data.appliedFilter = data.filter

            if (!data.filter) {
                return (data.filteredOrders = data.orders)
            } else {
                var txt = data.filter.toUpperCase()
                data.filteredOrders = data.orders.filter(e => {
                    return (e.style && e.style.toUpperCase().indexOf(txt) >= 0)
                })
            }

            return data.filteredOrders
        }

        scope.onTab = tab => {
            $('.book-controller .nav-tabs .active').removeClass('active')
            $('.book-controller .nav-tabs .' + tab).addClass('active')
            data.tabViewMode = tab
            if (tab == TabViewMode.CLOSED) {
                console.log('closed')
                data.orders = data.closedOrders
                scope.getOrders()
            } else {
                console.log('opened')
                data.orders = data.openedOrders
                scope.getOrders()
            }
        }

        scope.onStyle = style => {
            data.orders.forEach(e => e.cssClass = 'style')
            style.cssClass = 'style selected-style'
        }

        scope.onSelect = evt => {
            var $t = $(evt.target), e = $t.scope().e
            data.orders.forEach(x => x.cssClass = 'style')
            e.cssClass = 'style selected-style'
            scope.onTab('nav-styles')
        }

        // suppress up/down/left/right arrow (except for id-no input)
        var keydown = evt => {
            if ($('.id-no-input').is(':focus')) return
            var c = evt.keyCode
            if (c >= 37 && c <= 40) {
                evt.preventDefault()
            }
        }

        $(window).on('resize', _resize)
        $(window).on('keydown', keydown)
        scope.$on('$destroy', () => {
            $(window).off('resize', _resize)
            $(window).off('keydown', keydown)
        })
    })
})
