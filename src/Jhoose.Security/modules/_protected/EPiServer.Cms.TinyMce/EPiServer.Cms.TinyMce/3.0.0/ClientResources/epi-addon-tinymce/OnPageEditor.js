define([
    // Dojo
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/on",
    // EPi
    "epi/debounce",
    "epi-addon-tinymce/Editor",
    // Template
    "dojo/text!./templates/TinyMCEInlineEditor.html"
], function (
    // Dojo
    declare,
    domStyle,
    on,
    // EPi
    debounce,
    Editor,
    // Template
    template
) {

    return declare([Editor], {
        // summary:
        //      Widget for the TinyMCE inline editor.
        // tags:
        //      internal

        // baseClass: [public] String
        //      The widget's base CSS class.
        baseClass: "epiTinyMCEInlineEditor",

        // autoResizable: [public] Boolean
        //      States if the editor can be resized while text is added.
        autoResizable: true,

        // templateString: [protected] String
        //      Template for the widget.
        templateString: template,

        // inlineSettings: [public] object
        //      The inline editor settings.
        inlineSettings: null,

        // supportCustomDnd: [public] Boolean
        //      Indicates that the current editor had custom Dnd handler or not
        supportCustomDnd: true,

        onEditorBlur: function () {
            // summary:
            //      Stop editing when click outside editor but inside its viewport
            // tags:
            //      public

            var ed = this.editor;
            // We should not react to the blur event in case the editor has not been fully initialized yet
            if (!ed || !ed.initialized) {
                return;
            }

            var val = ed.getContent();

            // This is common way to hide a validation popup in dojo
            this.displayMessage(null);

            if (ed.undoManager && ed.undoManager.typing) {
                ed.undoManager.typing = 0;
                ed.undoManager.add();
            }

            this._onChange(val);
        },

        onEditorResizing: function (/*Object*/resizeInfo) {
            // summary:
            //      Stub to do something when the current editor on resizing progress
            // resizeInfo: [Object]
            //      Object that provides resize information to editor wrapper
            // tags:
            //      public
        },

        onEditorResized: function (/*Function*/callbackFunction) {
            // summary:
            //      Stub to do something when the current editor finished its resizing process
            // tags:
            //      public
        },

        _onEditorResized: function (event) {
            // summary:
            //      Stub to do something when the current editor finished its resizing process
            // tags:
            //      privates

            // Set position of the caret if resizing is triggered by "focus" or "load" event
            if (event && (event.type === "focus" || event.type === "load")) {
                this._placeCaretAtClick();
            }
        },

        isEditing: function () {
            // summary:
            //      Check the current editor widget is on editing or not
            // tags:
            //      public

            return this.domNode && domStyle.get(this.domNode, "display").toLowerCase() !== "none";
        },

        startup: function () {

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            this.own(
                this.watch("state", function (name, oldValue, newValue) {
                    on.emit(this.domNode, "editorstatechanged", newValue);
                }.bind(this))
            );
        },

        destroy: function () {

            this._clearLocalDefers();

            this.inherited(arguments);
        },

        focus: function () {
            // summary:
            //      Set focus on the current editor.
            // tags:
            //      public, extension

            this.inherited(arguments);

            var editor = this.editor;
            if (editor && editor.initialized) {
                this.resizeEditor({type: "focus"});
            }
        },

        resizeEditor: function () {
            // summary:
            //      Resizes the editor area.
            // tags:
            //      public, extension

            //Dont resize when in fullscreen mode
            if (this.isFullScreen) {
                return;
            }

            // Don't do a resize if the editor isn't visible as height will calculate to zero.
            // Instead call onEditorResized to update subscribers and return.
            if (domStyle.get(this.containerNode, "display") === "none") {
                this.onEditorResized();
                return;
            }

            var editor = this.editor,
                style = { height: "auto" },
                editorIframe = this._getEditorIframe();

            domStyle.set(editorIframe, style);

            // Update height
            style.height = editor.getBody().parentNode.scrollHeight + "px";

            this.onEditorResizing({ style: style });

            domStyle.set(editorIframe, style);

            this.isResized = true;
            this._onEditorResized.apply(this, arguments);
        },

        _onBlur: function () {
            // summary:
            //      Disable default onblur event
            // tags:
            //      protected, extension
        },

        _updateTinySettings: function () {
            return this.inherited(arguments).then(function (settings) {
                settings.width = settings.height = "100%";
                settings.statusbar = false;
                settings = Object.assign(settings, this.inlineSettings);
                return settings;
            }.bind(this));
        },

        _setupEditorEventHandling: function (editor) {
            // summary:
            //      Hook up to the tinyMCE events.
            // editor:
            //      Current editor.
            // tags:
            //      private extension

            this.inherited(arguments);

            this._appendEditorResizeHandler(editor);
        },

        _clearLocalDefers: function () {
            // summary:
            //      Clear all registered local defers
            // tags:
            //      protected, extension

            this._deferOnKeyUp && this._deferOnKeyUp.remove();
        },

        _appendEditorResizeHandler: function (/*Object*/editor) {
            // summary:
            //      Append editor resizing process for appropriate editor events
            // editor: [Object]
            //      Active tinyMCE editor
            // tags:
            //      private

            var hitchedResize = debounce(this.resizeEditor, this);

            // Add appropriate listeners for resizing content area
            editor.on("change", hitchedResize);
            editor.on("load", hitchedResize);
            editor.on("Paste", hitchedResize);
            editor.on("PostRender", hitchedResize);

            editor.on("KeyUp", function () {
                // Delay a time around onKeyUp fired, mean that we need to wait user finished his/her input text by typed on the keyboard
                this._clearLocalDefers();
                this._deferOnKeyUp = this.defer(hitchedResize, 10);
            }.bind(this));
        },

        _getEditorIframe: function () {
            // summary:
            //      Gets the editor iframe DOM node.
            // tags:
            //      private

            return this.editor && this.editor.iframeElement;
        },

        _placeCaretAtClick: function () {
            // summary:
            //      Place caret at the position of mouse click on overlay
            // tags:
            //      private

            this.placeCaretAt(this.overlayItem._clickOffset.x, this.overlayItem._clickOffset.y);
        }
    });
});
