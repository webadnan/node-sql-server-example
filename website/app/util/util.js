class Url {
    static getQueries(hash = document.location.hash) {
        if (!hash) {
            return {};
        }
        if (Url._hashToObj.map[hash]) {
            return Url._hashToObj.map[hash];
        }
        var actionQuery = hash.split(/#\//)[1].split('?');
        var obj = {};
        obj.action = actionQuery[0].split('/')[0];
        if (actionQuery.length >= 2) {
            var query = actionQuery[1];
            query.split('&').forEach(function (e) {
                var pair = e.split('=');
                var key = pair[0];
                var value = pair.length > 1 ? pair[1] : '';
                obj[key] = decodeURI(value);
            });
        }
        Url._hashToObj.list.push(hash);
        Url._hashToObj.map[hash] = obj;
        if (Url._hashToObj.list.length > Url._hashToObj.MAX) {
            delete Url._hashToObj.map[Url._hashToObj.list.shift()];
        }
        return obj;
    }

    static get queries() {
        return Url.getQueries();
    }

    static get action() {
        return Url.getQueries().action;
    }

    static setQueries(p, updateSlno = true) {
        var pre = Url.getQueries();
        if (Url._s === -1) {
            Url._s = +_und(pre.s, '0');
        }
        if (updateSlno) {
            p.s = ++Url._s;
        }
        window.location.hash = Url.createHash(p);
    }

    static set queries(value) {
        Url.setQueries(value);
    }

    static createHash(p) {
        if (!p.action) {
            throw new Error("action must be provided with createUrlHash");
        }
        p = _.extend({}, p);
        var hash = "#/" + p.action;
        delete p.action;
        var ar = [];
        _.forEach(p, (value, key) => {
            if (value !== void 0 && value !== null) {
                ar.push(key + "=" + value);
            }
        });
        if (ar.length > 0) {
            hash += "?" + ar.join("&");
        }
        return hash;
    }

    static back() {
        var pre = Url._hashToObj.list.pop() || '/'
        window.location.hash = pre
    }
}
Url._hashToObj = {list: [], map: {}, MAX: 10};
Url._s = -1;

class UI {
    static isFirefox() {
        return navigator.userAgent.toLowerCase().indexOf('firefox') !== -1
    }

    static isChrome() {
        return navigator.userAgent.toLowerCase().indexOf('chrome') !== -1
    }

    static scrollTo(value, animation = false) {
        if (UI.isChrome()) {
            if (animation) {
                $(document.body).animate({scrollTop: value + 'px'})
            } else {
                document.body.scrollTop = value;
            }
            document.body.scrollLeft = 0;
        } else {
            $(document).scrollTop(value);
            $(document).scrollLeft(0);
        }
    }

    static goTop() {
        UI.scrollTo(0)
    }

    static goBottom() {
        UI.scrollTo($(document).height())
    }
}

/**
 * If undefined returns the next value, and so on
 */
function _und() {
    for (var i = 0; i < arguments.length; i++) {
        if (typeof(arguments[i]) !== 'undefined') return arguments[i];
    }
}

function _templateUrl(url) {
    return url;
}

// emulating the assert() function available in other languages
function assert(condition, message) {
    if (!condition)
        throw message || 'assertion failed: stack trace: ' + (new Error()).stack;
    return;
}

var __ = {};

__.getMethodName = function (txt) {
    if (!txt) {
        return undefined;
    }
    return txt.match(/[^(]+/)[0];
};

__.getMethodParams = function (txt) {
    try {
        return txt.match(/\((.*)\)/)[1].split(',').map(function (e) {
            return e.trim();
        });
    } catch (er) {
    }
    return [""];
};

__.find = function (srcAr, dest) {
    var results = __.where(srcAr, dest);
    return results.length > 0 ? results[0] : undefined;
};

__.where = function (srcAr, dest) {
    var result = [], len = srcAr.length;
    for (var i = 0; i < len; i++) if (__.isSubset(srcAr[i], dest)) result.push(srcAr[i]);
    return result;
};

__.isSubset = function (src, dest) {
    var compare = [];
    compare.push([src, dest]);
    for (; compare.length > 0;) {
        var pair = compare.shift();
        src = pair[0];
        dest = pair[1];
        for (var key in dest) {
            var sval = src[key], dval = dest[key];
            var stype = __.typeof(sval), dtype = __.typeof(dval);

            if (stype !== dtype) return false;

            if (dtype === 'string' || dtype === 'number' || dtype === 'boolean') {
                if (sval !== dval) return false;
            } else if (dtype === 'array') {
                for (var i = dval.length - 1; i >= 0; i--)
                    if (sval.indexOf(dval[i]) === -1) return false;
            } else {
                compare.push([sval, dval]);
            }
        }
    }
    return true;
};

__.typeof = function (obj) {
    return (obj instanceof Array) ? 'array' : typeof obj;
};

__.shuffle = function (o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


/**
 *
 * @param conditionFunction, callback will be fired if this condition is true
 * @param success
 * @param failure, will be called when try expires
 * @param expire, upto expire time it will keep trying
 * @param interval, the duration between two tries
 * @returns {*}
 */
function WaitFor(scopeOrElement, conditionFunction, success, failure, expire, interval) {
    interval = _und(interval, 100);
    expire = _und(expire, 5 * 1000); // 5 secs
    failure = failure || function () {
        };
    var timerId = 0, enable = true, successCalled = false, failureCalled = false;
    _check(0);

    function _callFailure() {
        timerId = 0;
        if (!failureCalled && !successCalled) {
            failureCalled = true;
            failure();
        }
    }

    function _check(cnt) {
        if (!enable) return;
        if (interval * cnt >= expire) return _callFailure();

        if (conditionFunction()) {
            timerId = 0;
            successCalled = true;
            success();
        } else if (enable) {
            timerId = setTimeout(_check, interval, cnt + 1);
        }
    }

    function _stop() {
        enable = false;
        if (timerId > 0) {
            clearTimeout(timerId);
            timerId = 0;
        }
        _callFailure();
    }

    if (scopeOrElement) {
        if (scopeOrElement.$on) {
            scopeOrElement.$on('$destroy', _stop);
        } else {
            scopeOrElement.on('$destroy', _stop);
        }
    }

    return {stop: _stop};
}

var DialogManager = {
    dialogs: [],

    addDialog: function ($element, $container) {
        var self = this;
        $container = $container || $('.dialog-container-100');
        self.dialogs.push({
            element: $element,
            container: $container
        });
        $container.append($element).css('display', 'flex');
        $('.black-overlay').show();
        $('body').css('overflow-y', 'hidden');
    },

    removeDialog: function () {
        var self = this;
        if (self.dialogs.length === 0) return;

        var tuple = self.dialogs.pop();
        console.log('removing dialog', tuple.element, tuple.container);
        tuple.element.remove();
        if (self.dialogs.length === 0) {
            tuple.container.css('display', 'none');
            $('.black-overlay').hide();
            $('body').css('overflow-y', 'auto');
        }
    },

    removeAllDialogs: function () {
        var self = this;
        while (self.dialogs.length > 0) {
            self.removeDialog();
        }
        $('.black-overlay').hide();
        $('body').css('overflow-y', 'auto');
        $('.dialog-container-100').css('display', 'none');
    }
};


String.prototype.toCamel = function () {
    return this.replace(/[-_]([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
};

String.prototype.toHyphen = function () {
    return this.replace(/[A-Z]/g, function (g) {
        return '-' + g[0].toLowerCase();
    });
};

String.prototype.toName = function () {
    var s = this.trim();
    s = s.charAt(0).toUpperCase() + s.substr(1);
    return s.replace(/[ ]([a-z])/g, function (g) {
        return ' ' + g[1].toUpperCase();
    });
};

class EventDispatcher {
    constructor() {
        var self = this
        self._events = []
    }

    on(eventName, callback) {
        var self = this
        self._events.push(new _Event(eventName, callback))
    }

    off(eventName, callback = null) {
        var self = this
        var ar = []
        _.forEach(self._events, (e, i) => {
            if (e.eventName !== eventName) return
            if (callback && e.callback !== callback) return
            ar.push(i)
        })
        ar.map(i => self._events.splice(i, 1))
    }

    fire(eventName, ...param) {
        var self = this
        self._events.forEach(e => {
            if (e.eventName === eventName && e.callback) {
                e.callback(...param)
            }
        })
    }
}

class _Event {
    constructor(eventName, callback) {
        var self = this
        self.eventName = eventName
        self.callback = callback
    }
}

function isParent($parent, $child) {
    if ($parent.length === 0 || $child.length === 0) return false;
    for (; ;) {
        if ($parent[0] === $child[0]) return true;
        $child = $child.parent();
        if (!$child || $child.length === 0) return false;
    }
}

class DateUtil {
    static get MIN_DATE() {
        return new Date('1990-01-01')
    }
    static get MAX_DATE() {
        return new Date('2250-01-01')
    }
    static get MIN_YEAR() {
        return 1990
    }
    static get MAX_YEAR() {
        return 2200
    }

    static toDate(date) {
        if (date instanceof Date) {
            return date
        } else if (DateUtil.isValidYMD(date)) {
            return new Date(`#${date}#`)
        } else {
            return null
        }
    }

    static toYMD(date) {
        if (date instanceof Date) {
            var d = date.getDate();
            var m = date.getMonth() + 1;
            var y = date.getFullYear();
            return y + '-' + (m > 9 ? m : '0' + m) + '-' + (d > 9 ? d : '0' + d);
        } else if (DateUtil.isValidDate(date)) {
            return DateUtil.toYMD(DateUtil.toDate(date))
        } else {
            return null
        }
    }

    static toYM(date, sep = '') {
        var y, m
        if (date instanceof Date) {
            m = date.getMonth() + 1;
            y = date.getFullYear();
            return String(y) + sep + String((m > 9 ? m : '0' + m))
        } else if (DateUtil.isValidYM(date)) {
            var ar = date.replace(/\//g, '-').split('-')
            y = parseInt(ar[0]), m = parseInt(ar[1])
            return String(y) + sep + String(m > 9 ? m : '0' + m)
        } else if (date.length === 6 && !isNaN(date)) {
            y = date.substr(0, 4), m = date.substr(4, 2)
            if (+y < DateUtil.MIN_YEAR || +y > DateUtil.MAX_YEAR) return null
            if (+m < 1 || +m > 12) return null
            return String(y) + sep + String(m)
        } else {
            return null
        }
    }

    static toY(date) {
        if (date instanceof Date) {
            return date.getFullYear().toString()
        } else {
            var y = date.substr(0, 4)
            if (isNaN(y)) return null
            if (+y < 1990 || +y > 2200) return null
            return y
        }
    }

    static _getYM(offset = 0) {
        var ym = DateUtil.toYMD(new Date()).substr(0, 7).split('-');
        if (offset > 12) {
            ym[0] = +ym[0] + parseInt(offset / 12);
            offset = offset % 12;
        }
        ym[1] = +ym[1] + offset;
        if (ym[1] > 12) {
            ym[1] -= 12;
            ym[0]++;
        }
        while (ym[1] < 1) {
            ym[1] += 12;
            ym[0] -= 1;
        }
        return ym;
    }

    static isValidDate(txt) {
        if (!txt) return false
        if (txt.length > 10) return false
        txt = txt.replace(/\//g, '-')
        var ar = txt.split('-')
        if (ar.length !== 3) return false
        if (ar[0].length !== 4) return false
        if (!ar[0] || isNaN(ar[0])) return false
        if (!ar[1] || isNaN(ar[1])) return false
        if (!ar[2] || isNaN(ar[2])) return false
        if (parseInt(ar[0]) < 1990 || parseInt(ar[0]) > 2200) return false
        if (parseInt(ar[1]) < 1 || parseInt(ar[1]) > 12) return false
        if (parseInt(ar[2]) < 1 || parseInt(ar[2]) > 31) return false
        return true
    }

    static isValidYMD(txt) {
        return DateUtil.isValidDate(txt)
    }

    static isValidYM(txt) {
        if (!txt) return false
        if (txt.length > 10) return false
        txt = txt.replace(/\//g, '-')
        var ar = txt.split('-')
        if (ar.length < 2) return false
        if (ar[0].length !== 4) return false
        if (!ar[0] || isNaN(ar[0])) return false
        if (!ar[1] || isNaN(ar[1])) return false
        if (parseInt(ar[0]) < 1990 || parseInt(ar[0]) > 2200) return false
        if (parseInt(ar[1]) < 1 || parseInt(ar[1]) > 12) return false
        return true
    }

    static isValidY(txt) {
        return DateUtil.toY(txt) !== null
    }

    static getYMDiff(a, b) {
        var [ym1, ym2] = [a, b].map(e => {
            var ym = DateUtil.toYM(e), y = ym.substr(0, 4), m = ym.substr(4, 2)
            return [y, m]
        })
        return 12 * (ym1[0] - ym2[0]) + (ym1[1] - ym2[1])
    }
}

/**
 * Contains items = array of key/value. It accepts string
 */
class PmsMenuItems {
    constructor(items){
        var self = this
        self.items = []
        items.forEach(e => {
            self.add(e)
        })
    }

    add(item) {
        var self = this
        var e = {}
        if (typeof item === 'string') {
            e.key = e.value = item
            self.items.push(e)
        } else if (!item.key || !item.value) {
            throw Error(`Menu item ${item} need to contain key/value`)
        } else {
            self.items.push(item)
        }
    }
}


/**
 * If undefined returns the next value, and so on
 */
function _und() {
    for (var i = 0; i < arguments.length; i++) {
        if (typeof(arguments[i]) !== 'undefined') return arguments[i];
    }
}

/**
 * If null returns the next value, and so on
 */
function _null() {
    for (var i = 0; i < arguments.length; i++) {
        if (typeof(arguments[i]) !== 'undefined' && arguments[i] !== null) return arguments[i];
    }
}

function _chain(...p) {
    return _(...p).chain()
}

function printRes(...argv) {
    console.log(...argv)
}

Array.prototype._ = function(){
    return _(this)
}

class Pair {
    constructor(key, value) {
        this.key = key
        this.display = value
    }

    toString() {
        return this.value
    }
}
