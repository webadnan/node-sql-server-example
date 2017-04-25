/**
 * Created by SM on 5/12/2015.
 */
define(['app'], function(app){
    app.factory('MasterData', function(Global, Rest, $q){
        var sections = null;

        function getSections(){
            //if (sections) return Global.resolve(sections);

            return Rest.batch({
                api: 'codefile.sections'
            }).then(function(data){
                return (sections = data);
            });
        }

        return {
            getSections: getSections
        };
    });
});
