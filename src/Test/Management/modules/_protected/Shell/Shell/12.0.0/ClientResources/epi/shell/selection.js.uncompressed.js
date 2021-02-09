define("epi/shell/selection", [
    "dojo/_base/declare",
    "./StatefulArray"
], function (
    declare,
    StatefulArray
) {
    return declare(StatefulArray, {
        // summary:
        //      A Stateful object for keeping track of currently selected items
        // tags:
        //      internal xproduct

        // data: []
        //      An array of currently selected items.
        data: null,

        constructor: function () {
            // summary:
            //      Initializes the selection with an empty array
            this.data = [];
        }
    });
});
