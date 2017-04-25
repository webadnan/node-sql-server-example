//Promise.prototype.finally = function (callback) {
//    var resolve = value => {
//        return this.constructor.resolve(callback()).then(() => value)
//    }
//    var reject = reason => {
//        return this.constructor.resolve(callback()).then(() => {
//            throw reason
//        })
//    }
//    return this.then(resolve, reject)
//}
//
//window._Promise = Promise

function start(){
    var _paths = {};
    _paths.app = 'app';

    _paths.HomeController = 'controllers/home-controller/home-controller';
    _paths.ProdBasic = 'controllers/prod-basic/prod-basic';
    _paths.ProdSettings = 'controllers/prod-settings/prod-settings';
    _paths.BookController = 'controllers/book-controller/book-controller';
    // @CODE_GENERATOR:LINK_CONTROLLER

    _paths.Rest = 'factories/rest';
    _paths.Global = 'factories/global';

    _paths.MasterData = 'factories/master-data';
    _paths.Codefile = 'factories/codefile';

    _paths.ModalDialogs = 'factories/modal-dialogs';
    _paths.PmsModal = 'factories/pms-modal';
    _paths.angularUtil = 'util/angular-util';
    _paths.SelectSection = 'comp/dialog/select-section/select-section';
    _paths.CommonDialog = 'comp/dialog/common-dialog/common-dialog';
    _paths.SelectableList = 'comp/selectable-list/selectable-list';
    _paths.PmsHeader = 'comp/pms-header/pms-header';
    _paths.SearchText = 'comp/search-text/search-text';
    _paths.Combo = 'comp/combo/combo';
    _paths.DatePicker = 'comp/date-picker/date-picker';
    _paths.PmsMenu = 'comp/pms-menu/pms-menu';


    require.config({
        baseUrl: 'build-dev/app',
        urlArgs: 'v=' + _UUID_,
        paths: _paths,
        priority: ['app']
    });

    var initialDependencies = [];
    _.forEach(_paths, function(value, index){
        initialDependencies.push(index);
    });

    require(initialDependencies, function(){
        angular.bootstrap(document, ['app']);
    });
}
