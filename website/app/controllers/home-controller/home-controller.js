/**
 * Created by SM on 6/20/2015.
 */
define(['app'], function(app){
    app.controller('HomeController', function($scope){
        var scope = $scope, data = scope.data = {}

        scope.onKnittingSettings = () => {
            Url.queries = {action: 'prod-settings', section: 'knitting'}
        }

        scope.onProdBasic = () => {
            Url.queries = {action: 'prod-basic'}
        }

        scope.onBook = () => {
            Url.queries = {action: 'book-controller'}
        }
   })
})
