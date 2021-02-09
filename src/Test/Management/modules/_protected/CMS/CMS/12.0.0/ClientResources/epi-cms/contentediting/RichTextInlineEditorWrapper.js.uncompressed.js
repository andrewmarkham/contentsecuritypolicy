define("epi-cms/contentediting/RichTextInlineEditorWrapper", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/on",
    // epi
    "epi/obsolete",
    "epi-cms/contentediting/_FloatingComponentEditorWrapperMixin",
    "epi-cms/contentediting/InlineEditorWrapper"
],

function (
// dojo
    declare,
    lang,
    domStyle,
    on,
    // epi
    obsolete,
    _FloatingComponentEditorWrapperMixin,
    InlineEditorWrapper
) {

    return declare([InlineEditorWrapper, _FloatingComponentEditorWrapperMixin], {
        // summary:
        //      Overlay based inline editor wrapper for rich text editor.
        // description:
        //      Adds "epi-cms/contentediting/_FloatingComponentEditorWrapperMixin" in order to float the exposed component from its editor widget.
        // tags:
        //      internal xproduct deprecated

        // isUndoDisabled: Boolean
        //      Override base value to disable undo when editing.
        isUndoDisabled: true,

        // =======================================================================
        // Overrides public functions

        postCreate: function () {
            this.inherited(arguments);

            obsolete("epi-cms/contentediting/RichTextInlineEditorWrapper", null, "12.0");

            this.own(
                on(this.get("iframeWithOverlay").iframe, "unload", lang.hitch(this, function () {
                    this.tryToStopEditing();
                    this._blockDisplayNodeOpacity = this.blockDisplayNode = this.overlayItem = null;
                }))
            );
        },

        setupFloatingComponentEditorWrapper: function (/*Object*/componentFloaterInfo) {
            // summary:
            //
            // componentFloatInfo: [Object]
            //      Object's properties:
            //          componentInfo: [Object]
            //              component: [Object]
            //              componentOverlayItem: [DOM]
            //              viewport: [DOM]
            //              viewportScroller: [DOM]
            //          floatingInfo: [Object]
            // tags:
            //      public, extension

            this.inherited(arguments);

            this._setupFloatingEvents(componentFloaterInfo);
        },

        focus: function () {
            // summary:
            //      Setup pre-settings when focus
            // tags:
            //      public, extension

            this.inherited(arguments);

            this.blockDisplayNode && domStyle.set(this.blockDisplayNode, { visibility: "hidden" });

            this._toggleOverlayItemZIndex(true);
            this._toggleSupportCustomDnd(true);
        },

        startEdit: function () {
            // summary:
            //      Updates editor widget parameters when start edit
            // tags:
            //      public, extension

            lang.mixin(this.editorParams, {
                ready: this.get("overlayItem") != null
            });

            this.inherited(arguments);

            this.setupFloatingComponentEditorWrapper(this._getComponentFloaterInfo());
        },

        tryToStopEditing: function () {
            // summary:
            //		Try to stop editing, if the value has changed, editing is stopped
            //      otherwise editing is cancelled
            // tags:
            //		public overridden

            this.inherited(arguments);

            //If the editor widget has implemented tryToStopEditing call it
            //This is mainly done to solve an IE 11 focus problem, the editor needs to know when it is going to get hidden
            var editorWidget = this.getEditorWidget();
            if (editorWidget && editorWidget.tryToStopEditing) {
                editorWidget.tryToStopEditing();
            }
        },

        // =======================================================================
        // Protected functions

        _onEditorResizing: function (/*Object*/resizeInfo) {
            // summary:
            //      Stub to do something when the current editor on resizing progress
            // resizeInfo: [Object]
            //      Object that provides resize information to editor wrapper
            // tags:
            //      protected, extension

            this.blockDisplayNode && domStyle.set(this.blockDisplayNode, resizeInfo.style);
        },

        _onEditorResized: function (/*Function*/callbackFunction) {
            // summary:
            //      Stub to do something when the current editor finished its resizing process
            // tags:
            //      protected, extension

            var overlayItem = this.get("overlayItem");
            overlayItem && overlayItem.onResize();

            callbackFunction && (this._deferEditorResizedCallback = this.defer(callbackFunction, 100));
        },

        _removeEditingFeatures: function () {
            // summary:
            //      Its purpose is to restore state as it was before editing was started.
            // tags:
            //      protected, extension

            this.inherited(arguments);

            // Restore the block display node's styles
            this.blockDisplayNode && domStyle.set(this.blockDisplayNode, {
                height: "auto",
                visibility: "visible"
            });

            // Restore z-index of the overlay item
            this._toggleOverlayItemZIndex();
            // Remove custom Dnd
            this._toggleSupportCustomDnd();
        },

        // =======================================================================
        // Private functions

        _setupFloatingEvents: function (/*Object*/componentFloaterInfo) {
            // summary:
            //      Stub to setup floating events
            // componentFloatInfo: [Object]
            //      Object's properties:
            //          componentInfo: [Object]
            //              component: [Object]
            //              componentOverlayItem: [DOM]
            //              viewport: [DOM]
            //              viewportScroller: [DOM]
            //          floatingInfo: [Object]
            //              delayTime: [Integer]
            //              refreshPosition: [Boolean]
            //              refreshDelayTime: [Integer]
            // tags:
            //      private

            var iframeWithOverlay = this.get("iframeWithOverlay"),
                hitchComponentFloatAction = lang.hitch(this, function (/*Event*/evt) {
                    var editorWidget = this.getEditorWidget();
                    if (!editorWidget || !editorWidget.isEditing()) {
                        return;
                    }

                    lang.mixin(componentFloaterInfo, {
                        floatingInfo: {
                            delayTime: evt != null && evt.type === "viewportresized" ? 100 : null,
                            refreshPosition: evt != null && (evt.type === "viewportresized" || evt.type === "viewportpulldown"),
                            refreshDelayTime: evt != null && evt.type === "viewportpulldown" ? 0 : 100
                        }
                    });

                    // Call exposed event of the _FloatingComponentEditorWrapperMixin mixin in order to float the editor's external component
                    this.onComponentFloat(componentFloaterInfo);
                });

            this.own(
                // onscroll event
                //      Fired when the mouse have scrolled on the viewport
                on(iframeWithOverlay.previewContainer, "scroll", hitchComponentFloatAction),
                on(iframeWithOverlay.scroller, "scroll", hitchComponentFloatAction),

                // onviewportpositionchanged event
                //      Fired after pin/un-pin the left/right pane or change the viewport size
                on(iframeWithOverlay.domNode, "viewportresized, viewportpulldown", hitchComponentFloatAction)
            );
        },

        _getComponentFloaterInfo: function () {
            // summary:
            //      Build component wrapper information for floating
            // returns: [Object]
            //      Object's properties:
            //          component: [Object]
            //          componentOverlayItem: [DOM]
            //          viewport: [DOM]
            //          viewportScroller: [DOM]
            // tags:
            //      private

            var iframeWithOverlay = this.get("iframeWithOverlay"),
                overlayItem = this.get("overlayItem");

            return {
                componentInfo: {
                    component: this.getEditorWidget(),
                    componentOverlayItem: overlayItem ? overlayItem.item : null,
                    viewport: iframeWithOverlay.previewContainer,
                    viewportIframe: iframeWithOverlay.iframe.domNode,
                    viewportScroller: iframeWithOverlay.scroller
                }
            };
        }

    });

});
