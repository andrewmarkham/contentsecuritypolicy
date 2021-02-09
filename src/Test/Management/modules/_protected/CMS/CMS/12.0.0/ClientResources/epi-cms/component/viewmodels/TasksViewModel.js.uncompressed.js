define("epi-cms/component/viewmodels/TasksViewModel", [
// dojo
    "dojo/_base/declare",
    "dojo/Stateful"
], function (declare, Stateful) {

    return declare([Stateful], {
        // summary:
        //      View model used by the Task component
        // tags:
        //      internal

        // categories: [readonly] Array
        //      A list of categories and its queries
        categories: null,

        getOptions: function () {
            // summary:
            //      Converts the categories and its queries into select options and returns them

            var options = this._convert(this.categories);

            this._selectFirstItem(options);

            return options;
        },

        getQuery: function (queryName) {
            // summary:
            //      Returns the query with the given name, if not found it returns null
            // queryName: String
            //      The name of the query to find
            // tags:
            //      public

            var foundQuery = null;

            this.categories.some(function (category) {
                return category.queries.some(function (query) {
                    if (query.name === queryName) {
                        foundQuery = query;
                        return true;
                    }
                });
            });

            return foundQuery;
        },

        _selectFirstItem: function (options) {
            // summary:
            //      Selects the first item when the first option is an category
            // tags:
            //      private

            var isCategory = options.length > 0 && options[0].category;
            if (isCategory) {
                var item = options[1];
                if (item) {
                    item.selected = true;
                }
            }
        },

        _convert: function (categories) {
            // summary:
            //      Flattens the category tree into a flat list of select options
            //      where the category is disabled
            // tags:
            //      private

            var options = [];

            categories.forEach(function (category) {
                if (category.displayName) {
                    options.push({
                        category: true,
                        label: category.displayName
                    });
                }

                category.queries.forEach(function (query) {
                    options.push({
                        label: query.displayName,
                        value: query.name
                    });
                });
            });

            return options;
        }
    });
});
