define("epi/shell/command/_SelectionCommandMixin", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang"
],

function (
// dojo
    declare,
    lang
) {

    return declare(null, {
        // summary:
        //      Stub to handle selection content for an instance of "epi/shell/command/_Command" object
        // tags:
        //      internal xproduct mixin

        // selection: [public] Object
        //      Hold information about selected content
        selection: null,

        // =======================================================================
        // Public overridden functions

        postscript: function () {
            // summary:
            //      Register a watch handler when the command change its model
            //      Watch model and initialize model dependent properties.
            // tags:
            //      public

            this.inherited(arguments);

            this.watchSelectionChange();
        },

        // =======================================================================
        // Public functions

        onRefreshSelection: function () {
            // summary:
            //      Stub to do somethings when selection refreshed
            // tags:
            //      public callback
        },

        watchSelectionChange: function () {
            // summary:
            //      Register a watch handler when the command change its model
            // tags:
            //      public

            this._selectionChangeWatcher = this.selection.watch("data", lang.hitch(this, this._onModelChange));
        },

        unwatchSelectionChange: function () {
            // summary:
            //      Clear the registered watch handler for command model change
            // tags:
            //      public

            this._selectionChangeWatcher && this._selectionChangeWatcher.unwatch();
        },

        // =======================================================================
        // Protected functions

        _getSingleSelectionData: function () {
            // summary:
            //      Returns the selected item if only one is selected otherwise null;
            // tags:
            //      protected

            var target = this._getSelectionData();

            return target && (this.selection.data.length === 1) ? target.data : null;
        },

        _selectionDataGetter: function () {
            // summary:
            //      Return selection content item data
            // tags:
            //      protected

            var selectionData = this._getSelectionData();
            return selectionData && selectionData.type === "epi.cms.contentdata" ? selectionData.data : null;
        },

        _selectionTypeGetter: function () {
            // summary:
            //      Return selection type
            // tags:
            //      protected

            return this._getSelectionData().type;
        },

        // =======================================================================
        // Private functions

        _getSelectionData: function () {
            // summary:
            //      Return the selection data for the first item selected
            // tags:
            //      private

            if (!this.selection || !(this.selection.data instanceof Array)) {
                return null;
            }

            return this.selection.data[0];
        }
    });

});
