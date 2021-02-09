define("epi-cms/widget/UrlContentSelector", [
    "dojo/_base/declare",
    "epi-cms/widget/ContentSelector",
    "epi-cms/widget/_UrlSelectorMixin"
], function (
    declare,
    ContentSelector,
    _UrlSelectorMixin) {

    return declare([ContentSelector, _UrlSelectorMixin], {
        // tags:
        //      internal
    });
});
