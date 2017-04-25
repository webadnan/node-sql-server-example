/**
 * Created by SM on 5/16/2015.
 */
define(['app'], app => {
    app.directive('datePicker', (Global, $document) => {
        return {
            restrict: 'EA',
            scope: {
            },
            templateUrl: _templateUrl('app/comp/date-picker/date-picker.html'),
            link: (scope, el, attr) => {

                scope.parentScope = null
                scope.selectedDate = null

                scope.dispatcher = new EventDispatcher()

                var startDate = DateUtil.MIN_DATE
                var endDate = DateUtil.MAX_DATE
                var currentDate = new Date()
                var TODAY = new Date()

                var data = scope.data = {};
                data.weekDays = "Su|Mo|Tu|We|Th|Fr|Sa".split('|');
                data.days = [];
                var offset = 0;

                scope.filter = text => {
                    if (DateUtil.isValidYMD(text)){
                        offset = DateUtil.getYMDiff(text, TODAY)
                        currentDate = DateUtil.toDate(text)
                        init()
                        Global.apply(scope)
                    } else if (DateUtil.isValidYM(text)) {
                        offset = DateUtil.getYMDiff(text, TODAY)
                        currentDate = DateUtil.toDate(DateUtil.toYM(text, '-') + '-01')
                        init()
                        Global.apply(scope)
                    } else if (DateUtil.isValidY(text)) {
                        var ymd = DateUtil.toY(text) + '-01-01'
                        offset = DateUtil.getYMDiff(ymd, TODAY)
                        currentDate = DateUtil.toDate(ymd)
                        init()
                        Global.apply(scope)
                    }
                }

                function init() {
                    var i, yearMonth = getYearMonth();
                    var [startYMD, endYMD, currentYMD] = [startDate, endDate, currentDate].map(e => DateUtil.toYMD(e))
                    data.firstDate = DateUtil.toDate(yearMonth.concat([1]).join('/'));
                    data.lastDate = DateUtil.toDate(yearMonth.concat([31]).join('/'));
                    //data.firstWeekDayIndex = data.firstDate.getDay();
                    var checkDate = data.lastDate.getDate();
                    if (checkDate < 31) {
                        data.lastDate = DateUtil.toDate(yearMonth.concat([31 - checkDate]).join('/'));
                    }

                    // populating days
                    data.days = [];

                    // initial empty cells
                    for (i = 0; i < data.firstDate.getDay(); i++)
                        data.days.push({text: "", cssClass: 'cell'});

                    // month days cells
                    for (i = data.firstDate.getDate(); i <= data.lastDate.getDate(); i++) {
                        var ymd = DateUtil.toYMD(DateUtil.toDate(yearMonth.concat([i]).join('/')));
                        var isValid = ymd >= startYMD && ymd <= endYMD;
                        var tuple = {text: "" + i, cssClass: 'cell hover'};
                        if (!isValid) tuple.cssClass = 'cell disabled';
                        if (ymd === currentYMD) tuple.cssClass += ' today';
                        data.days.push(tuple);
                    }

                    // trialing emtpy cells
                    if (data.lastDate.getDay() < 6)
                        for (i = data.lastDate.getDay() + 1; i <= 6; i++)
                            data.days.push({text: "", cssClass: 'cell'});

                    var tokens = data.firstDate.toString().split(' ');
                    data.yearMonthText = tokens[1] + ' ' + tokens[3];

                    scope.previousClass = isValidPrevious() ? 'previous' : 'previous disabled';
                    scope.nextClass = isValidNext() ? 'next' : 'next disabled';
                    //scope.previousClass = 'previous';
                    //scope.nextClass = 'next';
                }

                init();

                scope.onNext = function (add) {
                    offset += add;
                    console.log(offset);
                    if (isValid()) {
                        init();
                    } else {
                        offset -= add;
                        return;
                    }
                };

                function isValidNext() {
                    offset++;
                    var flag = isValid();
                    offset--;
                    return flag;
                }

                function isValidPrevious() {
                    offset--;
                    var flag = isValid();
                    offset++;
                    return flag;
                }

                function isValid() {
                    var i, yearMonth = getYearMonth();
                    var startYMD = DateUtil.toYMD(startDate), endYMD = DateUtil.toYMD(endDate)
                    data.firstDate = DateUtil.toDate(yearMonth.concat([1]).join('/'));
                    data.lastDate = DateUtil.toDate(yearMonth.concat([31]).join('/'));
                    var checkDate = data.lastDate.getDate();
                    if (checkDate < 31) {
                        data.lastDate = DateUtil.toDate(yearMonth.concat([31 - checkDate]).join('/'));
                    }

                    // month days cells
                    for (i = data.firstDate.getDate(); i <= data.lastDate.getDate(); i++) {
                        var ymd = DateUtil.toYMD(yearMonth.concat([i]).join('/'));
                        if (ymd >= startYMD && ymd <= endYMD) return true;
                    }
                    return false;
                }

                scope.onDate = function (tuple) {
                    if (tuple.text === "") return;
                    console.log(getYearMonth().concat(tuple.text).join('/'));
                    scope.selectedDate = DateUtil.toDate(getYearMonth().concat(tuple.text).join('/'));
                };

                function getYearMonth() {
                    return DateUtil._getYM(offset)
                }

                var documentClick = evt => {
                    var $t = $(evt.target)
                    if (isParent(el.find('.days'), $t)) {
                        scope.dispatcher.fire('close', scope.selectedDate)
                    } else if (isParent(el, $t)) {
                        // ignore
                    } else if (!scope.parentScope) {
                        scope.dispatcher.fire('close')
                    } else if (isParent($('.floating-text'), $t)) {
                        // ignore
                    } else {
                        scope.dispatcher.fire('close')
                    }
                }

                $document.on('click', documentClick)

                el.on('$destroy', () => {
                    $document.off('click', documentClick)
                })
                scope.$emit('combo-created', scope)
            }
        };
    });
});