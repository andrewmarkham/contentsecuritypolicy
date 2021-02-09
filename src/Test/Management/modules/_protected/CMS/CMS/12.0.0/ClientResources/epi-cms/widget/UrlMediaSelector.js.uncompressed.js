define("epi-cms/widget/UrlMediaSelector", [
    "dojo/_base/declare",
    "epi-cms/widget/MediaSelector",
    "epi-cms/widget/_UrlSelectorMixin"
], function (
    declare,
    MediaSelector,
    _UrlSelectorMixin) {

    return declare([MediaSelector, _UrlSelectorMixin], {
        // tags:
        //      internal
    });
});
