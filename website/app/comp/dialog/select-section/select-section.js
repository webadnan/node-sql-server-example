/**
 * Created by SM on 5/9/2015.
 */
define(['app', 'CommonDialog', 'SelectableList'], function (app) {
    app.factory('SelectSection', function ($rootScope, $compile, $q) {
        return {
            defer: null,
            show: function (scope) {
                var self = this;
                self.defer = $q.defer();
                scope = scope || $rootScope;
                console.log('SelectSection.show()');
                var $e = $compile('<select-section></select-section>')(scope);
                DialogManager.addDialog($e);
                return self.defer.promise;
            }
        };
    });

    app.directive('selectSection', function (Codefile, SelectSection) {
        return {
            restrict: 'EA',
            templateUrl: _templateUrl('app/comp/dialog/select-section/select-section.html'),
            link: function (scope, element, attr) {
                console.log('inside select-section');
                var data = scope.data = {};
                var TITLE = 'Select Section';
                data.title = TITLE;
                data.sections = [];
                data.header = [{
                    key: 'cd', value: 'cd'
                }, {
                    key: 'name', value: 'Name'
                }];
                data.filter = "";
                data.okButtonClass = 'btn btn-primary disabled';

                function init() {
                    Codefile.getSections().then(function (sections) {
                        data.sections = sections;
                        console.log(scope.data.sections);
                    });
                    WaitFor(element, function () {
                        return element.find('.input-text').length;
                    }, function () {
                        element.find('.input-text').focus();
                    });
                }

                scope.close = function () {
                    console.log('inside select section close');
                    DialogManager.removeDialog();
                    SelectSection.defer.reject(null);
                };

                scope.ok = function () {
                    console.log('ok');
                };

                scope.onEnter = function () {
                    if (element.find('[id^=row-]').length === 1){
                        var id = element.find('[id^=row-]').attr('id').split('-')[1];
                        var selectedData = data.sections[+id];
                        console.log(selectedData);
                    }
                };

                scope.onFilter = function(filteredData){
                    data.okButtonClass = 'btn btn-primary disabled';
                    data.title = TITLE;
                    try {
                        if (filteredData.length === 1){
                            data.okButtonClass = 'btn btn-primary';
                            return;
                        }
                        var selected = __.where(filteredData, {_selected: true});
                        if (selected.length > 0) {
                            data.okButtonClass = 'btn btn-primary';
                            data.title = TITLE + ' (' + selected.length + ')';
                        }
                    } catch (err) {}
                };

                init();
            }
        };
    });
});
