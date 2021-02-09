define("epi-cms/contentediting/command/MoveVisibleToPrevious", [
    "dojo/_base/array",
    "dojo/_base/declare",
    // Parent class
    "epi-cms/contentediting/command/MoveToPrevious"
], function (array, declare, MoveToPrevious) {

    return declare([MoveToPrevious], {
        // summary:
        //      Moves the selected content block after the previous visible sibling. If the selected content block
        //      is within a group the group is moved instead.
        //
        // tags:
        //      internal

        _execute: function () {
            // summary:
            //      Moves the block after the next sibling; this could be abother block or a visitor group.
            // tags:
            //      protected

            this._getContainer().moveVisible(this._getItem(), false);
        },

        _onModelChange: function () {
            this.inherited(arguments);

            this._watch("visible", function () {
                this._onModelValueChange();
            }, this);
        },

        _onModelValueChange: function () {
            // summary:
            //      Updates canExecute after the model value has changed.
            // tags:
            //      protected
            var children = array.filter(this._getContainer().getChildren(), function (child) {
                    return child.get("visible");
                }),
                index = array.indexOf(children, this._getItem());

            // Can execute if the index of the item is greater than the first index.
            this.set("canExecute", index > 0);
        }
    });
});
