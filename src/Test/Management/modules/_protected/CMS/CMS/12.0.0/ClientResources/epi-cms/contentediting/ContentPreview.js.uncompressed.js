define("epi-cms/contentediting/ContentPreview", [
    "dojo/_base/declare",
    "epi-cms/contentediting/_View"
], function (declare, _View) {

    return declare([_View], {
        // tags:
        //      internal

        noPreview: true,

        constructor: function () {
            this.defaultQueryParameters = {};
        },

        startup: function () {
            this.inherited(arguments);

            this.overlay.set("enabled", true);

            this.iframeWithOverlay.set("previewClass", "epi-editorViewport-preview--previewing");
        },

        destroy: function () {
            this.iframeWithOverlay.set("previewClass", "");

            this.inherited(arguments);
        }
    });
});
