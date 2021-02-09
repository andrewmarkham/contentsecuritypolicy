define("epi-cms/widget/CategoryTree", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dijit/Tree",

    "epi",
    "epi-cms/widget/_CategoryTreeNode",
    "epi-cms/widget/CategoryTreeStoreModel"
],

function (
    array,
    declare,
    lang,

    Tree,

    epi,
    _CategoryTreeNode,
    CategoryTreeStoreModel
) {

    return declare([Tree], {
        // summary:
        //      The EPiServer Category tree.
        //      The page tree shows the EPiServer Category  page tree using a REST store to fetch the data.
        // tags:
        //      internal

        // Hide the root node.
        showRoot: false,

        // selectedNodeIds: [Array] public
        //      Array of selected node identies
        selectedNodeIds: null,

        // selectedNodeData: [Object] public
        //      Object that hold all necessary information about selected nodes
        selectedNodeData: null,

        constructor: function () {
            this.selectedNodeIds = [];
            this.selectedNodeData = {};
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.model) {
                this.model = new CategoryTreeStoreModel({rootCategory: this.rootCategory});
                this.persist = false;
            }
        },

        postCreate: function () {
            this.inherited(arguments);

            this.connect(this, "onOpen", lang.hitch(this, this._onNodeOpen));
            this.connect(this, "onClose", lang.hitch(this, this._onNodeClose));

            this.watch("selectedNodeData", lang.hitch(this, this._loadSelectedNodes));
        },

        startup: function () {

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            // Disabling multiselect in tree
            this.dndController.singular = true;
        },

        buildNodeFromTemplate: function (args) {
            // summary:
            //      Build tree node from the given template.
            // args: Object
            //      Tree node creation arguments
            // tags:
            //      extension

            return new _CategoryTreeNode(args);
        },

        getTooltip: function (item) {
            // summary:
            //		Overridden to select data for the tooltip
            // tags:
            //		public, extension

            var getter = this.model.getTooltip || this.model.getLabel;

            return getter ? getter(item) : this.inherited(arguments);

        },

        getNodeById: function (categoryId) {
            // summary:
            //      get the tree node by category id.
            // categoryId:
            //      the category id.
            // tags:
            //      public

            var nodes = this.getNodesByItem(categoryId.toString());
            if (!nodes) {
                return null;
            }

            return nodes[0];
        },

        _getTotalSelectedNodes: function (/*Object*/parentNode, /*Array*/selectedNodeIds, /*Object*/selectedData) {
            // summary:
            //      Get total selected child nodes under the given collapsed parent node
            // parentNode:
            //      Parent tree node that we want to display total selected child items (contains selected child nodes or not)
            // selectedNodeIds:
            //      Selected child node identities
            // selectedData:
            //      Selected child node data (object that contains selected child node identities and its parent names
            // tags:
            //      private

            if (!parentNode || !parentNode.item || !parentNode.item.hasChildren ||
                !lang.isArray(selectedNodeIds) || selectedNodeIds.length === 0 ||
                !selectedData) {
                return 0;
            }

            var totalItems = 0,
                targetArray = [], compareArray = [],
                parentsNameCollection = lang.clone(parentNode.item.parentsNameCollection);

            var removeSelectedItem = function (targetArray) {
                if (lang.isArray(targetArray) && targetArray.length > 0) {
                    targetArray.pop();
                }
            };

            parentsNameCollection[parentsNameCollection.length - 1] = parentNode.item.description;

            array.forEach(selectedNodeIds, function (selectedNodeId) {

                targetArray = lang.clone(selectedData[selectedNodeId]);
                // Remove selected node from selected path
                removeSelectedItem(targetArray);

                // Ensure we count correct in case the selected nodes that have the same name, but in other levels
                compareArray = lang.clone(targetArray);
                lang.mixin(compareArray, parentsNameCollection);

                if (lang.isArray(targetArray) && epi.areEqual(targetArray, compareArray)) {
                    totalItems++;
                }
            }, this);

            return totalItems;
        },

        _setTotalSelectedNodes: function (/*Tree._TreeNode*/parentNode) {
            // summary:
            //      Set total selected nodes recurisvely
            // tags:
            //      private

            if (parentNode) {
                parentNode.set("totalSelectedNodes", this._getTotalSelectedNodes(parentNode, this.selectedNodeIds, this.selectedNodeData));

                array.forEach(parentNode.getChildren(), function (childNode) {
                    if (childNode && childNode.item && childNode.item.hasChildren) {
                        if (childNode.isExpanded) {
                            this._setTotalSelectedNodes(childNode);
                        } else {
                            childNode.set("totalSelectedNodes", this._getTotalSelectedNodes(childNode, this.selectedNodeIds, this.selectedNodeData));
                        }
                    }
                }, this);
            }
        },

        _loadSelectedNodes: function () {
            // summary:
            //      Set selected nodes when the first time this tree show
            // tags:
            //      private

            this.expandChildrenDeferred.then(lang.hitch(this, function () {
                this.set("toggleSelectNodes", this.rootNode, this.selectedNodeIds);
                this._setTotalSelectedNodes(this.rootNode);
            }));
        },

        _onNodeCreated: function (node) {
            // summary:
            //      onNodeCreated event.
            // node:
            //      the tree node.
            // tags:
            //      private

            node.set("totalSelectedNodes", this._getTotalSelectedNodes(node, this.selectedNodeIds, this.selectedNodeData));
        },

        _onNodeSelectChanged: function (checked, item) {
            // summary:
            //      onNodeSelectChanged event.
            // checked:
            //      true if the check box is checked,otherwise false.
            // item:
            //      the tree node item.
            // tags:
            //      private

            if (!this.getNodeById(item.id)) {
                return;
            }

            var index = this.selectedNodeIds.indexOf(item.id),
                exist = index !== -1;

            if (checked && !exist) {
                this.selectedNodeIds.push(item.id);
                this.selectedNodeData[item.id] = item.parentsNameCollection;
            }

            if (!checked && exist) {
                this.selectedNodeIds.splice(index, 1);
                this.selectedNodeData[item.id] = {};
            }
        },

        _onNodeOpen: function (item, node) {
            // summary:
            //      handles node expanded event.
            // treeNode:
            //      the tree node.
            // item:
            //      the tree node item.
            // tags:
            //      private

            this.set("toggleSelectNodes", node, this.selectedNodeIds);
            this._setTotalSelectedNodes(node);
        },

        _onNodeClose: function (item, node) {
            // summary:
            //      handles node closed event.
            // treeNode:
            //      the tree node.
            // item:
            //      the tree node item.
            // tags:
            //      private

            this._setTotalSelectedNodes(node);
        },

        _setToggleSelectNodesAttr: function (/*Object*/parentNode, /*Array*/toggleNodeIds) {
            // summary:
            //      Set selected for the given nodes in tree
            // tags:
            //      private

            if (!parentNode || !lang.isArray(toggleNodeIds)) {
                return;
            }

            var checked = false;
            array.forEach(parentNode.getChildren(), function (childNode) {
                if (childNode) {
                    checked = toggleNodeIds.indexOf(childNode.item.id) !== -1;
                    childNode.set("checked", checked);

                    if (childNode.hasChildren()) {
                        this.set("toggleSelectNodes", childNode, toggleNodeIds);
                    }
                }
            }, this);
        },

        _createTreeNode: function (/*Object*/args) {
            // summary:
            //      Overridable function to create tree node.
            // args: Object
            //      Tree node creation arguments
            // tags:
            //      extension

            var node = this.buildNodeFromTemplate(args);
            node.connect(node, "onNodeSelectChanged", lang.hitch(this, function (checked, item) {
                this._onNodeSelectChanged(checked, item);
            }));

            this._onNodeCreated(node);

            return node;
        }
    });

});
