define("epi-cms/contentediting/DialogEditorWrapper", [
    "epi",
    "dojo",
    "epi-cms/contentediting/_EditorWrapperBase",
    "epi/shell/widget/dialog/Dialog"],

function (epi, dojo, _EditorWrapperBase, Dialog) {

    return dojo.declare([_EditorWrapperBase], {
        // summary:
        //		Base Dialog Editor wrapper. Create property editor in a dialog. Provides positioning, sizing functions.
        //
        // tags:
        //      internal

        // closeOnChange: [public] Boolean
        //    Denote if the dialog should be closed on change
        closeOnChange: true,

        // closeOnChange: [public] Boolean
        //    Denote if the dialog should show its Ok and Cancel buttons
        showButtons: false,

        _dialog: null,

        buildRendering: function () {
            this.inherited(arguments);

            if (!this.editorWidget) {
                // Create editor widget
                dojo["require"](this.editorWidgetType); // Written this way on purpose to fool the build system.
                var cls = dojo.getObject(this.editorWidgetType);
                var editorParams = this.editorParams || {};

                if ("displayedValue" in cls.prototype || "value" in cls.prototype) {
                    editorParams["displayedValue" in cls.prototype ? "displayedValue" : "value"] = this.value;
                }

                this.editorWidget = new cls(editorParams);
            }

            var ew = this.editorWidget;

            // Create dialog and set content
            var dialog = new Dialog({
                content: ew,
                title: this.propertyDisplayName,
                defaultActionsVisible: this.showButtons,
                contentClass: "epi-dialog-fullWidth",
                destroyOnHide: false
            });

            // ESC and TAB could cancel and save.  Note that edit widgets do a stopEvent() on ESC key (to
            // prevent Dialog from closing when the user just wants to revert the value in the edit widget),
            // so this is the only way we can see the key press event.
            this.connect(ew, "onKeyPress", this._onKeyPress);
            this.connect(ew, "onCancel", this._onCancel);
            this.connect(ew, "onResize", dojo.hitch(this, function () {
                this._dialog.resize();
            }));

            if ("intermediateChanges" in ew) {
                // If an editor widget publishes intermediate changes we want to get notified about them.
                ew.set("intermediateChanges", true);
            }
            this.connect(ew, "onChange", "_onChange");

            this.connect(dialog, "onHide", this._onHide);
            this.connect(dialog, "onCancel", this._onCancel);
            this._dialog = dialog;
        },

        destroy: function () {
            this._dialog.destroyRecursive();
            this.inherited(arguments);
        },

        _onKeyPress: function (e) {
            // summary:
            //		Handler for keypress in the edit box in autoSave mode.
            // description:
            //		For autoSave widgets, if Esc/Enter, call cancel/save.
            // tags:
            //		private

            if (this.editing) {

                if (e.altKey || e.ctrlKey) {
                    return;
                }
                // If Enter/Esc pressed, treat as save/cancel.
                if (e.keyCode === dojo.keys.ESCAPE) {
                    dojo.stopEvent(e);
                    this.cancel(); // sets editing=false which short-circuits _onBlur processing
                } else if (e.keyCode === dojo.keys.ENTER && e.target.tagName === "INPUT") {

                    dojo.stopEvent(e);
                    this._stopEdit();
                }

                // _onBlur will handle TAB automatically by allowing
                // the TAB to change focus before we mess with the DOM: #6227
                // Expounding by request:
                // The current focus is on the edit widget input field.
                // save() will hide and destroy this widget.
                // We want the focus to jump from the currently hidden
                // displayNode, but since it's hidden, it's impossible to
                // unhide it, focus it, and then have the browser focus
                // away from it to the next focusable element since each
                // of these events is asynchronous and the focus-to-next-element
                // is already queued.
                // So we allow the browser time to unqueue the move-focus event
                // before we do all the hide/show stuff.
            }
        },

        _onCancel: function () {
            this.cancel();

            // reset editor value
            this.editorWidget.set("value", this.value);

            if (this._dialog.open) {
                this._dialog.hide();
            }
        },

        _onChange: function () {
            this.inherited(arguments);

            if (this.closeOnChange) {
                this._stopEdit();
            }
        },

        _onHide: function () {
            if (this.editing) {
                this._stopEdit();
            }
        },

        startEdit: function () {
            this.inherited(arguments);
            this._dialog.show();
        },

        _stopEdit: function () {
            this.inherited(arguments);

            if (this._dialog.open) {
                this._dialog.hide();
            }
        },

        _setTitleAttr: function (title) {

            if (this._dialog) {
                this._dialog.set("title", title);
            }

            this._set("title", title);
        }
    });

});
