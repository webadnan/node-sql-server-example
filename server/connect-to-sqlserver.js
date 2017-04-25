/**
 * Created by webadnan on 9/1/15.
 */

var mssql = require('mssql')

module.exports = class ConnectToSqlServer {
    connect(user, password, server, database, port) {
        var self = this
        return new _Promise((resolve, reject) => {
            var con = new mssql.Connection({
                user: user,
                password: password,
                server: server, // You can use 'localhost\\instance' to connect to named instance
                database: database,
                port: +port
            })

            con.connect(err => {
                if (err) {
                    console.log('error on connecting mssql');
                    return reject(err)
                }

                var req = new mssql.Request(con); // or: var request = connection.request();
                req.query('select * from tcode_section', (err, data) => {
                    if (err) {
                        console.log(err)
                        return reject(err)
                    }

                    console.log(data);
                    resolve(req)
                })
            })
        })
    }
}
