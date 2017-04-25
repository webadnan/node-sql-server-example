var BaseApi = require('./base-api');

module.exports = class EmployeeApi extends BaseApi {
    constructor(db) {
        super(db);
        var self = this;

        self.routes = [
            {api: 'employee.get', fn: self.getWithCd, params: ['cd']},
            {api: 'employee.get', fn: self.getWithSectionCdCardNo, params: ['sectionCd', 'cardNo']},
            {api: 'employee.get', fn: self.getWithSectionCd, params: ['sectionCd']}
        ];
    }

    getWithCd(cd) {
        var self = this;
        return self.sql('select * from vw_employee2 where cd = ${cd}', {cd: cd});
    }

    getWithSectionCdCardNo(sectionCd, cardNo) {
        var self = this;
        return self.sql("select * from vw_employee2 where section_cd = '${sectionCd}' and cardno = '${cardNo}'", {
            sectionCd: sectionCd,
            cardNo: cardNo
        });
    }

    getWithSectionCd(sectionCd) {
        var self = this;
        return self.sql("select * from vw_employee2 where section_cd = '${sectionCd}'", {
            sectionCd: sectionCd
        });
    }
};
