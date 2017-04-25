/**
 * Contains modal dialog example
 */

define(['app', 'ModalDialogs'], function(app){
    app.controller('HomeController', function ($scope, ModalDialogs, Rest, SelectSection, MasterData) {
        console.log('HomeController');
        $scope.name = 'Adnan';
        $scope.showModal = function () {
            ModalDialogs.example('lg', 'YourName').result.then(function () {
                console.log('callback-1', arguments);
            }, function () {
                console.log('callback-2', arguments);
            });
        };

        $scope.onAlert = function () {
            ModalDialogs.alert("Hello, World!").then(function () {
                console.log('alert done');
            });
        };

        $scope.onConfirm = function () {
            ModalDialogs.confirm("Do you want to delete this?").then(function () {
                console.log('confirm done with success');
            }, function () {
                console.log('confirm done with failure');
            });
        };

        $scope.onPrompt = function () {
            ModalDialogs.prompt({
                msg: 'Enter the user name',
                placeholder: 'Name'
            }).then(function (text) {
                console.log('confirm done with ', text);
            }, function () {
                console.log('confirm done with failure');
            });
        };

        $scope.onMultiInput = function () {
            ModalDialogs.multiInput([{
                key: 'name',
                label: 'Name',
                type: ModalDialogs.TYPE_TEXT,
                defaultText: 'hello, world!',
                placeholder: 'Ex. Alibaba'
            }, {
                key: 'salary',
                label: 'Salary',
                type: ModalDialogs.TYPE_INT,
                defaultText: '10000'
            }]).then(function (map) {
                console.log(map);
            }, function () {
                console.log('failure');
            });
        };

        $scope.onAddress = function () {
            ModalDialogs.multiInput([{
                key: 'name',
                label: 'Name',
                type: ModalDialogs.TYPE_TEXT,
                defaultText: 'Your Name',
                placeholder: 'Ex. Alibaba'
            }, {
                key: 'fathersname',
                label: "Father's Name",
                type: ModalDialogs.TYPE_INT,
                defaultText: 'father name'
            }, {
                key: 'paddress',
                label: 'Permanent Address',
                type: ModalDialogs.TYPE_TEXT,
                defaultText: 'Permanent address'
            }, {
                key: 'mobileno',
                label: 'Mobile No',
                type: ModalDialogs.TYPE_TEXT,
                defaultText: '+880'
            }, {
                key: 'nid',
                label: 'NID',
                type: ModalDialogs.TYPE_TEXT,
                defaultText: 'Your National ID No'
            }]).then(function (map) {
                console.log(map);
            }, function () {
                console.log('failure');
            });
        };

        $scope.onEsc = function(){
            console.log('esc');
        };

        $scope.loadData = function () {
            MasterData.getSections().then(function(data){
                console.log(data);
            });
        };

        $scope.selectSection = function(){
            SelectSection.show();
        };
    });
});
