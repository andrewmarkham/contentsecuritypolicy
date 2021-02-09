define("epi-cms/contentediting/command/MoveToNext", [
    // General application modules
    "dojo/_base/declare",
    "epi",
    // Parent class
    "epi-cms/contentediting/command/_ContentAreaCommand"
], function (declare, epi, _ContentAreaCommand) {

    return declare([_ContentAreaCommand], {
        // summary:
        //      Moves the selected content block after the next sibling.
        //
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: epi.resources.action.movedown,

        // tooltip: [public] String
        //      The description text of the command to be used in visual elements.
        tooltip: epi.resources.action.movedown,

        // iconClass: [readonly] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconDown",

        // category: [readonly] String
        //      Indicates that this command should created with a separator.
        category: "menuWithSeparator",

        _execute: function () {
            // summary:
            //      Moves the block after the next sibling; this could be abother block or a visitor group.
            // tags:
            //      protected

            this.model.moveNext();
        },

        _onModelChange: function () {
            this.inherited(arguments);

            // Watch the new model for changes
            this._watch("canMoveNext", function () {
                this._onModelValueChange();
            }, this);
        },

        _onModelValueChange: function () {
            this.set("canExecute", this.model.get("canMoveNext") && !this.model.get("readOnly"));
        }
    });
});
