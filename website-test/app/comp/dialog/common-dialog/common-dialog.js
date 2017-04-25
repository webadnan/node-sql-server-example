/**
 * Created by SM on 5/9/2015.
 *
 * <header> tag and @title attribute do the same task
 * <footer> is optional
 * @close attribute will bring a cross button and it takes callback
 */

//<div class="comp-select-section" common-dialog title="{{title}}" close="close()">
//  <header>
//      Header text
//  </header>
//  This is a simple html of select section lkjfaldskjf alksdjflakjf laksdj fl;aksdj flkaj sdf
//  asdfklasjd fl;kja sdlfkj as;fldkjasl;dkfj la;asdjkf al;sdjkf l;aksdjf asdf
//
//  <footer>
//      <button class="btn btn-primary" ng-click="ok()">Grant Access</button>
//      <button class="btn btn-default" ng-click="close()">Deny</button>
//  </footer>
//</div>

define(['app'], function (app) {
    app.directive('commonDialog', function () {
        return {
            restrict: 'EA',
            transclude: true,
            scope: {
                close: '&',
                title: '@'
            },
            templateUrl: _templateUrl('app/comp/dialog/common-dialog/common-dialog.html'),
            link: function (scope, element, attr) {
                //scope.onClose = function () {
                //    console.log('inside common dialog close');
                //};
                if (!attr.close) {
                    element.find('.cross-button').remove();
                }

                if (element.find('header').length > 0) {
                    element.find('.modal-title').empty().append(element.find('header'));
                } else if (!attr.title) {
                    element.find('.modal-title').remove();
                }

                // if modal title is there then make content's padding-top 0
                if (element.find('.modal-title').length > 0) {
                    element.find('.content').css('padding-top', '0');
                }

                if (element.find('footer').length > 0) {
                    element.find('.modal-footer').append(element.find('footer'));
                } else {
                    element.find('.modal-footer').remove();
                }

                console.log(attr);
            }
        };
    });
});