define("epi-cms/contentediting/EditingBase", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/query",
    "dojo/topic",
    "dojo/when",

    // EPi Framework
    "epi/dependency",
    "epi/string",
    "epi/shell/DestroyableByKey",
    "epi/shell/postMessage",

    // EPi CMS
    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/MutationObserver",
    "epi-cms/contentediting/_View",
    "epi-cms/contentediting/AutoSaveButton",
    "epi-cms/contentediting/MappingManager",
    "epi-cms/contentediting/RenderManager",
    "epi-cms/contentediting/UpdateController",
    "epi-cms/widget/overlay/overlayFactory",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting"
],

function (
// Dojo
    array,
    connect,
    declare,
    Deferred,
    lang,

    aspect,
    query,
    topic,
    when,

    // EPi Framework
    dependency,
    epiString,
    DestroyableByKey,
    postMessage,

    // EPi CMS
    ApplicationSettings,
    MutationObserver,
    _View,
    AutoSaveButton,
    MappingManager,
    RenderManager,
    UpdateController,
    overlayFactory,

    // Resources
    res
) {
    return declare([_View, DestroyableByKey], {
        // tags:
        //      internal

        // toolbar: [epi.cms/contentediting/widget/EditToolbar]
        //      Edit toolbar instance.
        toolbar: null,

        // editorFactory: [epi-cms/contentediting/EditorFactory]
        //      Editor factory instance.
        editorFactory: null,

        // activePropertyOnStartup: [String]
        //      Property to be set as active when edit view has done setting up.
        activePropertyOnStartup: null,

        // createOverlays: [Boolean]
        //      Indicate that the overlays should be created.
        createOverlays: true,

        _renderManager: null,

        _mappingManager: null,

        _activeEditorWrapper: null,

        _autoSaveButton: null,

        _deferredReloadHandle: null,

        _eventHandlers: null,

        _isCreatingWrapper: null,

        // _mutationObserver: [private] epi-cms/contentediting/MutationObserver
        //      MutationObserver instance
        _mutationObserver: null,

        constructor: function () {
            this.defaultQueryParameters = {
                epieditmode: true
            };
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            this.editorFactory = this.editorFactory || dependency.resolve("epi.cms.contentediting.EditorFactory");

            this._mappingManager = new MappingManager();

            this._mutationObserver = new MutationObserver();
            this.own(this._mutationObserver.on("dom-updated", function () {
                this.emit("dom-updated");
            }.bind(this)));

            this._eventHandlers = [];
        },

        postCreate: function () {
            this.inherited(arguments);

            this.subscribe("/epi/cms/action/disableundoredoactions", this._toggleUndoRedoActions);
        },

        destroy: function () {
            this._stopActiveEditorWrapper();

            if (this._renderManager) {
                this._renderManager.destroy();
            }

            if (this._autoSaveButton) {
                this._autoSaveButton.destroyRecursive();
            }

            this._mappingManager.clear();

            if (this.toolbar) {
                this.toolbar = null;
            }

            // Remove all overlay items that was added
            this.overlay.destroyDescendants();

            // Teardown mutation observers
            this._mutationObserver.teardown();

            this.inherited(arguments);
        },

        _setCommandEnabled: function (toolbarItemName, enabled) {
            if (this.toolbar) {
                this.toolbar.setItemProperty(toolbarItemName, "disabled", !enabled);
            }
        },

        onContentLinkSyncChange: function () {
            this.inherited(arguments);
            this._setButtonState();
        },

        onReloadRequired: function () {
            this.inherited(arguments);

            // clear and suspend render manager after the watch handlers finished
            setTimeout(function () {
                this._renderManager.suspend();
                this._renderManager.clear();
            }.bind(this), 0);
        },

        _setViewModelAttr: function (viewModel) {
            if (viewModel === this.viewModel) {
                return;
            }

            this.inherited(arguments);

            //Disconnect all event handlers
            this.destroyByKey("viewModel");

            //Listen to onSuspend and stop editing the property and reset active editor
            this.ownByKey("viewModel", connect.connect(this.viewModel, "onContentChange", this, this._stopActiveEditorWrapper));

            // Listen on onSetActiveProperty event so it can react when active property is about to set on ContentViewModel
            this.ownByKey("viewModel", connect.connect(this.viewModel, "onSetActiveProperty", this, this.onSetActiveProperty));

            // Listen to onPropertyReverted to handle property value rollback
            this.ownByKey("viewModel", connect.connect(this.viewModel, "onPropertyReverted", this, this._onPropertyReverted));

            this.ownByKey("viewModel", topic.subscribe("/dnd/start", function () {
                // this timeout lets the previous operation end before starting the new one
                setTimeout(this.beginOperation.bind(this), 0);
            }.bind(this.viewModel)));
            this.ownByKey("viewModel", topic.subscribe("/dnd/stop", lang.hitch(this, function () {
                // If we have an active editor do not end the operation
                if (this._activeEditorWrapper) {
                    return;
                }
                this.viewModel.endOperation();
            })));
        },

        _stopActiveEditorWrapper: function () {
            if (this._activeEditorWrapper != null) {
                when(this._activeEditorWrapper.tryToStopEditing(), lang.hitch(this, function () {
                    this._activeEditorWrapper = null;
                }));
            }
        },

        onSetActiveProperty: function (property) {
            // summary:
            //      Triggered when active property is set on the current content view model.
            // property: String
            //      The property name.
            // tags:
            //      public, callback
        },

        onPreviewReady: function (viewModel, doc, forceSetup) {
            // summary:
            //      Triggered when preview is ready.
            // viewModel: [epi.cms.contentediting.ContentViewModel]
            //      The content view model.
            // doc: [Document]
            //      The preview document.
            // forceSetup: [Boolean]
            //      Indicate that the preview ready along with significant model changes, therefore the editing stuff must be setup again.
            // tags:
            //      public, callback.

            if (forceSetup || viewModel !== this.viewModel) {
                this.set("viewModel", viewModel);
                this.setupEditMode(doc);
            } else if (viewModel) {
                this.remapEditMode(doc);
            }
        },

        _setButtonState: function () {
            this._setCommandEnabled("reverttopublished", this.viewModel && !this.viewModel.contentData.isPendingPublish);
        },

        setupEditMode: function (doc) {
            // summary:
            //      Setup all necessary stuff for edit mode.
            // tags:
            //      protected

            this.viewModel.reload().then(
                lang.hitch(this, function () {
                    // reset
                    this._mappingManager.clear();
                    if (this._renderManager) {
                        this._renderManager.destroy();
                    }
                    this._renderManager = new RenderManager();

                    // create toolbar
                    if (this.toolbar && !this._autoSaveButton) {
                        this._autoSaveButton = new AutoSaveButton({
                            button: this.toolbar._getWidget("autosave")
                        });
                        this.own(aspect.after(this._autoSaveButton, "onLayoutChanged", lang.hitch(this, function () {
                            this.mainLayoutContainer.layout();
                        })));
                    }

                    this._autoSaveButton.set("model", this.viewModel);

                    var updateUndoRedo = lang.hitch(this, function () {
                        this._toggleUndoRedoActions(this.viewModel.hasUndoSteps, this.viewModel.hasRedoSteps);
                    });

                    this.viewModel.resetNotifications();

                    // remove existing handles
                    this._destroyOverlay();

                    this.ownByKey("viewModel",
                        this.viewModel.watch("hasUndoSteps", updateUndoRedo),
                        this.viewModel.watch("hasRedoSteps", updateUndoRedo));

                    // Get initial values
                    updateUndoRedo();

                    this.onReadySetupEditMode(doc);

                    if (ApplicationSettings.hasExternalTemplates) {
                        this.ownByKey("overlay", postMessage.subscribe(this.iFrame.name + "/site/property-positions", this._createOverlaysForProperties.bind(this)));
                        postMessage.publish("/site/check-property-positions");
                    }

                    // Setup mutation observers
                    this._mutationObserver.setup(doc);

                    // Set the doc to null to avoid closure leakage
                    doc = null;

                    //reset Publish button
                    this._setButtonState();

                    this.onPrepareOverlayComplete();
                })
            );
        },

        remapEditMode: function (doc) {
            // summary:
            //      Re-configure edit mode after the preview context changed.
            // tags:
            //      protected

            this.viewModel.reload().then(lang.hitch(this, function () {
                this._renderManager.resume();

                // When loading blocks that required reload, wait for blocks rendered then remap update controller
                if (doc) {
                    setTimeout(lang.hitch(this, function () {
                        this._remapUpdateControllers(doc);
                        this.onPrepareOverlayComplete();
                        this._toggleUndoRedoActions(this.viewModel.hasUndoSteps, this.viewModel.hasRedoSteps);

                        this._autoSaveButton.set("model", this.viewModel);

                        // Setup mutation observers
                        this._mutationObserver.setup(doc);
                    }), 1);
                }
            }));
        },

        _destroyOverlay: function () {
            // summary:
            //      Destroy the handles owned by the overlay items and view model
            // tags:
            //      protected, internal

            this.destroyByKey("overlay");
        },

        onReadySetupEditMode: function (doc) {
            // summary:
            //    Edit mode is ready for setting up.
            //
            // description:
            //    Setup editable blocks. Override to do extra setup, for example: set up form editing.
            //
            // propertyMetadataMap: Object
            //    Property metadata hashmap.
            //
            // tags:
            //    protected

            this._createUpdateControllers(doc);
        },

        onSetupEditModeComplete: function () {
            // summary:
            //      Triggered when edit mode is successfully set up.
            // remark:
            //      Should be fired by concrete edit view when it finishes preparations.
            // tags:
            //      public, callback.

            // Set active property if exists.
            if (this.activePropertyOnStartup) {
                this.onSetActiveProperty(this.activePropertyOnStartup);
                this.activePropertyOnStartup = null;
            }
        },

        _getPropertyNodes: function (doc) {
            var allNodes = query("[data-epi-edit], [data-epi-property-name]", doc);
            // Write out all the combinations of nested nodes to avoid runtime calculations which would always give the same result.
            var nestedNodes = query("[data-epi-edit] [data-epi-edit], [data-epi-property-name] [data-epi-property-name], [data-epi-property-name] [data-epi-edit], [data-epi-edit] [data-epi-property-name]", doc);

            return array.filter(allNodes, function (node) {
                // return the nodes that are not nested
                return nestedNodes.indexOf(node) === -1;
            });
        },

        _getOverlayParameters: function (nodes, isExternal) {
            var result = [];

            array.forEach(nodes, function (node) {
                var dataset = node.dataset;
                var propertyNodeName = epiString.pascalToCamel(dataset.epiEdit || dataset.epiPropertyName);
                var propertyMetadata = this.viewModel.getPropertyMetaData(propertyNodeName);
                var forceFloating = isExternal || !!dataset.epiEdit;

                // Skip this property if we don't have metadata,
                // i.e. the template rendered a node we won't find in the model
                if (!propertyMetadata) {
                    return;
                }

                // readOnly property is not editable
                if (propertyMetadata.settings && propertyMetadata.settings.readOnly) {
                    return;
                }

                // Get the real property name from metadata, since the page property name may be the legacy name (e.g. pageName -> icontent_name)
                var propertyName = epiString.pascalToCamel(propertyMetadata.getName());

                var propertyDisplayName = dataset.epiPropertyDisplayName;
                if (propertyDisplayName) {
                    propertyMetadata = lang.delegate(propertyMetadata, { displayName: propertyDisplayName });
                }

                if (propertyMetadata != null && propertyMetadata.showForEdit) {
                    // Extract block information from the data attributes
                    // add to result array

                    var renderSettings = {
                        cacheResults: true,
                        rerenderOnCancel: false,
                        propertyRenderSettings: dataset.epiPropertyRendersettings || undefined,
                        useMvc: dataset.epiUseMvc ? dataset.epiUseMvc.toLowerCase() === "true" : false
                    };
                    renderSettings = lang.mixin(renderSettings, propertyMetadata.additionalValues.renderSettings);

                    // Read custom renderer settings from the data attribute resolving any name aliases if needed,
                    // or use the metadata if the attribute is empty.
                    var rendererClass = forceFloating ? "none" : dataset.epiPropertyRender || propertyMetadata.customEditorSettings.rendererClass;
                    switch (rendererClass) {
                        case "client":
                            rendererClass = "epi-cms/contentediting/ClientRenderer";
                            break;
                        case "none":
                            rendererClass = "epi-cms/contentediting/NullRenderer";
                            break;
                    }

                    var editorParams = JSON.parse(dataset.epiPropertyEditorsettings || null);

                    var overlayParams = JSON.parse(dataset.epiPropertyOverlaysettings || null);

                    overlayParams = lang.mixin(overlayParams, propertyMetadata.overlaySettings);

                    // Disable custom OPE editor and wrapper type since we want to force floating editors.
                    if (forceFloating) {
                        propertyMetadata.customEditorSettings.uiType = null;
                        propertyMetadata.customEditorSettings.uiWrapper = null;
                    }

                    result.push({
                        node: node,
                        disabled: dataset.epiDisabled === "true",
                        useOverlay: dataset.epiUseoverlay === "true",
                        overlayZIndex: parseInt(dataset.epiOverlayZIndex, 10) || 0,
                        property: {
                            name: propertyName,
                            contentLink: this.viewModel.contentLink,
                            contentModel: this.viewModel.contentModel,
                            type: dataset.epiPropertyType,
                            wrapperType: forceFloating ? "floating" : dataset.epiPropertyEdittype || null,
                            editorParams: editorParams,
                            overlayParams: overlayParams,
                            editorWidgetType: dataset.epiPropertyEditor,
                            renderSettings: renderSettings,
                            rendererClass: rendererClass,
                            metadata: propertyMetadata,
                            propertyNodeName: propertyNodeName
                        }
                    });
                }
            }, this);

            // sort editable nodes depending on z-index-hint
            result.sort(function (a, b) {
                // use reverse index, higher values later in array
                if (a.overlayZIndex < b.overlayZIndex) {
                    return -1;
                } else if (a.overlayZIndex > b.overlayZIndex) {
                    return 1;
                } else {
                    return 0;
                }
            });

            return result;
        },

        _getEditableNodes: function (doc) {
            // summary:
            //    Create the editable blocks and wire up events.
            //
            // tags:
            //    private

            // Cannot inspect document, assume that we have no editable node.
            if (!doc || !this.viewModel.canChangeContent()) {
                return [];
            }

            var nodes = this._getPropertyNodes(doc);

            return this._getOverlayParameters(nodes, false);
        },

        _createOverlaysForProperties: function (properties) {
            // summary:
            //      Create overlays and connect events for properties from
            //      an external template site.
            // tags:
            //    private

            // We don't need to recreate the overlays if they're not active
            if (!this.overlay.enabled) {
                return;
            }

            var results = this._getOverlayParameters(properties, true);

            // Clear mappings for overlays.
            // This is what causes the old overlays to be destroyed.
            var overlayMappings = this._mappingManager.find(function (mapping) {
                return !!mapping.overlayItem;
            });
            this._mappingManager.clearMappings(overlayMappings);

            results.forEach(function (property) {
                overlayFactory.createByDimensions(property).then(function (overlayItem) {
                    this.overlay.addChild(overlayItem);
                    this._connectUpdateControllerAndOverlayEvents(null, overlayItem);
                    // create mapping
                    this._mappingManager.add({
                        blockPropertyInfo: property.property,
                        overlayItem: overlayItem
                    });
                }.bind(this));
            }, this);
        },

        _createUpdateControllers: function (doc) {
            // summary:
            //    Create the editable blocks and wire up events.
            //
            // doc: Document
            //    Document where to get editable blocks.
            //
            // tags:
            //    private

            //Create a full page update controller
            var fullpageUpdateController = this._createFullPageUpdateController(doc);
            if (fullpageUpdateController) {
                this._connectFullPageUpdateControllerEvents(fullpageUpdateController);
                this._mappingManager.add({
                    updateController: fullpageUpdateController
                });
            }

            //Create update controllers for nodes
            var editableNodes = this._getEditableNodes(doc);
            array.forEach(editableNodes, function (editableNode) {
                var property = editableNode.property;
                var nodeHTML = editableNode.node.innerHTML;
                var updateController = this._createNodeUpdateController(editableNode);

                when(this._createNodeOverlay(editableNode), lang.hitch(this, function (overlayItem) {
                    this._connectUpdateControllerAndOverlayEvents(updateController, overlayItem);
                    // create mapping
                    this._mappingManager.add({
                        blockPropertyInfo: property,
                        node: editableNode.node,
                        updateController: updateController,
                        overlayItem: overlayItem
                    });
                }));

                //Cache the block's initial rendering.
                this._renderManager.cacheRender(property.name, property.renderSettings, this.viewModel.getProperty(property.name), nodeHTML);
            }, this);
        },

        _createNodeOverlay: function (editableNode) {
            // summary:
            //      Change to use dojo/Deferred because of overlayFactory now use this way

            var deferred = new Deferred();

            // Don't create overlay
            if (!this.createOverlays) {
                deferred.resolve(null);
                return deferred;
            }

            when(overlayFactory.create(editableNode), lang.hitch(this, function (overlayItem) {
                this.overlay.addChild(overlayItem);
                deferred.resolve(overlayItem);
            }));

            return deferred;
        },

        _createNodeUpdateController: function (editableNode) {
            var property = editableNode.property;
            var metadata = property.metadata;

            // Create block
            var updateController = new UpdateController({
                displayName: metadata.displayName,
                renderManager: this._renderManager,
                contentModel: property.contentModel,
                contentLink: property.contentLink,
                modelPropertyName: property.name,
                nodePropertyName: property.propertyNodeName,
                renderSettings: property.renderSettings,
                rendererClass: property.rendererClass,
                displayNode: editableNode.node
            });

            return updateController;
        },

        _createFullPageUpdateController: function (doc) {
            var fullreloadProperties = [];

            // Get full page reload properties from template
            if (doc) {
                var metaTags = query("input[data-epi-full-refresh-property-names][type='hidden']", doc);
                array.forEach(metaTags, function (tag) {
                    array.forEach(tag.dataset.epiFullRefreshPropertyNames.split(","), function (propertyName) {
                        if (!array.some(fullreloadProperties, function (p) {
                            return p === propertyName;
                        })) {
                            fullreloadProperties.push(epiString.pascalToCamel(propertyName));
                        }
                    });
                });
            }

            // Get full page reload properties from metadata
            array.forEach(this.viewModel.metadata.properties, function (property) {
                if (property.additionalValues["reloadOnChange"] === true) {
                    fullreloadProperties.push(epiString.pascalToCamel(property.name));
                }
            });

            if (!fullreloadProperties.length) {
                return null;
            }
            //create a full page update controller
            var pageUpdateController = new UpdateController({
                displayName: "",
                renderManager: this._renderManager,
                contentModel: this.viewModel.contentModel,
                modelPropertyName: fullreloadProperties,
                renderSettings: { isFullReload: true }
            });

            return pageUpdateController;
        },

        _remapUpdateControllers: function (doc) {
            var editableNodes = this._getEditableNodes(doc);

            // Remap update controller that connected to old nodes. Also remove the old fullpage update controller
            var unmappedNodes = this._mappingManager.remap(editableNodes);

            //Create new update controllers for nodes that was newly added
            array.forEach(unmappedNodes, function (editableNode) {
                var property = editableNode.property;
                var updateController = this._createNodeUpdateController(editableNode);

                when(this._createNodeOverlay(editableNode), lang.hitch(this, function (overlayItem) {
                    this._connectUpdateControllerAndOverlayEvents(updateController, overlayItem);
                    this._mappingManager.add({
                        blockPropertyInfo: property,
                        node: editableNode.node,
                        updateController: updateController,
                        overlayItem: overlayItem
                    });
                }));

                //Cache the block's initial rendering.
                this._renderManager.cacheRender(property.name, property.renderSettings, this.viewModel.getProperty(property.name), editableNode.node.innerHTML);
            }, this);

            // Recreate new fullpage update controller
            var fullpageUpdateController = this._createFullPageUpdateController(doc);
            if (fullpageUpdateController) {
                this._connectFullPageUpdateControllerEvents(fullpageUpdateController);
                this._mappingManager.add({
                    updateController: fullpageUpdateController
                });
            }
        },

        _connectUpdateControllerAndOverlayEvents: function (updateController, overlayItem) {
            if (updateController) {
                this.ownByKey("overlay",
                    aspect.after(updateController, "onReloadRequired", lang.hitch(this, this._onBlockReloadRequired), true),
                    aspect.after(updateController, "onRender", lang.hitch(this, this._onBlockRender), true));
            }
            if (overlayItem) {
                this.ownByKey("overlay",
                    aspect.after(overlayItem, "onClick", lang.hitch(this, this._onOverlayItemClick), true),
                    aspect.after(overlayItem, "onValueChange", lang.hitch(this, function (value) {
                        this._onOverlayValueChange(overlayItem, value);
                    }), true));
            }
        },

        _connectFullPageUpdateControllerEvents: function (fullpageUpdateController) {
            this.destroyByKey("fullpageoverlay");

            this.ownByKey("fullpageoverlay",
                aspect.after(fullpageUpdateController, "onReloadRequired", this._onBlockReloadRequired.bind(this), true),
                aspect.after(fullpageUpdateController, "onRender", this._onBlockRender.bind(this), true));
        },

        _getEditor: function (/*Object*/overlayItem) {
            // summary:
            //      Get wrapper editor
            // overlayItem:
            //      Current overlay item that accepting drop
            // tags:
            //      private

            var mapping = this._mappingManager.findOne("overlayItem", overlayItem);

            return (mapping.wrapper && mapping.wrapper.editorWidget) ? mapping.wrapper.editorWidget : null;
        },

        onEditorWrapperCreated: function (/*Object*/editorWrapper) {
            // summary:
            //      Triggered when the active editor wrapper created.
            //
            // editorWrapper:
            //      The created editor wrapper
            //
            // tags:
            //    public, callback
        },

        _onOverlayItemClick: function (overlayItem) {
            // Do not continue if a wrapper is already being created
            if (this._isCreatingWrapper) {
                return;
            }
            this._isCreatingWrapper = true;

            var mapping = this._mappingManager.findOne("overlayItem", overlayItem);

            var property = mapping.blockPropertyInfo;
            var val = this.viewModel.getProperty(mapping.propertyName);

            var value = lang.clone(val, true);

            var wrapper;

            var wrapperCreated = lang.hitch(this, function (wrapper) {
                // store wrapper if we want to reuse it
                mapping.wrapper = wrapper;
                this._activeEditorWrapper = wrapper;

                topic.publish("/epi/layout/pinnable/propertyEditor/show", null);

                // TODO: force a save for legacy properties? or close open currentWrapper
                // if saving: use deferred to not open this wrapper until save is done

                array.forEach(this._mappingManager.find(), function (m) {
                    if (m.overlayItem) {
                        m.overlayItem.set("active", false);
                    }
                });

                mapping.overlayItem.set("active", true);

                // start editing
                var editorParams = { value: value, parent: wrapper };
                when(wrapper.startEdit(editorParams)).always(lang.hitch(this, function () {
                    this._isCreatingWrapper = null;
                }));

                this.overlay.set("readOnly", wrapper.isOverlayDisabled);
                this.viewModel.set("disableUndo", wrapper.isUndoDisabled);
            });

            if (mapping.wrapper) {
                wrapper = mapping.wrapper;
                if (wrapper && wrapper.editorWidget && !wrapper.editorWidget.overlayItem) {
                    wrapper.editorWidget.overlayItem = overlayItem;
                }
                wrapper.set("blockDisplayNode", mapping.node);

                wrapperCreated(wrapper);
            } else {
                // create new wrapper
                when(this._createEditorWrapper(property, overlayItem, mapping.node, value), lang.hitch(this, function (wrapper) {
                    wrapperCreated(wrapper);
                    this.onEditorWrapperCreated(wrapper);
                }));
            }
        },

        _createEditorWrapper: function (property, overlayItem, node, value) {
            // summary:
            //		Create editor wrapper for property in template.
            // description:
            //      By default, editor wrappers are created using EditorFactory. Override to implement custom creation, for example: FormEditing creates FormEditorWrapper all the times
            // tags:
            //		protected
            var def = new Deferred(),
                options = { overlayItem: overlayItem };

            when(this.editorFactory.createEditor(property, node, value, options), lang.hitch(this, function (wrapper) {
                this.ownByKey("overlay",
                    aspect.after(wrapper, "onValueChange", lang.hitch(this, this._onWrapperValueChange), true),
                    aspect.after(wrapper, "onCancel", lang.hitch(this, this._onWrapperCancel), true),
                    aspect.after(wrapper, "onStopEdit", lang.hitch(this, this._onWrapperStopEdit), true));

                def.resolve(wrapper);
            }), def.reject);

            return def;
        },

        _onBlockReloadRequired: function (updateController) {

            var reload = function () {
                // If currently editing inline, don't reload
                if (this._activeEditorWrapper && this._activeEditorWrapper.hasInlineEditor) {
                    return;
                }
                if (this._deferredReloadHandle) {
                    this._deferredReloadHandle.remove();
                    this._deferredReloadHandle = null;
                }

                this._toggleUndoRedoActions(false, false);
                this.onReloadRequired();
            }.bind(this);

            if (this.viewModel.isSaved) {
                reload();
            } else {
                if (!this._deferredReloadHandle) {
                    this.own(this._deferredReloadHandle = aspect.after(this.viewModel, "onPropertySaved", reload, true));
                }
            }
        },

        _onBlockRender: function (updateController) {
            var mapping = this._mappingManager.findOne("updateController", updateController);

            if (mapping && mapping.overlayItem) {
                mapping.overlayItem.refresh();
            }
        },

        _saveEditorChanges: function (/*Object*/overlayItem, /*Object*/data) {
            // summary:
            //      Update active editor widget value
            // overlayItem:
            //      Current overlay item that accepting drop
            // data:
            //      Array of objects
            // tags:
            //      private

            var editor = this._getEditor(overlayItem);
            if (editor && !editor.overlayItem) {
                editor.overlayItem = overlayItem;
            }
            if (editor && editor.saveChanges) {
                editor.saveChanges(editor, data);
            }
        },

        _onOverlayValueChange: function (overlayItem, data) {
            // summary:
            //      Handler for single or multiple property changes
            // overlayItem: Object
            //      Current overlay item that accepting drop
            // data: Object || Array
            //      The properties to change n format {propertyName: "myName", value: propertyValue}
            // tags:
            //      Private

            this._saveEditorChanges(overlayItem, data.value);

            this.viewModel.setProperty(data.propertyName, data.value);
        },

        _onWrapperValueChange: function (wrapper, value, oldValue) {
            var mapping = this._mappingManager.findOne("wrapper", wrapper),
                propertyName = mapping.propertyName;
            // If this change from dnd then it will saved when "/dnd/stop"

            if (mapping.overlayItem) {
                mapping.overlayItem.set("updated", true);
            }

            // Begin an operation if not already started
            this.viewModel.beginOperation();

            // Save the property
            this.viewModel.setProperty(propertyName, value, oldValue);
        },

        _onWrapperStopEdit: function (wrapper, value, oldValue, implicitExit) {
            var mapping = this._mappingManager.findOne("wrapper", wrapper);

            // End the ongoing operation, commit the value
            this.viewModel.endOperation();

            if (mapping.overlayItem) {
                mapping.overlayItem.set("active", false);
            }

            this._activeEditorWrapper = null;
            this.overlay.set("readOnly", false);
            this.viewModel.set("disableUndo", false);
        },

        _onWrapperCancel: function (wrapper, implicitExit) {

            var mapping = this._mappingManager.findOne("wrapper", wrapper),
                updateController = mapping.updateController;

            // Abort the current operation
            this.viewModel.abortOperation();

            // force re-render on block if it has rerenderOnCancel
            if (updateController && updateController.renderSettings && updateController.renderSettings.rerenderOnCancel) {
                updateController.render();
            }

            if (mapping.overlayItem) {
                mapping.overlayItem.set("active", false);
            }

            this._activeEditorWrapper = null;
            this.overlay.set("readOnly", false);
            this.viewModel.set("disableUndo", false);
        },

        _onPropertyReverted: function (propertyName, oldValue) {
            this._mappingManager.find("propertyName", propertyName).forEach(function (mapping) {
                var wrapper = mapping.wrapper,
                    editing;

                if (wrapper) {
                    editing = wrapper.get("editing");
                    wrapper.set("editing", false);
                    wrapper.set("value", oldValue);
                    wrapper.set("editing", editing);
                }
            });
        },

        _toggleUndoRedoActions: function (hasUndoSteps, hasRedoSteps) {
            // summary:
            //   Disable Undo & Redo actions when selecting Schedule for Publish or Ready to Publish
            //
            // tags:
            //    private

            this._setCommandEnabled("undo", !!hasUndoSteps);
            this._setCommandEnabled("redo", !!hasRedoSteps);
        }
    });
});
