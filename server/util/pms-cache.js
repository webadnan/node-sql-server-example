/**
 * Created by webadnan on 9/1/15.
 */

module.exports = class PmsCache {
    constructor(db) {
        var self = this
        self.db = db
        self.rules = [
            {id: 'section', table: 'tcode_section', keys: ['cd']},
            {id: 'order', table: 'tran_order', keys: ['cd']},
            {id: 'buyer', table: 'tcode_buyer', keys: ['cd']},
            {id: 'style', table: 'tcode_productionstyle', keys: ['cd']},
            {id: 'emptype', table: 'tcode_emptype', keys: ['cd']},
            {id: 'desig', table: 'tcode_designation', keys: ['cd']}
        ]
        self.table2rule = {}
        self.rules.map(e => {
            self.table2rule[e.table] = e
        })
    }

    load() {
        var self = this
        var promises = self.rules.map(e => {
            self[e.id] = new CacheTable(self.db, e.table, ...e.keys)
            return self[e.id].load()
        })
        console.log('caching...');
        return _Promise.all(promises).finally(() => {
            self.registerEvent()
        })
    }

    //load() {
    //    var self = this
    //    return new _Promise((resolve, reject) => {
    //        self.db.query('tcode_section', {cd: 1}).update({name: 'KNITTING'})
    //        self.db.query('tcode_section', {cd: 2}).update({name: 'LINKING'})
    //        self.db.query('tcode_section', {cd: 3}).update({name: 'TRIMMING'})
    //        self.db.query('tcode_section', {cd: 4}).update({name: 'WINDING'})
    //        self.db.query('tcode_section', {cd: 5}).update({name: 'MENDING'})
    //        self.db.query('tcode_section', {cd: 10}).update({name: 'FINISHING'})
    //        self.db.query('tcode_section', {cd: 11}).update({name: 'FIXED'})
    //        self.db.query('tcode_section', {cd: 12}).update({name: 'INSPECTION'})
    //        self.db.query('tcode_section', {cd: 16}).update({name: 'OFFICE'})
    //        self.db.query('tcode_section', {cd: 17}).update({name: 'PROD STAFF'})
    //        self.db.query('tcode_section', {cd: 18}).update({name: 'SAMPLE'})
    //        self.db.query('tcode_section', {cd: 19}).update({name: 'SECURITY'})
    //        self.db.query('tcode_section', {cd: 20}).update({name: 'SEWING'})
    //        self.db.query('tcode_section', {cd: 21}).update({name: 'STAFF'})
    //        self.db.query('tcode_section', {cd: 24}).update({name: 'ZIPPER'})
    //        self.db.query('tcode_section', {cd: 33}).update({name: 'FINISHING LINE - ASSORT'})
    //        self.db.query('tcode_section', {cd: 34}).update({name: 'FINISHING LINE - WASH'})
    //        self.db.query('tcode_section', {cd: 35}).update({name: 'FINISHING - IRON'})
    //        self.db.query('tcode_section', {cd: 36}).update({name: 'FINISHING - PQC'})
    //        self.db.query('tcode_section', {cd: 37}).update({name: 'FINISHING - MENDING'})
    //        self.db.query('tcode_section', {cd: 38}).update({name: 'FINISHING - PACKING'})
    //        self.db.query('tcode_section', {cd: 39}).update({name: 'FINISHING - SEWING'})
    //        self.db.query('tcode_section', {cd: 40}).update({name: 'MANAGEMENT TRAINEE'})
    //        self.db.query('tcode_section', {cd: 41}).update({name: 'EXECUTIVE'})
    //    })
    //}

    registerEvent() {
        var self = this
        globalEvents.on('QueryBuilder:execute', queryBuilder => {
            if (queryBuilder.type === 'select') return
            self.rules.forEach(e => {
                if (e.table !== queryBuilder.table) return
                self[e.id] = new CacheTable(self.db, e.table, ...e.keys)
                self[e.id].load()
                console.log('re-caching', queryBuilder.table)
            })
        })
    }
}


class CacheTable {
    constructor(db, table, ...keys) {
        var self = this
        self.db = db
        self.table = table
        self.keys = keys.map(e => e.split('#'))
        self.buffer = {}
        self.data = null
    }

    load() {
        var self = this
        try {
            return new _Promise((resolve, reject) => {
                self.db.query(self.table).select().then(data => {
                    self.data = data
                    for (var i = data.length - 1; i >= 0; i--) {
                        self.set(data[i])
                    }
                    resolve()
                }, reject)
            })
        } catch (err) {
            console.log('CacheTable:load', err)
        }
    }

    keyForRow(row) {
        var self = this
        try {
            var ar = []
            for (var i = self.keys.length - 1; i >= 0; i--) {
                var key = self.keys[i];
                ar.push(key.map(field => row[field]).join('#').toLowerCase())
            }
            return ar
        } catch (err) {
            console.log('CacheTable:keyForRow', err)
        }
    }

    getAll() {
        var self = this
        return self.data
    }

    get(...key) {
        var self = this
        return self.buffer[key.join('#').toLowerCase()] || {}
    }

    set(row) {
        var self = this
        self.keyForRow(row).map(key => {
            self.buffer[key.toString().toLowerCase()] = row
        })
    }

    del(...key) {
        var self = this
        try {
            key = key.join('#').toLowerCase()
            if (!self.buffer[key]) return
            self.keyForRow(self.buffer[key]).map(otherKey => {
                delete self.buffer[otherKey]
            })
        } catch (err) {
            console.log('CacheTable:del', err)
        }
    }

    print() {
        var self = this
        _.forEach(self.buffer, (value, key) => {
            console.log(`key: ${key}, value: ${JSON.stringify(value)}`)
        })
    }
}
