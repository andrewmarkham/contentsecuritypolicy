define("epi-cms/contentediting/_FormEditingMixin", [
    // Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/when",

    // EPi
    "epi-cms/contentediting/SideBySideEditorWrapper",
    "epi/shell/widget/FormContainer"
],

function (
    array,
    declare,
    lang,
    Deferred,
    when,

    SideBySideEditorWrapper,
    FormContainer
) {
    return declare(null, {
        // summary:
        //		Form editing controller.
        //
        // tags:
        //      internal

        _form: null,

        _formWidgets: null,

        // canHandleLeftOver: Boolean
        //      Indicate that the view can handle "left over" on the edit layout container.
        canHandleLeftOver: true,

        // selectFormOnCreation: Boolean
        //      Indicate that the form should be set as selected child after being added to edit layout.
        selectFormOnCreation: false,

        // formSettings: Object
        //      Settings used when creating form.
        formSettings: null,

        // connectOverlayItemsToFormWidgets: Boolean
        //      Denote if we want to connect overlay items to form widgets, which means user can click on overlay item to start edit on form.
        //      Should be set to true on side by side editing.
        connectOverlayItemsToFormWidgets: false,

        _formConnects: null,

        destroy: function () {
            // summary:
            //		Destroy the widget.
            // tags:
            //		protected

            // Do not use own because Destroyable destroys owned things before destroy method is called.
            // As a result, we cannot remove the form from edit layout.
            this._removeAndDestroyForm();

            // remove all widgets
            this._formWidgets = null;

            this.inherited(arguments);
        },

        _removeAndDestroyForm: function () {
            // summary:
            //		Check if a form exists so remove from edit layout and destroy it.
            // tags:
            //		private

            // Remove the watches that are added for each form field during form creation.
            if (this._removeViewModelWatches) {
                this._removeViewModelWatches();
            }

            if (this._form) {
                if (this.removeForm(this._form)) {
                    this._form.destroyRecursive();
                    this._form = null;
                }

                var connect;
                while ((connect = this._formConnects.pop())) {
                    this.disconnect(connect);
                    connect = null;
                }
                this._formConnects = null;
                this._form = null;
            }

            for (var p in this._formWidgets) {
                this._formWidgets[p] = null;
            }
        },

        _setupForm: function () {
            // summary:
            //		Setup the edit form.
            // tags:
            //		private

            var formIsCreated = new Deferred();

            this._formWidgets = {};
            // Create Form container
            // Note: We don't need to set a model to the formContainer since a value
            //       will be set by the editor wrapper.
            this._form = this._createForm();

            this._formConnects = [
                this.connect(this._form, "onFieldCreated", this.onFieldCreated),
                this.connect(this._form, "onGroupCreated", this.onGroupCreated),
                this.connect(this._form, "onFormCreated", function () {
                    formIsCreated.resolve();
                })
            ];

            this.placeForm(this._form);

            when(formIsCreated, lang.hitch(this, function () {
                this._finishFormCreation();
            }));
        },

        _createForm: function () {

            return new FormContainer(lang.mixin({
                readOnly: !this.viewModel.canChangeContent(),
                metadata: this.viewModel.metadata,
                baseClass: "epi-cmsEditingForm",
                useDefaultValue: false
            }, this.formSettings));

        },

        _createFormEditorWrappers: function () {
            // summary:
            //		Create editor wrappers for form widgets.
            // formContainer: epi/shell/widget/FormContainer
            //     The form container.
            // tags:
            //		private

            for (var fieldName in this._formWidgets) {

                var property = {
                    name: fieldName,
                    metadata: this.viewModel.getPropertyMetaData(fieldName)
                };

                var value = lang.clone(this.viewModel.getProperty(property.name));

                var wrapper = new SideBySideEditorWrapper({
                    property: property,
                    propertyName: fieldName,
                    value: value,
                    editorWidget: this._formWidgets[fieldName],
                    contentModel: this.viewModel.contentModel,
                    // TODO: Remove the operation dependency when editor wrappers can raise change notifications without being in editable state
                    operation: this.viewModel._operation
                });
                wrapper.editorWidget.set("parent", wrapper);
                wrapper.editorWidget.set("editMode", "formedit");

                // Push these aspects onto the form connects array so that they are correctly destroyed
                // when the form is recreated.
                this._formConnects.push(
                    this.connect(wrapper, "onValueChange", "_onWrapperValueChange"),
                    this.connect(wrapper, "onCancel", "_onWrapperCancel"),
                    this.connect(wrapper, "onStopEdit", "_onWrapperStopEdit")
                );

                // Create mapping between property and form editor wrapper
                this._createMapping(fieldName, wrapper);

                property = null;
                value = null;
                wrapper = null;
            }
        },

        _createMapping: function (fieldName, wrapper) {
            // summary:
            //		Connect editor wraper to property rendering in template.
            // fieldName: String
            //      The property name.
            // wrapper: epi.cms.contentediting._EditorWrapperBase
            //      The editor wrapper
            // tags:
            //		private

            var names = fieldName.split(".");
            var foundAnyBlock = false;

            if (this.connectOverlayItemsToFormWidgets) {
                while (names.length > 0) {
                    var propertyName = names.join(".");

                    var mappings = this._mappingManager.find("propertyName", propertyName);
                    array.forEach(mappings, function (mapping) {
                        foundAnyBlock = true;
                        mapping.propertyName = fieldName;
                        mapping.wrapper = mapping.wrapper || wrapper;
                    });

                    names.pop();
                }
            }

            if (!foundAnyBlock) {
                // create empty mapping
                this._mappingManager.add({
                    propertyName: fieldName,
                    wrapper: wrapper
                });
            }
        },

        onSetActiveProperty: function (property) {
            // summary:
            //      Triggered when active property is set on the current content view model.
            // property: String
            //      The property name.
            // tags:
            //      public, callback

            var mapping =
                this._mappingManager
                    .find("propertyName", property)
                    .filter(function (mapping) {
                        return !!mapping.wrapper;
                    })[0];

            if (mapping) {
                mapping.wrapper.startEdit();
            }
        },

        placeForm: function (form) {
            // summary:
            //		Place edit form into container.
            // tags:
            //		protected, abstract

        },

        removeForm: function (form) {
            // summary:
            //		Remove edit form from container.
            // tags:
            //		protected, abstract
            // returns:
            //      false if the form is set as leftover, otherwise if form is removed and ready to destroy: true
        },

        onFieldCreated: function (fieldName, widget) {
            // summary:
            //		Triggerred when a field created.
            // tags:
            //		public, callback

            this._formWidgets[fieldName] = widget;

            if (this._addStateWatch) {
                this._addStateWatch(widget);
            }
        },

        onGroupCreated: function (groupName, widget, parentGroupWidget) {
            // summary:
            //		Triggered when a group created.
            // tags:
            //		public, callback

            if (widget.contentViewModel !== undefined) {
                widget.set("contentViewModel", this.viewModel);
            }
        },

        _finishFormCreation: function () {
            when(this.selectFormOnCreation ? this.editLayoutContainer.selectChild(this._form) : null, lang.hitch(this, this._removeLeftOver));
            this.toolbar.setItemProperty("viewselect", "state", "");

            this._createFormEditorWrappers(this._form);
            this.onSetupEditModeComplete();
        },

        _removeLeftOver: function () {
            var editLayoutContainer = this.editLayoutContainer,
                leftOverIsSelected;

            if (editLayoutContainer.leftOver) {
                leftOverIsSelected = editLayoutContainer.selectedChildWidget === editLayoutContainer.leftOver;

                when(leftOverIsSelected ? editLayoutContainer.selectChild(this.iframeWithOverlay) : null, function () {
                    var leftOver = editLayoutContainer.leftOver;

                    // Have to check again since the container may have been removed while waiting for the select animation
                    if (leftOver) {
                        editLayoutContainer.removeChild(leftOver);
                        leftOver.destroyRecursive();
                        editLayoutContainer = editLayoutContainer.leftOver = null;
                    }
                });
            }
        },

        onReadySetupEditMode: function () {
            // summary:
            //		Finish edit mode setting up.
            // description:
            //      Create editor wrappers for form widgets so it can update the model
            // tags:
            //		public callback

            this.inherited(arguments);

            // Remove the old form if there exists
            this._removeAndDestroyForm();

            // Setup new form
            this._setupForm();
        },

        remapEditMode: function () {
            // summary:
            //      Re configure edit mode after the preview context changed.
            // tags:
            //      public

            this.inherited(arguments);
            this._form && this._form.set("readOnly", !this.viewModel.canChangeContent());
        }
    });
});
