define("epi-cms/widget/ContentTreeStoreModel", [
// dojo
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/when",
    "dojo/topic",
    // epi
    "epi",
    "epi/dependency",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/_ContextMixin",
    "epi/shell/ViewSettings",

    // EPi CMS
    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/_HierarchicalModelMixin",
    "epi-cms/widget/viewmodel/_UpdateableStoreModelMixin"
],

function (
// dojo
    array,
    connect,
    declare,
    lang,
    Stateful,

    aspect,
    Deferred,
    promiseAll,
    when,
    topic,
    // epi
    epi,
    dependency,
    TypeDescriptorManager,
    _ContextMixin,
    ViewSettings,
    // EPi CMS
    ApplicationSettings,
    ContentActionSupport,
    ContentReference,
    _HierarchicalModelMixin,
    _UpdateableStoreModelMixin
) {

    return declare([Stateful, _HierarchicalModelMixin, _UpdateableStoreModelMixin, _ContextMixin], {
        // summary:
        //      A store model for tree widgets that only support content with a single root.
        //
        // tags:
        //      internal xproduct

        // store: [protected] dojo/store/api/Store
        //		Underlying store that will be queried for page tree items.
        store: null,

        // service: [protected] epi-cms/contentediting/ContentHierarchyService
        //		Service to use when updating data.
        service: null,

        // root: [public] ContentReference|String
        //		Id of the root content
        root: null,

        // notAllowToDelete: [public] List of item that we don't allow to delete. For example: Waste basket, start, root folder,...
        //		Id of the root content
        notAllowToDelete: null,

        // notAllowToCopy: [public] List of item that we don't allow to copy. For example: Waste basket, root folder,...
        //		Id of the root content
        notAllowToCopy: null,

        // typeIdentifiers: [protected] Array | String
        //		The set of type identifiers to be taken into account. Can either be an array or a comma separated string.
        typeIdentifiers: null,

        showAllLanguages: true,

        getChildrenQuery: "getchildren",

        getRootChildrenQuery: null,

        // _observers: [protected] Array
        //		Collection to store all the listeners from observed queries.
        _observers: null,

        // _defaultDataStoreName: [protected] String
        //		Default data store name to get from registry, if store is null.
        _defaultDataStoreName: "epi.cms.content.light",

        // additionalQueryOptions: [protected] Object
        //		Additional query options added when getting children. Set by inherited model.
        additionalQueryOptions: {},

        // createAsLocalAsset: [public] Boolean
        //      Indicate if the content should be created as local asset of its parent.
        createAsLocalAsset: false,

        // autoSelectPastedItem: Boolean
        //      Set to true if the pasted item automatically should be selected
        autoSelectPastedItem: true,

        constructor: function (args) {
            // summary:
            //		Construct the ContentTreeStoreModel object.

            declare.safeMixin(this, args);

            this._observers = {};
            this.store = this.store || dependency.resolve("epi.storeregistry").get(this._defaultDataStoreName);
            this.service = this.service || dependency.resolve("epi.cms.ContentHierarchyService");

            this._queryOptions = lang.mixin({
                ignore: ["query"],
                comparers: {
                    typeIdentifiers: lang.hitch(this, function (queryValue, instance) {
                        return array.some(queryValue, lang.hitch(this, function (item) {
                            return item === instance.typeIdentifier || TypeDescriptorManager.isBaseTypeIdentifier(instance.typeIdentifier, item);
                        }));
                    }),
                    referenceId: function (queryValue, instance) {
                        return ContentReference.compareIgnoreVersion(queryValue, instance.parentLink);
                    },
                    allLanguages: function (queryValue, instance) {
                        if (queryValue || !instance.currentLanguageBranch) {
                            return true;
                        }

                        return epi.areEqual(ApplicationSettings.currentContentLanguage, instance.currentLanguageBranch.languageId);
                    },
                    references: function (queryValue, instance) {
                        return queryValue.some(function (referenceId) {
                            return ContentReference.compareIgnoreVersion(referenceId, instance.parentLink);
                        });
                    }
                },
                sort: this._getSortSettings(this.typeIdentifiers)
            }, this.additionalQueryOptions);

            var updateHandle = connect.subscribe("/epi/cms/contentdata/updated", this, function (updatedContent) {
                var contentLink = new ContentReference(updatedContent.contentLink).createVersionUnspecificReference().toString();
                this.store.refresh(contentLink).then(lang.hitch(this, function () {
                    if (updatedContent.recursive) {
                        this.onItemChildrenReload(updatedContent);
                    }
                }));
            });

            //publish command has been executed: update children
            var childrenChangeHandle = connect.subscribe("/epi/cms/contentdata/childrenchanged", lang.hitch(this, this._childrenChanged));

            //when the store is refreshed, update the item
            var itemNotifyHandle = aspect.after(this.store, "notify", lang.hitch(this, function (item, id) {
                this.onChange(item);
            }), true);

            this._handles = [updateHandle, childrenChangeHandle, itemNotifyHandle];
        },

        destroy: function () {
            // summary:
            //		Destroy the object.

            for (var id in this._observers) {
                if (this._observers[id]) {
                    this._observers[id].remove();
                    this._observers[id] = null;
                }
            }
            if (this._handles) {
                array.forEach(this._handles, function (handle) {
                    handle.remove();
                });

                this._handles = null;
            }
        },

        isSupportedType: function (dataType) {
            // summary:
            //      Check the supported type of data type selected.
            // dataType: [String]
            //      The type of data selected
            // tags:
            //      public

            return array.some(this.typeIdentifiers, function (type) {
                return type === dataType || TypeDescriptorManager.isBaseTypeIdentifier(dataType, type);
            });
        },

        _showAllLanguagesSetter: function (value) {
            this.showAllLanguages = value;
            this.onItemChildrenReload(this.root);
        },

        // =======================================================================
        // Methods for traversing hierarchy

        getRoot: function (onItem, onError) {
            // summary:
            //		Calls onItem with the root item for the tree, possibly a fabricated item.

            if (lang.isArray(this.root)) {
                onItem({});
            } else {
                when(this.store.get(this.root), onItem, onError);
            }
        },

        mayHaveChildren: function (item) {
            // summary:
            //		Tells if an item has or may have children.  Implementing logic here
            //		avoids showing +/- expando icon for nodes that we know don't have children.
            //		(For efficiency reasons we may not want to check if an element actually
            //		has children until user clicks the expando node)

            return item.hasChildren;
        },

        getChildren: function (parentItem, onComplete) {
            // summary:
            //		Calls onComplete() with array of child items of given parent item, all loaded.

            var id = this.getIdentity(parentItem),
                observer = this._observers[id],
                isRoot = id === this.root,
                queryType = isRoot && this.getRootChildrenQuery ? this.getRootChildrenQuery : this.getChildrenQuery,
                query = this._createQuery({ referenceId: id, query: queryType }),
                results = this.store.query(query, this._queryOptions);

            if (observer) {
                observer.remove();
                delete this._observers[id];
            }

            // Hook up an observer to the results to re-query if the collection changes.
            // We cannot reuse the results directly since the query-options are crucial for the data
            // if the items to be correct(i.e. hasChildren depending on contentTypes and language)
            this._observers[id] = results.observe(function (item, removedFrom, insertedInto) {
                when(this.store.query(query, this._queryOptions), this.onChildrenChange.bind(this, parentItem));
            }.bind(this), true);

            when(results, onComplete);
        },

        _getSortSettings: function (/*String || Array*/typeIdentifiers) {
            // summary:
            //      Get sort settings by typeIdentifiers.
            // tags:
            //      protected virtual

            if (!typeIdentifiers) {
                return {};
            }

            if (typeIdentifiers instanceof String) {
                typeIdentifiers = [typeIdentifiers];
            }

            var sortColumn,
                sortSettings = [];

            typeIdentifiers.map(function (type) {
                sortColumn = TypeDescriptorManager.getValue(type, "sortKey");
                if (sortColumn) {
                    sortSettings.push(sortColumn.sortDescending ?
                        { attribute: sortColumn.columnName, descending: true } :
                        { attribute: sortColumn.columnName });
                }
            });

            return sortSettings;
        },

        _createQuery: function (queryBase, excludeType) {
            var typeIdentifiers = this.typeIdentifiers &&
                    (lang.isArray(this.typeIdentifiers) ? this.typeIdentifiers : this.typeIdentifiers.split(","));

            var language = this.showAllLanguages ? { allLanguages: true } : {},
                requestType = excludeType ? {} : { typeIdentifiers: typeIdentifiers };

            var query = lang.mixin(queryBase, requestType, language);

            return query;
        },

        _createChildrenQuery: function (queryBase, excludeType) {
            var childrenQuery = lang.mixin(queryBase, { query: "getchildren" });
            return this._createQuery(childrenQuery, excludeType);
        },

        move: function (sourceItems, target) {
            // summary:
            //      Move the source item to target.

            var contentItems = sourceItems.map(function (item) {
                return item.data;
            });

            return this.pasteItems(contentItems, target, false);
        },

        remove: function (items) {
            // summary
            //      Removes (deletes) the source

            items = items.map(function (item) {
                return item.data;
            });

            var deferreds = items.map(function (item) {
                return this.store.remove(item.contentLink);
            }, this);

            return promiseAll(deferreds).then(lang.hitch(this, function () {
                this.onDeleted(items);
            }));
        },

        copy: function (sourceItems, target) {
            // summary:
            //      Copy the source items to target.

            var contentItems = sourceItems.map(function (item) {
                return item.data;
            });

            return this.pasteItems(contentItems, target, true);
        },

        pasteItems: function (sourceItems, targetItem, copy, sortIndex) {
            // summary:
            //		Move or copy several items from one parent item to another.
            // sourceItems: [Item]
            //      The items that should be copied or moved
            // targetItem: Item
            //      The target item for the operation
            // copy: Boolean
            //      If true the childItem will be copied; otherwise it will be moved.
            // sortIndex: integer
            //      Optional sortIndex in the child collection of the new parent
            // returns: object
            //      An object indicating the result of the operation
            //
            // tags: public

            var method = copy ? "copy" : "move",
                ids,
                ignoredItems = [],
                deletingCurrentContext;

            ids = sourceItems.map(this.getIdentity, this);

            // check if the current context is being deleted before doing the operation
            // afterwards the structure has changed which giver the wrong answer
            return when(this.getCurrentContext()).then(function (ctx) {
                return this._isNodeAContextAncestor(ids, ctx)
                    .then(function (isNodeAContextAncestor) {
                        deletingCurrentContext = isNodeAContextAncestor;
                        return isNodeAContextAncestor;
                    });
            }.bind(this)).then(function () {
                return this.service[method](ids, this.getIdentity(targetItem), this.createAsLocalAsset, sortIndex);
            }.bind(this)).then(function (response) {

                // Get all items that are part of the paste operation
                return promiseAll(sourceItems.map(function (item) {
                    var itemId = response.extraInformation[item.contentLink].extraInformation || item.contentLink;

                    var contentLink = ContentReference.toContentReference(itemId).createVersionUnspecificReference().toString();

                    return this.store.get(contentLink);
                }, this));
            }.bind(this)).then(function (items) {
                if (targetItem.isWastebasket) {
                    this._handleSelect(sourceItems, deletingCurrentContext);
                } else {
                    // Publish a children changed event for the new parent to ensure that the new
                    // parent node is updated if it exists in other tree structures.
                    topic.publish("/epi/cms/contentdata/childrenchanged", targetItem.contentLink);

                    // Publish a children changed event also for the sourceItems parents in order to
                    // refresh it's tree structure
                    var refreshedItems = [];
                    sourceItems.forEach(function (sourceItem) {
                        if (refreshedItems.indexOf(sourceItem.parentLink) === -1) {
                            topic.publish("/epi/cms/contentdata/childrenchanged", sourceItem.parentLink);
                            refreshedItems.push(sourceItem.parentLink);
                        }
                    });
                }

                this._handleDelete(items);

                items.forEach(function (item) {
                    this._onPasteComplete(item, item.isDeleted, null, targetItem);
                }, this);

                // Get all items that were already there in the target folder, if the file is pasted successfully then
                // the parentLink will equal the target folder. Otherwise it will remain the same.
                ignoredItems = items.filter(function (item) {
                    return sourceItems.some(function (sourceItem) {
                        return (sourceItem.contentLink === item.contentLink) && (sourceItem.parentLink === item.parentLink);
                    });
                });

                if (this.createAsLocalAsset === true) {
                    topic.publish("/epi/cms/action/createlocalasset");
                }

            }.bind(this)).then(function () {
                if (ignoredItems.length > 0) {
                    this.onPasteItemsFailed(ignoredItems);
                }
            }.bind(this));
        },

        pasteItem: function (childItem, oldParentItem, newParentItem, copy, sortIndex) {
            // summary:
            //		Move or copy an item from one parent item to another.
            // childItem: Item
            //      A reference to the item that should be moved or copied
            // oldParentItem: Item
            //      The current parent item
            // newParentItem: Item
            //      The target item for the operation
            // copy: Boolean
            //      If true the childItem will be copied; otherwise it will be moved.
            // sortIndex: integer
            //      Optional sortIndex in the child collection of the new parent
            // returns: object
            //      An object indicating the result of the operation
            //
            // tags: public
            //

            // Having copy/paste/delete call pasteItem may seem a bit backwards, but since the drag & drop
            // is calling pasteItem() with all required arguments it becomes a bit messy to drop some arguments
            // here (i.e. old/new parent) and then do the lookup again.
            // Those methods also have to duplicate the notification logic

            return this.pasteItems([childItem], newParentItem, copy, sortIndex)
                .then(function (response) {
                    // Return the response from the first extraInformation
                    return response.extraInformation[childItem.contentLink];
                });
        },

        onPasteComplete: function () {
            // summary:
            //      Stub to do somethings when paste process complete
            // tags:
            //      public, callback
        },

        _onPasteComplete: function (item, isDeleted, oldParentItem, newParentItem) {
            // summary:
            //		Executed after a paste operation has completed
            // item: Item
            //      The target item of the operation
            // isDeleted: boolean
            //      If the operation resulted in the item being deleted, i.e. moved to the trash
            // oldParentItem: Item
            //      The current parent item
            // newParentItem: Item
            //      The target item for the operation
            // tags: protected

            this.onPasteComplete();

            this._selectItemOnPasteComplete(item, isDeleted, oldParentItem, newParentItem);
        },

        _selectItemOnPasteComplete: function (item, isDeleted, oldParentItem, newParentItem) {
            // summary:
            //		Select an item after a paste operation has completed
            // item: Item
            //      The target item of the operation
            // isDeleted: boolean
            //      If the operation resulted in the item being deleted, i.e. moved to the trash
            // oldParentItem: Item
            //      The current parent item
            // newParentItem: Item
            //      The target item for the operation
            // tags: protected

            if (this.autoSelectPastedItem && item && item.contentLink && !isDeleted) {
                this.onSelect(item.contentLink, true);
            }
        },

        newItem: function (item, newParentItem) {
            // summary:
            //		Called when an item that's accepted in the tree is added by an external source, for instance by dragging an item from a listing to the tree.

            this.newItems([item], newParentItem);
        },

        newItems: function (items, newParentItem) {
            var newItems = items.map(function (item) {
                return item.dndData.data;
            });

            this._pasteNewItems(newItems, newParentItem);
        },

        _pasteNewItems: function (newItems, newParentItem) {
            //Right now we only support move actions when moving items from an external source to the tree. Might be changed in the future.
            this.pasteItems(newItems, newParentItem, false);
        },

        _updateItemChanged: function (parentContentLink) {
            // update the parent cause of in some case its properties changed
            when(this.store.refresh(parentContentLink), lang.hitch(this, function (updatedItem) {
                // then update its children
                this._childrenChanged(updatedItem);
            }));
        },

        _childrenChanged: function (parent) {
            var dfd = new Deferred();

            this.getChildren(parent, lang.hitch(this, function (children) {
                this.onChildrenChange(parent, children);
                dfd.resolve(children);
            }));

            return dfd;
        },

        _isNodeAContextAncestor: function (nodeContentLinks, context) {
            var dfd = new Deferred(),
                directMatch = nodeContentLinks.some(function (contentId) {
                    return ContentReference.compareIgnoreVersion(contentId, context.id);
                });

            if (directMatch) {
                dfd.resolve(true);
            } else {
                this.getAncestors(context, function (ancestors) {
                    var result = ancestors.some(function (ancestor) {
                        return nodeContentLinks.indexOf(ancestor.contentLink) > -1;
                    });

                    dfd.resolve(result);
                });
            }

            return dfd.promise;
        },

        _handleSelect: function (deletedItems, deletingCurrentContext) {
            // summary:
            //      Makes sure selection and context is updated based on what has been deleted.
            // tags:
            //      private

            var firstDeletedItem, singleItem;

            if (deletingCurrentContext) {
                firstDeletedItem = deletedItems[0];
                if (firstDeletedItem.capabilities.isPage) {
                    singleItem = deletedItems.length === 1 && firstDeletedItem;
                    this.onSelect(singleItem ? singleItem.parentLink : ApplicationSettings.startPage, true);
                    return;
                }

                topic.publish("/epi/shell/context/request", { uri: ViewSettings.settings.defaultContext });
            }

            var folders = deletedItems.filter(function (deletedItem) {
                return this.isSupportedType(deletedItem.typeIdentifier);
            }.bind(this));

            /*
                Deleting from asset pane:
                1) Single folder - look for parent
                2) Many folders - select GlobalAssetsFolder
                3) Item or many items - the selection should not change
            */

            if (folders.length === 1) {
                this.onSelect(folders[0].parentLink, true);
            } else if (folders.length > 1) {
                this.onSelect(ApplicationSettings.globalAssetsFolder, true);
            }
        },

        checkItemAcceptance: function (target, source) {
            // summary:
            //      Called from DnD to check if a specific target can accept the items in source
            //
            // tags: public

            // list source uses getSelectedNodes, tree source uses getSelectedTreeNodes
            var selectedNodes = source.getSelectedNodes ? source.getSelectedNodes() : source.getSelectedTreeNodes();
            var canPastePromises = selectedNodes.map(function (node) {
                var item = source.getItem(node.id);
                var data = item.data;
                if (data.dndData) {
                    data = data.dndData;
                }
                // canPaste can return a promise in classes that inherit from this one.
                return this.canPaste(data, target);
            }, this);

            return promiseAll(canPastePromises).then(function (results) {
                return results.every(function (canPaste) {
                    return canPaste;
                });
            });
        },

        _handleDelete: function (items) {

            var deletedItems = items.filter(function (item) {
                return item.isDeleted;
            });

            if (deletedItems.length > 0) {
                deletedItems.forEach(function (item) {
                    var id = this.getIdentity(item),
                        observer = this._observers[id];
                    if (observer) {
                        observer.remove();
                        delete this._observers[id];
                    }
                    this.onDelete(item, true);
                }, this);

                this.onDeleted(deletedItems);
            }
        },

        // =======================================================================
        // Inspecting items

        getIdentity: function (item) {
            // summary:
            //		Returns identity for an item

            if (lang.isObject(item)) {
                return this.store.getIdentity(item);
            }
            return item;
        },

        getObjectIconClass: function (/*Object*/item, /*String*/fallbackIconClass) {
            // summary:
            //      Get icon class for content based on its content link
            // item: [Object]
            //      Content item data
            // fallbackIconClass: [String]
            //      Default icon class in case nothing returned
            // tags:
            //      public, extension

            var defaultIconClass = TypeDescriptorManager.getValue(item.typeIdentifier, "iconClass");
            if (!defaultIconClass) {
                return fallbackIconClass;
            }

            var suffix = "";
            switch (parseInt(item.contentLink, 10)) {
                case ApplicationSettings.globalAssetsFolder:
                    suffix = "AllSites";
                    break;

                case ApplicationSettings.siteAssetsFolder:
                    suffix = "ThisSite";
                    break;

                default:
                    break;
            }

            return (suffix === "" && defaultIconClass === fallbackIconClass) ? defaultIconClass : (fallbackIconClass + " " + defaultIconClass + suffix);
        },

        getLabel: function (item) {
            // summary:
            //		Get the label for an item

            return item.name;
        },

        canExpandTo: function (item) {
            // summary:
            //		Test if the tree can expand to an item
            // item: Object
            //      The item
            // returns:
            //       A promise which resolves to true if the item can be reached, otherwise false.

            var deferred = new Deferred();

            this.getAncestors(item, lang.hitch(this, function (ancestors) {
                deferred.resolve(this.getIdentity(ancestors[0]) === this.root.id);
            }));

            return deferred.promise;
        },

        canCopy: function (item) {
            // summary:
            //		Determine whether the given item is able to be copied by the current user.
            // remarks:
            //      Override to implement additional check.
            // tags:
            //		public

            if (!item) {
                return false;
            }

            var reference = item.contentLink,
                isSystemPage = reference === this.root || (array.indexOf(this.notAllowToCopy, reference) >= 0);

            return !isSystemPage &&
                ContentActionSupport.hasAccess(item.accessMask, ContentActionSupport.accessLevel.Read) &&
                ContentActionSupport.hasProviderCapability(item.providerCapabilityMask, ContentActionSupport.providerCapabilities.Copy);
        },

        canCut: function (item) {
            // summary:
            //		Determine whether the given item is able to be cut by the current user.
            // tags:
            //		public

            if (!item) {
                return false;
            }

            var reference = item.contentLink,
                isSystemPage = reference === this.root || (array.indexOf(this.notAllowToDelete, reference) >= 0);

            return !isSystemPage &&
                ContentActionSupport.isActionAvailable(item, ContentActionSupport.action.Delete, ContentActionSupport.providerCapabilities.Move, true);
        },

        canDelete: function (item) {
            // summary:
            //		Determine whether the given item is able to be deleted by the current user.
            // tags:
            //		public

            if (!item) {
                return false;
            }

            var reference = item.contentLink,
                isSystemPage = reference === this.root || (array.indexOf(this.notAllowToDelete, reference) >= 0);

            return !isSystemPage &&
                ContentActionSupport.isActionAvailable(item, ContentActionSupport.action.Delete, ContentActionSupport.providerCapabilities.Delete, true);
        },

        canPaste: function (item, target, isCopy) {
            // summary:
            //      Determines whether the given item can be moved or copied from its current parent to a new location
            //      Primarily used when validating drag & drop operations.
            // tags:
            //      public

            if (!item || !target) {
                return false;
            }

            var isCopyToWastebasket = isCopy && target.isWastebasket,
                isCutToTheSameItem = !isCopy && (this.getIdentity(item) === this.getIdentity(target)),
                isCutToTheSameParent = !isCopy && (item.parentLink === this.getIdentity(target)),
                hasAccess = ContentActionSupport.isActionAvailable(target, ContentActionSupport.action.Create, ContentActionSupport.providerCapabilities.Create, true);

            return !target.isDeleted && !isCopyToWastebasket && !isCutToTheSameItem && !isCutToTheSameParent && hasAccess;
        },

        canEdit: function (item) {
            // summary:
            //		Determine whether the given item is able to be edit by the current user.
            // tags:
            //		public

            if (!item) {
                return false;
            }

            var reference = item.contentLink,
                isSystemPage = reference === this.root;

            return !isSystemPage && ContentActionSupport.hasAccess(item.accessMask, ContentActionSupport.accessLevel.Edit);
        },

        // =======================================================================
        // Callbacks

        onItemChildrenReload: function (/*Object*/parent) {
            // summary:
            //  Raised when the children of an item must be reloaded.
            //  The subscriber needs to call getChildren to get the updated children collection
        },

        onChange: function (/*dojo/data/Item*/ /*===== item =====*/) {
            // summary:
            //		Callback whenever an item has changed, so that Tree
            //		can update the label, icon, etc.   Note that changes
            //		to an item's children or parent(s) will trigger an
            //		onChildrenChange() so you can ignore those changes here.
            // tags:
            //		callback
        },

        onChildrenChange: function (/*===== parent, newChildrenList =====*/) {
            // summary:
            //		Callback to do notifications about new, updated, or deleted items.
            // parent: dojo/data/Item
            // newChildrenList: dojo/data/Item[]
            // tags:
            //		callback
        },

        onDelete: function (/*dojo/data/Item*/ /*===== item =====*/) {
            // summary:
            //		Callback when an item has been deleted.
            // description:
            //		Note that there will also be an onChildrenChange() callback for the parent
            //		of this item.
            // tags:
            //		callback
        },

        onDeleted: function (deletedItems) {
            // summary:
            //      Callback when an item has been deleted to set the parent folder as selected
            // deletedItems: dojo/data/Item[]
            //      items deleted
            // tags:
            //      public callback
        },

        onSelect: function (ItemId, setFocus, onComplete) {
            // summary:
            //      Raise event to set an item as selected
            // tags:
            //      callback
        },

        onPasteItemsFailed: function (ignoredItems) {
            // summary:
            //      Raise event to select the items that were not pasted successfully.
            // tags:
            //      public callback
        }
    });
});
