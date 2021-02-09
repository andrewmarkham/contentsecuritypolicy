// Disable eqeqeq for this file
/*eslint eqeqeq:0*/

define("epi/shell/_HierarchicalModelMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/when"
], function (
    array,
    declare,
    lang,
    Deferred,
    all,
    when
) {

    // summary:
    //		A mixin that adds Hierarchical support for a model
    return declare([], {
        // tags:
        //    public

        // parentProperty: [public] string
        //      The name of the property that indentifies the parent (e.g. parentLink)
        parentProperty: "parentLink",

        // store: [public] dojo/store/JsonRest
        //      The store that is used to get the ancestors
        store: null,

        constructor: function (options) {
            declare.safeMixin(this, options);
        },

        getParentIdentity: function (item) {
            // summary:
            //		Get the identity of the parent
            //
            // item:
            //      The item to get the parent identity for
            //
            // tags:
            //      public

            return lang.getObject(this.parentProperty, false, item);
        },

        isAncestor: function (source, target) {
            // summary:
            //		Checks to see if the source is an ancestor of the target.
            //
            // source:
            //      The item to check if ancestor
            //
            // target:
            //      The item to check the source against
            //
            // tags:
            //      public

            var sourceId = this.store.getIdentity(source),
                targetId = this.store.getIdentity(target),
                targetParentId = this.getParentIdentity(target);

            if (sourceId == targetId || (target.parentLink && source.contentLink == target.parentLink)) {
                return true;
            }

            if (targetParentId) {
                return false;
            }

            return when(this.store.get(targetParentId), lang.hitch(this, function (parent) {
                return this.isAncestor(source, parent);
            }));
        },

        getAncestors: function (item, onComplete) {
            // summary:
            //		Get the ancestors for the item
            //
            // item: Object
            //      The item to get the ancestors for, or the identity of the item
            //
            // onComplete: callback function
            //      Function that will be invoked when the getAncestors has completed
            //
            // tags:
            //      public

            if (!this.store) {
                onComplete([]);
                return;
            }

            var obj = typeof item === "object" ? item : this.store.get(item);
            when(obj, lang.hitch(this, function (storeItem) {
                when(this._getAncestors([storeItem]), onComplete);
            }));
        },

        _getAncestors: function (items) {
            // If the first item is a root then stop the recursion.
            if (this._hasRoot(items)) {
                return items.slice(0, -1);
            }

            var parentId = this.getParentIdentity(items[0]);
            if (!parentId) {
                return items.slice(0, -1);
            }

            return when(this.store.get(parentId), lang.hitch(this, function (parent) {
                if (parent) {
                    items.unshift(parent);
                    return this._getAncestors(items);
                }
                return items.slice(0, -1);
            }));
        },

        _hasRoot: function (items) {
            // summary:
            //      Checks to see if the first item is a root item.
            // tags:
            //      private
            var roots = this.roots || [this.root];

            if (!items.length || !roots.length || typeof this.getIdentity !== "function") {
                return false;
            }

            var identity = this.getIdentity(items[0]);

            return array.some(roots, function (root) {
                return root == identity;
            }, this);
        },

        refreshAncestors: function (item, filter) {
            // summary:
            //      Refreshes the data for each ancester. If a filter function is specified
            //      only ancestors matching the filter will be refreshed.
            //
            //  item: Object
            //      The item or the identity to refresh the ancestors for
            //
            //  filter: function
            //      Filter function used to select which ancestors to refresh. Optional
            //
            // tags:
            //      public

            var store = this.store,
                deferred = new Deferred(),
                refreshDeferreds = [],
                refreshed = [];

            this.getAncestors(item, function (ancestors) {

                array.forEach(ancestors, function (ancestor) {
                    if (!filter || filter(ancestor)) {
                        refreshDeferreds.push(when(store.refresh(store.getIdentity(ancestor)), function (item) {
                            refreshed.push(item);
                        }));
                    }
                });

                all(refreshDeferreds).then(function () {
                    deferred.resolve(refreshed);
                });

            });

            return deferred.promise;
        }
    });
});
