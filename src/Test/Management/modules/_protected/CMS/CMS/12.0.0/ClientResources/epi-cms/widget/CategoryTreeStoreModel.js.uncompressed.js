define("epi-cms/widget/CategoryTreeStoreModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "dojox/html/entities",
    "epi/dependency",
    "epi/routes"
], function (declare, lang, when, entities, dependency, routes) {

    return declare(null, {
        // summary:
        //      store model for category tree.
        //
        // tags:
        //      internal

        // store: [protected] dojo/store/api/Store
        //      Underlying store that will be queried for category tree items.
        store: null,

        // rootCategory: [protected]
        //      Store root category id.
        rootCategory: undefined,

        constructor: function (args) {

            lang.mixin(this, args);

            if (!this.store) {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get("epi.cms.category");
            }
        },

        // =======================================================================
        // Methods for traversing hierarchy

        getRoot: function (onItem) {
            // summary:
            //      Calls onItem with the root item for the tree, possibly a fabricated item.

            when(this.store.get(this.rootCategory), onItem);
        },

        mayHaveChildren: function (item) {
            // summary:
            //      Tells if an item has or may have children.  Implementing logic here
            //      avoids showing +/- expando icon for nodes that we know don't have children.
            //      (For efficiency reasons we may not want to check if an element actually
            //      has children until user clicks the expando node)

            return item.hasChildren;
        },

        getChildren: function (parentItem, onComplete) {
            // summary:
            //      Calls onComplete() with array of child items of given parent item, all loaded.

            var id = this.getIdentity(parentItem),
                results = this.store.query({ id: id, query: "getchildren" });

            results.then(function (children) {
                parentItem.children = children;
                onComplete(children);
            });
        },

        // =======================================================================
        // Inspecting items

        getIdentity: function (item) {
            // summary:
            //      Returns identity for an item

            return this.store.getIdentity(item);
        },

        getLabel: function (item) {
            // summary:
            //      Get the label for an item

            return entities.encode(item.description);
        }
    });
});
