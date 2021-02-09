define("epi-cms/widget/viewmodel/CategorySelectorViewModel", [
    "dojo/_base/declare",
    "dojo/Deferred",
    "dijit/Destroyable",
    "dojo/Stateful",
    "dojo/when",
    "dojo/promise/all",

    "epi/dependency"
],

function (
    declare,
    Deferred,
    Destroyable,
    Stateful,
    when,
    all,

    dependency
) {

    return declare([Stateful, Destroyable], {
        // tags:
        //      internal

        // _categories: [private] Array
        //      List of selected category id's
        _categories: null,

        // _categoriesParentsName: [private] Object
        //      Named indexes array of Parents for categories
        _categoriesParentsName: null,

        // _updateDisplayPromise: [private] Object
        //      Result of refreshing categories
        _updateDisplayPromise: null,

        // store: [private] Store
        //      Category store
        store: null,

        constructor: function (kwArgs) {
            if (kwArgs && kwArgs.store) {
                this.store = kwArgs.store;
            } else {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get("epi.cms.category");
            }

            this._categoriesParentsName = {};
        },

        destroy: function () {
            this.inherited(arguments);

            if (this._updateDisplayPromise) {
                this._updateDisplayPromise.cancel();
                this._updateDisplayPromise = null;
            }
        },

        refreshCategories: function () {
            //summary:
            //    refresh categories list
            //
            // tags:
            //    public

            var result = new Deferred();

            this._categoriesParentsName = {};

            if (!this.hasCategories()) {
                result.resolve([]);
                return result.promise;
            }

            var dfdList = [];
            var categoriesToRemove = [];
            this._categories.forEach(function (categoryId) {
                var def = when(this.store.refresh(categoryId))
                    .then(function (category) {
                        if (!category || !category.visible) {
                            categoriesToRemove.push(categoryId);
                            return null;
                        }

                        this._categoriesParentsName[category.id] = category.parentsNameCollection;
                        return category;
                    }.bind(this), function () {
                        categoriesToRemove.push(categoryId);
                        return null;
                    }.bind(this));

                dfdList.push(def);
            }, this);

            this._updateDisplayPromise = all(dfdList)
                .then(function (categories) {

                    // Clear the pointer to the promise since it is resolved.
                    this._updateDisplayPromise = null;

                    categoriesToRemove.forEach(function (c) {
                        var categoryIndex = this._categories.indexOf(c);
                        if (categoryIndex !== -1) {
                            this._categories.splice(categoryIndex, 1);
                        }
                    }.bind(this), this);

                    result.resolve(categories.filter(function (c) {
                        return c !== null;
                    }));
                }.bind(this));

            return result.promise;
        },

        hasCategories: function () {
            //summary:
            //    Returns true when categories has at least one element
            //
            // tags:
            //    public

            var categories = this.get("categories");
            return !!categories && categories.length > 0;
        },

        hasCategory: function (categoryId) {
            //summary:
            //    Returns true when category for specific id is on the list
            //
            // tags:
            //    public

            return this.get("categories") && this.get("categories").indexOf(categoryId) !== -1;
        },

        _categoriesParentsNameGetter: function () {
            //summary:
            //    Getter for categoriesParentsName
            //
            // tags:
            //    private

            return this._categoriesParentsName;
        },

        _categoriesGetter: function () {
            //summary:
            //    Getter for categories
            //
            // tags:
            //    private

            return this._categories;
        },

        _categoriesSetter: function (value) {
            //summary:
            //    Setter for categoriesParentsName
            //
            // tags:
            //    private

            this._categories = value;
        }
    });
});
