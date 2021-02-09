define("epi-cms/contentediting/FloatingEditorWrapper", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/aspect",
    "dojo/Deferred",
    "dojo/topic",
    "dijit/focus",
    // epi
    "epi/dependency",

    "epi/shell/widget/dialog/LightWeight",

    "epi-cms/contentediting/OverlayBasedEditorWrapper"
],

function (
// dojo
    array,
    declare,
    aspect,
    Deferred,
    topic,
    FocusManager,
    // epi
    dependency,

    LightWeightDialog,

    OverlayBasedEditorWrapper
) {

    return declare([OverlayBasedEditorWrapper], {
        // summary:
        //      A lightweight dialog used for displaying property editors. This dialog doesn't contain any
        //      buttons, instead it will close when a user clicks on the overlay outside the dialog.
        // tags:
        //      internal

        // formContainerWidgetType: String
        //      Special editor widget type
        formContainerWidgetType: "epi/shell/widget/FormContainer",

        // isOverlayDisabled: Boolean
        //      Override base value to disable overlay when editing.
        isOverlayDisabled: true,

        // isUndoDisabled: Boolean
        //      Override base value to disable undo when editing.
        isUndoDisabled: true,

        // _overlayContainer: [protected] epi/shell/widget/overlay/Container widget
        _overlayContainer: null,

        postCreate: function () {
            this.inherited(arguments);

            var self = this;
            this.own(
                topic.subscribe("/epi/shell/context/request", function (context, callerData) {
                    // Don't stop editing if we are creating a draft.
                    if (!callerData.contextIdSyncChange) {
                        self.tryToStopEditing(false);
                        // Ensure editing is set to false since the dialog is about to be destroyed.
                        self.set("editing", false);
                        // Remove the dialog regardless of whether editing stopped correctly
                        // since the context change will occur anyway.
                        self._destroyDialog();
                    }
                }),
                topic.subscribe("/epi/shell/action/changeview", function () {
                    self.set("editing", false);
                    self._removeEditingFeatures();
                })
            );
        },

        destroy: function () {
            // Make sure editing has been stopped so this wrapper is no
            // longer the activeEditorWrapper after being destroyed
            this.tryToStopEditing(false);
            this._destroyDialog();
            this.inherited(arguments);
        },

        startEdit: function (params) {
            // summary:
            //    Start editing and show the dialog.
            // tags:
            //    public

            this.editorParams = Object.assign(this.editorParams || {}, params);

            var self = this;

            self._destroyDialog();

            return self._setupDialog().then(function () {
                self.own(
                    aspect.after(self._dialog, "onAfterShow", function () {
                        self._startEdit(params);
                        self._onTryToStopWithInvalidValue();
                    })
                );

                return self._dialog.show();
            });
        },

        _createDialog: function (/*Object*/editor) {
            // summary:
            //      Create dialog
            // editor:
            //      Editor object
            // tags:
            //      protected

            return new LightWeightDialog({
                title: this.propertyDisplayName,
                content: editor,
                duration: 350,
                snapToNode: this.get("overlayItem").domNode,
                positioner: dependency.resolve("epi.shell.layout.PositioningUtility"),
                showButtonContainer: false
            });
        },

        _setBlockDisplayNodeAttr: function (node) {
            this.inherited(arguments);

            var dialog = this._dialog;
            if (dialog) {
                // Work-around permission denied in IE when the document containing the old reference has been unloaded.
                dialog.set("snapToNode", node);
            }
        },

        _setupDialog: function () {
            var _formWidgets = {};

            //Define form's field created event handler.
            var onFieldCreatedHandler = function (fieldName, widget) {
                _formWidgets[fieldName] = widget;
            };

            //Define form's form created event handler.
            var onFormCreatedHandler = function (formContainer) {
                // set parent for each child widget
                for (var fieldName in _formWidgets) {
                    var widget = _formWidgets[fieldName];
                    widget.set("parent", this);
                }

                _formWidgets = null;
            }.bind(this);

            var editorParams = Object.assign({ intermediateChanges: true }, this.editorParams);

            // Add event only when editor type is FormContainer
            if (this.editorWidgetType === this.formContainerWidgetType) {
                editorParams = Object.assign(editorParams, {
                    onFieldCreated: onFieldCreatedHandler,
                    onFormCreated: onFormCreatedHandler,
                    doLayout: false
                });
            }

            var deferred = new Deferred();

            // Create editor widget
            require([this.editorWidgetType], function (editorClass) {
                var editor = new editorClass(editorParams);
                this.editorWidget = editor;

                // Create dialog and set content
                var dialog = this._createDialog(editor);

                this._handlers = [
                    this.connect(dialog, "onButtonClose", this._onButtonClose),
                    this.connect(dialog, "onCancel", this._onDialogCancel),
                    this.connect(dialog.doneButtonNode, "onClick", this._onButtonClose),
                    this.connect(editor, "onChange", this._onChange),
                    this.connect(editor, "onKeyPress", "_onEditorKeyPress")
                ];
                this._dialog = dialog;

                // start editor if we created it
                if (this._createdEditor && this.editorWidget.startup) {
                    this.editorWidget.startup();
                }

                deferred.resolve();
            }.bind(this));

            return deferred.promise;
        },

        _onDialogCancel: function () {
            this.cancel();
        },

        _destroyDialog: function () {
            array.forEach(this._handlers, function (handle) {
                handle.remove();
            });
            this._handlers = null;

            if (this.editorWidget) {
                this.editorWidget.destroy();
                this.editorWidget = null;
            }

            if (this._dialog) {
                this._dialog.destroy();
                this._dialog = null;
            }
        },

        _removeEditingFeatures: function () {
            var dialog = this._dialog;

            if (dialog && dialog.open) {
                dialog.hide();
            }
        },

        _onTryToStopWithInvalidValue: function () {
            // force the editor to show any validation message
            // trigger a blur for the widget and then refocus it
            // this is a workaround to get any validation feedback
            // from widgets that only displays validation message when
            // input fields are blurred
            FocusManager.focus(this._dialog.titleNode);

            if (this.editorWidget.focus) {
                this.editorWidget.focus();
            }
        },

        _onButtonClose: function () {
            // summary:
            //    Stop editing when the dialog is hidden.
            // tags:
            //    private

            this.tryToStopEditing(false);
        }

    });

});
