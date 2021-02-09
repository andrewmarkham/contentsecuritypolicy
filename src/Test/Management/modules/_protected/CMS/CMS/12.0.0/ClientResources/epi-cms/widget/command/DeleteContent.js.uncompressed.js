define("epi-cms/widget/command/DeleteContent", [
    "dojo/_base/declare",
    "epi/shell/command/_Command"
], function (
    declare,
    _Command
) {
    return declare([_Command], {
        // summary:
        //      A command that delete a single content in trash.
        //
        // tags:
        //      internal

        // trashId: [public] String
        //      The ID of the item to be removed.
        contentId: null,

        _execute: function () {
            // summary:
            //		Executes this command; publishes a change view request to change to the view trash view.
            // tags:
            //		protected

            this.model.deleteContent(this.contentId);
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var canExecute = this.model && !!this.contentId;
            this.set("canExecute", canExecute);
        }
    });
});
