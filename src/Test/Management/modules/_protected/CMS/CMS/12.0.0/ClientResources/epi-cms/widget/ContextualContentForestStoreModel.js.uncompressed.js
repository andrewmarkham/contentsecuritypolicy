define("epi-cms/widget/ContextualContentForestStoreModel", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/topic",
    "dojo/when",
    // epi
    "epi/shell/TypeDescriptorManager",
    "epi-cms/contentediting/_ContextualContentContextMixin",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/ContentForestStoreModel"
],

function (
// dojo
    array,
    declare,
    lang,

    aspect,
    Deferred,
    promiseAll,
    topic,
    when,
    // epi
    TypeDescriptorManager,
    _ContextualContentContextMixin,
    ContentReference,
    ContentForestStoreModel
) {

    return declare([ContentForestStoreModel, _ContextualContentContextMixin], {
        // description:
        //      Adds a contextual root node to the tree.
        // tags:
        //      internal

        // previousSelection: [public] Object
        //      Holds information about previous selection in the tree
        //      Object's properties:
        //          selectedContent: [public] Object
        //              An instance of the "dijit/_TreeNode"
        //              Holds the previous selected content of the given tree
        //          selectedAncestors: [public] Array
        //              Holds the ancestors of the previous selected content of the given tree
        previousSelection: null,

        // forThisFolderEnabled: [public] Boolean
        forThisFolderEnabled: true,

        // =======================================================================
        // Public overrided functions

        postscript: function () {

            this.inherited(arguments);

            this._handles.push(topic.subscribe("/epi/cms/action/createlocalasset", lang.hitch(this, this.refreshRoots)));
            this._handles.push(topic.subscribe("/epi/cms/action/togglecreatemode", lang.hitch(this, this._toggleContextualContent)));

            this._handles.push(aspect.around(this, "pasteItem", lang.hitch(this, this._aroundPasteItem)));
            this._handles.push(aspect.around(this, "pasteItems", lang.hitch(this, this._aroundPasteItems)));
            this._handles.push(aspect.after(this.store, "get", lang.hitch(this, this._afterStoreGet)));
        },

        contextChanged: function (context, callerData) {

            // summary:
            //    Called when the currently loaded context changes
            // tags:
            //    protected

            this.inherited(arguments);

            this.refreshRoots();

        },

        getChildren: function (parentItem, onComplete, onError) {
            // summary:
            //      Calls onComplete() with array of child items of given parent item.
            // parentItem: Object
            //      Item from the dojo/store
            // tags:
            //      public

            if (parentItem === this.root) {
                when(this._getRootItems(), onComplete, onError);
            } else {
                // Overrides onComplete callback function in order to return an empty array of child content for pseudo contextual root
                if (this.isPseudoContextualRoot(parentItem)) {
                    onComplete([]);
                    return;
                }

                this.inherited(arguments);
            }
        },

        // TODO: The getAncestors method should be generalized to support multiple roots and moved to the _HierarchicalModelMixin. (bemc)
        getAncestors: function (item, /*Function*/ onComplete) {
            // summary:
            //      Calls onComplete() with an array of ancestors of the given item.
            // item: Object
            //      Item from the dojo/store

            var inherited = this.getInherited(arguments),
                onCompleteCallback = onComplete;

            // Get the contextual root ID and concatenate it with the roots array.
            when(this.getCurrentContent()).then(lang.hitch(this, function (currentContent) {
                var roots = this.roots.concat(currentContent.assetsFolderLink),
                    callback = lang.hitch(this, function (results) {
                        // Loop through the results from the end to find the first item that is a
                        // root. If a root is found then append the virtual root as the first item and resolve.
                        var ancestor;
                        for (var i = results.length - 1; i >= 0; i--) {
                            ancestor = results[i];

                            // Update as contextual root
                            if (this.isContextualRoot(ancestor)) {
                                results[i] = this.getContextualRoot(ancestor);
                            }

                            if (array.indexOf(roots, this.getIdentity(ancestor)) >= 0) {
                                results = results.slice(i);
                                results.unshift(this.root);
                                onComplete(results);
                                return;
                            }
                        }

                        // Otherwise if no root item is found resolve with only the virtual root.
                        onComplete([this.root]);
                    });

                // If the given item is a root node then resolve with only the virtual root.
                if (array.indexOf(roots, this.getIdentity(item)) >= 0) {
                    onComplete([this.root]);
                }

                //Replace the default callback
                onCompleteCallback = callback;

            })).always(lang.hitch(this, function () {
                inherited.apply(this, [item, onCompleteCallback]);
            }));
        },

        getObjectIconClass: function (/*dojo/data/Item*/contentItem, /*String*/fallbackIconClass) {
            // summary:
            //      Get icon class for content based on its content link
            // contentItem: [dojo/data/Item]
            //      Content item data
            // fallbackIconClass: [String]
            //      Default icon class in case nothing returned
            // tags:
            //      public, extension

            var dataType = this._currentContext && this._currentContext.dataType;

            if (!dataType) {
                return this.inherited(arguments);
            }

            var contentIconClass = TypeDescriptorManager.getValue(dataType, "iconClass");

            return this.isContextualContent(contentItem)
                ? (contentIconClass
                    ? fallbackIconClass + " " + contentIconClass + "Contextual"
                    : fallbackIconClass
                )
                : this.inherited(arguments);
        },

        // =======================================================================
        // Public functions

        onToggleContentDisplay: function (/*String*/target, /*Boolean*/display) {
            // summary:
            //      Callback whenever widget switcher changed
            // target: [String]
            //      Assets folder content item that want to show/hide
            // display: [Boolean]
            // tags:
            //      public, callback
        },

        onRefreshRoots: function (/*dojo/data/Item*/refreshItem) {
            // summary:
            //      Callback whenever context changed
            // refreshItem: [dojo/data/Item]
            //      Assets folder content item that want to refresh
            // tags:
            //      public, callback
        },

        refreshRoots: function (sender) {
            // summary:
            //      Refresh root contents
            // sender: Object
            //      The instance that published the topic
            // tags:
            //      public

            //If the topic was published from this model do not react on it.
            if (sender === this) {
                return true;
            }

            var self = this;
            return when(self._getRootItems(), function (children) {
                self.onChildrenChange(self.root, children);
            });
        },

        canCopy: function (item) {
            // summary:
            //      Determine whether the copy action is supported for an item.
            // item: Object
            //      Item from the dojo/store
            // tags:
            //      public, override

            // Do not allow to copy the current contextual folder
            return this.isContextualContent(item) ? false : this.inherited(arguments);
        },

        canCut: function (/*dojo/data/Item*/item) {
            // summary:
            //      Determine whether the given item is able to be cut by the current user.
            // item: [dojo/data/Item]
            //      The source content item data that is being copied/cut
            // tags:
            //      public, override

            // Do not allow to cut the current contextual folder
            return this.isContextualContent(item) ? false : this.inherited(arguments);
        },

        canPaste: function (item, target, isCopy) {
            // summary:
            //      Determines whether the given item can be moved or copied from its current parent to a new location
            //      Primarily used when validating drag & drop operations.
            // item: [dojo/data/Item]
            //      The source content item data that is being copied/cut
            // target: [dojo/data/Item]
            //      The destination content item data
            // isCopy: Boolean
            //      If true, action is copy, otherwise is cut
            // tags:
            //      public override

            var self = this,
                canPaste = this.inherited(arguments),
                deferred = new Deferred();

            if (isCopy) {
                deferred.resolve(canPaste);
            } else {
                self.getAncestors(target, function (ancestors) {

                    // If we paste into current contextual folder or one of its children
                    var isPastingToContextualContent = self.isContextualContent(target) || self.hasContextual(ancestors);
                    if (isPastingToContextualContent) {
                        when(self.getCurrentContent()).then(function (currentContent) {

                            // and cut content is the current context
                            if (ContentReference.compareIgnoreVersion(item.contentLink, currentContent.contentLink)) {
                                deferred.resolve(false);
                            } else {
                                // or cut content is an ancestor of the current context
                                self.getAncestors(currentContent.contentLink, function (ancestors) {

                                    var itemIsParent = array.some(ancestors, function (ancestor) {
                                        return item.contentLink === ancestor.contentLink;
                                    }, this);

                                    deferred.resolve(itemIsParent ? false : canPaste);
                                });
                            }
                        }).otherwise(function () {
                            deferred.resolve(false);
                        });
                    } else {
                        deferred.resolve(canPaste);
                    }
                });
            }

            return deferred.promise;
        },

        filterAncestors: function (ancestors) {
            // summary:
            //      Filter out the pseudo contextual content from the given ancestor list incase pseudo content is not the deepest ancestor.
            // ancestors: [Array]
            //      Collection of ancestor content
            // tags:
            //      public

            if (!(ancestors instanceof Array)) {
                return ancestors;
            }

            var pseudoIndex = ancestors.indexOf(this._getPseudoContextualContent().toString());
            if (pseudoIndex !== -1 && pseudoIndex < ancestors.length - 1) {
                ancestors.splice(pseudoIndex, 1);
            }

            return ancestors;
        },

        isContextualContent: function (item) {
            // summary:
            //    Overrides _ContextualContentContextMixin.isContextualContent to only report items included in the tree as contextual content.
            // tags:
            //     public, override

            return !!item && this.isSupportedType(item.typeIdentifier) && this.inherited(arguments);
        },

        // =======================================================================
        // Private functions

        _toggleContextualContent: function (/*Boolean*/createMode) {
            // summary:
            //      Show/Hide contextual content (local asset folder)
            // createMode: [Boolean]
            //      Flag indicates that the current mode is create new content or not
            // tags:
            //      private

            when(this.getCurrentContent(), lang.hitch(this, function (currentContent) {
                this.onToggleContentDisplay(currentContent.assetsFolderLink, !createMode);
                this._setSelection(null); // Pass 'null' value in order to set selection to the default target on the tree
            }));
        },

        _setSelection: function (/*Object*/targetItem) {
            // summary:
            //      Set selection tree node by the given content link string
            // targetItem: [Object]
            //      An instance of "dojo/data/Item"
            // tags:
            //      private

            var defaultTarget = this.roots.length > 0 ? this.roots[0].toString() : (!targetItem ? null : targetItem.assetsFolderLink),
                target = targetItem != null ? targetItem.contentLink : defaultTarget,
                previousSelection = this.get("previousSelection"),
                previousContextualSelection = this.get("previousContextualSelection"),
                previousSelectedContextualContent = previousContextualSelection && previousContextualSelection.selectedContent,
                selectDeferred = new Deferred();

            //Return if there is no new target to select or any previous selection
            if (!(target && previousSelection)) {
                selectDeferred.resolve();
                return selectDeferred.promise;
            }

            var focusTarget = false, // Set focus to the target is FALSE to prevent steal focus of the others
                previousSelectedContent = previousSelection.selectedContent,
                previousSelectedAncestors = previousSelection.selectedAncestors,
                previousIsVirtualRoot = previousSelectedContent.item && !previousSelectedContent.item.contentLink;

            var onComplete = function () {
                selectDeferred.resolve();
            };

            if (previousIsVirtualRoot || this.hasContextual(previousSelectedAncestors)) {
                this.onSelect(target, focusTarget, onComplete);
            } else if (previousSelectedContent.item.contentLink === defaultTarget
                    && previousSelectedContextualContent
                    && previousSelectedContextualContent.item
                    && previousSelectedContextualContent.item.contentLink) {
                this.onSelect(previousSelectedContextualContent.item.contentLink, focusTarget, onComplete);
            } else {
                selectDeferred.resolve();
            }

            return selectDeferred.promise;
        },

        getRoots: function (filterContentAssetsFolder) {
            // summary:
            //      Returns the available roots for the current context
            //
            // filterContentAssetsFolder: Boolean?
            //      Set to true if you want to remove the content assets folder from the available roots
            //
            // returns: Promise
            //      A promise that will be resolved with the current roots for the context
            // tags:
            //      internal

            var def = new Deferred();

            var contentAssetRoot = this._getPseudoContextualContent().toString();
            var filterContentAssetsRootFolder = function (rootItem) {
                if (!filterContentAssetsFolder) {
                    return true;
                }
                return rootItem !== contentAssetRoot;
            };

            var mapContentLink = function (rootItem) {
                return rootItem.contentLink;
            };

            when(this._getRootItems(), function (rootItems) {
                def.resolve(rootItems.map(mapContentLink).filter(filterContentAssetsRootFolder));
            }, def.reject);

            return def.promise;
        },

        _getRootItems: function () {
            // summary:
            //      Resolves the root items, including the contextual root.
            // tags:
            //      private

            var self = this,
                currentStore = self.store,
                // Load all ordinary roots
                rootLoads = array.map(self.roots, function (item) {
                    return currentStore.get(item);
                });

            var contextRootLoad =
                // REMARK: This is not a longterm solution. We should push the currentContent to the model instead of getting it from the ContentContextMixin.
                // this model could be use when we do not have a editing context. E.g. an addon that just want's to pick a page/image etc.
                when(promiseAll([self.getCurrentContent(), self.getCurrentContext()]), function (result) {

                    var currentContent = result[0],
                        currentContext = result.length > 1 ? result[1] : null;

                    var currentContentWithoutVersion = new ContentReference(currentContent.contentLink).createVersionUnspecificReference().toString();
                    return when(currentStore.get(currentContentWithoutVersion), function (content) {
                        var inCreateMode = currentContext && currentContext.currentMode === "create";
                        if ((inCreateMode && self.get("view") === "contentselector") || !self.canHaveContextualContent(content) || !self.forThisFolderEnabled) {
                            return null;
                        }

                        // If the current context provided a context root, load it
                        var assetsFolderLink = content.assetsFolderLink;
                        if (assetsFolderLink) {
                            var getContextualContent = function (localFolderLink) {

                                // We need to call refresh local folder here in order to set its selection on the folder tree and refresh its icon and label.
                                return when(currentStore.get(localFolderLink), function (contextualContent) {
                                    // Take query in order to filters properly children that are allowed.
                                    // So that, we will show the expanded/collapsed icon for the root node correctly.
                                    var query = {
                                        id: contextualContent.contentLink,
                                        typeIdentifiers: self.typeIdentifiers,
                                        allLanguages: self.showAllLanguages
                                    };

                                    return when(currentStore.query(query), function (refreshedContent) {
                                        // Only show contextual content in the container that supports its type identifier
                                        if (typeof self.isSupportedType === "function" && !self.isSupportedType(refreshedContent.typeIdentifier)) {
                                            return null;
                                        }

                                        if (!self.isPseudoContextualRoot(refreshedContent)) {
                                            return self.getContextualRoot(refreshedContent);
                                        } else {
                                            return when(self.onRefreshRoots(refreshedContent), function () {
                                                return self._modifyContentAccess(refreshedContent, content);
                                            });
                                        }
                                    });
                                });
                            };

                            if (assetsFolderLink === self._getPseudoContextualContent().toString()) {
                                return when(currentStore.refresh(currentContentWithoutVersion), function (refreshedContent) {
                                    return getContextualContent(refreshedContent.assetsFolderLink);
                                });
                            } else {
                                return getContextualContent(assetsFolderLink);
                            }
                        }

                        return null;
                    });
                },
                //We want a return even the context is not a content item
                function () {
                    return null;
                });

            // Add context root load to the ordinary root loads
            rootLoads.push(contextRootLoad);

            return when(promiseAll(rootLoads), function (rootItems) {
                // When loads are done, filter the ones that resolve null
                return array.filter(rootItems, Boolean);
            });
        },

        _aroundPasteItem: function (originalFunction) {
            // summary:
            //      Stubs to do somethings before pasteItem processing
            // tags:
            //      private

            var self = this;

            return function (/*dojo/data/Item*/childItem, /*dojo/data/Item*/oldParentItem, /*dojo/data/Item*/newParentItem, /*Boolean*/copy, /*Integer?*/sortIndex) {
                var targetItem = newParentItem,
                    createAsLocalAsset = self.get("createAsLocalAsset");

                // If the new parent item is pseudo contextual content, get current content context item insteads
                // In additional, change the value of the "createAsLocalAsset" to TRUE if its value is FALSE, otherwise do nothing
                return when(self.getCurrentContent()).then(function (contextContentItem) {

                    if (!createAsLocalAsset) {
                        createAsLocalAsset = self.isPseudoContextualRoot(targetItem);
                        self.set("createAsLocalAsset", createAsLocalAsset);
                    }

                    createAsLocalAsset && (targetItem = contextContentItem);
                }).always(function () {
                    return when(originalFunction.apply(self, [childItem, oldParentItem, targetItem, copy, sortIndex]), function (response) {
                        if (createAsLocalAsset) {
                            self.set("createAsLocalAsset", false);
                            return when(self.refreshRoots(), function () {

                                // REMARK: This is not a very good place to do this, but when we can't rely on the
                                // store notfications for the contextual content we need to do this
                                // If the item got a new parent, publish the local asset created topic
                                topic.publish("/epi/cms/action/createlocalasset", self);

                                return response;
                            });
                        } else {
                            return response;
                        }
                    });
                });
            };
        },

        _aroundPasteItems: function (originalFunction) {
            // summary:
            //      Aspect around PasteItems to handle pasting content to the local asset folder.
            //      In this case the targetItem has to be replaced with the contentOwner contentLink
            // tags:
            //      private

            var self = this;
            return function (/*Array*/sourceItems, /*dojo/data/Item*/targetItem, /*Boolean*/copy, /*Integer?*/sortIndex) {
                var createAsLocalAsset = self.get("createAsLocalAsset");
                // If the new parent item is pseudo contextual content, get current content context item instead
                // In additional, change the value of the "createAsLocalAsset" to TRUE if its value is FALSE, otherwise do nothing
                return when(self.getCurrentContent()).then(function (contextContentItem) {
                    if (!createAsLocalAsset) {
                        createAsLocalAsset = self.isPseudoContextualRoot(targetItem);
                        self.set("createAsLocalAsset", createAsLocalAsset);
                    }

                    createAsLocalAsset && (targetItem = contextContentItem);
                }).always(function () {
                    return when(originalFunction.apply(self, [sourceItems, targetItem, copy, sortIndex]), function (response) {
                        if (createAsLocalAsset) {
                            self.set("createAsLocalAsset", false);
                        } else {
                            return response;
                        }
                    });
                });
            };
        },

        _afterStoreGet: function (/*Object*/promise) {
            // summary:
            //      Decorates result before send it back
            // promise: [Object]
            //      Store get() result
            // tags:
            //      private

            var self = this;
            return when(promise, function (result) {
                return when(self.getCurrentContent(), function (currentContent) {
                    return self._modifyContentAccess(result, currentContent);
                }, function (error) {
                    //If we fail to load the current content return the value from the store
                    return result;
                });
            });
        },

        _modifyContentAccess: function (/*dojo/data/Item*/targetContent, /*dojo/data/Item*/sourceContent) {
            // summary:
            //      Modify access marks for the given pseudo contextual content
            // targetContent: [dojo/data/Item]
            //      Pseudo contextual content asset folder that needed to overrides access marks
            // sourceContent: [dojo/data/Item]
            //      Source content that used to copy access marks from
            // tags:
            //      private

            // Only modify the content item name if it is a contextual content
            if (this.isContextualContent(targetContent)) {
                var contextualRoot = this.getContextualRoot(targetContent);
                // Only modify the access maske if its the fake folder
                return this.isPseudoContextualRoot(targetContent)
                    ? lang.mixin(contextualRoot, {
                        isPreferredLanguageAvailable: sourceContent.isPreferredLanguageAvailable,
                        hasTranslationAccess: sourceContent.hasTranslationAccess,
                        accessMask: sourceContent.accessRights, // Mix on the access rights that does not include language access rights
                        ownerContentLink: sourceContent.contentLink
                    })
                    : contextualRoot;
            }

            return targetContent;
        }

    });

});
