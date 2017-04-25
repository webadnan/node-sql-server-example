/**
 * Created by webadnan on 8/31/15.
 */

var Q = require('q');

module.exports = class QueryBuilder {
    constructor(db, table, whereClause) {
        var self = this
        self.db = db
        self.table = table
        self.whereClause = whereClause
        self.selectClause = {}
        //self.top = null
        //self.preQueryPromise = null
        //self.pipeCallback
        //self.pipeKeyValue
    }

    set waitFor(queryPromise) {
        var self = this
        self.preQueryPromise = queryPromise
    }

    _getSelectClause() {
        var self = this
        var ar = []
        if (self.selectTop) ar.push('top ' + self.selectTop)
        if (self.selectClause && self.selectClause.length) ar.push(self.selectClause.join(','))
        else ar.push('*')
        return ar.join(' ')
    }

    _getUpdateClause() {
        var self = this
        var _wrapValue = value => {
            if (value === 'null') return value
            return `'${value}'`
        }
        return 'set ' + _.map(self.throughPipe(self.updateClause), (value, field) => `${field} = ${_wrapValue(value)}`).join(',')
    }

    _getWhereClause() {
        var self = this
        if (!self.whereClause || _.values(self.whereClause).length === 0) return ''
        return 'where ' + _.map(self.throughPipe(self.whereClause), (value, field) => {

                var a = void 0, b = void 0
                if (value.length >= 1) a = value.charAt(0)
                if (value.length >= 2) b = value.charAt(1)

                if (!a) return `${field} = '${value}'`
                else if (value === 'null') return `${field} is null`
                else if (value === '!null') return `${field} is not null`
                else if (a === '!') return `${field} <> '${value.substr(1)}'`
                else if (a === '>' && b === '=') return `${field} >= '${value.substr(2)}'`
                else if (a === '<' && b === '=') return `${field} <= '${value.substr(2)}'`
                else if (a === '>') return `${field} > '${value.substr(1)}'`
                else if (a === '<') return `${field} < '${value.substr(1)}'`
                else return `${field} = '${value}'`

            }).join(' and ')
    }

    _getInsertClause() {
        var self = this
        self.insertClause = self.throughPipe(self.insertClause)
        var q = []
        q.push('(')
        q.push(_.keys(self.insertClause).join(','))
        q.push(') values (')
        q.push(_.values(self.insertClause).map(e => `'${e}'`).join(','))
        q.push(')')
        return q.join(' ')
    }

    execute() {
        var self = this
        return new QueryPromise(self, (resolve, reject) => {
            if (self.preQueryPromise) {
                self.preQueryPromise.then(data => {
                    self.extractValueFromPipe(data)
                    self._execute(resolve, reject)
                    return value
                }, reject)
            } else {
                self._execute(resolve, reject)
            }
        })
    }

    _execute(resolve, reject) {
        var self = this
        var q = [self.type]
        if (self.type === 'select') {
            q.push(self._getSelectClause())
            q.push('from')
            q.push(self.table)
            q.push(self._getWhereClause())
        } else if (self.type === 'delete') {
            q.push('from')
            q.push(self.table)
            q.push(self._getWhereClause())
        } else if (self.type === 'update') {
            q.push(self.table)
            q.push(self._getUpdateClause())
            q.push(self._getWhereClause())
        } else if (self.type === 'insert') {
            q.push('into ' + self.table)
            q.push(self._getInsertClause())
        }

        self.queryText = q.join(' ')

        self.db.sql(self.queryText).finally(() => {
            globalEvents.fire('QueryBuilder:execute', self)
        }).then(resolve, reject)
    }

    insert(insertClause) {
        var self = this
        self.type = 'insert'
        self.insertClause = insertClause
        return self.execute()
    }

    update(updateClause) {
        var self = this
        self.type = 'update'
        self.updateClause = updateClause
        return self.execute()
    }

    delete() {
        var self = this
        self.type = 'delete'
        return self.execute()
    }

    select(...selectClause) {
        var self = this
        self.type = 'select'
        self.selectClause = selectClause
        return self.execute()
    }

    top(n) {
        var self = this
        self.selectTop = n
        return self
    }

    where(whereClause) {
        var self = this
        self.whereClause = whereClause
        return self
    }

    pipe(pipeCallback) {
        var self = this
        self.pipeCallback = pipeCallback
        return self
    }

    extractValueFromPipe(data) {
        var self = this

        if (!self.pipeCallback) return self

        self.pipeKeyValue = self.pipeCallback(data)
        if (!self.pipeKeyValue) {
            if (data instanceof Array) self.pipeKeyValue = data[0]
            else self.pipeKeyValue = data
        }

        return self
    }

    throughPipe(obj) {
        var self = this

        if (!self.pipeKeyValue) return obj

        var result = {}

        _.keys(obj).forEach(key => {
            result[key] = obj[key]
            if (result[key].indexOf('pipe.') === 0) {
                result[key] = self.pipeKeyValue[result[key].substr(5)]
            }
        })

        return result
    }
}

class QueryPromise {
    constructor(queryBuilder, callback) {
        var self = this
        self.queryBuilder = queryBuilder
        self.defer = Q.defer()
        self.promise = self.defer.promise
        //self.pipeCallback = null
        if (callback) {
            callback((...value) => {
                self.defer.resolve(...value)
            }, (...reason) => {
                self.defer.reject(...reason)
            })
        }
    }

    query(...argv) {
        var self = this
        if (argv.length === 0) {
            argv.push(self.queryBuilder.table)
            argv.push(self.queryBuilder.whereClause)
        }
        var qb = self.queryBuilder.db.query(...argv)
        qb.waitFor = self
        if (self.pipeCallback) qb.pipe(self.pipeCallback)
        return qb
    }

    map(callback) {
        var self = this
        return self.then(data => {
            if (!data || !(data instanceof Array)) return data
            return data.map(callback)
        }, err => err)
    }

    resolve(...argv) {
        var self = this
        self.defer.resolve(...argv)
        return self
    }

    reject(...argv) {
        var self = this
        self.defer.reject(...argv)
        return self
    }

    then(...argv) {
        var self = this
        self.promise = self.promise.then(...argv)
        return self
    }

    finally(...argv) {
        var self = this
        self.promise = self.promise.finally(...argv)
        return self
    }

    /**
     * Pipe gets query result as data and returns key/value pair to provide this to next query builder
     * @param callback
     */
    pipe(callback = function(){}) {
        var self = this
        self.pipeCallback = callback
        return self
    }
}
