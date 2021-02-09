define("epi-cms/widget/command/RestoreContent", [
    "dojo/_base/declare",
    "epi/shell/command/_Command"
], function (
    declare,
    _Command
) {

    return declare([_Command], {
        // summary:
        //      Represents a command to restore content in trash, which allows user to select a parent to restore content to.
        //
        // tags:
        //      internal

        // content: [public] Object
        //      Represents the current content to be restored.
        content: null,

        _execute: function () {
            // summary:
            //		Executes this command; publishes a change view request to change to the view trash view.
            // tags:
            //		protected

            if (this.canExecute && this.content) {
                this.model.restore(this.content);
            }
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var canExecute = !!this.model;
            this.set("canExecute", canExecute);
        }
    });
});
