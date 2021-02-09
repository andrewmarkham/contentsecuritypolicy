//TODO: Remove when dojo upgrades to 1.9
//Fix for http://bugs.dojotoolkit.org/ticket/15858
//Changeset: http://bugs.dojotoolkit.org/changeset/29553/dojo

define("epi/patch/dijit/tree/Tree", [
    "dojo/_base/array",
    "dojo/_base/lang",

    "dojo/DeferredList", // DeferredList

    "dijit/_Container",
    "dijit/Tree"
],

function (
    array,
    lang,

    DeferredList,

    _Container,
    Tree
) {

    lang.mixin(Tree._TreeNode.prototype, {

        setChildItems: function (/* Object[] */items) {
            // summary:
            //		Sets the child items of this node, removing/adding nodes
            //		from current children to match specified items[] array.
            //		Also, if this.persist == true, expands any children that were previously
            //		opened.
            // returns:
            //		Deferred object that fires after all previously opened children
            //		have been expanded again (or fires instantly if there are no such children).

            var tree = this.tree,
                model = tree.model,
                defs = []; // list of deferreds that need to fire before I am complete


            // Orphan all my existing children.
            // If items contains some of the same items as before then we will reattach them.
            // Don't call this.removeChild() because that will collapse the tree etc.
            var oldChildren = this.getChildren();
            array.forEach(oldChildren, function (child) {
                _Container.prototype.removeChild.call(this, child);
            }, this);

            // All the old children of this TreeNode are subject for destruction if
            //		1) they aren't listed in the new children array (items)
            //		2) they aren't immediately adopted by another node (DnD)
            this.defer(function () {
                array.forEach(oldChildren, function (node) {
                    if (!node._destroyed && !node.getParent()) {
                        // If node is in selection then remove it.
                        tree.dndController.removeTreeNode(node);

                        // Deregister mapping from item id --> this node and its descendants
                        function remove(node) {
                            var id = model.getIdentity(node.item),
                                ary = tree._itemNodesMap[id];
                            if (ary && ary.length == 1) {
                                delete tree._itemNodesMap[id];
                            } else {
                                var index = array.indexOf(ary, node);
                                if (index != -1) {
                                    ary.splice(index, 1);
                                }
                            }
                            array.forEach(node.getChildren(), remove);
                        }
                        remove(node);

                        // And finally we can destroy the node
                        node.destroyRecursive();
                    }
                });
            });

            this.state = "LOADED";

            if (items && items.length > 0) {
                this.isExpandable = true;

                // Create _TreeNode widget for each specified tree node, unless one already
                // exists and isn't being used (presumably it's from a DnD move and was recently
                // released
                array.forEach(items, function (item) {	// MARKER: REUSE NODE
                    var id = model.getIdentity(item),
                        existingNodes = tree._itemNodesMap[id],
                        node;
                    if (existingNodes) {
                        for (var i = 0; i < existingNodes.length; i++) {
                            if (existingNodes[i] && !existingNodes[i].getParent()) {
                                node = existingNodes[i];
                                node.set('indent', this.indent + 1);
                                break;
                            }
                        }
                    }
                    if (!node) {
                        node = this.tree._createTreeNode({
                            item: item,
                            tree: tree,
                            isExpandable: model.mayHaveChildren(item),
                            label: tree.getLabel(item),
                            tooltip: tree.getTooltip(item),
                            ownerDocument: tree.ownerDocument,
                            dir: tree.dir,
                            lang: tree.lang,
                            textDir: tree.textDir,
                            indent: this.indent + 1
                        });
                        if (existingNodes) {
                            existingNodes.push(node);
                        } else {
                            tree._itemNodesMap[id] = [node];
                        }
                    }
                    this.addChild(node);

                    // If node was previously opened then open it again now (this may trigger
                    // more data store accesses, recursively)
                    if (this.tree.autoExpand || this.tree._state(node)) {
                        defs.push(tree._expandNode(node));
                    }
                }, this);

                // note that updateLayout() needs to be called on each child after
                // _all_ the children exist
                array.forEach(this.getChildren(), function (child) {
                    child._updateLayout();
                });
            } else {
                this.isExpandable = false;
            }

            if (this._setExpando) {
                // change expando to/from dot or + icon, as appropriate
                this._setExpando(false);
            }

            // Set leaf icon or folder icon, as appropriate
            this._updateItemClasses(this.item);

            // On initial tree show, make the selected TreeNode as either the root node of the tree,
            // or the first child, if the root node is hidden
            if (this == tree.rootNode) {
                var fc = this.tree.showRoot ? this : this.getChildren()[0];
                if (fc) {
                    fc.setFocusable(true);
                    tree.lastFocused = fc;
                } else {
                    // fallback: no nodes in tree so focus on Tree <div> itself
                    tree.domNode.setAttribute("tabIndex", "0");
                }
            }

            var def = new DeferredList(defs);
            this.tree._startPaint(def); // to reset TreeNode widths after an item is added/removed from the Tree
            return def; // dojo/_base/Deferred
        }

    });

    Tree._TreeNode.prototype.setChildItems.nom = "setChildItems";

    // Partial fix, removing an expensive resize operation. Remove when upgrading to 1.9 where a more substantial fix has been implemented
    lang.mixin(Tree.prototype, {
        _adjustWidths: function () {
            // summary:
            //		Get width of widest TreeNode, or the width of the Tree itself, whichever is greater,
            //		and then set all TreeNodes to that width, so that selection/hover highlighting
            //		extends to the edge of the Tree (#13141)

            if (this._adjustWidthsTimer) {
                this._adjustWidthsTimer.remove();
                delete this._adjustWidthsTimer;
            }

            //******** PATCH START *********//

            /*
            var maxWidth = 0,
                nodes = [];
            function collect(parent) {
                var node = parent.rowNode;
                node.style.width = "auto";		// erase setting from previous run
                maxWidth = Math.max(maxWidth, node.clientWidth);
                nodes.push(node);
                if (parent.isExpanded) {
                    array.forEach(parent.getChildren(), collect);
                }
            }
            collect(this.rootNode);
            maxWidth = Math.max(maxWidth, domGeometry.getContentBox(this.domNode).w);	// do after node.style.width="auto"
            array.forEach(nodes, function (node) {
                node.style.width = maxWidth + "px";		// assumes no horizontal padding, border, or margin on rowNode
            });
            */

            //******** PATCH END *********//

        }
    });

    Tree.prototype._adjustWidths.nom = "_adjustWidths";

});
