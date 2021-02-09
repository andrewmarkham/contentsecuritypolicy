define("epi-cms/contentediting/command/MoveToPrevious", [
    // General application modules
    "dojo/_base/declare",
    "epi",
    // Parent class
    "epi-cms/contentediting/command/_ContentAreaCommand"
], function (declare, epi, _ContentAreaCommand) {

    return declare([_ContentAreaCommand], {
        // summary:
        //      Moves the selected content block after the previous sibling.
        //
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: epi.resources.action.moveup,

        // tooltip: [public] String
        //      The description text of the command to be used in visual elements.
        tooltip: epi.resources.action.moveup,

        // iconClass: [readonly] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconUp",

        _execute: function () {
            // summary:
            //      Moves the block before the previous sibling; this could be abother block or a visitor group.
            // tags:
            //      protected
            this.model.movePrevious();
        },

        _onModelChange: function () {
            this.inherited(arguments);

            this._watch("canMovePrevious", function () {
                this._onModelValueChange();
            }, this);
        },

        _onModelValueChange: function () {
            this.set("canExecute", this.model.get("canMovePrevious") && !this.model.get("readOnly"));
        }
    });
});
