define("epi/shell/widget/command/CommandToolbar", [
    "dojo/_base/declare",
    "dijit/Toolbar"
],
function (
    declare,
    Toolbar
) {

    return declare([Toolbar], {
        // summary:
        //      A toolbar with predefined item positions, dependent on item category
        //
        // tags:
        //      internal

        _positions: null,

        groups: null,

        constructor: function () {
            this._positions = [];
            this.groups = [];
        },

        postMixInProperties: function () {
            this.inherited(arguments);
            for (var i = 0; i < this.groups.length; i++) {
                var categoryPosition = { category: this.groups[i], position: 0 };
                this._positions.push(categoryPosition);
            }
        },

        addChild: function (widget, position) {
            if (!position) {
                var currentCategory = widget._commandCategory || "default";
                position = this._getCurrentPosition(currentCategory);
                this.inherited("addChild", [widget, position]);
                this._updatePositions(currentCategory);
            } else {
                this.inherited(arguments);
            }
        },

        _getCurrentPosition: function (currentCategory) {
            // summary:
            //      Returns a new toolbar item position for the current category
            for (var i = 0; i < this._positions.length; i++) {
                if (this._positions[i].category === currentCategory) {
                    return this._positions[i].position;
                }
            }
            return 0;
        },

        _updatePositions: function (currentCategory) {
            // summary:
            //      Updates positions for categories
            var positionIncrement = 0;
            for (var i = 0; i < this._positions.length; i++) {
                if (this._positions[i].category === currentCategory) {
                    positionIncrement = 1;
                }
                this._positions[i].position = this._positions[i].position + positionIncrement;
            }
        }
    });
});
