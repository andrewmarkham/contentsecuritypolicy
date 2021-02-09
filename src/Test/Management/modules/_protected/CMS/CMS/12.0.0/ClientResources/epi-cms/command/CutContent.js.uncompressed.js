define("epi-cms/command/CutContent", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "epi",
    "epi/shell/command/_Command",
    "epi/shell/command/_ClipboardCommandMixin",
    "epi/shell/command/_SelectionCommandMixin"
], function (array, declare, epi, _Command, _ClipboardCommandMixin, _SelectionCommandMixin) {

    return declare([_Command, _ClipboardCommandMixin, _SelectionCommandMixin], {
        // summary:
        //      Copies the currently selected items to the clipboard.
        //
        // tags:
        //      public

        // label: [readonly] String
        //		The action text of the command to be used in visual elements.
        label: epi.resources.action.cut,

        // iconClass: [readonly] String
        //		The icon class of the command to be used in visual elements.
        iconClass: "epi-iconCut",

        _execute: function () {
            // summary:
            //		Copies the selection to the clipboard.
            // tags:
            //		protected

            this.clipboard.set("copy", false);
            this.clipboard.set("data", this.selection.data.concat());
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var model = this.model,
                selection = this.selection.data,
                canExecute = false;

            if (model && selection.length) {
                canExecute = array.every(selection, function (item) {
                    return model.canCut(item.data);
                });
            }

            this.set("canExecute", canExecute);
        }
    });
});
