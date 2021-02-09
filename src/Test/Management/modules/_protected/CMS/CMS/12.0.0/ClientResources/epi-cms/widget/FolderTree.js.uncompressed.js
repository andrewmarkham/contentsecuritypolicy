define("epi-cms/widget/FolderTree", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-attr",
    "dojo/dom-class",

    "dojo/aspect",
    "dojo/json",
    "dojo/when",
    // dojox
    "dojox/html/entities",
    // dijit
    "dijit/tree/_dndSelector",
    // epi
    "epi/dependency",
    "epi/string",

    "epi/shell/widget/_FocusableMixin",

    "epi-cms/widget/_FolderTreeNode",
    "epi-cms/widget/ContentTree",
    "epi-cms/widget/ContentTreeStoreModel"
],

function (
// dojo
    array,
    declare,
    lang,

    domAttr,
    domClass,

    aspect,
    json,
    when,
    // dojox
    htmlEntities,
    // dijit
    _dndSelector,
    // epi
    dependency,
    epiString,

    _FocusableMixin,

    _FolderTreeNode,
    ContentTree,
    ContentTreeStoreModel
) {

    return declare([ContentTree, _FocusableMixin], {
        // summary:
        //      The EPiServer block folder tree.
        // description:
        //      The block folder tree shows the EPiServer CMS block folder tree using a REST store to fetch the data.
        // tags:
        //      internal

        // handleSelection: [public] Boolean
        //      Flag that indicates this tree need to reset selection each time it had refresh
        handleSelection: true,

        postCreate: function () {

            var self = this;

            self.inherited(arguments);

            self.own(
                self.connect(self.model, "onDeleted", lang.hitch(self, self._onDeleted)),
                aspect.around(self.model, "onRefreshRoots", function (original) {
                    return function (refreshItem) {
                        if (refreshItem && typeof self._onItemDelete === "function") {
                            self._onItemDelete(refreshItem);
                        }

                        return original.apply(self.model, [refreshItem]);
                    };
                })
            );
        },

        toggleCut: function (/*Object*/item, /*Boolean*/isCut) {
            // summary
            //      Mark folder is cutting
            // item:
            //      Object are cutting and save on clipboard
            // tags:
            //      public

            var node = this.tree.getNodesByItem(item)[0];
            if (node) {
                domClass.toggle(node.rowNode, "epi-opacity50", isCut);
            }
        },

        _createTreeModel: function () {
            // summary:
            //      Create content tree model
            // tags:
            //      protected override

            return new ContentTreeStoreModel({
                store: this.store
            });
        },

        _updateItemDeletedHierachy: function (/* Folder tree node */node) {
            // summary:
            //      Manualy mark node's item is deleted descendant (recursive)
            // node: Tree node
            //      The deleted node
            // tags:
            //      Private

            if (!node) {
                return;
            }

            array.forEach(node.getChildren(), function (childNode) {
                childNode.set({ item: lang.mixin(childNode.item, { isDeleted: true }) });
                this._updateItemDeletedHierachy(childNode); // call recursive
            }, this);
        },

        _onDeleted: function (/* Model's item */item) {
            // summary:
            //      Handler onDeleted event that is raised after folder is deleted
            // item: Folder item
            //      The folder was deleted
            // tags:
            //      Private

            var nodes = this.getNodesByItem(item);

            array.forEach(nodes, function (node) {
                this._updateItemDeletedHierachy(node);
            }, this);
        },

        _renameFolder: function (item, name) {
            var newName = lang.trim(name),
                treeNode = this.getNodesByItem(item)[0];

            if (newName) {
                when(this.model.rename(item.contentLink, newName)).otherwise(
                    function (ex) {
                        treeNode.rollbackLabel(item.name, ex);
                        treeNode.edit();
                    });

            } else {
                treeNode.rollbackLabel(item.name);
            }
        },

        buildNodeFromTemplate: function (/*Object*/args) {
            // summary:
            //      Build tree node from the given template.
            // args:
            //      Tree node creation arguments
            // tags:
            //      extension

            var treeNode = new _FolderTreeNode(args);

            treeNode.bindContextMenu(this.contextMenu);

            this.own(
                treeNode.on("rename", lang.hitch(this, function (val) {
                    this._renameFolder(treeNode.item, val);
                }))
            );

            return treeNode;
        },

        _onNodeMouseEnter: function (/* Tree._TreeNode */node, evt) {
            // summary:
            //      Handles mouse enter event on a node
            // tags:
            //      private

            this.inherited(arguments);
            node._handleMouseEnter();
        },

        _onNodeMouseLeave: function (/* Tree._TreeNode */node, evt) {
            // summary:
            //      Handles mouse leave event on a node
            // tags:
            //      private

            this.inherited(arguments);
            node._handleMouseLeave();
        },

        _onClick: function (/* Tree._TreeNode */node, evt) {
            // summary:
            //      Handles mouse leave event on a node
            // tags:
            //      private

            this.inherited(arguments);
            node._onClick();
        },

        checkAcceptance: function (source, nodes) {
            // summary:
            //      Check if the target can accept nodes from this source.
            //      In the case supportedDndSources is provided, only sources from there will be accepted
            // source: Object
            //      the source which provides items
            // nodes: Array
            //      the list of transferred items
            // tags:
            //      public override

            if (this.tree.supportedDndSources) {
                return this.tree.supportedDndSources.indexOf(source) >= 0;
            } else {
                return this.inherited(arguments);
            }
        }
    });

});
