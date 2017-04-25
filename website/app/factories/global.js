/**
 * Created by SM on 5/12/2015.
 */
define(['app'], function (app) {
    app.factory('Global', function ($q, ModalDialogs, $compile, _Promise) {
        var self = {
            // following keycodes will be ignored while editing a text, (inline-edit)
            SPECIAL_KEYCODE: [9, 13, 16, 17, 18, 19, 20, 27, 32, 33, 34, 35, 36, 37, 38, 39, 40, 45, 56, 91, 92, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 144, 145, 192],
            ModalDialogs: ModalDialogs,
            $combo: null,

            alert(...p) {
                return self.ModalDialogs.alert(...p)
            },

            confirm(...p) {
                return self.ModalDialogs.confirm(...p)
            },

            prompt(...p) {
                return self.ModalDialogs.prompt(...p)
            },

            resolve: data => {
                var defer = $q.defer();
                defer.resolve(data);
                return defer.promise;
            },

            createCombo: (html, scope) => {
                return new _Promise((resolve, reject) => {
                    var xComboCreated = scope.$on('combo-created', (event, childScope) => {
                        xComboCreated()
                        resolve(childScope)
                    })
                    var $combo = $compile(html)(scope)
                    self.$combo = $combo
                    $('.drop-down-cont').empty().append($combo)
                })
            },

            destroyCombo: () => {
                if (self.$combo) {
                    self.$combo.remove()
                    delete self.$combo
                    self.initDropDownCont()
                }
            },

            initDropDownCont() {
                return $('.drop-down-cont').css({
                    width: '',
                    minWidth: '',
                    maxHeight: '',
                    textAlign: '',
                    overflow: '',
                    top: '',
                    right: '',
                    left: ''
                }).hide()
            },

            apply: scope => {
                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply();
                    return true
                }
                return false
            },

            home: () => {
                Url.queries = {action: 'home-controller'}
            }
        }
        return self
    });
});
