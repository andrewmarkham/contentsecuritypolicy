define("epi-cms/contentediting/ContentViewModel", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/json",
    "dojo/Deferred",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/on",
    "dojo/when",
    "dojo/promise/all",
    "dojo/Stateful",
    "dijit/Destroyable",
    "dgrid/List",
    "dgrid/extensions/DijitRegistry",

    // EPi Framework
    "epi",
    "epi/dependency",
    "epi/shell/UndoManager",
    "epi/shell/DialogService",
    "epi/shell/conversion/ObjectConverterRegistry",
    "epi/shell/widget/dialog/Alert",
    "epi/shell/Stateful",
    "epi/shell/xhr/errorHandler",

    // EPi CMS
    "../ApplicationSettings",
    "./ContentActionSupport",
    "./ContentEditingValidator",
    "./ContentModelServerSync",
    "./Operation",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting",
    "epi/i18n!epi/cms/nls/episerver.cms.components.versions"
],


function (
// Dojo
    array,
    connect,
    declare,
    json,
    Deferred,
    lang,
    topic,
    on,
    when,
    all,
    Stateful,
    Destroyable,
    List,
    DijitRegistry,

    // EPi Framework
    epi,
    dependency,
    UndoManager,
    dialogService,
    ObjectConverterRegistry,
    Alert,
    EpiStateful,
    errorHandler,

    // EPi CMS
    ApplicationSettings,
    ContentActionSupport,
    ContentEditingValidator,
    ContentModelServerSync,
    Operation,

    // Resources
    res,
    resVersions
) {

    return declare([Stateful, Destroyable], {
        // tags:
        //      internal xproduct

        // PUBLIC
        contentModel: null,

        metadata: null,

        syncService: null,

        editorFactory: null,

        validator: null,

        contentDataStore: null,

        profileHandler: null,

        languageContext: null,

        enableAutoSave: true,

        // PRIVATE
        _converterRegistry: null,

        _contentVersionStore: null,

        _syncRetryTimeout: 60000,

        undoManager: null,

        contextTypeName: "",

        contentLink: null,

        contentData: null,

        viewName: null,

        isCreatingNewVersion: false,

        hasUndoSteps: false,
        hasRedoSteps: false,
        isValid: true,
        hasPendingChanges: false,
        lastSaved: null,
        isSaved: true,
        isSaving: false,
        isOnline: true,
        hasErrors: false,
        validationErrors: null,
        isChangingContentStatus: false,

        // isSuspended: [readonly] Boolean
        //      Determines if the model is suspended or not (re-acting to undo/redo, publishing topics)
        isSuspended: false,

        constructor: function () {
            this.contentModel = new EpiStateful();
        },

        postscript: function () {
            this.inherited(arguments);

            // resolve dependency variables
            this.profileHandler = this.profileHandler || dependency.resolve("epi.shell.Profile");
            this.metadataManager = this.metadataManager || dependency.resolve("epi.shell.MetadataManager");
            this.projectService = this.projectService || dependency.resolve("epi.cms.ProjectService");

            this.currentContentLanguage = this.currentContentLanguage || ApplicationSettings.currentContentLanguage;
            this.contentDataStore = this.contentDataStore || dependency.resolve("epi.storeregistry").get("epi.cms.contentdata");

            if (!this._contentVersionStore) {
                this._contentVersionStore = dependency.resolve("epi.storeregistry").get("epi.cms.contentversion");
            }

            this.undoManager = this.undoManager || new UndoManager();
            this.validator = this.validator || new ContentEditingValidator({ contextId: this.get("contentLink"), contextTypeName: this.contextTypeName });
            this._dialogService = this._dialogService || dialogService;

            if (!this.syncService) {
                this._createSyncService();
            }

            // observe and copy these properties to this object
            var updater = lang.hitch(this, function (name, oldVal, newVal) {
                this.set(name, newVal);
            });

            this._operation = new Operation();

            this.own(
                this.syncService.watch("hasPendingChanges", updater),
                this.validator.watch("isValid", updater),
                this.validator.watch("hasErrors", updater),
                this.undoManager.watch("hasUndoSteps", updater),
                this.undoManager.watch("hasRedoSteps", updater),
                on(this._operation, "commit", lang.hitch(this, this._commitChanges))
            );
        },

        setActiveProperty: function (name) {
            // summary:
            //      Set property to active, which would bring up property's editor.
            // name: [String]
            //      Property name. Can also be "dot notation" name if it is sub property of a block property.
            // tags:
            //      public

            this.onSetActiveProperty(name);
        },

        suspend: function () {
            // summary:
            //      Suspends the editing for this view model.

            this.set("isSuspended", true);

            this.onContentChange();
            this.onSuspend();
        },

        onSuspend: function () {
            // summary:
            //  Raise onSuspend current view model
        },

        wakeUp: function () {
            // summary:
            //      Wake the suspended content view model up.
            this.set("isSuspended", false);
        },

        destroy: function () {

            this.clear();

            this.inherited(arguments);
        },


        clear: function () {
            this.undoManager.clear();
        },

        _createSyncService: function () {
            // summary:
            //      Creates and returns a new sync service instance.
            // tags:
            //      private

            var syncService = new ContentModelServerSync({
                contentLink: this.get("contentLink"),
                contentDataStore: this.contentDataStore
            });

            this.syncService = syncService;
        },

        connectLocal: function (targetArray, obj, evt, listener) {
            if (!lang.isArray(targetArray)) {
                throw Error("First argument to connectLocal must be an Array");
            }

            return targetArray.push(connect.connect(obj, evt, this, listener));
        },

        disconnectLocal: function (targetArray) {
            if (lang.isArray(targetArray)) {
                var listener;
                while ((listener = targetArray.pop())) {
                    connect.disconnect(listener);
                }
            }
        },

        resetNotifications: function () {
            this.validator.clearErrorsBySource(this.validator.validationSource.client);
        },

        beginOperation: function () {
            // summary:
            //      Start a multi property operation where all property changes should be handled as one undo step.

            this._operation.begin();
        },

        endOperation: function () {
            // summary:
            //      End a multi property operation, creating an undo step.

            this._operation.end();
        },

        abortOperation: function () {
            // summary:
            //      Abort an ongoing multi property operation.

            this._operation.abort();
        },

        getProperty: function (propertyName) {
            return this.contentModel.get(propertyName);
        },

        setProperty: function (propertyName, value, oldValue) {
            this._setModelProperty(propertyName, value, oldValue);
        },

        scheduleForPublish: function (date) {
            // summary:
            //      Schedule the content for publish at a given time
            // date: Date
            //      The date when the content should be published
            // tags:
            //      internal

            return this.saveProperty("iversionable_startpublish", date, ContentActionSupport.saveAction.ForceCurrentVersion | ContentActionSupport.saveAction.Schedule);
        },

        saveProperty: function (propertyName, value, saveAction) {
            // summary:
            //      Save a property value to the current version with a given save action.
            // propertyName: String
            //      The property name
            // value: Object
            //      The property value
            // saveAction: SaveAction
            //      The save action that should be triggered

            return this.syncService.saveProperty(propertyName, value, saveAction)
                .then(function (result) {
                    this.set("validationErrors", result.validationErrors);
                    this.contentModel.set(propertyName, value);
                    return this.changeContentStatus(saveAction, true);
                }.bind(this));
        },

        saveAndPublishProperty: function (propertyName, value, additionalSaveAction) {
            // summary:
            //      Save a property value to the published version. The change is also saved on the current version.
            // propertyName: String
            //      The property name
            // value:
            //      The property value
            // additionalSaveAction: SaveAction
            //      An additional save action to trigger

            // sync change to syncservice
            return when(this.syncService.saveProperty(propertyName, value, ContentActionSupport.saveAction.Publish | additionalSaveAction), lang.hitch(this, function (result) {

                // Update global errors
                this.validator.setGlobalErrors(result.validationErrors, this.validator.validationSource.server);

                // Update model
                this.contentModel.set(propertyName, value);

                // update data store
                return when(all([
                    this.contentDataStore.refresh(result.contentLink),
                    result.publishedContentLink ? this.contentDataStore.refresh(result.publishedContentLink) : null
                ]),
                lang.hitch(this, function (promiseResult) {
                    var contentData = promiseResult[0];
                    this.set("contentData", contentData);

                    return result;
                }));
            }));
        },

        _commitChanges: function (/*Array*/ properties) {
            // summary:
            //      Schedules the supplied properties to the server and creates ONE undo step for the changes

            var inverseProperties = [];

            properties.forEach(function (property) {
                inverseProperties.push({
                    propertyName: property.propertyName,
                    value: property.oldValue,
                    oldValue: property.value
                });

            }, this);

            this.undoManager.createStep(this, this._saveProperties, [inverseProperties], "Edit properties");
        },

        _saveProperties: function (properties) {
            // summary:
            //      Updates the model with an array of properties as one "unit" causing one undo step.
            //      Primarily used as undo/redo callback

            this.beginOperation();

            array.forEach(properties, function (p) {
                this._setModelProperty(p.propertyName, p.value, p.oldValue);
            }, this);

            this.endOperation();
        },

        _setModelProperty: function (propertyName, value, oldValue) {
            // summary:
            //      Sets a property value on the content model and adds a save operation to the internal operation object

            oldValue = oldValue === undefined ? this.contentModel.get(propertyName) : oldValue;

            this.set("isSaved", false);

            this.contentModel.set(propertyName, value);

            this._operation.save({
                propertyName: propertyName,
                value: value,
                oldValue: oldValue
            });

            // Add the property to the sync queue
            this.syncService.scheduleForSync(propertyName, value);
            this.enableAutoSave && this.save();

            this.onPropertyEdited(propertyName, value);
        },

        onPropertyEdited: function (propertyName, value) {
            // summary:
            //      Called when a property has been edited.
            //
            // propertyName: String
            //      Name of the property
            //
            // value: String|Object
            //      The new value
            //
            // tags:
            //      public
        },

        onPropertySaved: function (propertyName, value) {
            // summary:
            //      Raised when a property value has been saved to the server
            //
            // propertyName: String
            //      Name of the saved property
            //
            // value: String|Object
            //      The saved value
            //
            // tags: internal
        },

        onPropertyReverted: function (propertyName, oldValue) {
            // summary:
            //      Raised when a property value has been reverted to last saved value
            //
            // propertyName: String
            //      Name of the reverted property
            //
            // oldValue: String|Object
            //      The old value
            //
            // tags: internal

            this.contentModel.set(propertyName, oldValue);
        },

        _onSynchronizeSuccess: function (contentLink, properties, results) {
            // summary:
            //    Handler when a property has been successfully synchronized
            // contentLink:
            //      The contentLink
            // properties:
            //      Properties synchronized

            array.forEach(properties, lang.hitch(this, function (property) {
                this.validator.clearPropertyErrors(property.name, this.validator.validationSource.server);
                // update data store
                this._patchContentDataStore(contentLink, property.name, null, property.value);
                this.onPropertySaved(property.name, property.value);
            }));

            this.validator.setGlobalErrors(results.validationErrors, this.validator.validationSource.server);
        },


        _onSynchronizeFailure: function (contentLink, properties, message, results) {
            // summary:
            //      Handle a property that couldn't be synchronized due to server rejecting the data,
            //      for instance if the data isn't valid
            // contentLink:
            //      The contentLink
            // properties:
            //      Properties
            // message:
            //      A message why it couldn't update
            // results:
            //      The results of the update including any global validation errors.
            // tags:
            //      private

            var propertiesToRevert = [];

            array.forEach(properties, function (property) {
                if ("successful" in property) {
                    if (property.successful) {
                        this.validator.clearPropertyErrors(property.name, this.validator.validationSource.server);
                    } else {
                        // Could not synchronize property, queue it up to be handled
                        propertiesToRevert.push(property);
                    }
                }
            }, this);

            // We inform the user that properties that couldn't be synchronized will be reverted
            if (propertiesToRevert.length) {
                var errorMessages = array.map(propertiesToRevert, function (property) {
                    return property.validationErrors;
                });
                this._showErrorsDialog(res.autosave.error, errorMessages, lang.hitch(this, function () {
                    array.forEach(propertiesToRevert, function (property) {
                        this.onPropertyReverted(property.name, property.value);
                    }, this);
                }));
            }

            //If we have a result set the global validation errors
            if (results) {
                if (results.validationErrors) {
                    this.validator.setGlobalErrors(results.validationErrors, this.validator.validationSource.server);
                } else {
                    this.validator.clearGlobalErrors(this.validator.validationSource.server);
                }
            }
        },

        _showErrorsDialog: function (description, errors, acknowledgeCallback) {
            // summary:
            //      Shows an alert dialog with a list of errors
            //
            // errors: [Array:string]
            //      Collection of error messages to display
            //
            // acknowledgeCallback: [Function]
            //      Called when user has triggered the dialog's acknowledge action.
            //
            // tags:
            //      private

            var list = new (declare([List, DijitRegistry]))({className: "epi-grid-max-height--300"});
            list.renderArray(errors);
            list.startup();

            function onActionCallback() {
                if (typeof acknowledgeCallback === "function") {
                    acknowledgeCallback();
                }
                this._currentErrorDialog = null;
            }

            if (this._currentErrorDialog) {
                // don't show alert twice, just update the content
                this._currentErrorDialog.set("content", list);
            } else {
                this._currentErrorDialog = new Alert({
                    description: description,
                    content: list,
                    onAction: onActionCallback.bind(this)
                });
                this._currentErrorDialog.show();
            }
        },

        _contentLinkChanged: function (newContentLink) {

            // store the latest newContentLink, could have changed during sync, ie when first changing a property
            this.set("contentLink", newContentLink);

            this.syncService.set("contentLink", newContentLink);

            // propagate new contentlink
            this.validator.setContextId(newContentLink);

            this.onContentLinkChange();
        },

        ensureWritableVersion: function () {
            // summary:
            //      Ensures that we are editing a writable version
            //
            // tags:
            //      private

            var contentLink = this.get("contentLink");

            if (!this.contentData.isNewVersionRequired) {
                return contentLink;
            }


            if (this._isCreatingNewVersionDeferred && !this._isCreatingNewVersionDeferred.isFulfilled()) {
                return this._isCreatingNewVersionDeferred.promise;
            } else {
                this._isCreatingNewVersionDeferred = new Deferred();
            }

            this.isCreatingNewVersion = true;

            when(this._contentVersionStore.put({ originalContentLink: contentLink }), lang.hitch(this, function (newVersion) {

                //Load the new version
                //NOTE:     we need to refresh contentData before we resolve because isNewVersionRequired
                //          is returned with the contentData, if we don't update contentData before resolving we
                //          can end up in a situation where we keep producing new versions with every sync call
                //          since isNewVersionRequired stays true
                this.contentDataStore.refresh(newVersion.contentLink).then(lang.hitch(this, function (contentData) {
                    this.set("contentData", contentData);
                })).always(lang.hitch(this, function () {
                    this.isCreatingNewVersion = false;
                    this._contentLinkChanged(newVersion.contentLink);
                    this._isCreatingNewVersionDeferred.resolve(newVersion);
                }));

            }), lang.hitch(this, function (error) {
                this.isCreatingNewVersion = false;
                this._isCreatingNewVersionDeferred.reject(error);

                var errorMessage = error.responseText ? json.fromJson(error.responseText) : error.message;
                this.validator.setGlobalErrors(errorMessage, this.validator.validationSource.server);
            }));

            return this._isCreatingNewVersionDeferred.promise;
        },

        validate: function () {
            // summary:
            //      Validate the model
            //
            // tags:
            //      public

            var def;
            if (!this.validator) {
                def = new Deferred();
                def.resolve();
            } else {
                def = this.validator.validate();
            }

            return def;
        },

        revertToPublished: function () {
            // summary:
            //      Revert to published version
            // tags:
            //      public

            var contentLink = this.get("contentLink");

            return when(this._contentVersionStore.remove(contentLink),
                function () {
                    this._loadPublishedVersion(contentLink);
                }.bind(this),
                function (error) {
                    var errorMessage;
                    if (error.status === 403) {
                        // This version already published
                        errorMessage = resVersions.deleteversion.cannotdeletepublished;
                    } else if (error.status === 404) {
                        // This version does not exist
                        errorMessage = res.versionstatus.versionnotfound;
                    }

                    if (errorMessage) {
                        return this._dialogService.alert(errorMessage).then(function () {
                            this._loadPublishedVersion(contentLink);
                        }.bind(this));
                    }
                }.bind(this)
            );
        },

        _loadPublishedVersion: function (contentLink) {
            // summary:
            //      Get published version and reload
            // tags:
            //      private
            when(this._contentVersionStore.query({ contentLink: contentLink, language: this.languageContext ? this.languageContext.language : "", query: "getpublishedversion" }),
                lang.hitch(this, function (result) {
                    if (result !== null) {
                        var contextParameters = { uri: "epi.cms.contentdata:///" + result.contentLink, context: this };
                        topic.publish("/epi/shell/context/request", contextParameters, { sender: this, forceReload: true });
                    }
                }));
        },

        createDraft: function () {

            var contentLink = this.get("contentLink"),
                setCommonDraft =
                    this.contentData.isCommonDraft &&
                    this.contentData.status === ContentActionSupport.versionStatus.DelayedPublish &&
                    !this.projectService.isProjectModeEnabled;

            return when(this._contentVersionStore.put({ originalContentLink: contentLink, isCommonDraft: setCommonDraft }), lang.hitch(this, function (newVersion) {
                var contextParameters = { uri: "epi.cms.contentdata:///" + newVersion.contentLink, context: this };
                topic.publish("/epi/shell/context/request", contextParameters, { sender: this });
                topic.publish("/epi/cms/content/statuschange/", "common-draft", { id: newVersion.contentLink });
            }));

        },

        editCommonDraft: function () {
            // summary:
            //      Get common draft version and reload
            // tags:
            //      public
            var contentLink = this.get("contentLink");

            return when(this._contentVersionStore.query({ contentLink: contentLink, query: "getcommondraftversion" }), lang.hitch(this, function (commonDraftVersion) {
                var contextParameters = { uri: "epi.cms.contentdata:///" + commonDraftVersion.contentLink, context: this };
                topic.publish("/epi/shell/context/request", contextParameters, { sender: this });
            }));
        },

        _populateContentModel: function (data, metadata) {
            var props = {},
                converterType,
                converter;

            for (var propertyName in data) {
                var propertyMetadata = metadata.getPropertyMetadata(propertyName);
                var propertyValue = data[propertyName];
                if (propertyMetadata.hasSubProperties()) {
                    props[propertyName] = this._populateContentModel(propertyValue, propertyMetadata);
                } else {
                    // default
                    props[propertyName] = propertyValue;

                    // check for converter
                    converterType = propertyMetadata.customEditorSettings.converter;
                    if (converterType) {
                        converter = ObjectConverterRegistry.getConverter(converterType, "runtimeType");
                        if (converter) {
                            // bind converted value instead
                            props[propertyName] = converter.convert(converterType, "runtimeType", propertyValue);
                        }
                    }
                }
            }
            return props;
        },

        getPropertyMetaData: function (propertyName) {
            // summary:
            //      Return metadata of a property.
            //
            // propertyName: [String]
            //      The property name
            //
            // return: [Object|Deferred]
            //      Returns the metadata object if content metadata has already resolved.
            //      Otherwise returns a deferred which resolves to the property metadata when content metadata is loaded.
            //
            // tags:
            //      public

            return when(this._getMetadata(), function (metadata) {
                return metadata.getPropertyMetadata(propertyName);
            });
        },

        reload: function () {
            // summary:
            //      Reloads the metadata and content data for the model
            //
            // return: [Promise]
            //      Returns a promise when the data has been reloaded
            //
            // tags:
            //      public

            return when(all([
                this.contentDataStore.get(this.get("contentLink")),
                this._getMetadata(true)]),
            lang.hitch(this, function (data) {
                var contentData = data[0],
                    metadata = data[1];

                this.set("contentData", contentData);

                var contentModel = this.get("contentModel");
                var model = this._populateContentModel(contentData.properties, metadata);

                for (var name in model) {
                    // Only update changed values, otherwise watches are called for all properties
                    if (model.hasOwnProperty(name) && !epi.areEqual(contentModel.get(name), model[name])) {
                        contentModel.set(name, model[name]);
                    }
                }
            })
            );
        },

        _getMetadata: function (reload) {
            // summary:
            //      Returns the metadata for the content
            // reload: [Boolean]
            //      Flag inidicating if the metadata should be reloaded or not
            // return: [Object|Promise]
            //      Returns the metadata object if content metadata has already resolved.
            //      Otherwise returns a deferred which resolves to the  content metadata is loaded.
            // tags:
            //      private

            var metadata = this.get("metadata");
            if (!reload && metadata) {
                return metadata;
            }

            var self = this;
            return when(this.metadataManager.getMetadataForType("EPiServer.Core.ContentData", { contentLink: this.get("contentLink") }),
                function (metadata) {
                    self.set("metadata", metadata);

                    return metadata;
                });
        },

        save: function () {
            if (!this.isOnline) {
                var def = new Deferred();

                def.resolve(true);

                return def;
            }
            return this._save();
        },

        _save: function () {
            var def = new Deferred(),
                onSuccess = lang.hitch(this, function (result) {
                    if (result) {
                        if (result.successful) {
                            this._onSynchronizeSuccess(result.contentLink, result.properties, result);
                        } else {
                            this._rescheduleProperties(result.properties);
                            this._onSynchronizeFailure(result.contentLink, result.properties, result.validationErrors, result);
                        }
                        if (result && result.hasContentLinkChanged && this.contentLink !== result.contentLink) {
                            this._contentLinkChanged(result.contentLink);
                        }

                        this.set("validationErrors", result.validationErrors);
                    }
                    this.set("isOnline", true);
                    this.set("lastSaved", new Date());
                    this.set("isSaving", false);
                    this.set("isSaved", true);

                    def.resolve(true);
                }),
                onError = lang.hitch(this, function (result) {

                    this.set("hasErrors", true);
                    this.set("isSaving", false);
                    this.set("isSaved", false);

                    if (result && result.error && (result.error.status === 409 || result.error.status === 404)) {
                        // Version conflict or removed, do not retry.
                        var message = result.error.status === 409 ? res.autosave.conflict : res.autosave.reloadmessage;
                        this._showErrorsDialog(message, []);

                    } else {
                        this.set("isOnline", false);

                        if (result) {
                            this.set("validationErrors", result.validationErrors);
                            this._rescheduleProperties(result.properties);
                        }

                        setTimeout(lang.hitch(this, function () {
                            this.set("isOnline", true);
                            this._save();
                        }), this._syncRetryTimeout);
                    }

                    def.reject(result);
                });

            //Make sure that we have a version that we can make changes to
            if (!this.hasPendingChanges) {
                onSuccess();
            } else {

                when(this.ensureWritableVersion()).then(lang.hitch(this, function () {
                    this.set("isSaving", true);
                    return this.syncService.save();
                })).then(onSuccess).otherwise(onError);

            }
            return def;
        },

        _rescheduleProperties: function (properties) {
            // summary:
            //      Add a range of properties to re-schedule upon next synchronization.
            //      Only properties not already scheduled for synchronization will be added,
            //      meaning that if a new property change has been recorded while syncing
            //      it won't be overwritten.
            // properties: Array
            //      An array of property names and values

            array.forEach(properties, lang.hitch(this, function (property) {
                if (!this.syncService.pendingSync(property.name)) {
                    this.syncService.scheduleForSync(property.name, property.value);
                }
            }));
        },

        undo: function () {
            !this.get("isSuspended") && this.undoManager.undo();
        },

        redo: function () {
            !this.get("isSuspended") && this.undoManager.redo();
        },

        _patchContentDataStore: function (contentLink, propertyName, oldValue, newValue) {
            // summary:
            //      Updates the named named property in the current content data store with value in newValue

            var properties = {};

            lang.setObject(propertyName, newValue, properties);

            return this.contentDataStore.patchCache({
                contentLink: contentLink,
                changedBy: this.profileHandler.userName,
                saved: (new Date()).toISOString(),
                properties: properties
            });
        },

        changeContentStatus: function (status, suppressUpdateStatus) {
            var contentLink = this.get("contentLink");
            var def = new Deferred();

            // This will notify other content that we are in changing state.
            this.set("isChangingContentStatus", true);

            var onSuccess = lang.hitch(this, function (result) {
                var success = result && result.success;
                var validator = this.validator;
                if (success) {
                    // Set lastSaved to null after publishing, ready to publish and Schedule to publish the content
                    if (status === ContentActionSupport.saveAction.Publish
                        || status === ContentActionSupport.saveAction.CheckIn
                        || status === (ContentActionSupport.saveAction.CheckIn | ContentActionSupport.saveAction.DelayedPublish | ContentActionSupport.saveAction.ForceCurrentVersion)) {
                        this.set("lastSaved", null);
                    }
                    if (validator) {
                        validator.clearGlobalErrors(validator.validationSource.server);
                    }
                    var resolveArgs = { id: result.id, oldId: contentLink };
                    topic.publish("/epi/cms/content/statuschange/", status, resolveArgs);
                    def.resolve(resolveArgs);
                } else {
                    if (result && result.validationErrors) {
                        // add to validator
                        if (validator) {
                            validator.setGlobalErrors(result.validationErrors, validator.validationSource.server);
                            validator.validate();
                        }

                        // reject with empty value, we took care of the validations errors
                        def.reject(null);
                    } else {
                        def.reject((result && result.errorMessage) ? result.errorMessage : res.publish.error);
                    }
                }

                this.set("isChangingContentStatus", false);
            });

            var onError = lang.hitch(this, function (result) {
                topic.publish("/epi/cms/action/showerror"); //TODO: Copy from PageDataController to make the system working as before. But, why we need it!!!
                def.reject((result && result.errorMessage) ? result.errorMessage : res.publish.error);

                this.set("isChangingContentStatus", false);
            });

            this.onContentChange();

            if (suppressUpdateStatus) {
                var success;

                if (this.validationErrors && this.validationErrors.length > 0) {
                    //When the severity on the validation errors is not errors but
                    //instead warnings, info and such. Set success to true.
                    success = !this.validationErrors.some(function (error) {
                        return error.severity === 3;
                    });
                } else {
                    success = true;
                }

                onSuccess({ id: this.contentLink, success: success, validationErrors: this.validationErrors });
            } else {
                // Validate, save pending change, then execute changestatus server method.
                when(this.validate())
                    .then(this.save.bind(this))
                    .then(function () {
                        return errorHandler.wrapXhr(this.contentDataStore.executeMethod("ChangeStatus", this.get("contentLink"),
                            { action: status }));
                    }.bind(this))
                    .then(onSuccess)
                    .otherwise(onError);
            }

            return def;
        },

        _lastSavedGetter: function () {
            if (this.lastSaved) {
                return this.lastSaved;
            }
            if (this.contentData) {
                return this.contentData.saved;
            }
            return null;
        },

        onContentChange: function () {
            // summary:
            //      Raised before making changes that will eventually change content
            // tags:
            //      callback
        },

        onContentLinkChange: function () {
            // summary:
            //      Raised after changing the current content link in the view model and in the sync service
            // tags:
            //      callback

            if (this.get("isSuspended")) {
                return;
            }

            // note that our view component, OPE or form must check if we're the sender?
            // or just skip when a content link changed
            var contextParameters = { uri: "epi.cms.contentdata:///" + this.get("contentLink") };
            topic.publish("/epi/shell/context/request", contextParameters, { sender: this, contextIdSyncChange: true, trigger: "internal" });
        },

        hasEditAccess: function () {
            // summary:
            //      Check if current user has access right to edit the content
            return ContentActionSupport.hasAccess(this.contentData.accessMask, ContentActionSupport.accessLevel.Edit);
        },

        hasAccess: function (action) {
            // summary:
            //      Check if current user has access on the active content using the given action.
            // remark:
            //      This method cannot be overriden by plugins. Use when we need to check core conditions only.

            // languageContext is null if the content or content provider does not have multi language support
            // in this case allow editing matter which language is active
            var canEditLanguage = !this.languageContext || !this.languageContext.isTranslationNeeded;
            return canEditLanguage && ContentActionSupport.isActionAvailable(this.contentData, action || ContentActionSupport.action.Edit, ContentActionSupport.providerCapabilities.Edit);
        },

        canTranslateContent: function () {

            if (this.viewLanguage && this.languageContext && this.viewLanguage !== this.currentContentLanguage) {
                return false;
            }

            return true;
        },

        canChangeContent: function (action) {
            // summary:
            //      Check if current user can change on the active content using
            //      the given action.
            // action: String
            //      The action to check.
            // returns: Boolean
            //      A boolean which indicates whether the current user can
            //      change the current content using the given action.
            // tags:
            //      internal

            var isPartOfProject = this.projectService.isProjectModeEnabled && this.contentData.isPartOfAnotherProject;

            return !isPartOfProject && this.canEditCurrentLanguage() && this.hasAccess(action);
        },

        canEditCurrentLanguage: function () {
            // summary:
            //      Check if the current content language can be edited in the current language context.
            // tags:
            //      public
            if (!this.languageContext) {
                return true;
            }

            return this.languageContext.language === this.currentContentLanguage;
        },

        _contentDataSetter: function (contentData) {
            this.contentData = contentData;
            if (contentData.contentLink !== undefined) {
                this.set("contentLink", contentData.contentLink);
            }
        },

        _showOverlayGetter: function () {
            var shortcut = this.getProperty("iversionable_shortcut");
            if (shortcut && shortcut.pageShortcutType) {
                // Return true if the shortcut is not "fetchdata"
                return shortcut.pageShortcutType !== 4;
            }

            return true;
        }
    });
});
