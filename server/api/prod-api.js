/**
 * Created by webadnan on 9/10/15.
 */

var BaseApi = require('./base-api');

module.exports = class ProdApi extends BaseApi {
    constructor(db) {
        super(db);
        var self = this;

        self.routes = [
            {api: 'prod.order-details', fn: self.getOrderDetails, params: ['cd']},
            {api: 'prod.add-order-detail', fn: self.addOrderDetail, params: []},
            {
                api: 'prod.delete-order-detail',
                fn: self.deleteOrderDetail,
                params: ['order_cd', 'section_cd', 'rate_name']
            },
            {api: 'prod.update-order-detail', fn: self.updateOrderDetail, params: []}
        ];
    }

    getOrderDetails(cd) {
        var self = this;
        return self.query('tran_order_rate', {order_cd: cd}).select().map(e => {
            e.section = cache.section.get(e.section_cd).name
            return e
        })
    }

    updateOrderDetail(p) {
        var self = this
        assert(p.where.order_cd, 'order_cd is missing in where clause')
        assert(p.where.section_cd, 'order_cd is missing in where clause')

        var _query = () => self.query('tran_order_rate', p.where).update(p.update).then(() => SUCCESS)

        if (p.update.rate_name) {
            return new _Promise((resolve, reject) => {
                var where = _.cloneDeep(p.where)
                self.query('tran_order_rate', _.assign(where, {rate_name: p.update.rate_name})).select().then(data => {
                    if (data && data.length > 0) {
                        reject({result: 'failure', reason: `Rate name ${p.update.rate_name} already exists`})
                    } else {
                        _query().then(resolve, reject)
                    }
                }, reject)
            })

        } else {
            return _query()
        }
    }

    addOrderDetail(p) {
        var self = this
        return new _Promise((resolve, reject) => {
            var section = _.find(cache.section.data, {name: p.section})
            if (!section) return reject(`Section ${p.section} is not recognized`)
            delete p.section
            p.section_cd = section.cd
            self.query('tran_order_rate').
                insert(p).
                query('tran_order_rate', _.pick(p, 'order_cd', 'section_cd', 'rate_name')).
                select().
                then(resolve, reject)
        })
    }

    deleteOrderDetail(order_cd, section_cd, rate_name, p) {
        var self = this
        return new _Promise((resolve, reject) => {
            self.query('tran_order_rate', p).delete().then(() => {
                resolve(SUCCESS)
            }, reject)
        })
    }
};
