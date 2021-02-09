define("epi-cms/contentediting/command/MoveVisibleToNext", [
    "dojo/_base/array",
    "dojo/_base/declare",
    // Parent class
    "epi-cms/contentediting/command/MoveToNext"
], function (array, declare, MoveToNext) {

    return declare([MoveToNext], {
        // summary:
        //      Moves the selected content block after the next visible sibling. If the selected content block
        //      is within a group the group is moved instead.
        //
        // tags:
        //      internal

        _execute: function () {
            // summary:
            //      Moves the block after the next sibling; this could be abother block or a visitor group.
            // tags:
            //      protected

            this._getContainer().moveVisible(this._getItem(), true);
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

            // Can execute if the index of the item is less than the last index.
            this.set("canExecute", index !== -1 && index < children.length - 1);
        }
    });
});
