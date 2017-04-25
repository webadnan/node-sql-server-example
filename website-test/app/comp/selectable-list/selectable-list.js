/**
 * Created by SM on 5/12/2015.
 */
define(['app'], function (app) {
    app.directive('selectableList', function($filter){
        return {
            restrict: 'EA',
            templateUrl: _templateUrl('app/comp/selectable-list/selectable-list.html'),
            scope: {
                data: '=',
                header: '=',
                filter: '=',
                filteredData: '&'
            },
            link: function(scope, element, attr){
                scope.allSelected = false;
                var filteredData = scope.data;

                scope.getData = function(){
                    filteredData = $filter('filter')(scope.data, scope.filter || '');
                    if (attr.filteredData) scope.filteredData({data: filteredData});
                    return filteredData;
                };

                scope.selectAll = function(flag){
                    scope.allSelected = flag;
                    for (var i = 0; i < filteredData.length; i++) {
                        var e = filteredData[i];
                        e._selected = flag;
                    }
                    console.log(scope.allSelected);
                };

                scope.toggle = function ($index) {
                    var flag = filteredData[$index]._selected;
                    filteredData[$index]._selected = flag ? false : true;

                    scope.allSelected = isAllSelected();
                };

                function isAllSelected(){
                    for (var i = 0; i < filteredData.length; i++) {
                        var e = filteredData[i];
                        if (!e._selected) return false;
                    }
                    return true;
                }

                scope.getDataClass = function ($index) {
                    if (filteredData[$index]._selected){
                        return "data selected";
                    } else {
                        return "data";
                    }
                };
            }
        };
    });
});