/**
 * Created by smadnan on 8/18/15.
 */
define(['app'], app => {
    app.factory('Codefile', (Global, Rest, $q) => {
        var table2apiForSelect = {
            section: 'codefile.sections',
            buyer: 'codefile.buyers',
            style: 'codefile.styles',
            color: 'codefile.colors',
            size: 'codefile.sizes',
            lot: 'codefile.lots',
            rate: 'codefile.rates',
            designation: 'codefile.designations'
        }
        var table2apiForAdd = {
            section: 'codefile.add-section',
            buyer: 'codefile.add-buyer',
            style: 'codefile.add-style',
            color: 'codefile.add-color',
            size: 'codefile.add-size',
            lot: 'codefile.add-lot',
            rate: 'codefile.add-rate',
            designation: 'codefile.add-designation'
        }
        var table2apiForDelete = {
            section: 'codefile.delete-section',
            buyer: 'codefile.delete-buyer',
            style: 'codefile.delete-style',
            color: 'codefile.delete-color',
            size: 'codefile.delete-size',
            lot: 'codefile.delete-lot',
            rate: 'codefile.delete-rate',
            designation: 'codefile.delete-designation'
        }

        var self
        return (self = {
            //getApiForSelect: table => {
            //    table = table.toLocaleLowerCase()
            //    assert(table2apiForSelect[table], `table ${table} is not listed`)
            //    return table2apiForSelect[table]
            //    },
            //getApiForAdd: table => {
            //    table = table.toLocaleLowerCase()
            //    assert(table2apiForSelect[table], `table ${table} is not listed`)
            //    return table2apiForAdd[table]
            //},
            getDataFor: table => {
                return Rest.batch({
                    api: table2apiForSelect[table.toLocaleLowerCase()]
                })
            },
            addDataFor: (table, value) => {
                return Rest.batch({
                    api: table2apiForAdd[table.toLocaleLowerCase()],
                    value: value
                })
            },
            deleteDataFor: (table, id) => {
                return Rest.batch({
                    api: table2apiForDelete[table.toLocaleLowerCase()],
                    id: id
                })
            }
        })
    })
})
