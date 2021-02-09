define("epi-cms/contentediting/_ViewSetting", [
    "dojo/_base/declare",
    "epi/shell/_StatefulGetterSetterMixin"
],
function (
    declare,
    _StatefulGetterSetterMixin
) {
    return declare(_StatefulGetterSetterMixin, {
        // summary:
        //      Abstract view setting class.
        //      Concreate view setting classes define a key to get setting value from URL hash, and an apply method.
        //      On applying settings, "/epi/cms/action/viewsettingchanged" will be published.
        // tags:
        //      abstract public

        key: null,

        value: null,

        enabled: null,

        postscript: function () {
            this._disableObsoleteWarnings = true;
            this.inherited(arguments);
        },

        beforePreviewLoad: function (previewParams, enabled) {
            // summary:
            //      Before the preview is loaded. The view setting implementation can modify preview parameters it concerns.
            //      In most of the cases, previewParams contains Url parameter to load the preview iframe.
            // previewParams: Hashtable
            //      The current preview parameters.
            // enabled: Boolean
            //      Indicate that this view setting should be enabled or disabled when apply.
            // tags:
            //      public
        },

        afterPreviewLoad: function (preview, enabled) {
            // summary:
            //      After the preview is loaded. The view setting implementation can modify preview parameters it concerns
            //      Concrete implementation should either make changes to the preview or return set of preview parameters if changes require the preview to reload.
            // preview: Object
            //      The preview widget. For CMS contents, preview widget is usually an IframeWithOverlay.
            // enabled: Boolean
            //      Indicate that this view setting should be enabled or disabled when apply.
            //  return: Hashtable
            //      Preview parameters added when the preview is reloaded.
            // tags:
            //      public
        }
    });
});
