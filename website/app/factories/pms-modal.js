define(['app'], function(app){
    app.service('PmsModal', function ($modal, $q) {
        return {
            open: function (options) {
                options.backdrop = options.backdrop || 'static';

                var d = $modal.open(options);

                d.opened.then(function () {
                    setTimeout(function () {
                        var marginTop = ($(window).height() - $('.modal-dialog').height()) / 2;
                        $('.modal-dialog').css('margin-top', marginTop);
                    }, 0);
                });

                d.result.then(function (res) {
                    $('.modal-backdrop').remove();
                    return res;
                }, function () {
                    $('.modal-backdrop').remove();
                    return $q.reject.apply(this, arguments);
                });

                return d;
            }
        };
    });
});
