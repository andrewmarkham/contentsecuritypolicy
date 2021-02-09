define("epi/shell/widget/AutoResizingIframe", [
    "dojo/_base/declare",

    // EPi Framework
    "./Iframe",
    "./_AutoResizingIframeMixin",
    "./_DynamicStyleSheetIframeMixin"
], function (declare, Iframe, _AutoResizingIframeMixin, _DynamicStyleSheetIframeMixin) {

    return declare([Iframe, _AutoResizingIframeMixin, _DynamicStyleSheetIframeMixin], {
        // summary:
        //    This is an auto resizing iframe
        //
        // tags:
        //      internal xproduct
    });
});

