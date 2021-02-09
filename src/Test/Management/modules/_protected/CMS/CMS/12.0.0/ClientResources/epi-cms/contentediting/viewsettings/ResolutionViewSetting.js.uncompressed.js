define("epi-cms/contentediting/viewsettings/ResolutionViewSetting", [
    "dojo/_base/declare",
    "epi-cms/contentediting/_ViewSetting"
],
function (declare, _ViewSetting) {
    return declare([_ViewSetting], {
        // tags:
        //      internal

        key: "resolution",
        usedForRendering: false,

        afterPreviewLoad: function (preview, enabled) {
            this.inherited(arguments);

            if (preview) {
                var size = enabled ? this._getPreviewResolution() : null;
                preview.set("previewSize", size);
                preview.set("devicePreviewClass", this.value ? "epi-editorViewport--device-preview epi-viewPort-" + this.value : "");
            }

            return null; //Don't need to reload
        },

        _getPreviewResolution: function () {
            // summary:
            //		Gets preview resolution view setting.
            //
            // tags:
            //		private

            var size = null;

            // Get preview resolution.
            var resolution = this.value;

            if (resolution) {
                var screenSize = resolution.split("x");
                if (screenSize.length === 2) {
                    size = { w: screenSize[0], h: screenSize[1] };
                }
            }

            return size;
        }
    });
});
