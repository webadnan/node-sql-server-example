/**
 * Created by webadnan on 9/2/15.
 */

module.exports = class EventDispatcher {
    constructor(){
        var self = this
        self._events = []
    }

    on(eventName, callback){
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

    fire(eventName, ...param){
        var self = this
        self._events.forEach(e => {
            if (e.eventName === eventName && e.callback){
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
