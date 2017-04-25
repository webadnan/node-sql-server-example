/**
 * Created by SM on 5/9/2015.
 */
define(['app', 'PmsModal'], function(app){
    app.service('ModalDialogs', function (PmsModal, $q) {
        return {
            TYPE_TEXT: 'type-text',
            TYPE_INT: 'type-int',
            TYPE_NUMBER: 'type-number',
            TYPE_COMBO: 'type-combo',
            TYPE_DATE: 'type-date',

            example: function (size, param1) {
                return PmsModal.open({
                    templateUrl: 'myModalContent.html',
                    size: size,
                    resolve: {
                        anotherParam: function () {
                            return "this can be any value" + param1;
                        }
                    },
                    controller: function ($scope, $modalInstance, anotherParam) {
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                        };
                        $scope.ok = function () {
                            $modalInstance.close('alibaba');
                        };
                    }
                });
            },

            /**
             * Returns primise that have only success
             */
            alert: function (msg) {
                var defer = $q.defer();
                var lines = [
                    '<div class="modal-body" ng-enter="ok()">${msg}</div>',
                    '<div class="modal-footer">',
                    '<button class="btn btn-default" ng-click="ok()">OK</button>',
                    '</div>'
                ];
                var template = _.template(lines.join(''), {msg: msg});
                PmsModal.open({
                    template: template,
                    size: 'sm',
                    backdrop: 'static',
                    controller: function ($scope, $modalInstance) {
                        $scope.ok = function () {
                            $modalInstance.dismiss('cancel');
                            defer.resolve('ok');
                        };
                    }
                }).result.then(function () {
                    }, function () {
                        defer.resolve('ok');
                    });
                return defer.promise;
            },

            /**
             * @param msg
             * @param buttonTexts should be any of Yes_No, OK_Cancel
             * @returns {d.promise|promise|Q.promise}
             */
            confirm: function (msg, buttonTexts) {
                var defer = $q.defer();
                var texts = _und(buttonTexts, 'Yes_No').split('_');

                var lines = [
                    '<div class="modal-body" ng-enter="ok()">{{options.msg}}</div>',
                    '<div class="modal-footer">',
                    '  <button class="btn btn-primary" ng-click="ok()">${ok}</button>',
                    '  <button class="btn btn-default" ng-click="cancel()">${cancel}</button>',
                    '</div>'
                ];
                var template = _.template(lines.join(''), {
                    ok: texts[0],
                    cancel: texts[1]
                });
                PmsModal.open({
                    template: template,
                    size: 'sm',
                    backdrop: 'static',
                    controller: function ($scope, $modalInstance) {
                        $scope.options = {
                            msg: msg
                        };
                        $scope.ok = function () {
                            $modalInstance.dismiss('ok');
                            defer.resolve('ok');
                        };
                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                            defer.reject('cancel');
                        };
                    }
                }).result.then(function () {
                    }, function () {
                        defer.reject('cancel');
                    });
                return defer.promise;
            },

            /**
             * @param msg
             * @param buttonTexts should be any of Yes_No, OK_Cancel
             * @returns {d.promise|promise|Q.promise}
             */
            prompt: function (options) {
                var defer = $q.defer();
                options = angular.extend({
                    msg: 'Enter your value',
                    defaultText: '',
                    buttonTexts: 'OK_Cancel',
                    placeholder: ''
                }, options);
                var texts = options.buttonTexts.split('_');

                var lines = [
                    '<div class="modal-body">',
                    '  <p>{{options.msg}}</p>',
                    '  <input type="text" class="form-control dialog-prompt-text" placeholder="{{options.placeholder}}" ng-model="options.defaultText" ng-enter="ok()" />',
                    '</div>',
                    '<div class="modal-footer">',
                    '  <button class="btn btn-primary" ng-click="ok()">${ok}</button>',
                    '  <button class="btn btn-default" ng-click="cancel()">${cancel}</button>',
                    '</div>',
                    '{{focus()}}'
                ];
                var template = _.template(lines.join(''), {
                    ok: texts[0],
                    cancel: texts[1]
                });
                PmsModal.open({
                    template: template,
                    size: 'sm',
                    backdrop: 'static',
                    controller: function ($scope, $modalInstance) {
                        $scope.options = options;

                        $scope.ok = function () {
                            $modalInstance.dismiss('ok');
                            defer.resolve($scope.options.defaultText);
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                            defer.reject('cancel');
                        };

                        $scope.focus = function(){
                            console.log('focusing');
                            $('.modal-body input').focus();
                        };
                    }
                }).result.then(function () {
                    }, function () {
                        defer.reject('cancel');
                    });
                return defer.promise;
            },

            multiInput: function (options, otherOptions) {
                var self = this;
                var defer = $q.defer();

                options = options.map(function (option, otherOptions) {
                    option = angular.extend({
                        key: 'empty-key',
                        type: self.TYPE_TEXT,
                        defaultText: '',
                        placeholder: ''
                    }, option);
                    option.label = option.label || option.key;
                    return option;
                });

                otherOptions = angular.extend({
                    msg: 'Enter your values',
                    buttonTexts: 'OK_Cancel',
                    size: ''
                }, otherOptions);
                var texts = otherOptions.buttonTexts.split('_');


                var lines = [
                    '<div class="modal-title">{{options.msg}}</div>',
                    '<div class="modal-body">',
                    '  ${inputHtml}',
                    '</div>',
                    '<div class="modal-footer">',
                    '  <button class="btn btn-primary" ng-click="ok()">${ok}</button>',
                    '  <button class="btn btn-default" ng-click="cancel()">${cancel}</button>',
                    '</div> {{focus()}}'
                ];

                var inputHtml = [];
                for (var i = 0; i < options.length; i++) {
                    var option = options[i];
                    var html = [
                        '<div class="form-group">',
                        '  <label for="${key}" class="col-sm-2 control-label">${label}</label>',
                        '  <div class="col-sm-10">',
                        '    <input id="${key}" type="email" class="form-control" placeholder="${placeholder}" value="${defaultText}">',
                        '  </div>',
                        '</div>'
                    ];
                    inputHtml.push(_.template(html.join(''), option));
                }
                inputHtml.splice(0, 0, '<form class="form-horizontal">');
                inputHtml.push('</form>');

                var template = _.template(lines.join(''), {
                    inputHtml: inputHtml.join(''),
                    ok: texts[0],
                    cancel: texts[1]
                });
                PmsModal.open({
                    template: template,
                    size: otherOptions.size,
                    backdrop: 'static',
                    controller: function ($scope, $modalInstance) {
                        $scope.focused = false;

                        $scope.options = otherOptions;

                        $scope.ok = function () {
                            $modalInstance.dismiss('ok');
                            defer.resolve('success');
                        };

                        $scope.cancel = function () {
                            $modalInstance.dismiss('cancel');
                            defer.reject('cancel');
                        };

                        $scope.focus = function() {
                            if ($scope.focused){
                                return;
                            }

                            var selector = '#' + options[0].key + ':eq(0)';
                            if ($(selector).length === 0){
                                return;
                            }

                            $scope.focused = true;
                            setTimeout(function(){
                                $(selector).focus();
                            }, 0);
                        };
                    }
                }).result.then(function () {
                    }, function () {
                        defer.reject('cancel');
                    });
                return defer.promise;
            }
        };
    });
});