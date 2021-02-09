define("epi-cms/widget/ReadOnlyContentList", [
// dojo
    "dojo/_base/declare",
    // dgrid
    "dgrid/OnDemandList",
    // epi
    "epi/shell/dgrid/Formatter",

    "epi-cms/core/ContentReference",
    "epi-cms/dgrid/formatters",
    "epi-cms/widget/_ContentListBase"
],

function (
// dojo
    declare,
    // dgrid
    OnDemandList,
    // epi
    Formatter,

    ContentReference,
    formatters,
    _ContentListBase
) {

    return declare([_ContentListBase], {
        // summary:
        //      Widget to show a read only content list
        // tags:
        //      internal

        // _gridClass: [protected]
        //      Declaration for dgrid
        _gridClass: declare([OnDemandList, Formatter]),

        // query: [public] Object
        //      Grid query object
        query: null,

        // queryOptions: [public] Object
        //      Grid query options object
        queryOptions: null,

        // =======================================================================
        // Public functions

        onPostCreateSettings: function () {

        },

        // =======================================================================
        // Public overrided functions

        postCreate: function () {

            this.inherited(arguments);

            this.onPostCreateSettings();
        },

        destroy: function () {

            if (this.grid) {
                this.grid.destroy();
                this.grid = null;
            }

            this.inherited(arguments);
        },

        getContextMenu: function () {
            // summary:
            //
            // tags:
            //      public, extension

            // Do not create a contextMenu if it's not been specified.
        },

        createList: function () {
            // summary:
            //      Hides grid header by default
            // tags:
            //      public, extension

            this.inherited(arguments);

            this.grid.set("showHeader", false);
        },

        getListSettings: function () {
            // summary:
            //      Initialization a list.
            // tags:
            //      public, extension

            return this._getBaseSettings();
        },

        // =======================================================================
        // Protected functions

        _setQueryAttr: function (/*Object*/value) {
            // summary:
            //
            // value: [Object]
            //
            // tags:
            //      protected

            this._set("query", value);
            this._updateQuery(value);
        },

        _getBaseSettings: function (/*Object?*/contextMenu) {
            // summary:
            //
            // contextMenu: [Object?]
            //
            // tags:
            //      protected

            var titleSelector = function (item) {
                var reference = new ContentReference(item.contentLink);

                return formatters.title(item.name, reference.id, item.contentTypeName);
            };

            var thumbnailSelector = function (item) {
                return item.thumbnailUrl;
            };

            // Init content list
            return {
                store: this.store,
                queryOptions: this.queryOptions,
                formatters: [formatters.contentItemFactory("name", titleSelector, null, contextMenu, thumbnailSelector, undefined, undefined, true)],
                deselectOnRefresh: true,
                sort: this.queryOptions && this.queryOptions.sort
            };
        },

        // =======================================================================
        // Private functions

        _updateQuery: function (/*Object*/query) {
            // summary:
            //
            // query: [Object]
            //
            // tags:
            //      private

            if (query) {
                this.grid.set("query", query);
            } else {
                this.grid.cleanup();
            }
        }

    });

});
