define("epi/shell/dnd/tree/multiDndSource", [
    "dojo/_base/array", // array.forEach array.indexOf array.map
    "dojo/_base/connect", // isCopyKey
    "dojo/_base/declare", // declare
    "dojo/aspect",
    "dojo/dom-class", // domClass.add
    "dojo/dom-geometry", // domGeometry.position
    "dojo/_base/lang", // lang.mixin lang.hitch
    "dojo/on", // subscribe
    "dojo/touch",
    "dojo/topic",
    "dojo/dnd/Manager",
    "dojo/when",
    "dijit/tree/dndSource",
    "../_DndDataMixin",
    "epi/shell/TypeDescriptorManager"
], function (array, connect, declare, aspect, domClass, domGeometry, lang, on, touch, topic, dndManager, when, dndSource, _DndDataMixin, TypeDescriptorManager) {
    return declare([dndSource, _DndDataMixin], {
        // tags:
        //      internal xproduct

        generateText: false,

        //	singular: Boolean
        //      Allows selection of only one element, if true.
        //      Tree hasn't been tested in singular=true mode, unclear if it works.
        singular: false,

        constructor: function () {
            // If there are restricted types then add them to the accept array
            // with a value of zero to indicated that they are not accepted.
            var reject = this.reject;
            if (reject) {

                // we need to filter out restrictedDndTypes
                var allowedDnD = [];
                for (var key in this.accept) {
                    allowedDnD.push(key);
                }

                this.accept = {};
                allowedDnD = TypeDescriptorManager.removeIntersectingTypes(allowedDnD, this.reject);
                array.forEach(allowedDnD, function (allowed) {
                    this.accept[allowed] = 1;
                }, this);

                for (var i = 0; i < reject.length; ++i) {
                    this.accept[reject[i]] = 0;
                }
            }

            var manager = dndManager.manager();
            this._startDragHandle = aspect.before(manager, "startDrag", this._beforeStartDrag.bind(this));
        },

        destroy: function () {
            this.inherited(arguments);
            this._startDragHandle.remove();
            delete this._startDragHandle;
        },

        _beforeStartDrag: function (source, nodes, copy) {
            // summary:
            //      Replaces the nodes argument to include all selected nodes, not just parent nodes.
            //      dijit/tree/dndSource filters out nodes that are children to other nodes before calling startDrag.
            //      See: https://github.com/dojo/dijit/blob/1bd0548b63989418fc69a46976f5749651473ebb/tree/dndSource.js#L226
            // source: Object
            //      The dijit/tree/dndSource / dojo/dnd/Source which is providing the items
            // nodes: DomNode[]
            //      The list of transferred items, dndTreeNode nodes if dragging from a Tree
            // copy: Boolean
            //      Copy items, if true, move items otherwise
            // tags:
            //      private

            if (source !== this) {
                return arguments;
            }

            var allNodes = this.getSelectedTreeNodes();
            if (!allNodes.length) {
                return arguments;
            }

            allNodes = allNodes.map(function (treeNode) {
                return treeNode.domNode;
            });

            return [source, allNodes, copy];
        },

        deleteSelectedNodes: function () {
            // Method needed to interact with other sources but should not do anything
        },

        onDndDrop: function (source, nodes, copy, target) {
            // summary:
            //      Topic event processor for /dnd/drop, called to finish the DnD operation.
            // description:
            //      Updates data store items according to where node was dragged from and dropped
            //      to.   The tree will then respond to those data store updates and redraw itself.
            // source: Object
            //      The dijit.tree.dndSource / dojo.dnd.Source which is providing the items
            // nodes: DomNode[]
            //      The list of transferred items, dndTreeNode nodes if dragging from a Tree
            // copy: Boolean
            //      Copy items, if true, move items otherwise
            // tags:
            //      protected

            if (this.containerState === "Over") {
                var tree = this.tree,
                    model = tree.model,
                    targetAnchor = this.targetAnchor;

                this.isDragging = false;

                // Compute the new parent item
                var insertIndex;
                var newParentItem = (targetAnchor && targetAnchor.item) || tree.item;
                if (this.dropPosition === "Before" || this.dropPosition === "After") {
                    // Actually this should be checked during onMouseMove too, to make the drag icon red.
                    newParentItem = (targetAnchor.getParent() && targetAnchor.getParent().item) || tree.item;
                    // Compute the insert index for reordering
                    insertIndex = targetAnchor.getIndexInParent();
                    if (this.dropPosition === "After") {
                        insertIndex = targetAnchor.getIndexInParent() + 1;
                    }
                }

                // Get the hash to pass to model.newItem() / pasteItem().  A single call to
                // itemCreator() returns an array of hashes, one for each drag source node.
                var items = this.itemCreator(nodes, targetAnchor.rowNode, source, target);
                if (source === this) {
                    // This is a node from my own tree, and we are moving it, not copying.
                    // Remove item from old parent's children attribute.
                    // and this code should go there.

                    if (model.pasteItems) {
                        var pasteItems = items.map(function (item) {
                            if (item.dndData) {
                                return item.dndData.data;
                            }
                            return item;
                        });
                        model.pasteItems(pasteItems, newParentItem, copy, insertIndex);
                    } else {
                        array.forEach(items, function (item) {
                            if (item.dndData) {
                                var options = item.dndData.options;
                                var oldParentItem = options ? options.oldParentItem : null;
                                var indexInParent = options ? options.indexInParent : 0;

                                if (typeof insertIndex == "number") {
                                    if (newParentItem === oldParentItem && indexInParent < insertIndex) {
                                        insertIndex -= 1;
                                    }
                                }

                                model.pasteItem(item.dndData.data, oldParentItem, newParentItem, copy, insertIndex);
                            }
                        });
                    }
                } else {
                    // Create new items in the tree, based on the drag source.
                    if (model.newItems) {
                        model.newItems(items, newParentItem, insertIndex);
                    } else {
                        array.forEach(items, function (item) {
                            model.newItem(item, newParentItem, insertIndex);
                        });
                    }
                }

                // If both source and target have completed there event chains raise an onDndEnd.
                if (!source.isDragging && !target.isDragging) {
                    this.onDndEnd();
                }
            }

            //If the nodes has been dropped in another target and copy is set to false, raise the onDndItemRemoved on the source if it supports it
            if (this === target && source !== target && !copy && source.onDndItemRemoved) {
                var dndData = array.map(nodes, function (node) {
                    return this._getDndData(source.getItem(node.id), this.accept, false);
                }, this);
                source.onDndItemRemoved(dndData, source, nodes, copy, target);
            }

            this.onDndCancel();
        },

        onMouseOut: function () {
            // summary:
            //      Event processor for when mouse is moved away from a TreeNode
            // tags:
            //      private

            this.inherited(arguments);

            if (this._expandOnDndTimeout) {
                clearTimeout(this._expandOnDndTimeout);
            }
        },

        _onDragMouse: function (e, firstTime) {
            // summary:
            //      Helper method for processing onmousemove/onmouseover events while drag is in progress.
            //      Keeps track of current drop target.
            // e: Event
            //      The mousemove event.
            // firstTime: Boolean?
            //      If this flag is set, this is the first mouse move event of the drag, so call m.canDrop() etc.
            //      even if newTarget == null because the user quickly dragged a node in the Tree to a position
            //      over Tree.containerNode but not over any TreeNode (#7971)

            this.inherited(arguments);

            // Double check for droppable ability in case checkItemAcceptance() returns deferred,
            // because base _onDragMouse() only works correctly with checkItemAcceptance() that returns boolean.
            var m = dndManager.manager();
            if (m.canDropFlag) {
                when(this.checkItemAcceptance(this.current.rowNode, m.source, this.dropPosition.toLowerCase()), function (accepted) {
                    m.canDrop(accepted);
                });
            }

            if (this._expandOnDndTimeout) {
                clearTimeout(this._expandOnDndTimeout);
            }

            // Expand the targetAnchor node (if it's currently collapsed) so the user can see
            // where their node was dropped. In particular since that node is still selected.
            if (this.tree && this.tree.expandOnDnd === true && this.targetAnchor) {
                this._expandOnDndTimeout = setTimeout(function () {
                    // Only try to expand target node when still dragging
                    this.isDragging && this.tree._expandNode(this.targetAnchor);
                }.bind(this), 500);
            }
        },

        onDndEnd: function () {
            // summary:
            //      Event raised when both source and target have completed their drag events.
            // tags:
            //      callback
        },

        onDndItemRemoved: function (dndData, source, nodes, copy, target) {
            // summary:
            //      Called when the nodes has been removed from the source, i.e. dropped in another target
            //
            // dndData:
            //    Dnd data extracted from the dragging items which have the same data type to the current target
            //
            // source:
            //    The dnd source.
            //
            // nodes:
            //    The dragging nodes.
            //
            // copy:
            //    Denote that the drag is copy.
            //
            // tags:
            //    public, event
        },

        itemCreator: function (nodes, targetNode, source, target) {
            // summary:
            //      Returns objects passed to `Tree.model.newItem()` based on DnD nodes
            //      dropped onto the tree.
            // description:
            //      For each node in nodes[], which came from source, create a hash of name/value
            //      pairs to be passed to Tree.model.newItem().  Returns array of those hashes.
            // nodes: DomNode[]
            // targetNode: DomNode
            // source: dojo/dnd/Source
            // target: dojo/dnd/Source
            // returns: __Item[]
            //      Array of name/value hashes for each new item to be added to the Tree
            // tags:
            //      extension
            return array.map(nodes, function (node) {
                return {
                    id: node.id,
                    name: node.textContent || node.innerText || "",
                    dndData: this._getDndData(source.getItem(node.id), this.accept, this === source)
                };
            }, this);
        },

        getItem: function (/*String*/key) {
            // summary:
            //      Returns the dojo.dnd.Item (representing a dragged node) by it's key (id).
            //      Called by dojo.dnd.Source.checkAcceptance().
            // tags:
            //      protected
            var item = this.inherited(arguments);

            // change drag type for the tree
            if (this.tree.getItemType && item && item.data && item.data.item) {
                item.type = this.tree.getItemType(item.data.item);
            }

            // add other options
            item.options = this.getItemOptions(item);

            return item;
        },

        getItemOptions: function (item) {
            // summary:
            //      Add options for each item. Called by getItem.

            var opts = {};
            if (item.data) {
                if (item.data.getParent) {
                    var oldParent = item.data.getParent();
                    opts.oldParentItem = oldParent ? oldParent.item : null;
                }

                if (item.data.getIndexInParent) {
                    opts.indexInParent = item.data.getIndexInParent();
                }
            }
            return opts;
        },

        onMouseDown: function (e) {
            // summary:
            //      Event processor for onmousedown/ontouchstart.
            //      Override this to prevent dnd when user mouses down on scroll bar.
            // e: Event
            //      onmousedown/ontouchend event
            // tags:
            //      protected override

            // Prevent drag/drop from happening when user mouses down on scrollbar.
            var isContainer = domClass.contains(e.target, "dojoDndContainerOver");
            // Prevent drag/drop from happening when user mouses down between nodes.
            var isTreeContainer = domClass.contains(e.target, "dijitTreeContainer");
            if (isContainer || isTreeContainer) {
                return;
            }

            this.inherited(arguments);
        },

        onMouseUp: function (e) {

            // If multiple items are selected and the user clicks on the context menu
            // then it should not de-select the selected items
            if (this.current) {
                var id = this.current.id;

                if (!this.singular && !e.shiftKey && this.selection[id] && domClass.contains(e.target, "epi-iconContextMenu")) {
                    this._doDeselect = false;
                }
            }

            this.inherited(arguments);
        },

        checkAcceptance: function (source, nodes) {
            // summary:
            //		Checks if the target can accept nodes from this source.
            // source: Object
            //		The source which provides items.
            // nodes: Array
            //		The list of transferred items.

            if (this.readOnly) {
                return false;
            }

            var items = array.map(nodes, function (node) {
                return source.getItem(node.id);
            });

            return this._checkAcceptanceForItems(items, this.accept);
        }
    });
});
