define("epi-cms/contentediting/OverlayBasedEditorWrapper", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/on",
    // epi
    "epi/shell/widget/IframeWithOverlay",
    "epi-cms/contentediting/_EditorWrapperBase"
],

function (
// dojo
    declare,
    lang,

    on,
    // epi
    IframeWithOverlay,
    _EditorWrapperBase
) {

    return declare([_EditorWrapperBase], {
        // summary:
        //      Based editor wrapper for the overlay relying editor widget type
        // tags:
        //      internal

        destroy: function () {

            this._iframeWithOverlay = null;

            this.inherited(arguments);
        },

        _onEditorResize: function (/*Object*/resizeInfo) {
            // summary:
            //      Stub to do somethings on editor resizing process
            // resizeInfo: [Object]
            //      Resize information
            // tags:
            //      protected
        },

        _onEditorResizeFinished: function (/*Function*/callbackFunction) {
            // summary:
            //      Stub to do somethings after editor finished its resize function
            // callbackFunction: [Function]
            //      Function will be call after finish resizing process
            // tags:
            //      protected
        },

        _getOverlayItemAttr: function () {
            // summary:
            //      Get editing overlay item object
            // tags:
            //      protected

            return this.overlayItem || this.editorParams.overlayItem;
        },

        _getIframeWithOverlayAttr: function () {
            // summary:
            //      Get the viewport ("epi/shell/widget/IframeWithOverlay") object
            // tags:
            //      protected

            if (this._iframeWithOverlay) {
                return this._iframeWithOverlay;
            }

            var iframeWithOverlay = null,
                widget = this.overlayItem;

            while (widget) {
                if (widget instanceof IframeWithOverlay) {
                    iframeWithOverlay = widget;
                    break;
                }

                widget = widget.getParent();
            }

            return this._iframeWithOverlay = iframeWithOverlay;
        }

    });

});
