define("epi/shell/widget/Tree", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",

    // Dijit
    "dijit/focus",
    "dijit/Tree"
],

function (
// Dojo
    array,
    declare,
    lang,
    dom,

    // Dijit
    focus,
    Tree
) {

    return declare(Tree, {
        // summary:
        //      Extends dijit/Tree with support for reloading expanded nodes
        //      by listening to the onItemChildrenReload event of the model.
        //      The subscriber needs to call getChildren to get the updated children collection
        // tags:
        //      public

        // dndParams: [internal] Array
        //      Parameters to pull off of the tree and pass on to the dndController as its params.
        dndParams: ["accept", "reject"].concat(Tree.prototype.dndParams),

        postCreate: function () {
            this.inherited(arguments);
            this.connect(this.model, "onItemChildrenReload", "_onChildrenReload");
        },

        _onChildrenReload: function (/*dojo/data/Item*/parent) {
            // summary:
            //      Processes notification of a change to an item's children
            // tags:
            //      private

            var identity = this.model.getIdentity(parent),
                parentNodes = this._itemNodesMap[identity];

            if (parentNodes) {
                if (array.some(parentNodes, function (node) {
                    return node.state === "LOADED";
                })) {
                    this.model.getChildren(parent, lang.hitch(this, function (newChildrenList) {
                        array.forEach(parentNodes, function (parentNode) {
                            parentNode.setChildItems(newChildrenList);
                        });

                        array.forEach(newChildrenList, function (child) {
                            // Update node's item
                            this.model.onChange(child);
                            // Recursive reload
                            this._onChildrenReload(child);
                        }, this);
                    }));
                } else {
                    // Maybe we process more than makeExpandable method
                    array.forEach(parentNodes, function (node) {
                        node.isExpandable = this.model.mayHaveChildren(node.item);
                        node._setExpando(false);
                    }, this);
                }
            }
        },

        _onItemChildrenChange: function () {
            // summary:
            //      Overridden in an effort to keep focus in the tree when the children changes.
            //      Since the tree detaches the nodes from the dom when refreshing children the
            //      focus will be lost

            var currentFocus = null;

            // Do we currently have focus
            if (focus.curNode && dom.isDescendant(focus.curNode, this.domNode)) {
                currentFocus = focus.curNode;
            }

            this.inherited(arguments);

            // Try to restore focus to the tree
            if (currentFocus) {
                if (dom.isDescendant(currentFocus, this.domNode)) {
                    currentFocus.focus();
                } else {
                    // We had focus but the previously focused node is not alive.
                    var node = this._getRootOrFirstNode();
                    if (node) {
                        this.focusNode(node);
                    }
                }
            }
        }
    });

});
