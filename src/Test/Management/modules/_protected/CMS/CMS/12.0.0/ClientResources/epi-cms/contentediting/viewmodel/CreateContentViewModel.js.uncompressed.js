define("epi-cms/contentediting/viewmodel/CreateContentViewModel", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/json",

    "dojo/Stateful",
    "dojo/string",
    "dojo/when",
    "dojo/Evented",

    // epi
    "epi/dependency",
    "epi/shell/TypeDescriptorManager",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentEditingValidator",

    // resources
    "epi/i18n!epi/shell/ui/nls/episerver.shared.messages",
    "epi/i18n!epi/cms/nls/episerver.cms.components.requiredproperties"
],

function (
// dojo
    array,
    declare,
    lang,
    json,

    Stateful,
    string,
    when,
    Evented,

    // epi
    dependency,
    TypeDescriptorManager,
    ContentReference,
    ContentEditingValidator,

    // resources
    sharedMessages,
    reqPropsResources
) {

    return declare([Stateful, Evented], {
        // summary:
        //      View model of epi-cms/contentediting/CreateContent component.
        // tags:
        //      internal

        // =======================================================================
        // Private stuffs
        // =======================================================================

        // _topLevelContainerType: String
        //      The default top level container type used in properties form.
        _topLevelContainerType: "epi/shell/layout/SimpleContainer",

        // _groupContainerType: String
        //      The default group container type used in properties form.
        _groupContainerType: "epi-cms/layout/CreateContentGroupContainer",

        // =======================================================================
        // Dependencies
        // =======================================================================

        // contentDataStore: epi/shell/RestStore
        //      The content data store instance.
        contentDataStore: null,

        // metadataManager: epi/shell/MetadataManager
        //      The metadata manager instance.
        metadataManager: null,

        // typeIdentifierManager: epi/shell/TypeIdentifierManager
        //      The type identifier manager instance.
        typeIdentifierManager: null,

        // validator: epi-cms/contentediting/ContentEditingValidator
        //      The content editing validator instance.
        validator: null,

        // =======================================================================
        // Data model properties
        // =======================================================================

        // parent: Content
        //      The parent content on which the new content is created.
        parent: null,

        // contentTypeId: Number
        //      The content type id of which the new content is created.
        contentTypeId: null,

        // requestedType: String
        //      The type indentifier of created content. This is used for filtering available content types.
        requestedType: null,

        // createAsLocalAsset: Boolean
        //      Indicates that the content is created as local asset which means it will be attached to the parent content's asset folder.
        createAsLocalAsset: null,

        // autoPublish: Boolean
        //       Indicates if the content should be published automatically when created if the user has publish rights.
        autoPublish: false,

        // addToDestination: Delegate
        //      A delagate object which contains a save method. The method will be executed after the content is successfully created.
        addToDestination: null,

        // =======================================================================
        // View model properties
        // =======================================================================

        // wizardStep: Number
        //      Keeps track the current step of the creation wizard. 0 means selecting content type while 1 means collecting properties value.
        wizardStep: 0,

        // startWizardStep: [protected] Number
        //      Which step to start with
        startWizardStep: 0,

        // contentName: String
        //      Name of the content being created. This is initialized from the resource bundle and bound to the name text box in the widget.
        contentName: null,

        // ignoreDefaultNameWarning: Boolean
        //      Indicates that name checking should be ignored.
        ignoreDefaultNameWarning: null,

        // properties: Collection
        //      The properties collection used to create new content.
        properties: null,

        // headingText: String
        //      Heading text which is displayed on the top of the toolbar. This is set according to the current request type.
        headingText: null,

        // contentNameHelpText: String
        //      Help text for the content name input
        contentNameHelpText: "",

        // createAsLocalAssetHelpText: Boolean
        //      Helper text that displayed in the sub header
        createAsLocalAssetHelpText: null,

        // namePanelIsVisible: Boolean
        //      Indicate that the name panel is visible. If the content is created as local asset, name panel should not be visible
        namePanelIsVisible: null,

        // headingPanelIsVisible: Boolean
        //      Indicates that the heading panel is visible. Similar to the name panel, heading panel is not visible when the content is created as local asset.
        //      In that case, a more detail heading is displayed inside the content type selection list or properties form.
        headingPanelIsVisible: null,

        // seamlessTopPanel: Boolean
        //      Indicates that the top panel should show seamlessly.
        seamlessTopPanel: null,

        // saveButtonIsVisible: Boolean
        //      Indicate that the save button should be visible, normally in the last step.
        saveButtonIsVisible: null,

        // saveButtonDisabled: Boolean
        //      Indicate that the save button should be disabled, when saving is on going.
        saveButtonDisabled: null,

        // showAllProperties: Boolean
        //      Indicates that it should show all properties for user to enter initial value, normally when content is created from content area.
        showAllProperties: null,

        // showCurrentNodeOnBreadcrumb: Boolean
        //      Indicates that the breadcrumb should show current content node.
        showCurrentNodeOnBreadcrumb: null,

        // actualParentLink: String
        //      Link of the parent beneath which the content is created. It could be the given parent or the given parent's local asset folder.
        actualParentLink: null,

        // metadata: Object
        //      The metadata object of the content being created.
        metadata: null,

        // =======================================================================
        // Public methods
        // =======================================================================

        postscript: function () {
            // summary:
            //      Initializes internal objects and state after constructed.
            // description:
            //      Obtains content data store and metadata manager instances from dependency manager.
            // tags:
            //      protected

            this.inherited(arguments);

            if (!this.contentDataStore) {
                var registry = dependency.resolve("epi.storeregistry");
                this.contentDataStore = registry.get("epi.cms.contentdata");
            }

            this.metadataManager = this.metadataManager || dependency.resolve("epi.shell.MetadataManager");
            this.projectService = this.projectService || dependency.resolve("epi.cms.ProjectService");

            // Could the dependency handle non-singleton objects?
            this.validator = this.validator || new ContentEditingValidator({ contextTypeName: "epi.cms.contentdata" });

            this.set("propertyFilter", lang.hitch(this, this._propertyFilter));
        },

        update: function (settings) {
            // summary:
            //      Update the component with new settings.
            // description:
            //      Taking settings from the ones who request the Create content component.
            //      The supported settings are: allowedTypes, restrictedTypes, createAsLocalAsset, addToDestination, contentTypeId. They will be mixed to the current instance.
            // settings: Object
            //      The settings object.
            // tags:
            //      protected

            // Reset view properties

            this.set("ignoreDefaultNameWarning", false);
            this.set("properties", null);
            this.set("saveButtonIsVisible", false);
            this.set("wizardStep", this.startWizardStep);
            this.set("isContentTypeSelected", false);

            this.set("namePanelIsVisible", true);
            this.set("headingPanelIsVisible", true);

            this.set("showCurrentNodeOnBreadcrumb", true);
            this.set("seamlessTopPanel", true);

            // Copy data properties from topic sender
            if (settings) {
                array.forEach(["allowedTypes", "restrictedTypes", "requestedType", "parent", "createAsLocalAsset", "autoPublish", "addToDestination", "contentTypeId"], function (property) {
                    this.set(property, settings[property]);
                }, this);
            }

            // Setup the validator
            if (this.parent) {
                var notificationContextId = this.parent.contentLink + "_new_content"; // A pseudo context id for the content that not yet created.
                this.validator.clearErrorsBySource();
                this.validator.setContextId(notificationContextId);

                this.set("notificationContext", { contextTypeName: "epi.cms.contentdata", contextId: notificationContextId });
            }
        },

        save: function () {
            // summary:
            //      Save the content and finish the wizard.
            // description:
            //      save() will validate the content name if ignoreDefaultNameWarning is not set. By then "invalidContentName" might be emitted.
            //      If data validation is fine, the new content object will be put on the content data store.
            //      On success, "saveSuccess" event is emitted, otherwise "saveError" is emitted.
            // tags:
            //      public

            this.set("saveButtonDisabled", true);

            // Validate content name
            if (!this.ignoreDefaultNameWarning && (!this.contentName || this.contentName === "" || this.contentName === this.defaultName)) {

                var contentName = this.contentName;
                if (this.metadata && this.metadata.additionalValues && this.metadata.additionalValues.modelTypeIdentifier) {
                    contentName = TypeDescriptorManager.getResourceValue(this.metadata.additionalValues.modelTypeIdentifier, "newitemdefaultname");
                }

                this._emitSaveEvent("invalidContentName", contentName);
                return;
            }

            // Ask the validator to do properties validation and/or other global validation
            this.validator.clearErrorsBySource(this.validator.validationSource.server);
            when(this.validator.validate(), lang.hitch(this, function (hasErrors) {
                if (hasErrors) {
                    this._emitSaveEvent("validationError");
                    return;
                }

                // Build the content object
                var content = this.buildContentObject();

                // Determine whether there is a project active
                this.projectService.getCurrentProjectId().then(function (isProjectActive) {
                    // If a project is active then the content should not be auto-published
                    content.autoPublish = content.autoPublish && !isProjectActive;

                    // Put the new content into content data store
                    this.contentDataStore.put(content).then(lang.hitch(this, this._saveSuccessHandler), lang.hitch(this, this._saveErrorHandler));
                }.bind(this));
            }), lang.hitch(this, function () {
                this._emitSaveEvent("validationError");
            }));
        },

        _emitSaveEvent: function (eventName, params) {
            this.set("saveButtonDisabled", false);
            this.emit(eventName, params);
        },

        cancel: function () {
            // summary:
            //      Cancel operation and finish the wizard
            // tags:
            //      Public

            this.addToDestination && (typeof this.addToDestination.cancel === "function") && this.addToDestination.cancel();
        },

        _propertyFilter: function (ownerMetadata, propertyMetadata) {
            // summary:
            //      Filter out meta properties which are not supposed to have value on creation.
            // tags:
            //      private

            var isNotInSpecialGroup = propertyMetadata.originalGroupName !== "EPiServerCMS_SettingsPanel" && propertyMetadata.originalGroupName !== "Advanced";
            var required = this._isRequiredProperty(ownerMetadata, propertyMetadata);

            if (this.showAllProperties) {
                // show properties which do not belong to a special groups at all OR belong to special groups but required
                return isNotInSpecialGroup || required;
            } else {
                // only show properties from "required" group
                return required;
            }
        },

        _saveSuccessHandler: function (contentLink) {
            // summary:
            //      Save success handler
            // contentLink: String
            //      The newly created content's link
            // tags:
            //      private

            var ref = new ContentReference(contentLink),
                versionAgnosticRef = ref.createVersionUnspecificReference(),
                changeToNewContext = lang.hitch(this, function (/*String*/targetLink) {
                    this._emitSaveEvent("saveSuccess", {
                        newContentLink: targetLink,
                        changeContext: true
                    });
                });

            when(this.contentDataStore.refresh(contentLink), lang.hitch(this, function (newContent) {
                if (this.addToDestination) {
                    this.addToDestination.save({
                        contentLink: versionAgnosticRef.toString(),
                        name: newContent.name,
                        typeIdentifier: newContent.typeIdentifier
                    });

                    // Keep the current context
                    this._emitSaveEvent("saveSuccess", {
                        changeContext: false
                    });

                } else {
                    // Change to new context
                    changeToNewContext(versionAgnosticRef.toString());
                }
            }));
        },

        _saveErrorHandler: function (err) {
            // summary:
            //      Save error handler
            // err: Object
            //      The error object.
            // tags:
            //      private

            // err is actually the xhr error, as for now the rest store doesn't pre handle errors.
            if (err && err.responseText) {
                // received a list of problems

                // NOTE: Do not copy this code since it's not a good practice to handle error. We are finding a pattern to handle server errors in a nicer manner, perhaps inside the rest store.
                var validationErrors = json.fromJson(err.responseText);

                array.forEach(validationErrors, function (item) {
                    if (item.propertyName) {
                        this.validator.setPropertyErrors(item.propertyName, [{
                            severity: item.severity,
                            errorMessage: item.errorMessage
                        }], this.validator.validationSource.server);
                    } else {
                        this.validator.setGlobalErrors([{
                            severity: item.severity,
                            errorMessage: item.errorMessage
                        }], this.validator.validationSource.server);
                    }
                }, this);

            } else if (err) {
                // general error
                this.validator.setGlobalErrors([{
                    severity: this.validator.severity.error,
                    errorMessage: err.message
                }], this.validator.validationSource.server);
            }

            this._emitSaveEvent("saveError", err);
        },

        buildContentObject: function () {
            // summary:
            //      Build up the content object to create from model properties.
            // tags:
            //      protected

            return {
                name: string.trim(this.contentName + ""),
                parentLink: this._getParentLink(),
                contentTypeId: this.contentTypeId,
                properties: this.properties,
                createAsLocalAsset: this.createAsLocalAsset,
                autoPublish: this.autoPublish
            };
        },

        addInvalidProperty: function (propertyName, errorMessage) {
            // summary:
            //      State that a property has become invalid after client validation.
            // propertyName: String
            //      The property name.
            // errorMessage: String
            //      The error message.
            // tags:
            //		public

            this.validator.setPropertyErrors(propertyName, [{
                severity: this.validator.severity.error,
                errorMessage: errorMessage
            }], this.validator.validationSource.client);
        },

        removeInvalidProperty: function (propertyName) {
            // summary:
            //      State that a property is no more invalid after client validation.
            // propertyName: String
            //      The property name.
            // tags:
            //		public

            this.validator.clearPropertyErrors(propertyName);
        },

        // =======================================================================
        // Property setters
        // =======================================================================

        _contentTypeIdSetter: function (contentTypeId) {
            // summary:
            //      Set content type id.
            // description:
            //      After the value is set, metadata is also updated. If it is neccessary to enter properties, the wizard is stepped forward, otherwise save is executed.
            // contentTypeId: Number
            //      The value.
            // tags:
            //		private

            this.contentTypeId = contentTypeId;

            if (contentTypeId && this.parent) {
                this.set("isContentTypeSelected", true);
                this.validator.clearErrorsBySource(this.validator.validationSource.server);

                when(this._getMetadata(this.parent.contentLink, contentTypeId), lang.hitch(this, function (metadata) {
                    metadata = this._regroupProperties(metadata);
                    this.set("metadata", metadata);
                    if (this.autoPublish || this._hasRequiredProperties(metadata)) {
                        this.set("wizardStep", 1);
                        this.set("saveButtonIsVisible", true);
                    } else {
                        this.save();
                    }
                }), lang.hitch(this, function () {
                    this.set("isContentTypeSelected", false);

                    this.validator.setGlobalErrors([{
                        severity: this.validator.severity.error,
                        errorMessage: sharedMessages.unexpectederror
                    }], this.validator.validationSource.server);
                }));
            }
        },

        _createAsLocalAssetSetter: function (createAsLocalAsset) {
            // summary:
            //      Set createAsLocalAsset option.
            // createAsLocalAsset: Boolean
            //      The value.
            // tags:
            //      private


            this.createAsLocalAsset = createAsLocalAsset;
            if (this.parent) {
                this.set("actualParentLink", this._getParentLink());
            }
        },

        _autoPublishSetter: function (autoPublish) {
            // summary:
            //      Sets autoPublish option.
            // autoPublish: Boolean
            //      The value.
            // tags:
            //      private

            this.set("showAllProperties", autoPublish);
            this.autoPublish = autoPublish;
        },

        _parentSetter: function (parent) {
            this.parent = parent;

            var typeIdentifier = this.parent.typeIdentifier,
                requestedTypeName = TypeDescriptorManager.getResourceValue(this.requestedType, "name"),
                parentTypeName = TypeDescriptorManager.getResourceValue(typeIdentifier, "name"),
                createAsLocalAssetHelpText = TypeDescriptorManager.getResourceValue(typeIdentifier, "createaslocalassethelptext");

            if (requestedTypeName && parentTypeName) {
                createAsLocalAssetHelpText = lang.replace(createAsLocalAssetHelpText, [requestedTypeName.toLowerCase(), parentTypeName.toLowerCase()]);
            }

            this.set("createAsLocalAssetHelpText", createAsLocalAssetHelpText);
        },

        _requestedTypeSetter: function (requestedType) {
            // summary:
            //      Set requested type.
            // description:
            //      After the value is set, heading text and content name are also updated.
            // requestedType: String
            //      The value.
            // tags:
            //		private

            var headingText = TypeDescriptorManager.getResourceValue(requestedType, "create"),
                defaultName = TypeDescriptorManager.getResourceValue(requestedType, "newitemdefaultname");

            this.defaultName = defaultName;

            this.set("headingText", headingText);
            this.set("contentName", defaultName);

            this.requestedType = requestedType;
        },

        // =======================================================================
        // Private methods
        // =======================================================================

        _getParentLink: function () {
            // summary:
            //      Gets the link to the parent where the content should be created under.
            //      If the parent is a Content Asset folder the link to the owner content will be returned.
            // tags:
            //      private

            if (!this.parent) {
                return null;
            }

            if (this.createAsLocalAsset) {
                return this.parent.ownerContentLink ? this.parent.ownerContentLink : this.parent.contentLink;
            }
            return this.parent.contentLink;
        },


        _hasRequiredProperties: function (metadata) {
            // summary:
            //      Checks if the metadata object contains any required property.
            // metadata: Object
            //      The metadata object.
            // tags:
            //		protected internal

            return array.some(metadata.properties, function (property) {
                return this._isRequiredProperty(metadata, property);
            }, this);
        },

        _isRequired: function (property) {
            // summary:
            //      Checks if the given property is required.
            // property: Object
            //      The metadata property.
            // tags:
            //      protected, extension

            return property.settings && property.settings.required;
        },

        _isRequiredProperty: function (metadata, property) {
            // summary:
            //      Checks if the given property is required.
            // description:
            //      A property is considered to be required if is required or it contains required sub properties.
            //      It should also have no value set, is visible, and is not the icontent_name property which is entered outside the properties form.
            // metadata: Object
            //      The metadata object.
            // property: Object
            //      The metadata property.
            // tags:
            //		private

            var isNotSet = !property.additionalValues.hasValue;

            var isShownForEdit = property.showForEdit && array.every(metadata.groups, function (group) {
                // Every group must be either not the property's original group or have displayui true
                return (group.name !== property.groupName && group.name !== property.originalGroupName) || group.displayUI;
            });

            var hasRequiredChildProperties = array.some(property.properties, function (childProperty) {
                return this._isRequiredProperty(property, childProperty);
            }, this);

            return (this._isRequired(property) || hasRequiredChildProperties) && isNotSet && isShownForEdit && (property.name !== "icontent_name");
        },

        _regroupProperties: function (metadata) {
            // summary:
            //		Regroup properties into required and additional property groups.
            // metadata: Object
            //      The metadata object.
            // tags:
            //		private

            metadata = lang.clone(metadata);

            metadata.layoutType = this._topLevelContainerType;

            array.forEach(metadata.properties, function (prop) {
                var isMandatory = this._isRequiredProperty(metadata, prop);
                prop.originalGroupName = prop.groupName;
                prop.groupName = isMandatory ? "required" : "additional";
            }, this);

            metadata.groups = [
                {
                    name: "required",
                    displayUI: true,
                    title: reqPropsResources.groups.required,
                    uiType: this._groupContainerType
                },
                {
                    name: "additional",
                    displayUI: true,
                    title: reqPropsResources.groups.additional,
                    uiType: this._groupContainerType
                }
            ];

            return metadata;
        },

        _getMetadata: function (parentLink, contentTypeId) {
            // summary:
            //      Get the metadata for the newly created content.
            // parentLink: String
            //      The parent content link.
            // contentTypeId: Number
            //      The content type id.
            // tags:
            //      private

            return this.metadataManager.getMetadataForType("EPiServer.Core.ContentData", {
                parentLink: parentLink,
                contentTypeId: contentTypeId
            });
        }

    });

});
