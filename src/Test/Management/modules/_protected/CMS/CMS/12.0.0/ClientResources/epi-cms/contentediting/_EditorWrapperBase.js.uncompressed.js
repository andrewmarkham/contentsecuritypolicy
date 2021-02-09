define("epi-cms/contentediting/_EditorWrapperBase", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/event",
    "dojo/keys",

    "dijit/_Widget",
    "dijit/form/_TextBoxMixin",	// selectInputText

    "epi/epi"
],

function (
    declare,
    lang,
    event,
    keys,

    _Widget,
    _TextBoxMixin,
    epi
) {
    return declare([_Widget], {
        // summary:
        //		Base class for all editor wrappers.
        //
        // tags:
        //      public

        // wrapperType: [public] String
        //    Editor wrapper type name
        wrapperType: "",

        // editorWidgetType: [public] String
        //    Editor widget type
        editorWidgetType: null,

        // editorParams: [public] Null|Object
        //    Editor widget's parameters
        editorParams: null,

        // editing: Boolean
        editing: false,

        // disabled: Boolean
        disabled: false,

        // blockDisplayNode: DomNode
        //		The node for the editable block
        blockDisplayNode: null,

        // editorWidget: dijit/_Widget|Object
        //		The editor for the value
        editorWidget: null,

        // isModified: Bool
        //		Indicates if we have triggered any saves while we edited value
        isModified: false,

        // _resetValue: [private] String|Object
        //      The value when as a string we started to edit
        _resetValue: null,

        // _lastSavedValue: [private] Object
        //      The last saved value
        _lastSavedValue: null,

        // _createdEditor: [private] Bool
        //      Set to true if we created our editor and must destroy it
        _createdEditor: false,

        propertyName: "",
        propertyDisplayName: "",

        // overlayItem: Overlay item
        //      Property overlay layer
        overlayItem: null,

        // isOverlayDisabled: Boolean
        //      Flags that used to disable overlay (or not) when the editor wrapper is running.
        isOverlayDisabled: false,

        // isUndoDisabled: Boolean
        //      Flags that used to disable undo when the editor wrapper is running.
        isUndoDisabled: false,

        // hasInlineEditor: Boolean
        //      A value indicating if the wrapped editor is editing inline, i.e. On-Page-Editing.
        //      False by default.
        hasInlineEditor: false,

        // contentModel: dojo/Stateful
        //     The content model to observe changes
        contentModel: null,

        // closeOnViewportClick: bool
        //      Close editor when clicking on viewport
        closeOnViewportClick: true,

        onStartEdit: function (sender, data) {
            // summary:
            //		Set this handler to be notified when editing is started.
            //
            // sender:
            //      The wrapper which triggered this event
            //
            // tags:
            //		callback
        },

        onValueChange: function (sender, value, oldValue) {
            // summary:
            //    Triggered when the an undo step is added.
            //
            // sender:
            //      The wrapper which triggered this event
            //
            // value: String|Object
            //      The value
            // oldValue: String|Object
            //      The old value
            //
            // tags:
            //      public callback
        },

        onCancel: function (sender) {
            // summary:
            //		Set this handler to be notified when editing is cancelled.
            //
            // sender:
            //      The wrapper which triggered this event
            //
            // tags:
            //		callback
        },

        onStopEdit: function (sender, value, oldValue) {
            // summary:
            //		Set this handler to be notified when editing is finished.
            // tags:
            //		callback
        },

        postCreate: function () {
            this.inherited(arguments);

            this._contentModelWatchHandle = this.contentModel.watch(this.propertyName, lang.hitch(this, "contentModelChanged"));
        },

        destroy: function () {
            this._contentModelWatchHandle.remove();

            if (this._createdEditor && this.editorWidget) {
                this.editorWidget.destroyRecursive();
            }

            if (this.editorWidget) {
                this.editorWidget.parent = null;
            }

            this.blockDisplayNode = this.overlayItem = this.editorWidget = null;

            this.inherited(arguments);
        },

        contentModelChanged: function (name, oldValue, value) {
            // Only set the value when we are editing
            if (!this.editing) {
                this.set("value", value);
            }
        },

        startEdit: function (additionParams) {
            this._startEdit(additionParams);
        },

        _startEdit: function (additionParams) {
            lang.mixin(this.editorParams, additionParams);

            // Implemented by sub class
            this.set("editing", true);

            // reset value
            this.set("isModified", false);

            // store old value
            this._lastSavedValue = this._resetValue = lang.clone(this.getEditorValue());

            // Cause validation to ensure the widget shows the latest validation messages
            this.isValid();

            this.onStartEdit(this, this.editorParams);
        },

        _stopEdit: function (implicitExit) {
            // Implemented by sub class
            this.set("editing", false);
            this._removeEditingFeatures();

            this.onStopEdit(this, this.getEditorValue(), this._resetValue, implicitExit);
        },

        cancel: function () {
            // force reset of value

            if (this.isModified) {
                // If property is modified then do a final save with the reset value.
                this.save(this._resetValue);
            } else {
                // Else set the value in the wrapper to the reset value.
                this.set("value", this._resetValue);
            }

            this.set("editing", false);
            this._removeEditingFeatures();

            this.onCancel(this);
        },

        save: function (/*String|Object*/val) {
            // keep track that save has been done
            this.set("value", val);
            this.set("isModified", true);
            this.onValueChange(this, val, this._lastSavedValue);
            this._lastSavedValue = lang.clone(val);
        },

        hasBeenEdited: function () {
            return this.editing && (!epi.areEqual(this.getEditorValue(), this._resetValue));
        },

        hasPendingChanges: function () {
            return this.editing && (!epi.areEqual(this.getEditorValue(), this._lastSavedValue));
        },

        tryToStopEditing: function (implicitExit) {
            // summary:
            //		Try to stop editing, if the value has changed, editing is stopped
            //      otherwise editing is cancelled
            // tags:
            //		public

            if (this.editing) {
                if (this.isValid()) {
                    if (this.hasBeenEdited()) {
                        if (this.hasPendingChanges()) {
                            this.save(this.getEditorValue());
                        }
                        this._stopEdit(implicitExit);
                    } else {
                        this.cancel(implicitExit);
                    }
                } else {
                    this._onTryToStopWithInvalidValue();
                }
            }
        },

        _removeEditingFeatures: function () {
            // summary:
            //		This is should be implemented by sub class, it's purpose is to
            //      restore state as it was before editing was started.
            // tags:
            //		protected
        },

        _onTryToStopWithInvalidValue: function () {
            // summary:
            //      do nothing, implemented by sub class
            // tags:
            //		protected
            //

            this.set("editing", false);
            this._removeEditingFeatures();
        },

        _onEditorKeyPress: function (e) {
            // summary:
            //		Handler for keypress in editor.
            // description:
            //		For autoSave widgets, if Esc/Enter, call cancel/save.
            // tags:
            //		protected

            if (this.editing) {
                if (e.altKey || e.ctrlKey) {
                    return;
                }
                // If Enter/Esc pressed, treat as save/cancel.
                if (e.keyCode === keys.ESCAPE) {
                    event.stop(e);
                    this.cancel(); // sets editing=false which short-circuits _onBlur processing
                } else if (e.keyCode === keys.ENTER && e.target.tagName === "INPUT") {
                    event.stop(e);

                    // stop editing
                    this.tryToStopEditing(false);
                }

                // _onBlur will handle TAB automatically by allowing
                // the TAB to change focus before we mess with the DOM: #6227
                // Expounding by request:
                //	The current focus is on the edit widget input field.
                //	save() will hide and destroy this widget.
                //	We want the focus to jump from the currently hidden
                //	displayNode, but since it's hidden, it's impossible to
                //	unhide it, focus it, and then have the browser focus
                //	away from it to the next focusable element since each
                //	of these events is asynchronous and the focus-to-next-element
                //	is already queued.
                //	So we allow the browser time to unqueue the move-focus event
                //	before we do all the hide/show stuff.
            }
        },

        _onChange: function (val) {
            if (this.editing && this.isValid() && this.hasPendingChanges()) {
                this.save(val);
            }
        },

        getEditorWidget: function () {
            return this.editorWidget;
        },

        getEditorValue: function () {
            // summary:
            //		Return the [display] value of the edit widget
            var ew = this.editorWidget;

            if (ew) {
                return ew.get("value");
            }
            return null;
        },

        setEditorValue: function (val) {
            // summary:
            //		Set the [display] value of the edit widget
            var ew = this.editorWidget;

            // Don't set the value to the editor if we are currently in an
            // editing state. Since it is possible the value argument is
            // older than the value of the editor. This occurs due to the
            // fact that the onChange event is fired within a timeout.
            if (!this.editing && ew && !epi.areEqual(val, ew.get("value"))) {
                ew.set("value", val);
            }
        },

        _setValueAttr: function (value) {
            this.setEditorValue(value);

            // Get the value back as the editor will return it
            this._set("value", this.getEditorValue() || value);
        },

        _setBlockDisplayNodeAttr: function (node) {
            // Work-around permission denied in IE when the document containing the old reference has been unloaded.
            this.blockDisplayNode = null;
            this._set("blockDisplayNode", node);
        },

        isValid: function () {
            // summary:
            //		User overridable function returning a Boolean to indicate
            //		if the Save button should be enabled or not - usually due to invalid conditions
            // tags:
            //		extension
            return (
                this.editorWidget && this.editorWidget.isValid
                    ? this.editorWidget.isValid()
                    : true
            );
        },

        focus: function () {
            // summary:
            //		Focus the edit widget.
            // tags:
            //		protected

            this.editorWidget.focus();
            setTimeout(lang.hitch(this, function () {
                if (this.editorWidget.focusNode && this.editorWidget.focusNode.tagName === "INPUT") {
                    _TextBoxMixin.selectInputText(this.editorWidget.focusNode);
                }
            }), 0);
        }
    });
});
