define("epi-cms/widget/command/EmptyTrash", [
    "dojo/_base/declare",
    "epi/shell/command/_Command"
], function (
    declare,
    _Command
) {

    return declare([_Command], {
        // summary:
        //      A command that empty items in tab container in trash.
        //
        // tags:
        //      internal

        // label: [public] String
        //		The action text of the command to be used in visual elements.
        label: null,

        // tooltip: [public] String
        //		The action text of the command to be used in visual elements.
        tooltip: null,

        // hasDeleteAccess: [public] Boolean
        //		If true the user can empty the trash.
        hasDeleteAccess: false,

        // trashId: [public] String
        //      The ID of specific trash to empty.
        trashId: null,

        _execute: function () {
            // summary:
            //		Executes this command; publishes a change view request to change to the view trash view.
            // tags:
            //		protected

            this.model.emptyTrash(this.trashId);
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var canExecute = this.model && this.hasDeleteAccess && !!this.trashId;
            this.set("canExecute", canExecute);
        }
    });
});
