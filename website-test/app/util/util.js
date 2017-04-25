/**
 * If undefined returns the next value, and so on
 */
function _und() {
    for (var i = 0; i < arguments.length; i++) {
        if (typeof(arguments[i]) !== 'undefined') return arguments[i];
    }
}

function _templateUrl(url){
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
function WaitFor(scopeOrElement, conditionFunction, success, failure, expire, interval){
    interval = _und(interval, 100);
    expire = _und(expire, 5 * 1000); // 5 secs
    failure = failure || function(){};
    var timerId = 0, enable = true, successCalled = false, failureCalled = false;
    _check(0);

    function _callFailure(){
        timerId = 0;
        if (!failureCalled && !successCalled){
            failureCalled = true;
            failure();
        }
    }

    function _check(cnt){
        if (!enable) return;
        if (interval * cnt >= expire) return _callFailure();

        if (conditionFunction()) {
            timerId = 0;
            successCalled = true;
            success();
        } else if (enable){
            timerId = setTimeout(_check, interval, cnt+1);
        }
    }

    function _stop(){
        enable = false;
        if (timerId > 0) {
            clearTimeout(timerId);
            timerId = 0;
        }
        _callFailure();
    }

    if (scopeOrElement){
        if (scopeOrElement.$on){
            scopeOrElement.$on('$destroy', _stop);
        } else {
            scopeOrElement.on('$destroy', _stop);
        }
    }

    return {stop: _stop};
}

var DialogManager = {
    dialogs: [],

    addDialog: function($element, $container){
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

    removeDialog: function(){
        var self = this;
        if (self.dialogs.length === 0) return;

        var tuple = self.dialogs.pop();
        console.log('removing dialog', tuple.element, tuple.container);
        tuple.element.remove();
        if (self.dialogs.length === 0){
            tuple.container.css('display', 'none');
            $('.black-overlay').hide();
            $('body').css('overflow-y', 'auto');
        }
    },

    removeAllDialogs: function(){
        var self = this;
        while (self.dialogs.length > 0){
            self.removeDialog();
        }
        $('.black-overlay').hide();
        $('body').css('overflow-y', 'auto');
        $('.dialog-container-100').css('display', 'none');
    }
};
