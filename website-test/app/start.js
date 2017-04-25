function start(){
    require.config({
        baseUrl: 'app',
        urlArgs: 'v=' + _UUID_,
        paths: {
            app: 'app',

            // controller
            HomeController: 'controllers/home-controller',

            // service
            ModalDialogs: 'factories/modal-dialogs',
            PmsModal: 'factories/pms-modal',

            // factory
            Rest: 'factories/rest',
            MasterData: 'factories/master-data',
            Global: 'factories/global',

            // util
            angularUtil: 'util/angular-util',

            // components
            SelectSection: 'comp/dialog/select-section/select-section',
            CommonDialog: 'comp/dialog/common-dialog/common-dialog',
            SelectableList: 'comp/selectable-list/selectable-list',

            // other
            lazyLoad: 'comp/LazyLoad/lazy-load'
        },
        priority: ['app']
    });

    var initialDependencies = [
        'app',
        'Rest',
        'angularUtil',
        'ModalDialogs',
        'PmsModal',
        'SelectSection',
        'CommonDialog',
        'MasterData',
        'Global',
        'SelectableList'
    ];

    require(initialDependencies, function(){
        angular.bootstrap(document, ['app']);
    });
}
