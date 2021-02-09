define("epi/shell/dgrid/selection/Extensions", ["dojo/_base/declare", "dojo/query", "dojo/window"], function (declare, query, win) {
    return declare([], {
        // summary:
        //      Selection mixin that makes it easier to work with selections on a dgrid list
        // tags:
        //      internal

        moveSelectionUp: function () {
            // summary:
            //      Moves the selection up in the list
            // returns:
            //      The selected dgrid row
            // tags:
            //      public

            return this.moveSelection(true);
        },

        moveSelectionDown: function () {
            // summary:
            //      Moves the selection down in the list
            // returns:
            //      The selected dgrid row
            // tags:
            //      public

            return this.moveSelection(false);
        },

        moveSelection: function (up) {
            // summary:
            //      Moves the selection either up or down in the list
            // up: Boolean
            //      true if the selection should be moved upwards in the list otherwise false
            // returns:
            //      The selected dgrid row
            // tags:
            //      public

            var selectedRow = this.getFirstSelectedRow();
            if (!selectedRow) {
                return this._selectFirstRow();
            }

            // Clear the old select
            this.clearSelection();
            selectedRow = up ? this.up(selectedRow, 1, true) : this.down(selectedRow, 1, true);
            // Select the new row
            this.select(selectedRow, 1, true);
            win.scrollIntoView(selectedRow.element);
            return selectedRow;
        },

        hasSelection: function () {
            // summary:
            //      Returns true if there are any selected rows in the list
            // tags:
            //      public

            return Object.keys(this.selection).length > 0;
        },

        getFirstSelectedRow: function () {
            // summary:
            //      Returns the first selected row if any, otherwise null
            // tags:
            //      public

            if (!this.hasSelection()) {
                return null;
            }

            var row = this.row(Object.keys(this.selection)[0]);

            //If dgrid returns a row but no data on the row we consider it as not selected
            if (row && !row.data) {
                return null;
            }

            return row;
        },

        _selectFirstRow: function () {
            var rows = query(".dgrid-row", this.domNode);
            if (rows.length === 0) {
                return null;
            }

            var firstRow = this.row(rows[0]);
            if (!firstRow) {
                return null;
            }
            this.select(firstRow, 1, true);
            return firstRow;
        }
    });
});
