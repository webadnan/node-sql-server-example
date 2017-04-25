var _ = require('lodash');

module.exports = class BaseApi {
    constructor(db) {
        var self = this;
        self.routes = [];
        self.param = {};
        self.db = db
    }

    serve(param) {
        var self = this;
        self.param = param;

        if (!param.api) {
            return null;
        }

        for (var i = 0; i < self.routes.length; i++) {
            var route = self.routes[i];
            if (route.api !== param.api) {
                continue;
            }
            route.params = route.params || [];
            var matched = true;
            var args = [];
            for (var j = 0; j < route.params.length; j++) {
                var key = route.params[j];
                if (!param[key]) {
                    matched = false;
                    break;
                }
                args.push(param[key]);
            }
            if (matched) {
                var bypassParam = _.cloneDeep(param)
                delete bypassParam.api
                args.push(bypassParam)
                return route.fn.apply(self, args);
            }
        }

        return null;
    }

    sql(text, param = {}) {
        var self = this;
        return self.db.sql(text)
    }

    query(...argv) {
        var self = this
        return self.db.query(...argv)
    }

    getNextCd(table, field = 'cd') {
        var self = this
        return new _Promise((resolve, reject) => {
            self.sql(`select max(${field}) as 'max' from ${table}`).then(data => {
                resolve(data[0].max+1)
            }, reject)
        })
    }
};
