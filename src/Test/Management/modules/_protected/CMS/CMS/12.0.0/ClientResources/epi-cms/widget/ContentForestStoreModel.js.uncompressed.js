define("epi-cms/widget/ContentForestStoreModel", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/promise/all",
    "dojo/when",
    "epi/epi",
    "epi-cms/widget/ContentTreeStoreModel"
], function (
    array,
    declare,
    lang,
    promiseAll,
    when,
    epi,
    ContentTreeStoreModel
) {

    return declare([ContentTreeStoreModel], {
        // summary:
        //      A store model for tree widgets that must support content with multiple roots.
        // description:
        //      The model creates a fabricated root item in order to support a store that has
        //      content with multiple roots. It is expected that the root will never be displayed
        //      in the tree.
        //
        // tags:
        //      internal xproduct

        // root: [readonly] Object
        //      The fabricated root item for the model.
        root: null,

        constructor: function () {
            this.root = {
                id: "0",
                name: "ROOT"
            };
        },

        // =======================================================================
        // Methods for traversing hierarchy

        isRoot: function (/*dojo/data/Item*/contentItem) {
            // summary:
            //		Checks to see if the item is a root node in the content forest
            // contentItem: [dojo/data/Item]
            //      The given data item object that wanted to verify
            // returns: [Boolean]
            // tags:
            //      public

            var inherited = this.inherited(arguments);
            return inherited || !!(contentItem && this.roots && (array.indexOf(this.roots, this.getIdentity(contentItem)) >= 0));
        },

        getRoot: function (/*Function*/ onItem) {
            // summary:
            //      Calls onItem with the fake root item for the tree.
            onItem(this.root);
        },

        mayHaveChildren: function (item) {
            // summary:
            //      Tells if an item has or may have children.
            // item: Object
            //      Item from the dojo/store
            return item === this.root || this.inherited(arguments); // Boolean
        },

        getChildren: function (parentItem, /*Function*/ onComplete, /*Function*/ onError) {
            // summary:
            //      Calls onComplete() with an array of child items of given parent item.
            // parentItem: Object
            //      Item from the dojo/store
            if (parentItem === this.root) {
                var deferreds = array.map(this.roots, function (item) {
                    return this.store.get(item);
                }, this);

                when(promiseAll(deferreds), onComplete, onError);
            } else {
                this.inherited(arguments);
            }
        },

        getAncestors: function (item, /*Function*/ onComplete) {
            // summary:
            //      Calls onComplete() with an array of ancestors of the given item.
            // item: Object
            //      Item from the dojo/store

            // Return root if item is subroot
            if (this.roots.some(function (subRoot) {
                return this.getIdentity(item) === subRoot;
            }, this)) {
                onComplete([this.root]);
                return;
            }

            var root = this.root,
                callback = lang.hitch(this, function (results) {
                    if (array.some(this.roots, function (subRoot) {
                        return this.getIdentity(results[0]) === subRoot;
                    }, this)) {
                        results.unshift(root);
                    }
                    onComplete(results);
                });

            this.inherited(arguments, [item, callback]);
        },

        // =======================================================================
        // Inspecting items

        getIdentity: function (item) {
            // summary:
            //      Returns identity for an item.
            // item: Object
            //      Item from the dojo/store
            return epi.areEqual(item, this.root) ? this.root.id : this.inherited(arguments); // String
        },

        canCopy: function (item) {
            // summary:
            //      Determine whether the copy action is supported for an item.
            // item: Object
            //      Item from the dojo/store
            return !this.isRoot(item) && this.inherited(arguments);
        },

        canCut: function (item) {
            // summary:
            //      Determine whether the cut action is supported for an item.
            // item: Object
            //      Item from the dojo/store
            return !this.isRoot(item) && this.inherited(arguments);
        },

        canDelete: function (item) {
            // summary:
            //      Determine whether the delete action is supported for an item.
            // item: Object
            //      Item from the dojo/store
            return !this.isTypeOfRoot(item) && this.inherited(arguments);
        },

        canEdit: function (item) {
            // summary:
            //      Determine whether the edit action is supported for an item.
            // item: Object
            //      Item from the dojo/store
            return !this.isRoot(item) && this.inherited(arguments);
        }
    });
});
