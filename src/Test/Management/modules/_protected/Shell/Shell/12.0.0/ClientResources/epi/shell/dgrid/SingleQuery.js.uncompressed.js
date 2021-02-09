define("epi/shell/dgrid/SingleQuery", [
    "dojo/_base/declare",
    "dgrid/_StoreMixin"
], function (declare, _StoreMixin) {

    return declare(_StoreMixin, {
        // summary:
        //      A dgrid mixin which implements the refresh method to always perform a single query
        //      with no start or count specified, to retrieve all relevant results at once.
        //      Appropriate for grids using memory stores with small result set sizes.
        // tags:
        //      public

        // See: http://dgrid.io/tutorials/0.3/single_query/

        refresh: function () {
            // First defer to List#refresh to clear the grid's previous content.
            this.inherited(arguments);

            if (!this._started || !this.store) {
                return;
            }

            return this._trackError(function () {
                var queryOptions = this.get("queryOptions"),
                    results = this.store.query(this.query, queryOptions);

                return this.renderArray(results, null, queryOptions);
            }.bind(this));
        },

        renderArray: function () {
            var rows = this.inherited(arguments);

            // Clear _lastCollection which is ordinarily only used for store-less grids.
            this._lastCollection = null;

            return rows;
        }
    });
});
