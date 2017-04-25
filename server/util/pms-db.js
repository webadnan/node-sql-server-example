/**
 * Created by webadnan on 9/1/15.
 */
var _ = require('lodash')
var chalk = require('chalk')
var QueryBuilder = require('./query-builder.js')

module.exports = class PmsDb {
    constructor(mssqlRequest){
        var self = this
        self.mssqlRequest = mssqlRequest
    }

    sql(text) {
        var self = this;
        console.log(chalk.green(text))
        return new _Promise((resolve, reject) => {
            self.mssqlRequest.query(text, (err, recordset) => {
                if (err) console.log(err)
                err ? reject(err) : resolve(recordset);
            })
        })
    }

    query(table, whereClause) {
        var self = this
        return new QueryBuilder(self, table, whereClause)
    }

    makeAllColumnLowercase() {
        var self = this
        self.sql(`
            SELECT t.name AS table_name,
                SCHEMA_NAME(schema_id) AS schema_name,
                c.name AS column_name
            FROM sys.tables AS t
            INNER JOIN sys.columns c ON t.OBJECT_ID = c.OBJECT_ID
            ORDER BY schema_name, table_name;
        `).then(data => {
            data.forEach(e => {
                console.log(e.table_name, e.column_name)
                self.sql(`EXEC sp_RENAME '${e.table_name}.${e.column_name}' , '${e.column_name.toLowerCase()}', 'COLUMN'`)
            })
        })
    }
}
