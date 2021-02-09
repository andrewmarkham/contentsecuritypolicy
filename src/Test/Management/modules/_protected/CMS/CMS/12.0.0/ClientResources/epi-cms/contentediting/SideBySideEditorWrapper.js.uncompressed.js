define("epi-cms/contentediting/SideBySideEditorWrapper", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/window",
    "epi-cms/contentediting/_EditorWrapperBase"
], function (declare, lang, window, _EditorWrapperBase) {

    return declare([_EditorWrapperBase], {
        // summary:
        //		This editor wrapper connects editor widgets in side-form to the system
        //
        // tags:
        //      internal

        _grabFocusOnStartEdit: true,

        postCreate: function () {
            // summary:
            //		Post create initialization.
            // tags:
            //		protected

            this.inherited(arguments);
            if (this.editorWidget) {
                this.connect(this.editorWidget, "onChange", "_onChange");

                this.connect(this.editorWidget, "onFocus", lang.hitch(this, function () {
                    this._tryToStartEditing(false);
                }));

                this.connect(this.editorWidget, "onBlur", lang.hitch(this, function () {
                    // In form widgets onBlur event is raised before the last value change got updated. Therefore, at this point, editor widget's value is not up to date.
                    // This small timeout is for waiting for that change event to finish
                    setTimeout(lang.hitch(this, function () {
                        this.tryToStopEditing(true);
                    }), 0);
                }));

                this.connect(this.editorWidget, "onDropping", lang.hitch(this, function () {
                    this._tryToStartEditing(true);
                }));
            }
        },

        contentModelChanged: function (name, oldValue, value) {
            // Always uptate the editor
            this.set("value", value);
        },


        _tryToStartEditing: function (grabFocus) {
            if (this.editing) {
                return;
            }

            this._grabFocusOnStartEdit = grabFocus;
            this.startEdit();
            this._grabFocusOnStartEdit = true;
        },

        _onChange: function (val) {
            // When using set value attribute, change shouldn't be propagated
            if (this._preventChangeEvent) {
                return;
            }

            var savedState = this.editing;

            // When this change is inside a DnD operation and not in "editing" state.
            if (this.operation && this.operation.inProgress && !this.editing) {
                this.editing = true;
                this._lastSavedValue = this._resetValue = this.value;
            }
            this.inherited(arguments);

            this.editing = savedState;
        },

        _setValueAttr: function (value) {
            // Make sure no change events is propagated when setting the value
            this._preventChangeEvent = true;
            this.inherited(arguments);
            this._preventChangeEvent = false;
        },

        startEdit: function () {
            // summary:
            //		Start editing.
            // tags:
            //		public

            if (this._grabFocusOnStartEdit) {
                this.editorWidget.focus();
                // scrolls a node into view, similar to node.scrollIntoView() but working around browser quirks
                window.scrollIntoView(this.editorWidget.domNode);
            }

            this.inherited(arguments);
        },

        stopEdit: function (implicitExit) {
            // summary:
            //		Stop editing.
            // tags:
            //		public

            this.set("value", this.getEditorValue());
            this.inherited(arguments);
        }
    });

});
