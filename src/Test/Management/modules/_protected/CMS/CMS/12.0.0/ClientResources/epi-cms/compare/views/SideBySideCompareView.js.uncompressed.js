define("epi-cms/compare/views/SideBySideCompareView", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",

    "epi/shell/widget/Iframe",
    "epi/shell/widget/_ModelBindingMixin",

    "epi-cms/contentediting/OnPageEditing"
],

function (
    declare,
    lang,
    topic,

    Iframe,
    _ModelBindingMixin,

    OnPageEditing
) {

    return declare([OnPageEditing, _ModelBindingMixin], {
        // summary:
        //		Side by side compare view.
        //
        // tags:
        //      internal

        // createOverlays: [protected] Boolean
        //      Indicate that the overlays should be created.
        createOverlays: true,

        modelBindingMap: {
            rightVersionUrl: ["rightVersionUrl"]
        },

        _rightIframe: null,

        buildRendering: function () {
            this.inherited(arguments);
            this._setupComparePanes();
        },

        destroy: function () {
            // summary:
            //		Destroy the widget.
            // tags:
            //		protected

            // Do not use own because Destroyable destroys owned things before destroy method is called.
            // As a result, we cannot remove the compare panes from edit layout.
            this._removeAndDestroyComparePanes();

            this.inherited(arguments);
        },

        _setRightVersionUrlAttr: function (url) {
            // tags:
            //      private
            if (url) {
                this._rightIframe.load(url);
            }
        },

        _setupComparePanes: function () {
            // summary:
            //		Setup the edit form.
            // tags:
            //		private
            var orientation = this.model.orientation;
            var width = this.editLayoutContainer.w / 2;

            // Dojo puts an overflow hidden on the region containers which makes Firefox not display the scrollbar,
            // so we add the class epi-iframe--overflow to fix this
            this._rightIframe = new Iframe({
                region: orientation === "vertical" ? "right" : "bottom",
                layoutPriority: 100, // The top region panes' priority are from 0 to 99, the center panes' should be 100 or greater to keep the "headline" design.
                style: orientation === "vertical" ? "width: " + width + "px" : "height: 50%",
                splitter: true,
                "class": "epi-iframe--overflow epi-editorViewport"
            });

            this.own(
                this._rightIframe.on("load", lang.hitch(this, this._onRightIframeLoad))
            );

            this.mainLayoutContainer.addChild(this._rightIframe);
        },

        _onRightIframeLoad: function (url, triggeredExternally) {
            if (!!url && !triggeredExternally && url !== this.model.rightVersionUrl) {
                // Iframe is reloaded when user clicks on a link in preview iframe.

                // request a context change
                topic.publish("/epi/shell/context/request", { url: url }, {
                    sender: this,
                    forceContextChange: true,
                    suppressFailure: true
                });
            }
        },

        _removeAndDestroyComparePanes: function () {
            // summary:
            //		Check if a form exists so remove from edit layout and destroy it.
            // tags:
            //		private

            if (this._rightIframe) {
                this.mainLayoutContainer.removeChild(this._rightIframe);
                this._rightIframe.destroyRecursive();
                this._rightIframe = null;
            }
        }
    });
});
