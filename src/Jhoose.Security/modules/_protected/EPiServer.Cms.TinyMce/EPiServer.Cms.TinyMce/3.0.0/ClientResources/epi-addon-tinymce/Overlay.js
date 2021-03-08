define([
    "dojo/_base/declare",
    "epi/shell/widget/overlay/Item"
], function (
    declare,
    Item
) {
    return declare([Item], {
        // summary:
        //       Overlay item for the TinyMCE editor
        // tags:
        //       internal

        _clickOffset: {},

        postMixInProperties: function () {
            this.inherited(arguments);

            // Disable DND on the overlay item
            this.allowedDndTypes = [];
            this.baseClass += " epiTinyMCEEditorWrapper";
        },

        onClick: function (overlayItem, e) {
            this.inherited(arguments);

            // Save the offset position of click
            this._clickOffset = {
                x: e.offsetX,
                y: e.offsetY
            };
        }
    });
});
