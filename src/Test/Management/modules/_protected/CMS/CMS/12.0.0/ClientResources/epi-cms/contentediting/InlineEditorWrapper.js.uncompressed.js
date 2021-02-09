define("epi-cms/contentediting/InlineEditorWrapper", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",

    "dojo/dom-style",

    "dojo/Deferred",
    "dojo/on",
    "dojo/when",
    // epi
    "epi-cms/contentediting/OverlayBasedEditorWrapper"
],

function (
// dojo
    array,
    declare,
    event,
    lang,

    domStyle,

    Deferred,
    on,
    when,
    // epi
    OverlayBasedEditorWrapper
) {

    return declare([OverlayBasedEditorWrapper], {
        // summary:
        //      Widget that wraps a editor for inline property editing.
        // tags:
        //      internal xproduct

        // width: [public] String
        //      The witdh to use for the editor
        width: "100%",

        // hasInlineEditor: Boolean
        //      A value indicating if the wrapped editor is editing inline, i.e. On-Page-Editing.
        //      True by default.
        hasInlineEditor: true,

        matchStyle: false,

        destroy: function () {

            this._removeLocalHandlers();

            this._blockDisplayNodeOpacity = null;

            this.inherited(arguments);
        },

        tryToStopEditing: function () {
            // summary:
            //      Try to stop editing, ensure the inline editor has closed correctly
            //      first to ensure it has called to save.
            // tags:
            //      private

            var editorWidget = this.getEditorWidget();
            if (editorWidget && editorWidget.isEditing()) {
                editorWidget.onEditorBlur();
            }

            this.inherited(arguments, [true]);
        },

        _getOrCreateEditor: function () {
            if (this._createdEditor) {
                return this.editorWidget;
            }

            var deferred = new Deferred();

            var params = lang.mixin(this.editorParams, {
                value: this.value
            });

            if (this.matchStyle) {
                params.style = this._computeStyling();
            }

            require([this.editorWidgetType], lang.hitch(this, function (Editor) {
                var editorWidget = this.editorWidget = new Editor(params);

                editorWidget.placeAt(this.get("overlayItem").domNode);

                this.own(
                    on(editorWidget.domNode, "editorstatechanged", lang.hitch(this, this._onEditorStateChanged))
                );

                this._handlers = [
                    this.connect(editorWidget, "onClick", event.stop),
                    this.connect(editorWidget, "onEditorResizing", this._onEditorResizing),
                    this.connect(editorWidget, "onEditorResized", this._onEditorResized)
                ];

                this._handlers.push(this.connect(editorWidget, "onChange", "_onEditorChange"));

                // ESC and TAB should cancel and save.  Note that edit widgets do a stopEvent() on ESC key (to
                // prevent Dialog from closing when the user just wants to revert the value in the edit widget),
                // so this is the only way we can see the key press event.
                this._handlers.push(this.connect(editorWidget, "onKeyPress", "_onEditorKeyPress"));

                this._createdEditor = true;

                deferred.resolve(editorWidget);
            }));

            return deferred;
        },

        _computeStyling: function () {

            var srcStyle = domStyle.getComputedStyle(this.blockDisplayNode),
                editStyle = "line-height:" + srcStyle.lineHeight + ";",
                destStyle = domStyle.getComputedStyle(this.domNode);

            ["Weight", "Family", "Size", "Style"].forEach(function (prop) {
                var textStyle = srcStyle["font" + prop],
                    wrapperStyle = destStyle["font" + prop];
                if (wrapperStyle !== textStyle) {
                    editStyle += "font-" + prop + ":" + srcStyle["font" + prop] + ";";
                }
            }, this);

            var width = this.width;
            if (width === "100%") {
                // block mode
                editStyle += "width:100%;";
            } else {
                // inline-block mode
                editStyle += "width:" + (width + (Number(width) === width ? "px" : "")) + ";";
            }

            editStyle += "position: absolute; left: 0px; top: 0px;";

            return editStyle;
        },

        _onEditorChange: function (value) {
            this._onChange(value);
        },

        _onEditorResizing: function (/*Object*/resizeInfo) {
            // summary:
            //      Stub to do something when the current editor on resizing progress
            // resizeInfo: [Object]
            //      Object that provides resize information to editor wrapper
            // tags:
            //      protected, extension
        },

        _onEditorResized: function (/*Function*/callbackFunction) {
            // summary:
            //      Stub to do something when the current editor finished its resizing process
            // tags:
            //      protected, extension
        },

        _onEditorStateChanged: function (/*String*/inputValue) {
            // summary:
            //      Delegate validation state to the current editing overlay item
            // inputValue: [String]
            //      Validation state string value
            // tags:
            //      private

            var overlayItem = this.get("overlayItem");
            overlayItem && overlayItem.set("error", inputValue === "Error");
        },

        startEdit: function () {
            var inherited = this.getInherited(arguments);

            when(this._getOrCreateEditor(), lang.hitch(this, function (editorWidget) {
                this._blockDisplayNodeOpacity = domStyle.get(this.blockDisplayNode, "opacity");

                domStyle.set(editorWidget.domNode, { display: "" });
                domStyle.set(this.blockDisplayNode, { opacity: 0.5 });

                inherited.apply(this);

                this.focus();
            }));
        },

        _removeLocalHandlers: function () {
            // summary:
            //      Remove all local handlers
            // tags:
            //      private

            (this._handlers instanceof Array && this._handlers.length > 0) && this._handlers.forEach(function (handle) {
                handle.remove();
            });
        },

        _onTryToStopWithInvalidValue: function () {
            // summary:
            //      Overridden to prevent user from leaving an inline editor with an invalid value.
            //      Leaving the editor gives a bad UX, since the last saved value is shown rather than the invalid value.
        },

        _removeEditingFeatures: function () {
            // summary:
            //      Its purpose is to restore state as it was before editing was started.
            // tags:
            //      protected, extension

            (this.blockDisplayNode && this._blockDisplayNodeOpacity) && domStyle.set(this.blockDisplayNode, { opacity: this._blockDisplayNodeOpacity });
            (this.editorWidget && this.editorWidget.domNode) && domStyle.set(this.editorWidget.domNode, "display", "none");
        },

        _toggleSupportCustomDnd: function (/*Boolean*/customDnd) {
            // summary:
            //      We should passively connect to onDropData event since overlayItem can be setup dndTarget.
            //      If not, we never get dnd data from overlayItem.
            // customDnd: [Boolean]
            // tags:
            //      protected

            var overlayItem = this.get("overlayItem");
            if (!overlayItem) {
                return;
            }

            var editorWidget = this.getEditorWidget();
            if (!editorWidget || !editorWidget.supportCustomDnd) {
                return;
            }

            if (customDnd === true) {
                overlayItem.transferDndControlTo(editorWidget);
            } else {
                overlayItem.transferDndControlTo(overlayItem);
            }
        },

        _toggleOverlayItemZIndex: function (/*Boolean*/increase) {
            // summary:
            //      Toggle increase/decrease z-index of the current editing overlay item in order to make it have higher indexed
            // increase: [Boolean]
            //      TRUE to increase, otherwise decrease
            // tags:
            //      protected

            var overlayItem = this.get("overlayItem");
            if (!overlayItem || !overlayItem.item) {
                return;
            }

            var currentZIndex = parseInt(domStyle.get(overlayItem.item, "zIndex"), 10);

            domStyle.set(overlayItem.item, {
                zIndex: increase === true ? ++currentZIndex : --currentZIndex
            });
        }

    });

});
