define("epi-cms/contentediting/ContentEditableWrapper", [
// dojo
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",

    "dojo/dom-style",

    "dojo/Deferred",
    "dojo/keys",
    "dojo/on",
    "dojo/query",
    "dojo/when",
    // epi
    "epi/string",
    "epi-cms/contentediting/_EditorWrapperBase"
],

function (
// dojo
    connect,
    declare,
    event,
    lang,

    domStyle,

    Deferred,
    keys,
    on,
    query,
    when,
    // epi
    epiString,
    _EditorWrapperBase
) {

    var _unprintableKeyCodes = [];
    for (var keyName in keys) {
        _unprintableKeyCodes.push(keys[keyName]);
    }

    return declare([_EditorWrapperBase], {
        // summary:
        //      This editor wrapper having an editor widget that separate logic and support custom style.
        // tags:
        //      internal

        // _emptyValue: [private] String
        //      String to be used as empty content (The same value as first rendered by UpdateController)
        _emptyValue: "&nbsp;",

        // hasInlineEditor: Boolean
        //      A value indicating if the wrapped editor is editing inline, i.e. On-Page-Editing.
        //      True by default.
        hasInlineEditor: true,

        // closeOnViewportClick: bool
        //      Close editor when clicking on viewport
        closeOnViewportClick: false,

        // _overlayItemWatchHandle: [private] Object
        //      Watch handle for the overlay item
        _overlayItemWatchHandle: null,

        destroy: function () {
            // Reset display value to rendered html format
            (this.blockDisplayNode && this.editorWidget) && query(this.blockDisplayNode).html(epiString.encodeForWebString(this.value, this.editorWidget.uiSafeHtmlTags));

            if (this._overlayItemWatchHandle) {
                this._overlayItemWatchHandle.unwatch();
            }

            this.inherited(arguments);
        },

        startEdit: function () {
            // summary:
            //      Create content editable widget, connect event listens, and focus.
            // tags:
            //      protected

            var inherited = this.getInherited(arguments);
            when(this._getEditor(), lang.hitch(this, function (editor) {
                this._showOverlay(false);

                inherited.apply(this);

                this.focus();
            }));
        },

        _onTryToStopWithInvalidValue: function () {
            // summary:
            //      Overridden to prevent user from leaving an inline editor with an invalid value.
            //      Leaving the editor gives a bad UX, since the tooltip is connected to the editor.
        },

        _getEditor: function () {
            // summary:
            //      Return editor widget, create new if not exited before
            // tags:
            //      Private

            this._adjustContentSize();

            if (this.editorWidget) {
                this.editorWidget.set("value", this.value);
                return this.editorWidget;
            }

            var deferred = new Deferred(),
                node = this.blockDisplayNode,
                moduleName = this.editorWidgetType,
                params = lang.mixin(this.editorParams, {
                    blockDisplayNode: node,
                    value: this.value
                });

            require([moduleName], lang.hitch(this, function (Editor) {
                var editor = this.editorWidget = new Editor(params);

                this.editorWidget.placeAt(this.overlayItem.domNode);

                editor.own(
                    on(node, "blur", lang.hitch(this, this._trySaveValue)),
                    on(node, "keydown", lang.hitch(this, this._onEditorKeyPress)),
                    editor.watch("state", lang.hitch(this, function (name, oldValue, newValue) {
                        this._showOverlay(newValue === "Error");
                    }))
                );

                deferred.resolve(editor);
            }));

            if (this._overlayItemWatchHandle) {
                this._overlayItemWatchHandle.unwatch();
            }

            //  when the iframe preview is reloaded the nodes bound in the wrapper
            //  and the editor are no longer valid, so when a reload is about to occur
            //  we destroy the editor, thus forcing it to recreate it and rebind with the current nodes
            this._overlayItemWatchHandle = this.overlayItem.watch("sourceItemNode", function (name, oldValue, newValue) {
                if (this.editorWidget) {
                    this.editorParams.blockDisplayNode = null;
                    this.editorWidget.destroyRecursive();
                    this.editorWidget = null;
                }
            }.bind(this));

            return deferred.promise;
        },

        _adjustContentSize: function () {
            // summary:
            //      Adjust the display size especially when content is empty, so that
            //      the domNode will not be collapsed in Firefox and blinking in Chrome
            // tags:
            //      private

            var node = this.blockDisplayNode;

            // Temporarily empty the content to calculate the size. This will be set later when create/get the editor.
            node.innerHTML = this._emptyValue;

            // Always set minimum height to avoid collapsed element when content is empty, especially in Firefox
            domStyle.set(node, "minHeight", domStyle.getComputedStyle(node).height);
        },

        _onEditorKeyPress: function (e) {
            // summary:
            //      Handles keypress events inside the content editable and invokes the relevant action.
            // tags:
            //      private

            if (this.editing) {
                if (connect.isCopyKey(e) && !e.altKey) {
                    // Disable shorcut key events to apply text format
                    // We need to check allowed keys instead of not allowed keys because they are not the same in different countries
                    var character = e.keyCode ? String.fromCharCode(e.keyCode).toLowerCase() : "";
                    switch (character) {
                        case "a": // select all
                        case "c": // copy
                        case "x": // cut
                        case "v": // paste
                            break;
                        default:
                            if (_unprintableKeyCodes.indexOf(e.keyCode) === -1) {
                                e.preventDefault();
                            }
                            break;
                    }
                } else {
                    switch (e.keyCode) {
                        case keys.ESCAPE:
                            this.cancel();
                            break;
                        case keys.ENTER:
                        case keys.TAB:
                            event.stop(e);
                            this._trySaveValue();
                            break;
                        default:
                            this.isModified = true;
                            break;
                    }
                }
            }
        },

        _trySaveValue: function () {
            // summary:
            //      Handler blur event that fired on editor
            // tags:
            //      private

            var validCancel = lang.hitch(this, function () {
                if (this.editorWidget && this.editorWidget.isValid()) {
                    this.cancel();
                }
            });

            this.editing && (this.hasPendingChanges() ? this.tryToStopEditing(true) : validCancel());
        },

        _showOverlay: function (show) {
            // summary:
            //      Show or hide the the overlay node
            // show: Boolean
            //      A flag indicating whether the ovarlay should be shown or hidden
            // tags:
            //      private

            domStyle.set(this.overlayItem.domNode, "display", show ? "" : "none");
        },

        _removeEditingFeatures: function () {
            // summary:
            //      Change back to a non-editing state.
            // tags:
            //      protected

            this._showOverlay(true);

            this.editorWidget && this.editorWidget._removeEditingFeatures();
        }

    });

});
