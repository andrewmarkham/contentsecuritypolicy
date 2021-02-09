define("epi-cms/widget/_ContentListKeyMixin", [
    // Dojo
    "dojo/_base/declare",
    "dojo/keys"
],

function (
// Dojo
    declare,
    keys
) {

    return declare(null, {
        // summary:
        //    A Mixin to handle key event for ContentList.
        //
        // tags:
        //    internal mixin

        handleKey: function (evt) {
            // summary:
            //		Handle keystroke event forwarded from ComboBox, returning false if it's
            //		a keystroke I recognize and process, true otherwise.
            // tags:
            //      Protected

            switch (evt.keyCode) {
                case keys.DOWN_ARROW:
                    this.selectNextNode();
                    return false;
                case keys.UP_ARROW:
                    this.selectPreviousNode();
                    return false;
                case keys.ENTER:
                    // select item on pressing Enter
                    if (this.selected && this.grid.row(this.selected)) {
                        this._onSelect(this.grid.row(this.selected).data);
                    }
                    return false;
                default:
                    return true;
            }
        }
    });
});
