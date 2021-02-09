define("epi/shell/dnd/tree/dndSource", [
    "dojo/_base/declare", // declare

    "./multiDndSource"
], function (declare, multiDndSource) {

    return declare([multiDndSource], {
        // summary:
        //      dnd source that only supports single select
        // tags:
        //      internal

        //	singular: Boolean
        //      Allows selection of only one element, if true.
        //      Tree hasn't been tested in singular=true mode, unclear if it works.
        singular: true,

        userSelect: function (node) {
            // Override CTRL and SHIFT key press parameters since we don't support multiple selection.
            this.inherited(arguments, [node, false, false]);
        }
    });
});
