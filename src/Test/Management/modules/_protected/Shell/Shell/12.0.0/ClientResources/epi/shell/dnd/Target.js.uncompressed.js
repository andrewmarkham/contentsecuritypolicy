define("epi/shell/dnd/Target", [
    "dojo/_base/declare",
    "dojo/dom-class",
    "./Source"
], function (
    declare,
    domClass,
    Source
) {
    return declare([Source], {
        // summary:
        //		A Target object. When you want to create a new DnD target object.
        // tags:
        //      public

        // allowMultipleItems: [public] Boolean
        //      Indicates if the editor allows multiple items
        allowMultipleItems: false,

        checkAcceptance: function (source, nodes) {
            // summary:
            //		Checks if the target can accept nodes from this source.
            // source: Object
            //		The source which provides items.
            // nodes: Array
            //		The list of transferred items.
            // tags:
            //      public

            if (!this.allowMultipleItems && nodes.length > 1) {
                return false;
            } else {
                return this.inherited(arguments);
            }
        },

        constructor: function (node, params) {
            // summary:
            //		A constructor of the Target --- see the `dojo/dnd/Source.constructor` for details
            // tags:
            //      protected

            this.isSource = false;
            domClass.remove(this.node, "dojoDndSource");
        }
    });

});
