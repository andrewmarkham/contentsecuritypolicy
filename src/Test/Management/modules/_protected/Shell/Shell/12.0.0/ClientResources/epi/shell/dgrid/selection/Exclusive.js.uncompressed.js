define("epi/shell/dgrid/selection/Exclusive", ["dojo/_base/declare"], function (declare) {

    return declare([], {
        // summary:
        //      Adds exclusive item selection to a list or grid. The exclusive selection mode allows
        //      only one item to be selected at a time. The difference from the single selection mode
        //      is that an item can not be deselected via a ctrl/cmd click.
        //
        // tags:
        //      public

        _exclusiveSelectionHandler: function (event, target) {
            // summary:
            //      Selection handler for "exclusive" mode, where only one target may be
            //      selected at a time and can not be deselected.
            // tags:
            //      private
            if (this._lastSelected !== target) {
                this.clearSelection();
                this.select(target);
                this._lastSelected = target;
            }
        }
    });
});
