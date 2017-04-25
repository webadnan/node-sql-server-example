define(['app'], app => {
    [['ngEsc', 27], ['ngEnter', 13]].forEach(e => {
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
            }])
        }).apply(this, e)
    })

    app.directive('inlineEdit', (Global, Combo) => {
        return {
            restrict: 'A',
            scope: {
                inlineEdit: '&',
                ngModel: '=',
                parentSelectedItem: '=selectedItem'
            },
            link: (scope, el, attr) => {

                el.css('cursor', 'pointer')

                var $input
                var isFloating = false
                var isUserInput = () => {
                    if (attr.userInput) return attr.userInput === 'true'
                    if (attr.comboType) return false
                    return true
                }
                var getPlaceholder = () => _.get(attr, 'ngPlaceholder', '')

                var getElText = () => {
                    if (el.text() === getPlaceholder()) return ''
                    return el.text()
                }

                var setModelValue = (value, selectedItem) => {
                    if (attr.ngModel) scope.ngModel = value
                    if (selectedItem && attr.selectedItem) scope.parentSelectedItem = selectedItem
                }

                var setElText = (value, selectedItem) => {
                    setModelValue(value, selectedItem)
                    el.text(value)
                    Global.apply(scope)
                }

                if (el.prop('tagName') === 'INPUT') {
                    $input = el
                } else {
                    $input = $('.floating-text')
                    isFloating = true
                }

                scope.childScope = null
                scope.selectedItem = null

                function click(evt) {
                    if (isFloating) {
                        var $e = $(el)
                        var marginTop = parseInt($e.css('margin-top')) + parseInt($e.css('padding-top'))
                        var marginLeft = parseInt($e.css('margin-left')) + parseInt($e.css('padding-left'))
                        $input.css({
                            top: `${$e.offset().top}px`,
                            left: `${$e.offset().left}px`,
                            width: `${$e.width()}px`,
                            height: `${$e.height()}px`,
                            marginTop: `${marginTop}px`,
                            marginLeft: `${marginLeft - 2}px`,
                            textAlign: el.css('text-align')
                        }).val(getElText()).show().focus().select()
                    }
                    registerEvents()
                }

                var notifyParent = (event = {}) => {
                    event = angular.extend({attr: attr, newText: $input.val() + '', oldText: getElText() + ''}, event)
                    event.scope = el.scope()

                    if (!isUserInput()) {
                        if (!event.selectedItem) return
                        if (event.selectedItem.display) event.newText = event.selectedItem.display
                    }

                    console.log(event.oldText, event.newText)
                    console.log('event.selectedItem', event.selectedItem)

                    var updateDisplay = _.get(attr, 'updateDisplay', true)
                    if (updateDisplay) {
                        setElText(event.newText, event.selectedItem)
                        event.cancel = () => {
                            setElText(event.oldText, event.selectedItem)
                        }
                    } else {
                        event.updateDisplay = () => {
                            setElText(event.newText, event.selectedItem)
                        }
                    }

                    scope.inlineEdit({event: event})
                }

                function focusNext() {
                    if (!attr.nextFocus) return
                    var n = parseInt(attr.nextFocus) - 1
                    var $e = el.next()
                    while (n--) $e = $e.next()
                    setTimeout(() => $e.click(), 100)
                }

                function keydown(evt) {
                    if (evt.keyCode === 13) { //enter
                        if (attr.comboType === 'date') {
                            if (DateUtil.isValidYMD($input.val())) {
                                notifyParent({
                                    newText: DateUtil.toYMD($input.val()),
                                    oldText: getElText(),
                                    selectedItem: DateUtil.toDate($input.val())
                                })
                            } else {
                                notifyParent()
                            }
                        } else {
                            if (scope.selectedItem && scope.selectedItem.display == $input.val()) {
                                notifyParent({selectedItem: scope.selectedItem})
                            } else if (scope.childScope && scope.childScope.getSelectedItem && scope.childScope.getSelectedItem()) {
                                notifyParent({selectedItem: scope.childScope.getSelectedItem()})
                            } else {
                                notifyParent()
                            }
                        }
                        unRegisterEvents()

                        // focus next input
                        focusNext()

                    } else if (evt.keyCode === 27) { //esc
                        unRegisterEvents()
                    } else if (evt.keyCode === 38 || evt.keyCode === 40) { // up/down arrow
                        if (scope.childScope && scope.childScope.keydown) scope.childScope.keydown(evt)
                        evt.preventDefault()
                    }
                }

                function keyup(evt) {
                    if (Global.SPECIAL_KEYCODE.indexOf(evt.keyCode) >= 0) return
                    if (scope.childScope) scope.childScope.filter($input.val())
                }

                function registerEvents() {
                    $input.on('blur', onBlur)
                    $input.on('keydown', keydown)
                    $input.on('keyup', keyup)
                    var dropDown = null

                    if (attr.comboType) {
                        // show drop down at bottom
                        var $e = $(el)
                        if (attr.comboType === 'date') {
                            dropDown = Global.initDropDownCont().css({
                                textAlign: 'center',
                                width: `300px`,
                                top: `${$e.offset().top + $e.height() + 10}px`,
                                left: `${$e.offset().left}px`
                            }).html('wait...').show()
                        } else {
                            dropDown = Global.initDropDownCont().css({
                                width: 'auto',
                                textAlign: 'left',
                                minWidth: `${$e.width() + 5}px`,
                                maxHeight: `${parseInt($(window).height() / 2)}px`,
                                overflow: 'auto',
                                top: `${$e.offset().top + $e.height() + 10}px`,
                                left: `${$e.offset().left}px`
                            }).html('wait...')
                            if ($input.val()) dropDown.show()
                        }


                        var html
                        if (attr.comboType === 'date') {
                            html = `<date-picker></date-picker>`
                        } else {
                            html = `<combo type="${attr.comboType}"></combo>`
                        }
                        Global.createCombo(html, scope).then(childScope => {
                            $input.off('blur', onBlur)
                            if (!childScope.filter) return
                            scope.childScope = childScope
                            childScope.parentScope = scope
                            scope.childScope.filter($input.val())
                            childScope.dispatcher.on('selected', e => {
                                $input.val(e.display)
                                scope.selectedItem = e
                            })
                            childScope.dispatcher.on('close', e => {
                                if (attr.comboType === 'date') {
                                    if (e) notifyParent({newText: DateUtil.toYMD(e), selectedItem: e})
                                } else {
                                    if (e) notifyParent({newText: $input.val(), selectedItem: e})
                                }
                                unRegisterEvents()

                                if (e) focusNext()
                            })
                        })
                    }
                }

                function unRegisterEvents() {
                    if (isFloating) $input.hide()
                    $input.off('blur', onBlur)
                    $input.off('keydown', keydown)
                    $input.off('keyup', keyup)

                    if (attr.comboType) {
                        Global.destroyCombo()
                    }
                }

                function onBlur() {
                    unRegisterEvents()
                }

                el.on('click', click)

                el.on('$destroy', () => {
                    unRegisterEvents()
                })
            }
        }
    })

    app.directive('ngPlaceholder', () => {
        return {
            restrict: 'A',
            link: (scope, el, attr) => {
                var last = void 0

                var check = () => {
                    var s = el.text().trim()
                    if (s === last) return
                    last = s

                    if (s === '') {
                        el.html(attr.ngPlaceholder)
                        el.addClass('ng-placeholder')
                    } else if (s === attr.ngPlaceholder) {
                        el.addClass('ng-placeholder')
                    } else {
                        el.removeClass('ng-placeholder')
                    }
                }
                check()

                scope.$watch(check)
            }
        }
    })

    app.directive('expandToBottom', () => {
        return (scope, el, attr) => {
            var resize = () => {
                var windowHeight = $(window).height(), top = el.offset().top
                var availHeight = windowHeight - top
                console.log(windowHeight, top, availHeight);
                el.css('height', availHeight + 'px')
            }
            var _resize = _.debounce(resize, 100)
            _resize()
            $(window).on('resize', _resize)
            el.on('$destroy', () => {
                $(window).off('resize', _resize)
            })
        }
    })
})
