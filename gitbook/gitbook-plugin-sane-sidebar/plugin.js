require(["gitbook", "jQuery"], function(gitbook, $) {
    gitbook.events.bind('start', function (e, config) {
        if ($(document).width() <= 600) {
            gitbook.sidebar.toggle(false, false);
        }
    });
});
