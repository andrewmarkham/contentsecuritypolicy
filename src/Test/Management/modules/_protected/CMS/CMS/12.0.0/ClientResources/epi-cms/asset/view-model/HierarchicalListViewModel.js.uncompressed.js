define("epi-cms/asset/view-model/HierarchicalListViewModel", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/aspect",
    "dojo/Evented",

    "dojo/Stateful",
    "dojo/when",
    "dojo/promise/all",
    "dijit/registry",
    "dijit/Destroyable",
    //epi
    "epi",
    "epi/dependency",

    "epi/shell/ClipboardManager",
    "epi/shell/command/_CommandProviderMixin",
    "epi/shell/selection",
    "epi/shell/TypeDescriptorManager",
    //epi-cms
    "epi-cms/_MultilingualMixin",
    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/_ContextualContentContextMixin",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/ContentForestStoreModel",
    "epi-cms/widget/ContextualContentForestStoreModel",
    //command
    "epi-cms/widget/CreateCommandsMixin",
    "epi-cms/command/CopyContent",
    "epi-cms/command/CutContent",
    "epi-cms/command/DeleteContent",
    "epi-cms/command/PasteContent",
    "epi-cms/component/command/ViewTrash",
    "epi-cms/asset/command/ChangeContextToSelection",
    "epi-cms/asset/command/NewFolder",
    "epi-cms/asset/command/RenameSelectedFolder",
    "epi-cms/asset/command/TranslateSelectedContent",
    "epi-cms/plugin-area/assets-pane"
],

function (
// dojo
    array,
    declare,
    lang,
    topic,
    aspect,
    Evented,

    Stateful,
    when,
    all,
    registry,
    Destroyable,
    // epi
    epi,
    dependency,

    ClipboardManager,
    _CommandProviderMixin,
    Selection,
    TypeDescriptorManager,
    //epi-cms
    _MultilingualMixin,
    ApplicationSettings,
    _ContextualContentContextMixin,
    ContentReference,
    ContentForestStoreModel,
    ContextualContentForestStoreModel,
    //command
    CreateCommandsMixin,
    CopyContentCommand,
    CutContentCommand,
    DeleteContentCommand,
    PasteContentCommand,
    ViewTrashCommand,
    ChangeContextToSelectionCommand,
    NewFolderCommand,
    RenameSelectedFolderCommand,
    TranslateSelectedContentCommand,
    assetsPanePluginArea
) {

    return declare([Stateful, Evented, _ContextualContentContextMixin, _MultilingualMixin, CreateCommandsMixin, Destroyable], {
        // summary:
        //      Handles search and tree to list browsing widgets.
        //
        // tags:
        //      internal

        // searchArea: [readonly] String
        //      Used with the search component when querying to scope the search.
        searchArea: "",

        // searchRoots: [readonly] String
        //      Used with the search component to set the roots to search in.
        searchRoots: "",

        // clipboardManager: [const] ClipboardManager
        //      Used to handle copy-paste operations with the commands.
        clipboardManager: null,

        // selection: [const] Selection
        //      Used to handle currently selected items for the commands.
        selection: null,

        // commands: [readonly] _Command[]
        //      Used to handle currently selected items for the commands.
        commands: null,

        // createCommands: [readonly] _Command[]
        //      Used to handle currently selected items for the commands.
        createCommands: null,

        // createHierarchyCommands: [readonly] _Command[]
        //      Used to handle currently selected items for the commands.
        createHierarchyCommands: null,

        // pseudoContextualCommands: [readonly] _Command[]
        //      Used to handle currently selected items for the commands.
        pseudoContextualCommands: null,

        // treePaths: [public] Array[]
        //      An array of arrays containing a hierarchy of content items starting with the root
        //      and ending with the actual item being selected.
        treePaths: null,

        // selectedTreeItems: [public] Array
        //      The currently selected tree items.
        selectedTreeItems: null,

        // selectedListItems: [public] Array
        //      An array containing the currently selected list items.
        selectedListItems: null,

        // listQuery: Query
        //      Query object holding parameters to get the children.
        //      of the current tree item
        listQuery: null,

        // listQueryOptions: Object
        //      Extra parameters needed to query the store for the list items.
        listQueryOptions: null,

        // showAllLanguages: Boolean
        //      Indicates if to query for items only in current language context or not.
        showAllLanguages: true,

        // treeStoreModelClass: [const] Function
        //      Class to use as model for the tree.
        treeStoreModelClass: null,

        // treeStoreModel: [const] TreeStoreModel
        //      TreeStoreModel instance.
        treeStoreModel: null,

        // store: [const] Dojo/Store
        //      Store instance used for all server queries.
        store: null,

        // searchStore: [const] Dojo/Store
        //      Store instance used for all server search queries.
        searchStore: null,

        // storeKey: [const] String
        //      Key to resolve store from dependency.
        storeKey: "epi.cms.content.light",

        // mainNavigationTypes: String[]
        //      Which types to filter for tree queries. Also used with trash command.
        mainNavigationTypes: null,

        // containedTypes: [const] String[]
        //       Which types to filter for list queries.
        containedTypes: null,

        // noDataMessages: [public] Object
        //      Object containing the texts for when the list contains no items. It should have two properties named single and multiple.
        noDataMessages: null,

        // noDataMessage: [public] String
        //      String to be displayed in the list when no items are returned from the store.
        noDataMessage: "",

        // profile: [private] shell/Profile
        //       The current users profile that is used to store settings.
        _profile: null,

        // _commandItems: [private] Array
        //      An array containing the currently selected items used in the commands.
        _commandItems: null,

        // _pluginCommands: [private] Array
        //      An array containing the commands loaded from the plugin area.
        _pluginCommands: null,

        constructor: function () {

            // Create the command registry
            this._commandRegistry = {
                sort: function () {
                    var commands = [];
                    for (var key in this) {
                        if (key !== "toArray" && key !== "sort" && this.hasOwnProperty(key)) {
                            var index = this[key].order;
                            if (!index) {
                                index = 100;
                            }
                            commands.push([index, this[key].command]);
                        }
                    }

                    commands.sort(function (a, b) {
                        return a[0] - b[0];
                    });

                    return commands;
                },
                toArray: function () {
                    var sortedCommand = this.sort();
                    var commands = [];
                    array.forEach(sortedCommand, function (key) {
                        commands.push(key[1]);
                    });

                    return commands;
                }
            };

            this.own(assetsPanePluginArea.on("added, removed", this._setCommands.bind(this)));
        },

        postscript: function (args) {
            this.inherited(arguments);
            this.contentRepositoryDescriptors = this.contentRepositoryDescriptors || dependency.resolve("epi.cms.contentRepositoryDescriptors");
            declare.safeMixin(this, this.contentRepositoryDescriptors.get(args.repositoryKey));

            this._profile = this._profile || dependency.resolve("epi.shell.Profile");
            this.clipboardManager = this.clipboardManager || new ClipboardManager();
            this.selection = this.selection || new Selection();
            this.store = this.store || dependency.resolve("epi.storeregistry").get(this.storeKey);
            this.searchStore = this.searchStore || dependency.resolve("epi.storeregistry").get("epi.cms.content.search");

            this._setupTreeStoreModel();

            this._setupCommands();
            this._setCommands();


            this._setupSearchRoots();

            this.set("listQueryOptions", this.treeStoreModel._queryOptions);
        },

        startup: function () {
            // summary:
            //      Allows the view model to start reacting to external input.
            // tags:
            //      protected

            this.inherited(arguments);

            this._setupSelection();
        },

        getCommand: function (commandName) {
            // summary:
            //      Gets a command by command name
            // tags:
            //      protected

            return this._commandRegistry[commandName] ? this._commandRegistry[commandName].command : null;
        },

        contentContextChanged: function (context, callerData) {
            // summary:
            //      Called when the currently loaded content changes. I.e. a new content data object is loaded into the preview area.
            //      Override _ContextContextMixin.contentContextChanged
            // tags:
            //      protected

            this._setupSearchRoots();

            if (!this._isSupportedContent(context)) {
                return;
            }

            this.selectItemsByContentReference(context.id, false);
        },

        selectItemsByContentReference: function (contentLink, allowAssetsFolderSelection) {
            // summary:
            //      sets both tree folder path and grid selected items based on provided contentLink
            // contentLink: ContentReference?
            //      id of the content that should be selected in the component
            // allowAssetsFolderSelection: Boolean?
            //      if true then allow to select path when image is in Assets Folder
            // tags:
            //      public

            if (!contentLink) {
                return;
            }

            var contentReference = ContentReference.toContentReference(contentLink);

            when(this.store.get(contentReference.createVersionUnspecificReference().toString()), function (content) {

                this.treeStoreModel.getAncestors(content, function (ancestors) {

                    if (!allowAssetsFolderSelection && this._isAncestorAssetFolder(ancestors)) {
                        // If an ancestor is a asset folder we will not update the paths here.
                        // We will handle those cases in updateTreePaths at a later stage.
                        return;
                    }

                    var newListSelection = [];
                    // when content is a ContentFolder then it should be used to select tree path
                    // otherwise it should be used to select item on the list
                    if (content.capabilities.isContentFolder) {
                        ancestors.push(content);
                    } else {
                        newListSelection.push(content);
                    }

                    var newTreeSelection = [ancestors];

                    if (epi.areEqual(this.get("treePaths"), newTreeSelection) && epi.areEqual(this.get("selectedListItems"), newListSelection)) {
                        return;
                    }

                    this.emit("setPathsAndItems", newTreeSelection, newListSelection);
                }.bind(this));
            }.bind(this));
        },

        selectListItemsByContentReferences: function (contentLinks) {
            // summary:
            //      sets selected list items by fetching an array of content data from store
            // contentLinks: Array
            //      references of content items that should be selected
            // tags:
            //      public

            all(contentLinks.map(function (contentLink) {
                return when(this.store.get(contentLink));
            }.bind(this))).then(function (contentItems) {
                this.set("selectedListItems", contentItems);
            }.bind(this));
        },

        _isAncestorAssetFolder: function (ancestors) {
            // summary:
            //      Checks if any ancestor is an asset folder.
            // ancestors:
            //      The ancestors to a content.
            // returns:
            //      true, if any ancestor is an content asset folder; otherwise false.
            // tags:
            //      private

            //if there is only one ancestor we can be sure that this is an item in an asset folder.
            if (ancestors.length === 1) {
                return true;
            }

            return ancestors.some(function (ancestor) {
                return this._isAssetsFolder(ancestor);
            }.bind(this));
        },

        _isAssetsFolder: function (content) {
            // summary:
            //      Checks if a content is an asset folder.
            // content:
            //      The content to check if it's an asset folder.
            // returns:
            //      true, if the specified content is a content asset folder; otherwise false.
            // tags:
            //      private

            return content.typeIdentifier === "episerver.core.contentassetfolder" ||
                    ContentReference.compareIgnoreVersion(content.contentLink, ApplicationSettings.contentAssetsFolder);
        },

        updateTreePaths: function (rootChildItems) {
            // summary:
            //      Updates the treePaths value by comparing the existing treePaths with the new child items of the tree root.
            // rootChildItems:
            //      The new child items to the tree's root.
            // tags:
            //      public

            var treePaths = this.get("treePaths");

            if (!treePaths || !treePaths.length) {
                return;
            }

            var assetsFolderIndex = this._getAssetFolderIndex(treePaths);

            if (this._selectionContainsAssetFolder(assetsFolderIndex)) {

                var treePathsCopy = lang.clone(treePaths);

                this._removeOldAssetFolder(treePathsCopy, assetsFolderIndex);

                this._addNewAssetFolder(rootChildItems, treePathsCopy);

                if (!treePathsCopy.length) {
                    treePathsCopy = this._getDefaultTreePaths();
                }

                when(treePathsCopy).then(function (resolvedPaths) {
                    this.set("treePaths", resolvedPaths);
                }.bind(this));
            }
        },

        _getAssetFolderIndex: function (treePaths) {
            // summary:
            //      Gets the index of any treePath that contains an asset folder if any exist.
            // treePaths:
            //      The tree paths where we look for asset folders.
            // returns:
            //      The index of the tree path that contains an asset folder; otherwise -1.
            // tags:
            //      private

            var assetsFolderIndex = -1;

            treePaths.some(function (treePath, index) {
                return treePath.some(function (content) {
                    var isAssetFolder = this._isAssetsFolder(content);
                    if (isAssetFolder) {
                        assetsFolderIndex = index;
                    }
                    return isAssetFolder;
                }.bind(this));
            }.bind(this));

            return assetsFolderIndex;
        },

        _selectionContainsAssetFolder: function (assetsFolderIndex) {
            // summary:
            //      Removes the old asset folder from the specified treePaths.
            // assetsFolderIndex:
            //      The index of the tree path that contains an asset folder.
            // returns:
            //      true if the index is bigger than -1; otherwise false.
            // tags:
            //      private

            return assetsFolderIndex > -1;
        },

        _removeOldAssetFolder: function (treePaths, oldAssetFolderIndex) {
            // summary:
            //      Removes the old asset folder from the specified treePaths.
            // treePaths:
            //      The tree paths that includes the asset folder path that will be removed.
            // oldAssetFolderIndex:
            //      The index of the tree path that will be removed.
            // tags:
            //      private

            treePaths.splice(oldAssetFolderIndex, 1);
        },

        _addNewAssetFolder: function (rootChildItems, treePaths) {
            // summary:
            //      Adds a new tree path to an asset folder if any exists in the specified rootChildItems.
            // rootChildItems:
            //      An array with content items that may contain asset folders.
            // treePaths:
            //      The tree paths that any new path will be added to.
            // tags:
            //      private

            rootChildItems.some(function (content) {
                var isAssetFolder = this._isAssetsFolder(content);
                if (isAssetFolder) {
                    treePaths.push([this.treeStoreModel.root, content]);
                }
                return isAssetFolder;
            }.bind(this));
        },

        setSearchText: function (searchText) {
            // summary:
            //      Updates the search results and commands.
            // searchText:
            //      The text the user is searching for.
            // tags:
            //      protected
            var isSearching = !!searchText;
            this.set("isSearching", isSearching);

            this._updateSearchListQuery(searchText);
            var selectedItems = isSearching ? null : this.get("selectedListItems") || this.get("selectedTreeItems");
            this._updateCommands(selectedItems);
        },

        onListItemUpdated: function (updatedItems) {
            // summary:
            //      Refresh the editing media if it have a new version
            // updatedItems: [Array]
            //      Collection of the updated item
            // tags:
            //      public, extension
        },

        _isSupportedContent: function (/*Object*/content) {
            // summary:
            //      Indicates whether the given content is a type contained by this widget.
            // content:
            //      Object to validate
            // tags:
            //      private
            return !!(content && content.id) && this.containedTypes.some(function (type) {
                return TypeDescriptorManager.isBaseTypeIdentifier(content.dataType, type);
            });
        },

        _showAllLanguagesSetter: function (value) {
            this.showAllLanguages = value;
            this._updateListQuery(this.selectedTreeItems);

            // If we are searching we need to re-run the query otherwise the search result will still contain content in other languages
            if (this.get("isSearching")) {
                var searchListQuery = this.get("searchListQuery");
                this._updateSearchListQuery(searchListQuery.queryText);

            }
            this.treeStoreModel.set("showAllLanguages", value);
        },

        setTreePaths: function (treePaths) {
            // summary:
            //      This is called whenever a user clicks in the components folder tree.
            // treePaths: Array[]
            //      An array of arrays containing a hierarchy of content items starting with the root
            //      and ending with the actual item being selected.
            // tags:
            //      public

            // We call the custom setter directly here instead of using this.set("treePaths") because we
            // don't want want to update any watchers. The tree in the component should already have the correct selection.
            if (!epi.areEqual(treePaths, this.get("treePaths"))) {
                this._treePathsSetter(treePaths);
            }
        },

        _treePathsSetter: function (value) {
            // summary:
            //      Stores the treePaths value and resets the list selection.
            //      Calling set("treePaths", value) should update the corresponding components tree selection.
            // value: Array[]
            //      An array of arrays containing a hierarchy of content items starting with the root
            //      and ending with the actual item being selected.
            // tags:
            //      protected

            this.treePaths = value;

            this._saveTreePaths(value);

            // By using this._changeAttrValue instead of this.set("selectedListItems", null) we will update any
            // watchers (IE update selection in list component) without forcing this model to update the commands
            // several times in a row.
            this._changeAttrValue("selectedListItems", null);

            var treePaths = lang.clone(value);
            // The last item in every treePath array is the item that is selected.
            // We grab the last item and store that as the selectedTreeItems property.
            var selectedItems = treePaths ? treePaths.map(function (path) {
                return path.pop();
            }) : null;

            this.set("selectedTreeItems", selectedItems);
        },

        _selectedTreeItemsSetter: function (value) {
            // summary:
            //      Updates the commands with the specified value and updates the list query.
            // value:
            //      The selected tree items.
            // tags:
            //      protected

            this.selectedTreeItems = value;

            this._updateListQuery(value);

            if (!this.get("isSearching")) {
                this._updateCommands(value);
            }
        },

        setSelectedListItems: function (selectedListItems) {
            // summary:
            //      This is called whenever a user clicks in the components content list.
            // selectedListItems:
            //      The items that is currently selected in the list.
            // tags:
            //      public

            // We call the custom setter directly here instead of using this.set("selectedListItems") because we
            // don't want want to update any watchers. The list in the component should already have the correct selection.
            this._selectedListItemsSetter(selectedListItems);
        },

        _selectedListItemsSetter: function (value) {
            // summary:
            //      Updates the commands with the specified value.
            //      Calling set("selectedTreeItems", value) should update the corresponding components list selection.
            // value:
            //      The selected list items.
            // tags:
            //      protected

            this.selectedListItems = value;

            if (!this.get("isSearching")) {
                this._updateCommands(value);
            }
        },

        setSelectedSearchResults: function (selectedSearchResults) {
            // summary:
            //      This is called whenever a user clicks in the components search results.
            // selectedSearchResults:
            //      The items that is currently selected in the search results.
            // tags:
            //      public

            // We call the custom setter directly here instead of using this.set("selectedSearchResults") because we
            // don't want want to update any watchers. The search results in the component should already have the correct selection.
            this._selectedSearchResultsSetter(selectedSearchResults);
        },

        _selectedSearchResultsSetter: function (value) {
            // summary:
            //      Updates the commands with the specified value.
            // value:
            //      The selected search results.
            // tags:
            //      protected

            this.selectedSearchResults = value;
            this._updateCommands(value);
        },

        updateTreeCommands: function () {
            // summary:
            //      Updates the commands with the currently selected tree items.
            // tags:
            //      public

            this._updateCommands(this.get("selectedTreeItems"));
        },

        updateListCommands: function () {
            // summary:
            //      Updates the commands with the currently selected list items.
            // tags:
            //      public

            this._updateCommands(this.get("selectedListItems"));
        },

        _setupSelection: function () {
            // summary:
            //      Get target tree item and list item for selection
            // tags:
            //      protected

            //if we have no roots, we should not select anything.
            if (!this.roots || !this.roots.length) {
                return  null;
            }

            when(this.getCurrentContext(), function (ctx) {
                if (this._isSupportedContent(ctx)) {
                    this.contentContextChanged(ctx, null);
                    return;
                }
                when(this._loadTreePaths()).then(function (paths) {
                    if (!paths) {
                        paths = this._getDefaultTreePaths();
                    }

                    when(paths).then(function (paths) {
                        this.set("treePaths", paths);
                    }.bind(this));

                }.bind(this));
            }.bind(this));
        },

        _getDefaultTreePaths: function () {
            // summary:
            //      Gets a tree paths that contains the treeStoremodel root and the first root item.
            // tags:
            //      private

            if (!this.roots || !this.roots.length) {
                return [];
            }

            // TODO: Fix this hack of always using the first item in roots
            var rootId = ContentReference.toContentReference(this.roots[0]).toString();
            return this.store.get(rootId).then(function (model) {
                return [[this.treeStoreModel.root, model]];
            }.bind(this));
        },

        _setupTreeStoreModel: function () {
            // summary:
            //      Creates an configures the treeStoreModel.
            // tags:
            //      protected

            if (!this.treeStoreModelClass) {
                //Assign the default tree store model class if no custom one has been assigned.
                this.treeStoreModelClass = this.enableContextualContent ? ContextualContentForestStoreModel : ContentForestStoreModel;
            }

            var treeModel = this.treeStoreModel || new this.treeStoreModelClass({
                store: this.store,
                roots: this.roots,
                typeIdentifiers: this.mainNavigationTypes,
                containedTypes: this.containedTypes,
                notAllowToCopy: this.preventCopyingFor,
                notAllowToDelete: this.preventDeletionFor,
                notSupportContextualContents: this.preventContextualContentFor,
                autoSelectPastedItem: false,
                onAddDelegate: lang.hitch(this, function (node) {
                    var targetNode = registry.getEnclosingWidget(node.domNode),
                        target = targetNode && targetNode.item,
                        canExecute = (typeof (this.treeStoreModel.canEdit) === "function") && this.treeStoreModel.canEdit(target);

                    if (canExecute) {
                        node.edit();


                        // Publish the children change AFTER the user has change the name of the new folder or canceled the editor
                        // REMARK: We need to do this after the change otherwise the editing will be canceled because the children change replaced the child items in the tree
                        // TODO: This should be handled by the tree model
                        var publish = function () {
                            topic.publish("/epi/cms/contentdata/childrenchanged", target.parentLink);
                        };

                        var handle = node.on("rename", function () {
                            handle.remove();

                            publish();
                        });

                        var cancelHandle = node.on("cancelEdit", function () {
                            cancelHandle.remove();

                            publish();
                        });

                    }
                }),
                onRefreshRoots: lang.hitch(this, this._setupSearchRoots),
                onPasteItemsFailed: lang.hitch(this, this._pasteItemsFailed),
                additionalQueryOptions: {
                    sort: this._getSortSettings()
                }
            });

            // The ContentTreeModel is a destroyable, so we need to own it and clean up when this model is destroyed
            this.own(treeModel, aspect.after(treeModel, "rename", this._afterRename.bind(this)));

            this.set("treeStoreModel", treeModel);
        },

        _afterRename: function (renamePromise) {
            // summary:
            //      Updates selectedTreeItems property when treeModel rename is executed.
            // tags:
            //      private

            return renamePromise.then(function (renamedItem) {
                // the item returned by rename method came from ContentDataStore
                // and selectedTreeItems expects data from ContentStore

                // we have to use refresh instead of get to make sure that we are using latest version from dependant store
                return this.store.refresh(renamedItem.contentLink)
                    .then(function (item) {
                        var selectedTreeItems = this.selectedTreeItems;
                        if (selectedTreeItems && selectedTreeItems.length === 1) {
                            if (selectedTreeItems[0].contentLink === item.contentLink) {
                                this.set("selectedTreeItems", [item]);
                            }
                        }
                    }.bind(this));
            }.bind(this));
        },

        _getSortSettings: function () {
            // summary:
            //      Returns the list of sort criteria.
            // tags:
            //      protected

            return [{ attribute: "name", descending: false }];
        },

        _setupSearchRoots: function () {
            // summary:
            //      Creates and configures the treeStoreModel.
            // tags:
            //      protected

            var roots = this.roots instanceof Array && this.roots.length > 0 ? lang.clone(this.roots) : [];
            when(this.getCurrentContent()).then(lang.hitch(this, function (content) {

                var assetsFolderLink = content && content.assetsFolderLink;
                if (assetsFolderLink && typeof this._getPseudoContextualContent === "function" && assetsFolderLink !== this._getPseudoContextualContent()) {
                    roots.push(assetsFolderLink);
                }
            })).always(lang.hitch(this, function () {
                this.set("searchRoots", roots.join(","));
            }));
        },

        _setupCommands: function () {
            // summary:
            //      Creates and registers the commands used.
            // tags:
            //      protected

            var settings = {
                category: "context",
                model: this.treeStoreModel,
                selection: this.selection,
                clipboard: this.clipboardManager
            };

            this.createHierarchyCommands = {};
            var index = 1;

            // Create commands for the navigation types.
            array.forEach(this.mainNavigationTypes, function (type) {
                this.createHierarchyCommands[type] = {
                    command: new NewFolderCommand(lang.mixin({ typeIdentifier: type }, settings)),
                    order: index
                };
                index = index + 1;
            }, this);

            this.createCommands = this.getCreateCommands(index);

            var editableTypes = array.filter(this.containedTypes, function (item) {
                return this.mainNavigationTypes.indexOf(item) < 0;
            }, this);

            var commands = {
                rename: {
                    command: new RenameSelectedFolderCommand(settings),
                    order: 10
                },
                cut: {
                    command: new CutContentCommand(settings),
                    order: 20
                },
                copy: {
                    command: new CopyContentCommand(settings),
                    order: 30
                },
                paste: {
                    command: new PasteContentCommand(lang.mixin({
                        typeIdentifiers: this.mainNavigationTypes
                    }, settings)),
                    order: 40
                },
                edit: {
                    command: new ChangeContextToSelectionCommand(lang.mixin({
                        forceReload: true,
                        forceContextChange: true,
                        typeIdentifiers: editableTypes
                    }, settings)),
                    order: 3
                },
                translate: {
                    command: new TranslateSelectedContentCommand(settings)
                },
                "delete": {
                    command: new DeleteContentCommand(settings),
                    order: 50
                },
                trash: {
                    command: new ViewTrashCommand({ typeIdentifiers: this.mainNavigationTypes, order: 60 }),
                    order: 60
                }
            };

            this._commandRegistry = lang.mixin(this._commandRegistry, this.createHierarchyCommands, this.createCommands, commands);
            this.pseudoContextualCommands = this._getPseudoContextualCommands();
        },

        _setCommands: function () {
            // summary:
            //      Sets the commands from the hierarchical list plugin area and the command registry
            // tags:
            //      private

            var pluginCommands = [];
            assetsPanePluginArea.get().forEach(function (command) {
                command.category = "context";
                pluginCommands.push(command);
            });
            this._pluginCommands = pluginCommands;

            var commands = this._commandRegistry.toArray().concat(pluginCommands);
            this.set("commands", commands);
        },

        _pasteItemsFailed: function (ignoredItems) {
            // summary:
            //      Configures the items list based on the result of the paste operation.
            // tags:
            //      private

            this.set("selectedListItems", ignoredItems);
        },

        _updateListQuery: function (items) {
            // summary:
            //      Creates a new query and updates the listQuery property.
            // tags:
            //      protected

            var query = null;

            if (items && items.length > 0) {
                query = this._createListChildrenQuery(items);
                this.set("noDataMessage", items.length > 1 ? this.noDataMessages.multiple : this.noDataMessages.single);
            }

            this.set("listQuery", query);
        },

        _createListChildrenQuery: function (items) {
            // summary:
            //      Creates a new query .
            // tags:
            //      private

            // remove all mainNavigationTypes from containedTypes, to avoid of displaying Folder in Content List
            var contentTypes = array.filter(this.containedTypes, function (item) {
                return this.mainNavigationTypes.indexOf(item) < 0;
            }, this);

            var ids = items.map(function (item) {
                return item.contentLink.toString();
            });

            return { references: ids, query: "getpagedchildren", allLanguages: this.showAllLanguages, typeIdentifiers: contentTypes };
        },

        _updateSearchListQuery: function (searchText) {
            // summary:
            //      Creates a new query and updates the listQuery property.
            // tags:
            //      protected

            var query = null;

            if (searchText) {
                query = this._createListSearchQuery(searchText);
            }

            this.set("searchListQuery", query);
        },

        _createListSearchQuery: function (searchText) {
            return {
                queryText: searchText,
                query: "searchcontent",
                allLanguages: this.showAllLanguages,
                contentSearchAreas: this.get("searchArea"),
                searchRoots: this.get("searchRoots"),
                maxResults: 1000,
                filterDeleted: true
            };
        },

        _updateCommands: function (selectedItems) {
            // summary:
            //      Updates the current model for all commands needing this.
            // tags:
            //      protected

            if (epi.areEqual(this._commandItems, selectedItems)) {
                return;
            }
            this._commandItems = selectedItems;

            this._updateSelection(selectedItems);
            this._updateCommandModels(selectedItems);

            if (selectedItems && selectedItems.length === 1) {
                this.decoratePseudoContextualCommands(this.pseudoContextualCommands);
            }
        },

        _updateSelection: function (selectedItems) {
            // summary:
            //      Updates the selection manager to the selected items. Used when commands execute.
            // tags:
            //      protected

            var selectionData = selectedItems ? selectedItems.map(function (selectedItem) {
                return { type: "epi.cms.contentdata", data: selectedItem };
            }) : [];
            this.selection.set("data", selectionData);
        },

        _updateCommandModels: function (selectedItems) {
            // summary:
            //      Update model of create and plugin commands.
            // tags:
            //      protected

            var commands = this.createCommands;
            for (var key in commands) {
                commands[key].command.set("model", selectedItems);
            }

            this._pluginCommands.forEach(function (command) {
                command.set("model", selectedItems);
            });
        },

        _saveTreePaths: function (treePaths) {
            // summary:
            //      Saves the tree paths on the current profile.
            // treePaths:
            //      The tree paths that should be saved.
            // tags:
            //      private

            this._profile.set(this.componentId + "_treePaths", treePaths);
        },

        _loadTreePaths: function () {
            // summary:
            //      Loads any stored tree paths from the current profile.
            // returns: Promise
            //      The promise will resolve to a stored path if any exists.
            // tags:
            //      private

            return this._profile.get(this.componentId + "_treePaths");
        },

        _getPseudoContextualCommands: function () {
            // summary:
            //      Get commands to decorates
            // returns: [Array]
            //      Array of command object that each is instance of "epi.shell.command._Command" class
            // tags:
            //      private

            var key,
                commands = [];

            for (key in this.createCommands) {
                commands.push(this.createCommands[key].command);
            }

            for (key in this.createHierarchyCommands) {
                commands.push(this.createHierarchyCommands[key].command);
            }

            commands.push(this._commandRegistry.paste.command);

            return commands;
        },

        upload: function (fileList) {
            // summary:
            //      Implementation needs to overwrite this to process upload files action.
            // fileList:
            //      List files to upload.
            //      When null, only show upload form to select files for uploading.
            //      Otherwise, upload files in list.
            // tags:
            //      protected
        }

    });

});
