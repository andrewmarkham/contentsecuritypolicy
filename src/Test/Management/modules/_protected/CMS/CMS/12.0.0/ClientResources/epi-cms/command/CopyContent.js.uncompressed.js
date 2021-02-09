define("epi-cms/command/CopyContent", [
    "dojo/_base/declare",
    "dojo/_base/array",
    "epi",
    "epi/shell/command/_Command",
    "epi/shell/command/_ClipboardCommandMixin",
    "epi/shell/command/_SelectionCommandMixin"
], function (declare, array, epi, _Command, _ClipboardCommandMixin, _SelectionCommandMixin) {

    return declare([_Command, _ClipboardCommandMixin, _SelectionCommandMixin], {
        // summary:
        //      A command that starts the create new content process when executed.
        //
        // tags:
        //      public

        // label: [readonly] String
        //		The action text of the command to be used in visual elements.
        label: epi.resources.action.copy,

        // iconClass: [readonly] String
        //		The icon class of the command to be used in visual elements.
        iconClass: "epi-iconCopy",

        _execute: function () {
            // summary:
            //		Copies the currently selected items to the clipboard and sets the clipboard copy flag.
            // tags:
            //		protected

            this.clipboard.set("copy", true);
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
                    return model.canCopy(item.data);
                });
            }

            this.set("canExecute", canExecute);
        }
    });
});
