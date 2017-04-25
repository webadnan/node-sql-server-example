var BaseApi = require('./base-api');

module.exports = class CodeFileApi extends BaseApi {
    constructor(db) {
        super(db)
        var self = this

        self.routes = [
            {api: 'codefile.sections', fn: self.getSection, params: ['cd']},
            {api: 'codefile.sections', fn: self.getAllSections, params: []},
            {api: 'codefile.buyers', fn: self.getAllBuyers, params: []},
            {api: 'codefile.styles', fn: self.getAllStyles, params: []},
            {api: 'codefile.colors', fn: self.getAllColors, params: []},
            {api: 'codefile.sizes', fn: self.getAllSizes, params: []},
            {api: 'codefile.lots', fn: self.getAllLots, params: []},
            {api: 'codefile.rates', fn: self.getAllRates, params: []},
            {api: 'codefile.orders', fn: self.getAllOrders, params: []},
            {api: 'codefile.designations', fn: self.getAllDesignations, params: []},
            {api: 'codefile.add-section', fn: self.addSection, params: ['value']},
            {api: 'codefile.add-buyer', fn: self.addBuyer, params: ['value']},
            {api: 'codefile.add-style', fn: self.addStyle, params: ['value']},
            {api: 'codefile.add-color', fn: self.addColor, params: ['value']},
            {api: 'codefile.add-size', fn: self.addSize, params: ['value']},
            {api: 'codefile.add-lot', fn: self.addLot, params: ['value']},
            {api: 'codefile.add-rate', fn: self.addRate, params: ['value']},
            {api: 'codefile.add-designation', fn: self.addDesignation, params: ['value']},
            {api: 'codefile.add-order', fn: self.addOrder, params: ['style_cd', 'buyer_cd', 'create_date', 'qty', 'remark']},
            {api: 'codefile.update-order', fn: self.updateOrder, params: ['cd']},
            {api: 'codefile.delete-section', fn: self.deleteSection, params: ['id']},
            {api: 'codefile.delete-buyer', fn: self.deleteBuyer, params: ['id']},
            {api: 'codefile.delete-style', fn: self.deleteStyle, params: ['id']},
            {api: 'codefile.delete-color', fn: self.deleteColor, params: ['id']},
            {api: 'codefile.delete-size', fn: self.deleteSize, params: ['id']},
            {api: 'codefile.delete-lot', fn: self.deleteLot, params: ['id']},
            {api: 'codefile.delete-rate', fn: self.deleteRate, params: ['id']},
            {api: 'codefile.delete-designation', fn: self.deleteDesignation, params: ['id']},
            {api: 'codefile.generic-update', fn: self.genericUpdate, params: ['table', 'cd', 'oldText', 'newText']}
        ]

        self.table = {
            section: 'tcode_section',
            buyer: 'tcode_buyer',
            style: 'tcode_productionstyle',
            color: 'tcode_productioncolor',
            size: 'tcode_productionsize',
            lot: 'tcode_lot',
            rate: 'tcode_rate_name',
            designation: 'tcode_designation'
        }
    }

    genericUpdate(table, cd, oldText, newText) {
        var self = this
        table = table.toLowerCase()
        var dbTable = self.table[table]

        return new _Promise((resolve, reject) => {
            if (table === 'lot') {
                self.query(dbTable, {lot: oldText}).update({lot: newText}).then(data => {
                    self.query(dbTable, {lot: newText}).select().then(resolve, reject)
                }, reject)
            } else if (table === 'rate') {
                self.query(dbTable, {rate_name: oldText}).update({rate_name: newText}).then(data => {
                    self.query(dbTable, {rate_name: newText}).then(resolve, reject)
                }, reject)
            } else {
                self.query(dbTable, {cd: cd}).update({name: newText}).then(data => {
                    self.query(dbTable, {cd: cd}).select().then(resolve, reject)
                }, reject)
            }
        })
    }



    // SELECT



    getAllSections() {
        var self = this
        return self.query('tcode_section').select()
    }

    getSection(cd) {
        var self = this
        return self.sql(`select * from tcode_section where cd = ${cd}`)
    }

    getAllBuyers() {
        var self = this
        return self.sql(`select * from tcode_buyer`)
    }

    getAllStyles() {
        var self = this
        return self.query('tcode_productionstyle').select()
    }

    getAllColors() {
        var self = this
        return self.sql(`select * from tcode_productioncolor`)
    }

    getAllSizes() {
        var self = this
        return self.sql(`select * from tcode_productionsize`)
    }

    getAllLots() {
        var self = this
        return self.sql(`select lot as name from tcode_lot`)
    }

    getAllRates() {
        var self = this
        return self.sql(`select rate_name as name from tcode_rate_name`)
    }

    getAllDesignations() {
        var self = this
        return self.query('tcode_designation').select()
    }

    getAllOrders() {
        var self = this
        return new _Promise((resolve, reject) => {
            self.query('tran_order').select().then(data => {
                data.forEach(e => {
                    e.style = cache.style.get(e.style_cd).name
                    e.buyer = cache.buyer.get(e.buyer_cd).name
                })
                resolve(data)
            }, reject)
        })
    }



    // ADD



    addRowForTable(table, value){
        var self = this
        return new _Promise((resolve, reject) => {
            self.sql(`select * from ${table} where name = '${value}'`).then(data => {
                if (data.length === 0) {
                    self.getNextCd(table).then(nextCd => {
                        self.query(table).insert({cd: nextCd, name: value}).then(() => {
                            console.log('insert complete :)')
                            //self.sql(`insert into ${table} (cd, name) values (${nextCd}, '${value}')`).then(() => {
                            self.sql(`select * from ${table} where cd = ${nextCd}`).then(resolve, reject)
                        }, reject)
                    }, reject)
                } else {
                    self.sql(`select * from ${table} where name = '${value}'`).then(resolve, reject)
                }
            }, reject)
        })
    }

    addSection(value) {
        var self = this
        return self.addRowForTable('tcode_section', value)

    }

    addBuyer(value) {
        var self = this
        return self.addRowForTable('tcode_buyer', value)
    }

    addStyle(value) {
        var self = this
        return self.addRowForTable('tcode_productionstyle', value)
    }

    addColor(value) {
        var self = this
        return self.addRowForTable('tcode_productioncolor', value)
    }

    addSize(value) {
        var self = this
        return self.addRowForTable('tcode_productionsize', value)
    }

    addDesignation(value) {
        var self = this
        return self.addRowForTable('tcode_designation', value)
    }

    addOrder(style_cd, buyer_cd, create_date, qty, remark, p) {
        var self = this
        return new _Promise((resolve, reject) => {
            self.getNextCd('tran_order').then(cd => {
                self.query('tran_order').
                    insert(_.assign(p, {cd: cd})).
                    query('tran_order', {cd: cd}).
                    select().
                    then(data => {
                        data.forEach(e => {
                            e.style = cache.style.get(e.style_cd).name
                            e.buyer = cache.buyer.get(e.buyer_cd).name
                        })
                        resolve(data)
                    }, reject)
            }, reject)
        })
    }

    updateOrder(cd, p) {
        var self = this
        delete p.cd
        return self.query('tran_order', {cd: cd}).update(p).query().select()
    }

    addLot(value) {
        var self = this
        var select = () => {
            //return self.sql(`select lot as name from tcode_lot where lot = '${value}'`)
            return self.query('tcode_lot', {lot: value}).select('lot as name')
        }
        return new _Promise((resolve, reject) => {
            self.sql(`select * from tcode_lot where lot = '${value}'`).then(data => {
                if (data.length === 0) {
                    self.sql(`insert into tcode_lot (lot) values ('${value}')`).then(() => {
                        select().then(resolve, reject)
                    }, reject)
                } else {
                    select().then(resolve, reject)
                }
            }, reject)
        })
    }

    addRate(value) {
        var self = this
        var select = () => {
            return self.sql(`select rate_name as name from tcode_rate_name where rate_name = '${value}'`)
        }
        return new _Promise((resolve, reject) => {
            self.sql(`select * from tcode_rate_name where rate_name = '${value}'`).then(data => {
                if (data.length === 0) {
                    self.sql(`insert into tcode_rate_name (rate_name) values ('${value}')`).then(() => {
                        select().then(resolve, reject)
                    }, reject)
                } else {
                    select().then(resolve, reject)
                }
            }, reject)
        })
    }



    // DELETE



    deleteFor(table, column, value) {
        var self = this
        var where = {}
        where[column] = value
        return self.query(table, where).delete().then(() => {
            console.log('inside deleteFor()', table, column, value)
            return {result: true}
        })
    }

    deleteSection(id) {
        var self = this
        return self.deleteFor('tcode_section', 'cd', id)
    }

    deleteBuyer(id) {
        var self = this
        return self.deleteFor('tcode_buyer', 'cd', id)
    }

    deleteStyle(id) {
        var self = this
        return self.deleteFor('tcode_productionstyle', 'cd', id)
    }

    deleteColor(id) {
        var self = this
        return self.deleteFor('tcode_productioncolor', 'cd', id)
    }

    deleteSize(id) {
        var self = this
        return self.deleteFor('tcode_productionsize', 'cd', id)
    }

    deleteLot(id) {
        var self = this
        return self.deleteFor('tcode_lot', 'lot', id)
    }

    deleteRate(id) {
        var self = this
        return self.deleteFor('tcode_rate_name', 'rate_name', id)
    }

    deleteDesignation(id) {
        var self = this
        return self.deleteFor('tcode_designation', 'cd', id)
    }



    // Cross Api Query



    /*crossFromMasterData(){
     var self = this;
     var defer = Q.defer();

     var MasterDataApi = newRequire(__dirname + '/master-data-api.js');
     var masterDataApi = new MasterDataApi(self.mssqlRequest);
     masterDataApi.getMasterData().then(function(data){
     defer.resolve(data);
     }, function(err){
     defer.reject(err);
     });

     return defer.promise;
     }*/
}
