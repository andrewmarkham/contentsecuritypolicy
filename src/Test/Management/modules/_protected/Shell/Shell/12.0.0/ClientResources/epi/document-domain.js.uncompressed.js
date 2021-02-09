define("epi/document-domain", [], function () {
    return function (domain) {
        document.domain = domain || document.domain.substring(document.domain.indexOf(".") + 1);
    };
});
