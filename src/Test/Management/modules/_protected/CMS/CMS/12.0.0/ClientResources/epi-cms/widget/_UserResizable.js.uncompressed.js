define("epi-cms/widget/_UserResizable", [
    "dojo/_base/declare"
], function (declare) {

    return declare(null, {
        // summary:
        //    Mixin that provides container notification methods for user resizable widget.
        //
        // tags:
        //    internal

        onResizeStart: function () {
            // summary:
            //    Raised when user start resizing the widget.
            //
        },

        onResizeStop: function () {
            // summary:
            //    Raised when user stop resizing the widget.
            //
        }
    });
});
