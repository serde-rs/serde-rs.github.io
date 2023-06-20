require(["gitbook"], function(gitbook) {
    gitbook.events.bind("start", function(e, config) {
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function() {
            window.dataLayer.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', config.ga4.tag, {
            anonymize_ip: config.ga4.anonymize_ip ?? false,
            cookie_domain: config.ga4.cookie_domain ?? undefined,
            cookie_flags: 'samesite=strict;secure',
        });
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + config.ga4.tag;
        document.getElementsByTagName("head")[0].appendChild(script);
    });
    gitbook.events.bind("page.change", function() {
        window.gtag('event', 'page_view', {
            page_location: window.location.pathname + window.location.search,
        });
    });
});
