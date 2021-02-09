define("epi-cms/contentediting/command/BlockRemove", [
    // General application modules
    "dojo/_base/declare",
    "epi",
    // Parent class
    "epi-cms/contentediting/command/_ContentAreaCommand"
], function (declare, epi, _ContentAreaCommand) {

    return declare([_ContentAreaCommand], {
        // tags:
        //      internal xproduct

        name: "remove",

        label: epi.resources.action.remove,

        tooltip: epi.resources.action.remove,

        _execute: function () {
            // summary:
            //      Removes the content item.
            // tags:
            //      protected
            this.model.remove();
        },

        _onModelValueChange: function () {
            // summary:
            //      Updates canExecute after the model value has changed.
            // tags:
            //      protected
            this.set("canExecute", !!this.model && !this.model.get("readOnly"));
        }
    });
});
