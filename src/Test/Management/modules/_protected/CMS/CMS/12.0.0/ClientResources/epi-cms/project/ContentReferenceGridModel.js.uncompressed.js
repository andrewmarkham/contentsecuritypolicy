define("epi-cms/project/ContentReferenceGridModel", [
    "dojo/_base/declare",
    "dojo/Stateful"
],
function (declare,
    Stateful) {

    return declare([Stateful], {
        // summary:
        //      A model for the ContentReferenceGrid. A store and column configuration is required for showing contents in the grid
        // tags:
        //      internal

        onItemClicked: function (item) { },

        // resultSummary: String
        //      A summary for the result shown above the grid to the right of the refresh button
        resultSummary: "",

        // notificationText: String
        //      A notification text describing summary for the result shown above the grid to the right of the refresh button
        notificationText: "",

        // store: dojo/store/api/Store
        //      A data store to query for the items in the grid
        store: null,

        // query: Object
        //      An object with parameters used whn querying the store
        query: null,

        // columns: object
        //      dgrid column configuration
        columns: null,

        // totalItems: Number
        //      The total items shown in the grid. Updated as the grid refreshes.
        totalItems: null
    });
});
