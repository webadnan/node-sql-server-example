/**
 * Created by webadnan on 9/2/15.
 */

define(['app'], app => {
    app.controller('ProdSettings', ($scope, Global, Rest, PmsMenu) => {
        var scope = $scope, data = scope.data = {}
        scope.Global = Global
        data.section = (Url.queries.section || 'knitting').toName()
        data.filter = ''
        data.editTitle = 'Edit Detail'
        data.showDetail = false
        data.wait = false
        data.newOrder = {}
        var ViewMode = {
            OPEN: 'open',
            CLOSE: 'close',
            EDIT: 'edit'
        }
        data.viewMode = ViewMode.OPEN
        scope.pms = pms

        // Other data needed
        //data.selectedItem = null // selected element


        var menuItemsForOpen = new PmsMenuItems([
            {key: 'edit', value: 'Edit Detail', icon: 'fa fa-pencil'},
            {key: 'close', value: 'Close order', icon: 'fa fa-trash-o'}
        ])
        var menuItemsForClose = new PmsMenuItems([
            {key: 'edit', value: 'Edit Detail', icon: 'fa fa-pencil'},
            {key: 'open', value: 'Open order', icon: 'fa fa-undo'}
        ])

        scope.onMenu = evt => {
            if (data.wait) return
            var $t = $(evt.target), e = $t.scope().e, cd = e.cd
            var menuItems = (e.status === 'o') ? menuItemsForOpen : menuItemsForClose
            PmsMenu.showWithTarget($t, menuItems).then(menuItem => {
                if (menuItem.key === 'edit') {
                    _edit(e)
                } else if (menuItem.key === 'close') {
                    Global.confirm(`Do you want to close order with cd = ${e.cd}?`).then(() => {
                        e.status = 'c'
                        _.remove(data.displayOrders, a => a.cd === e.cd)
                    })
                } else if (menuItem.key === 'open') {
                    Global.confirm(`Do you want to open order again with cd = ${e.cd}?`).then(() => {
                        e.status = 'o'
                        _.remove(data.displayOrders, a => a.cd === e.cd)
                    })
                }
            })
        }

        scope.onOrderAdd = evt => {
            var e = data.newOrder
            if (!e.buyer) return Global.alert('Please input buyer')
            if (!e.style) return Global.alert('Please input style')
            if (!e.qty || isNaN(e.qty)) return Global.alert('Please input quantity (number)')
            if (!DateUtil.isValidDate(e.create_date)) return Global.alert('Please provide a valid date')

            var insertObj = _chain(e).pick('create_date', 'qty', 'remark').assign({
                style_cd: e.style.cd,
                buyer_cd: e.buyer.cd,
                status: 'o'
            }).value()

            Rest.api('codefile.add-order', insertObj).then(rows => {
                var row = rows[0]
                row.create_date = row.create_date.substr(0, 10)
                data.displayOrders.unshift(row)
                data.orders.unshift(row)
                data.newOrder = {}
                $('.new_buyer, .new_style, .new_qty, .new_create_date, .new_remark').html('')
            }, printRes)
        }

        scope.onEdit = evt => {
            var $t = $(evt.target), e = $t.scope().e
            _edit(e)
        }

        var _edit = e => {
            if (data.wait) return
            if (data.showDetail) return
            data.selectedItem = e
            data.displayOrders = [e]
            scope.showEdit()
        }

        scope.showOpened = () => {
            $('.prod-settings .nav-tabs .active').removeClass('active')
            $('.prod-settings .nav-opened').addClass('active')
            data.displayOrders = _.where(data.orders, {status: 'o'})
            data.filter = ''
            data.showDetail = false
            data.viewMode = ViewMode.OPEN
        }

        scope.showClosed = () => {
            $('.prod-settings .nav-tabs .active').removeClass('active')
            $('.prod-settings .nav-closed').addClass('active')
            data.displayOrders = _.where(data.orders, {status: 'c'})
            data.filter = ''
            data.showDetail = false
            data.viewMode = ViewMode.CLOSE
        }

        scope.showEdit = () => {
            $('.prod-settings .nav-tabs .active').removeClass('active')
            $('.prod-settings .nav-edit').addClass('active')
            data.filter = ''
            data.showDetail = true
            loadOrderDetail()
            initInput()
            data.viewMode = ViewMode.EDIT
        }

        scope.onBuyer = evt => {
            console.log('buyer', evt);
            if (!evt.selectedItem) return evt.cancel()
            var e = evt.scope.e, cd = e.cd, buyerCd = +evt.selectedItem.cd, buyer = evt.selectedItem.display
            e.buyer_cd = buyerCd
            e.buyer = buyer
            Rest.api('codefile.update-order', {cd: cd, buyer_cd: buyerCd}).then(printRes)
        }

        scope.onStyle = evt => {
            console.log('style', evt);
            if (!evt.selectedItem) return evt.cancel()
            var e = evt.scope.e, cd = e.cd, styleCd = +evt.selectedItem.cd, style = evt.selectedItem.display
            e.style_cd = styleCd
            e.style = style
            Rest.api('codefile.update-order', {cd: cd, style_cd: styleCd}).then(printRes)
        }

        scope.onQty = evt => {
            if (isNaN(evt.newText)) return evt.cancel()
            var e = evt.scope.e, cd = e.cd, qty = parseInt(evt.newText)
            e.qty = qty
            Rest.api('codefile.update-order', {cd: cd, qty: qty}).then(printRes)
        }

        scope.onDate = evt => {
            console.log('date', evt);
            if (!evt.selectedItem) return evt.cancel()
            var e = evt.scope.e, cd = e.cd, date = DateUtil.toYMD(evt.selectedItem)
            e.create_date = date
            Rest.api('codefile.update-order', {cd: cd, create_date: date}).then(printRes)
        }

        scope.onRemark = evt => {
            var e = evt.scope.e, cd = e.cd, remark = evt.newText
            e.remark = remark
            Rest.api('codefile.update-order', {cd: cd, remark: remark}).then(printRes)
        }

        scope.onRate = evt => {
            if (!evt.selectedItem) {
                Global.ModalDialogs.alert(`${evt.newText} is not added to database`)
                return evt.cancel()
            }
            var rate = evt.scope.rate
            var search = _.where(data.sectionDetail[rate.section], {
                order_cd: rate.order_cd,
                section_cd: rate.section_cd,
                rate_name: evt.newText
            })
            if (search.length > 0) {
                evt.cancel()
                Global.ModalDialogs.alert(`${evt.newText} already exists`)
                return
            }

            Rest.api('prod.update-order-detail', {
                where: {
                    order_cd: rate.order_cd,
                    section_cd: rate.section_cd,
                    rate_name: rate.rate_name
                },
                update: {
                    rate_name: evt.newText
                }
            }).then(e => {
                console.log('update response', e);
                if (e.result) rate.rate_name = evt.newText
            }, err => {
                evt.cancel()
            })
        }

        scope.onRateValue = evt => {
            if (isNaN(evt.newText)) return evt.cancel()
            var rate = evt.scope.rate

            Rest.api('prod.update-order-detail', {
                where: {
                    order_cd: rate.order_cd,
                    section_cd: rate.section_cd,
                    rate_name: rate.rate_name
                },
                update: {
                    rate_value: +evt.newText
                }
            }).then(e => {
                console.log('update response', e);
                if (e.result) rate.rate_value = evt.newText
            }, err => {
                evt.cancel()
            })
        }

        scope.onTarget = evt => {
            var rate = $(evt.target).scope().rate
            console.log(rate);

            Rest.api('prod.update-order-detail', {
                where: {
                    order_cd: rate.order_cd,
                    section_cd: rate.section_cd,
                    rate_name: rate.rate_name
                },
                update: {
                    rate_target: rate.rate_target ? 'T' : 'null'
                }
            }).then(e => {
                console.log('update response', e);
            }, err => {
                console.error(err)
            })
        }

        scope.onNewRate = evt => {
            console.log(evt);
            console.log($(evt.target).scope());
            var section = evt.attr.section, e = data.input[section]
            if (evt.selectedItem) e.newRateName = evt.selectedItem.display
            else e.newRateName = ''
        }

        scope.onAdd = evt => {
            var section = $(evt.target).scope().section
            var e = data.input[section]
            if (!e.newRateName) return Global.alert('Please provide rate name')
            if (!e.newRateValue) return Global.alert('Please provide rate value')
            if (_.find(data.sectionDetail[section], {rate_name: e.newRateName})) {
                return Global.alert(e.newRateName + ' already existed')
            }

            var insertObj = {
                order_cd: data.displayOrders[0].cd,
                section: section,
                rate_name: e.newRateName,
                rate_value: e.newRateValue,
                rate_target: e.newTarget ? 'T' : ''
            }
            console.log(insertObj);
            Rest.api('prod.add-order-detail', insertObj).then(rows => {
                console.log(rows);
                var row = rows[0]
                row.section = section
                row.rate_target = row.rate_target === 'T'
                if (data.sectionDetail[section]) data.sectionDetail[section].push(row)
                else data.sectionDetail[section] = [row]
                initInput()
            }, printRes)
        }

        scope.onDelete = evt => {
            var rate = $(evt.target).scope().rate
            Rest.api('prod.delete-order-detail', _.pick(rate, 'order_cd', 'section_cd', 'rate_name')).then(res => {
                console.log(res);
                if (res.result === 'success') {
                    data.sectionDetail[rate.section] = _.remove(data.sectionDetail[rate.section], e => {
                        return e.rate_name !== rate.rate_name
                    })
                }
            })
        }

        data.wait = true
        Rest.api('codefile.orders').then(orders => {
            orders.forEach(e => e.create_date = e.create_date.substr(0, 10))
            data.orders = _.sortByOrder(orders, ['create_date'], ['desc'])
            scope.showOpened()
        }).finally(() => {
            data.wait = false
        })

        var initInput = () => {
            data.input = data.input || {}
            pms.prod_sections.forEach(section => {
                data.input[section] = {}
            })
        }

        var loadOrderDetail = () => {
            Rest.api('prod.order-details', {cd: data.selectedItem.cd}).then(ar => {
                initInput()
                data.sectionDetail = {}
                data.sectionDetail = _chain(ar).groupBy(e => {
                    e.rate_target = (e.rate_target === 'T')
                    return e.section
                }).value()
            })
        }
    })

    app.filter('filterOrders', () => {
        return (ar, text) => {
            if (!text) return ar
            text = text.toLowerCase()
            return ar.filter(e => {
                return (e.buyer + e.style).toLowerCase().indexOf(text) !== -1
            })
        }
    })
})
