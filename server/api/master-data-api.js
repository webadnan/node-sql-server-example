var BaseApi = require('./base-api');

module.exports = class MasterDataApi extends BaseApi {
    constructor(db) {
        super(db);
        var self = this;

        self.routes = [{
            api: 'master-data.get',
            params: [],
            fn: self.getMasterData
        }];
    }

    getMasterData() {
        var self = this;
        return new _Promise((resolve, reject) => {
            var section = self.sql('select top 2 * from tcode_section');
            var designation = self.sql('select top 2 * from tcode_designation');
            var order = self.sql('select top 2 * from tran_order');
            _Promise.all([section, designation, order]).then(function (results) {
                resolve({
                    section: results[0],
                    designation: results[1],
                    order: results[2]
                });
            }, function (err) {
                reject(err);
            });
        });
    }
};
