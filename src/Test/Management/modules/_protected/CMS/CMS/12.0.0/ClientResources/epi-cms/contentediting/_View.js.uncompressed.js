define("epi-cms/contentediting/_View", [
    "dojo/_base/declare",
    "dijit/_Widget"
],

function (declare, _Widget) {

    return declare([_Widget], {
        // tags:
        //      internal

        // iframeWithOverlay: [protected] epi/shell/widget/IframeWithOverlay
        //      The IframeWithOverlay widget
        iframeWithOverlay: null,

        overlay: null,

        // iFrame: [protected] epi/shell/widget/Iframe
        //      The iframe widget
        iFrame: null,

        // layoutContainer: [protected] Object
        //      The layout container
        layoutContainer: null,

        // contextTypeName: String
        //      Type name for the context we can handle
        contextTypeName: null,

        // viewModel: [protected] Object
        //      The content view model.
        viewModel: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            if (this.iframeWithOverlay) {
                this.iFrame = this.iframeWithOverlay.iframe;
                this.overlay = this.iframeWithOverlay.overlay;
            }

            this._viewConnections = [];
        },

        _setViewModelAttr: function (viewModel) {
            this._set("viewModel", viewModel);
        },

        _setIframeWithOverlayAttr: function (value) {
            this._set("iframeWithOverlay", value);
            this.iFrame = this.iframeWithOverlay.iframe;
            this.overlay = this.iframeWithOverlay.overlay;
        },

        onPreviewReady: function (viewModel, doc) {
            // summary:
            //  Event raised when a new document is loading in the inner iframe.
            //  Override or connect to to handle the situation when the preview is loaded.
            // remark:
            //  The corresponding context is succesfully loaded and ready to use.
            //  Be very carefull when call inherited on this method.
            //  Because it has nothing to setup, overlay ready event is raised immediately which is not true in other view.
            //
            // url: string
            //  url of the frame source
            // tags: callback public

            this.set("viewModel", viewModel);
            this.onPrepareOverlayComplete();
        },

        onPrepareOverlayComplete: function () {
            // summary:
            //    Overlay preparation is complete
            //
            // tags:
            //    callback
        },

        onContentLinkSyncChange: function (oldContentLink, newContentLink) {
            // summary:
            //  Called when the current content link changed. For example: edit a published common draft.
            //
            // oldContentLink: String
            //  The content link before the update
            //
            // newContentLink: String
            //  The updated content link
            //
            // tags: callback public
        },

        onReloadRequired: function () {
            // summary:
            //  Event raised when the view require to be reloaded.
            //
            // tags: callback public
        }
    });
});
