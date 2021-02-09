define("epi-cms/widget/ContentTree", [
// dojo
    "dojo/_base/array",
    "dojo/_base/connect", // To use isCopyKey()
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",
    "dojo/dom-style",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/Evented",

    "dojo/keys",
    "dojo/promise/all",
    "dojo/query",
    "dojo/sniff",
    "dojo/when",
    "dijit/registry",
    // epi
    "epi/dependency",
    "epi/shell/DestroyableByKey",
    "epi/shell/dnd/tree/dndSource",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/Tree",

    "epi-cms/core/ContentReference",
    "epi-cms/dgrid/formatters",
    "epi-cms/widget/_ContentTreeNode",
    "epi-cms/widget/ContentTreeModelConfirmation",
    "epi-cms/widget/ContentForestStoreModel"
],

function (
// dojo
    array,
    connect, // To use isCopyKey()
    declare,
    lang,

    domClass,
    domStyle,

    aspect,
    Deferred,
    Evented,

    keys,
    promiseAll,
    query,
    sniff,
    when,
    registry,
    // epi
    dependency,
    DestroyableByKey,
    dndSource,
    TypeDescriptorManager,
    Tree,

    ContentReference,
    formatters,

    _ContentTreeNode,
    ContentTreeModelConfirmation,
    ContentForestStoreModel
) {

    return declare([Tree, Evented, DestroyableByKey], {
        // summary:
        //      The EPiServer content tree.
        // description:
        //      The page tree shows the EPiServer CMS page tree using a REST store to fetch the data.
        // tags:
        //      internal

        // roots: Array
        //      A list of references to the root nodes.
        roots: null,

        // expandExtraNodeItems: [public] Array|Integer
        //      A collection of content item id or one content item id need to expand by default.
        expandExtraNodeItems: null,

        // nodeConstructor: Function
        //      Tree node constructor. It should be a sub class of dijit/Tree/_TreeNode
        nodeConstructor: null,

        // typeIdentifiers: String | Array
        //      Type identifier  filter.
        typeIdentifiers: null,

        // allowManipulation: Boolean
        //      Denotes if node manipulation is allowed.
        allowManipulation: true,

        // persist: Boolean
        //      Enables/disables use of cookies for state saving.
        persist: false,

        // expandOnDnd: [public] Boolean
        //      Enables/disables expand on a tree node when Dnd over it.
        expandOnDnd: true,

        // showRoot: [public] Boolean
        //      Flag that indicates whether the the root node should be displayed.
        showRoot: false,

        // handleSelection: [public] Boolean
        //      Flag that indicates this tree need to reset selection each time it had refresh
        handleSelection: false,

        // disableRestrictedTypes: [public] Boolean
        //      Flag that indicates this tree must apply disable style for the node which are not selectable based on provided allowedTypes.
        disableRestrictedTypes: false,

        // dndSource: [public] dndSource
        //      The dnd source to use for the tree, if no one is specified the epi/shell/dnd/tree/dndSource will be used
        dndSource: null,

        postMixInProperties: function () {
            // summary:
            //      Post mixin initializations.
            // tags:
            //      protected

            this.inherited(arguments);

            if (!this.model) {
                this.model = this._createTreeModel();
            }
            this.own(this.model);

            if (this.allowManipulation) {
                this.dndController = this.dndSource || dndSource;

                //We allow dropping all types contained in the content repository, even if it's not displayed in the tree.
                this.accept = this.model.containedTypes || this.containedTypes;
            }

            // make sure these get called with this class as context
            // otherwise context will be the dndController for the tree
            this.checkItemAcceptance = lang.hitch(this, this.checkItemAcceptance);

            this.nodeConstructor = this.nodeConstructor || _ContentTreeNode;

            this.own(aspect.around(this.model, "pasteItems", this._aroundPasteItem.bind(this)));

            // we don't want to disable folders
            if (this.allowedTypes) {
                var contentFolderAdded = array.some(this.allowedTypes, function (item) {
                    return item === "episerver.core.contentfolder";
                });

                if (!contentFolderAdded) {
                    this.allowedTypes.push("episerver.core.contentfolder");
                }
            }
        },

        getItemType: function (item) {
            // summary:
            //      Resolve the type for each item. Called by the dnd source.

            return TypeDescriptorManager.getAndConcatenateValues(item.typeIdentifier, "dndTypes");
        },

        buildRendering: function () {
            // Wrap the model before build rendering
            this.model = this._wrapModel(this.model);

            this.inherited(arguments);
        },

        _wrapModel: function (model) {
            // summary:
            //      Wraps the model with a confirmation
            // tags:
            //      protected
            return ContentTreeModelConfirmation(this.model);
        },

        postCreate: function () {
            this.inherited(arguments);

            this.own(
                this.connect(this.model, "onSelect", lang.hitch(this, this._onSelect)),
                aspect.before(this.model, "onToggleContentDisplay", lang.hitch(this, function (/*String*/target, /*Boolean*/display) {
                    var targetContent = this.getNodesByItem(target)[0];
                    if (targetContent) {
                        domStyle.set(targetContent.domNode, {
                            display: display === true ? "" : "none"
                        });
                    }
                }))
            );
        },

        onLoad: function () {
            // summary:
            //      Called when tree has finished loading and expanding.
            // tags:
            //      protected

            this.inherited(arguments);

            return when(this._expandRootNodes(), lang.hitch(this, this._expandExtraNodes));
        },

        _expandRootNodes: function () {
            // summary:
            //      Expand the root nodes by default
            // tags:
            //      private

            // Expand the root nodes by default.
            var nodes = this.showRoot ? [this.rootNode] : this.rootNode.getChildren();
            return promiseAll(array.map(nodes, this.tree._expandNode, this));
        },

        _expandExtraNodes: function () {
            // summary:
            //      Expand the given extra nodes by default
            // tags:
            //      private

            if (!this.expandExtraNodeItems) {
                return;
            }

            var expandExtraNodeItems = this.expandExtraNodeItems instanceof Array ? this.expandExtraNodeItems : [this.expandExtraNodeItems];

            var extraNodes = array.map(expandExtraNodeItems, function (item) {
                return this.tree.getNodesByItem(item)[0];
            }, this);

            // Filter out empty node from the given array.
            extraNodes = array.filter(extraNodes, Boolean);

            return promiseAll(array.map(extraNodes, this.tree._expandNode, this));
        },

        _aroundPasteItem: function (originalPasteItems) {
            // summary:
            //      Paste item wrapper that marks the target node as processing while the paste is
            //      being executed on the server
            // tags:
            //      private

            return function (sourceItems, targetItem) {
                if (targetItem.isWastebasket) {
                    // wast basket is not in tree and it's not expandable
                    return originalPasteItems.apply(this.model, arguments);
                }

                var targetNode = this.get("selectedNode");
                // If we for some reason don't have a selected treeNode (UI)
                // we still want to try to paste the item
                if (!targetNode) {
                    return originalPasteItems.apply(this.model, arguments);
                }

                targetNode.markProcessing();
                return originalPasteItems.apply(this.model, arguments)
                    .then(function () {
                        if (!targetNode.isExpanded) {
                            targetNode.expand();
                        }
                    }).always(function () {
                        targetNode.unmarkProcessing();
                    });
            }.bind(this);
        },

        // gets propagated to dndSource
        checkItemAcceptance: function (targetNode, source, position) {
            // summary:
            //      Called from DnD to check if a specific target can accept the items in source

            var targetTreeNode = registry.getEnclosingWidget(targetNode),
                target = targetTreeNode && targetTreeNode.item;

            if (!target) {
                return false;
            }

            return this.model.checkItemAcceptance(target, source);
        },

        _setAllowManipulationAttr: function (value) {
            // summary:
            //      setter of allowManipulation property.
            // tags:
            //      private

            this._set("allowManipulation", value);

            if (value) {
                this.dndController = this.dndSource || dndSource;
            }
        },

        _createTreeModel: function () {
            // summary:
            //      Create content tree model
            // tags:
            //      protected

            return new ContentForestStoreModel({
                roots: this.roots,
                typeIdentifiers: this.typeIdentifiers
            });
        },

        _onItemDelete: function (/*Item*/item, /*boolean*/deleteChildren) {
            // summary:
            //      Override of dijit/Tree._onItemDelete to enable cleaning
            //      of the itemsNodeMap from children of the item being deleted.
            // tags:
            //      protected, override

            function flattenChildHierarchy(node, children) {
                array.forEach(node.getChildren(), function (child) {
                    children.push(child.item);
                    flattenChildHierarchy(child, children);
                });

                return children;
            }

            if (deleteChildren) {
                var treeNodes = this._itemNodesMap[this.model.getIdentity(item)];
                if (treeNodes) {
                    array.forEach(treeNodes, function (treeNode) {
                        array.forEach(flattenChildHierarchy(treeNode, []).reverse(), function (childItem) {
                            this._onItemDelete(childItem);
                        }, this);
                    }, this);
                }
            }

            this.inherited(arguments);
        },

        _setTypeIdentifiersAttr: function (value) {
            this._set("typeIdentifiers", value);

            if (this.model) {
                this.model.typeIdentifiers = value;
            }
        },

        getTooltip: function (item) {

            // summary:
            //		Overridden to select data for the tooltip
            // tags:
            //		public, extension
            var getter = this.model.getTooltip || this.model.getLabel;
            var reference = new ContentReference(item.contentLink),
                baseTooltip = getter ? getter(item) : this.inherited(arguments);

            return baseTooltip ? formatters.title(baseTooltip, reference.id, item.contentTypeName) : baseTooltip;

        },

        buildNodeFromTemplate: function (args) {
            // summary:
            //      Build tree node from the given template.
            // args: Object
            //      Tree node creation arguments
            // tags:
            //      extension

            return new this.nodeConstructor(args);
        },

        _createTreeNode: function (/*Object*/args) {
            // summary:
            //      Overridable function to make tree node draggable after creation
            // args: Object
            //      Tree node creation arguments
            // tags:
            //      extension

            var params = lang.mixin({}, args, {
                dndData: args.item
            });

            return this.buildNodeFromTemplate(params);
        },

        getIconClass: function (/*dojo/data/Item*/item, /*Boolean*/opened) {
            // summary:
            //      Overridable function to return CSS class name to display icon
            // tags:
            //      extension

            if (!item) {
                return this.inherited(arguments);
            }

            var iconNodeClass = TypeDescriptorManager.getValue(item.typeIdentifier, "iconClass");
            if (this.model.isTypeOfRoot(item)) {
                return this.model.getObjectIconClass(item, iconNodeClass);
            }

            var supportsOpenCssClass = TypeDescriptorManager.getValue(item.typeIdentifier, "supportsOpenCssClass");

            if (opened && !item.isSubRoot && supportsOpenCssClass) {
                iconNodeClass = iconNodeClass + "Open";
            }

            return iconNodeClass + this._getItemDisableStyle(item);
        },

        getLabelClass: function (item, expanded) {
            // summary:
            //      Overridable function to return CSS class name to display node label
            // tags:
            //      extension

            return this._getItemDisableStyle(item);
        },

        focus: function () {
            // summary:
            //      Set focus to the widget.
            // tags:
            //      public

            this.focusNode(this.get("selectedNode") || this.rootNode);
        },

        _getItemDisableStyle: function (/* dojo/data/Item */item) {
            // summary:
            //      Returns the disabled style/css class for the given item only if disableRestrictedTypes is enabled and item is not part of allowedTypes
            // item:
            //      dojo/data/Item
            // tags:
            //      private

            if (this.disableRestrictedTypes) {
                return this._isItemRestricted(item) ? " is-disabled " : "";
            }

            return "";
        },

        _isItemRestricted: function (/* dojo/data/Item */item) {
            // summary:
            //      Checks whether the given item is restricted based on the allowedTypes
            // item:
            //      dojo/data/Item
            // tags:
            //      private

            var acceptedTypes = TypeDescriptorManager.getValidAcceptedTypes([item.typeIdentifier], this.allowedTypes, this.restrictedTypes);

            return !acceptedTypes.length;
        },

        _getTargetPath: function (/*String*/targetContent) {
            // summary:
            //      Get target content path
            // targetContent:
            //      Target content identity
            // tags:
            //      private

            var model = this.model,
                deferred = new Deferred();

            model.getAncestors(targetContent, function (ancestors) {
                // Path should include the target content, so push it onto the array for conversion.
                ancestors.push(targetContent);

                var targetPath = array.map(ancestors, function (item) {
                    return model.getIdentity(item).toString();
                });

                if (typeof model.filterAncestors === "function") {
                    targetPath = model.filterAncestors(targetPath);
                }

                deferred.resolve(targetPath);
            });

            return deferred.promise;
        },

        _isValidTargetContent: function (/*String*/content) {
            // summary:
            //      Validate target content before using
            // tags:
            //      private

            if (!content) {
                return false;
            }

            return !content.isDeleted && !content.isWastebasket;
        },

        _onSelect: function (id, setFocus, onComplete) {
            // summary:
            //      Raise event to set an item as selected
            // tags:
            //      private

            var selectedNode = this.get("selectedNode");
            this.tree.model.set("previousContextualSelection", {
                selectedContent: selectedNode
            });

            this.selectContent(id, setFocus, true, onComplete).then(lang.hitch(this, function () {
                selectedNode = this.get("selectedNode");
                if (selectedNode && selectedNode.item && selectedNode.item.contentLink) {
                    this.emit("select", selectedNode.item, selectedNode);
                }
            }));
        },

        selectContent: function (contentReferenceAsString, setFocus, needParentRefresh, onComplete) {
            // summary:
            //      Select a given page.
            // return: a <c href="dojo/Deferred" /> object which when it resolves will return pageName
            // tags:
            //      public

            var self = this,
                model = self.model,
                deferred = new Deferred(),
                setPaths = function (paths) {
                    self._preparePathNodes(paths);
                    self._setRecursivePaths(paths, deferred, setFocus, onComplete);
                };

            when(model.store.get(contentReferenceAsString), function (content) {
                if (!self._isValidTargetContent(content)) {
                    // Remark: Is this needed any more?
                    self.set("paths", []);
                    deferred.resolve(null);
                } else {
                    self._getTargetPath(content).then(function (targetPath) {
                        self._onSetTargetPath();
                        setPaths(targetPath);
                    });
                }
            });

            return deferred.promise;
        },

        _onSetTargetPath: function () {
            // summary:
            //      Handles selection when set target path for the tree.
            // tags:
            //      private

            if (!this.handleSelection) {
                return;
            }

            var selectedNode = this.get("selectedNode");
            if (selectedNode) {
                // Get selected node one more time by getNodesByItem() function
                // in order to ensures that the node is existing in the tree.
                selectedNode = this.getNodesByItem(selectedNode.item)[0];
                if (selectedNode) {
                    this.model.set("previousSelection", {
                        selectedContent: selectedNode,
                        selectedAncestors: selectedNode.getTreePath()
                    });
                }
            }
        },

        _preparePathNodes: function (paths) {
            // summary:
            //      Prepare steps before node selection in the tree
            // tags:
            //      protected, extension
        },

        _setRecursivePaths: function (paths, deferred, setFocus, onComplete) {
            if (!paths || paths.length === 0) {
                return;
            }

            this.set("paths", [paths]).then(lang.hitch(this, function () {
                var selectedNode = this.get("selectedNode");
                if (!selectedNode) {
                    // We didn't find a node to select. Remove the last node in the path and try again.
                    this._setRecursivePaths(paths.slice(0, -1), deferred, setFocus, onComplete);

                    return;
                }

                if (setFocus) {
                    this.focus();
                }

                if (onComplete) {
                    onComplete(selectedNode);
                }

                deferred.resolve(selectedNode);
            }, deferred.reject));
        },

        _onKeyDown: function (item, e) {
            // summary:
            //      Handles onKeyDown event to process cut, copy, paste, delete action (non-printable characters).
            // e:
            //      Event object
            // tags:
            //      private

            this.inherited(arguments);

            if (!this.allowManipulation) {
                return;
            }

            if (connect.isCopyKey(e)) {
                var character = e.keyCode ? String.fromCharCode(e.keyCode).toLowerCase() : "";
                switch (character) {
                    case "c":
                        this.emit("copyOrCut", true);
                        break;
                    case "x":
                        this.emit("copyOrCut", false);
                        break;
                    case "v":
                        this.emit("paste");
                        break;
                    default:
                        break;
                }
            }

            if (e.altKey || e.ctrlKey || e.metaKey) {
                return;
            }

            // catch F10 key
            if (e.shiftKey && e.keyCode === keys.F10) {
                this.emit("showContextMenu", e);
                e.preventDefault();
                return;
            }

            // Catch DELETE key
            if (e.shiftKey) {
                return;
            }
            if (e.keyCode === keys.DELETE) {
                this.emit("delete");
            }
        },

        _onNodeMouseLeave: function (/* Tree._TreeNode */node, evt) {
            // summary:
            //      Handles mouse leave event on a node
            // tags:
            //      private

            this.inherited(arguments);

            // Remove dijitTreeRowHover class for all tree nodes when mouse leave on a node (in IE browser, dijitTreeRowHover css class added by _CssStateMixin did not removed)
            if (sniff("ie")) {
                array.forEach(query(".dijitTreeRow.dijitTreeRowHover", this.tree.domNode), function (node) {
                    domClass.remove(node, "dijitTreeRowHover");
                });
            }
        }

    });

});
