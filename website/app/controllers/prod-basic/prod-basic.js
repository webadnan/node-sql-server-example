/**
 * Created by SM on 8/18/2015.
 */
define(['app'], app => {
    app.controller('ProdBasic', ($scope, Global, Codefile, PmsMenu, Rest) => {
        var scope = $scope
        var data = scope.data = {}
        data.forms = [
            {name: 'Section', class: 'pms-link pms-link-selected'},
            {name: 'Buyer', class: 'pms-link'},
            {name: 'Style', class: 'pms-link'},
            {name: 'Color', class: 'pms-link'},
            {name: 'Size', class: 'pms-link'},
            {name: 'Lot', class: 'pms-link'},
            {name: 'Rate', class: 'pms-link'},
            {name: '', class: 'pms-link'},
            {name: 'Designation', class: 'pms-link'}
        ];
        var _menuItems = [
            {key: 'delete', value: 'Delete', icon: 'fa fa-trash-o'},
            {key: 'edit', value: 'Edit', icon: 'fa fa-pencil'}
        ]
        var menuItems = new PmsMenuItems(_menuItems)

        data.filter = ''
        data.wait = false
        data.addText = ''
        scope.Global = Global

        scope.loadData = () => {
            if (data.wait) return

            data.wait = true
            Codefile.getDataFor(data.selectedForm.name).then(items => {
                data.items = items
                data.filter = ''
                data.addText = ''
            }).finally(() => {
                data.wait = false
            })
        }

        scope.setSelectedForm = e => {
            if (data.wait) return
            if (!e.name) return
            data.selectedForm = e
            data.forms.forEach(f => f.class = 'pms-link')
            e.class = 'pms-link pms-link-selected'
            scope.loadData()
        }
        scope.setSelectedForm(data.forms[0])

        scope.onMenu = evt => {
            var $t = $(evt.target), e = $t.scope().e, cd = e.cd
            PmsMenu.showWithTarget($t, menuItems).then(menuItem => {
                if (menuItem.key === 'edit') {
                    $(`.pms-table-row[cd=${cd}] [inline-edit]`).click()
                } else if (menuItem.key === 'delete') {
                    scope.delete(e)
                }
            })
        }

        scope.onEdit = event => {
            var cd = event.attr.cd
            var newText = event.newText
            var oldText = event.oldText
            var form = data.selectedForm.name
            var $e
            if (cd) {
                $e = $(`.pms-table-row[cd=${cd}] [inline-edit]`)
            } else {
                $e = $(_.filter($('.pms-table-row [inline-edit]'), e => $(e).text() == oldText))
            }
            $e.text(newText)

            Rest.api('codefile.generic-update', {
                table: form,
                cd: cd || '0',
                oldText: oldText,
                newText: newText
            }).then(data => {
                if (cd) {
                    _.find(scope.data.items, {cd: +cd}).name = newText
                } else {
                    _.find(scope.data.items, {name: oldText}).name = newText
                }
            }, reason => {
                console.error(reason);
                Global.ModalDialogs.alert('Data cannot be updated')
                $e.text(oldText)
            });
        }

        scope.delete = e => {
            if (data.wait) return
            Global.ModalDialogs.confirm(`Do you want to delete ${e.name}?`).then(() => {
                data.wait = true
                Codefile.deleteDataFor(data.selectedForm.name, e.cd || e.name).then(res => {
                    if (res.result) {
                        data.items = data.items.filter(item => (item.cd || item.name) != (e.cd || e.name))
                    }
                }).finally(() => {
                    data.addText = ''
                    data.wait = false
                })
            })
        }

        scope.add = () => {
            if (data.wait) return
            data.addText = data.addText.trim()
            if (!data.addText) return
            data.wait = true
            Codefile.addDataFor(data.selectedForm.name, data.addText).then(items => {
                data.items.push(items[0])
            }).finally(() => {
                data.addText = ''
                data.wait = false
            })
        }
    })
})
