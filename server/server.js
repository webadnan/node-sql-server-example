var mssql = require('mssql');
var _ = require('lodash');
require('shelljs/global');

module.exports = class Server {
    constructor(db) {
        var self = this;
        self.req = null;
        self.res = null;
        self.baseApis = [];
        self.db = db

        ls(__dirname + '/api/*-api.js').forEach(file => {
            console.log('adding', file);
            if (file.match(/base-api.js/)) {
                return;
            }
            var APIClass = newRequire(file);
            var apiObject = new APIClass(self.db);
            self.baseApis.push(apiObject);
        });
    }

    route(req, res, next) {
        var self = this;
        self.req = req;
        self.res = res;
        self.res.setHeader('content-type', 'application/json');
        try {
            var path = req.path;
            if (path === '/api/path') {
                console.log(req.body);
                res.end(path);
            } else if (path === '/api/sections') {
                self.sections();
            } else if (path.indexOf('/api/batch') === 0) {
                self.batch();
            } else {
                self.sections();
            }
        } catch (err) {
            console.log(err);
            res.end('[]');
        }
    }

    query(txt) {
        var self = this;
        console.log('query', txt);
        return new _Promise((resolve, reject) => {
            self.db.sql(text).then(resolve, reject)
        });
    }

    sections() {
        var self = this;
        self.query('select * from tcode_section').then(function (data) {
            self.res.end(JSON.stringify(data));
        });
    }

    batch() {
        var [self, results, cnt] = [this, [], 0];
        //var singleResult = false;

        if (self.req.path.indexOf('api/batch/help') !== -1){
            return self.help();
        } else if (! (self.req.body instanceof Array)) {
            self.req.body = self.batchUrlToBody();
            //singleResult = true;
        }

        console.log('body', self.req.body);

        self.req.body.forEach((param, index) => {
            var promise = null;
            for (var i = 0; i < self.baseApis.length; i++) {
                var baseApi = self.baseApis[i];
                promise = baseApi.serve(param);
                if (promise) {
                    break;
                }
            }
            results.push(null);
            if (promise) {
                promise.then(function (result) {
                    _setValue(index, result);
                }, function (err) {
                    _setValue(index, err);
                });
            } else {
                _setValue(index, {name: "RequestError", message: "No Api matched.", param: param});
            }
        });

        var _setValue = (index, data) => {
            results[index] = data;
            cnt++;
            if (cnt === self.req.body.length) {
                var txt = (cnt === 1) ? JSON.stringify(results[0]) : JSON.stringify(results);
                self.res.end(txt);
            }
        }
    }

    batchUrlToBody(){
        var self = this;
        var url = self.req.path;
        var tokens = url.substr('/api/batch/'.length).split('/');
        var param = {};
        param.api = tokens[0];
        for (var i=1;i<tokens.length;i+=2){
            var [key, value] = [tokens[i], tokens[i+1]];
            param[key] = value;
        }
        return [param];
    }

    help(){
        var self = this;
        let lines = [];
        _.forEach(self.baseApis, api => {
            _.forEach(api.routes, route => {
                var postfix = route.api;
                _.forEach(route.params, p => {
                    postfix += `/${p}/?`;
                });
                lines.push(`http://${self.req.host}:4000/api/batch/${postfix}`);
            });
        });
        console.log(lines.join('\n'));
        self.res.end(JSON.stringify(lines));
    }
};
