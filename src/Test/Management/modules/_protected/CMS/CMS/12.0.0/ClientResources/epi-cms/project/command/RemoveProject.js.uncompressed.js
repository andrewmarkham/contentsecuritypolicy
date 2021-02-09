define("epi-cms/project/command/RemoveProject", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/when",
    "./RemoveProjectConfirmation",
    // Resources
    "epi/i18n!epi/nls/episerver.cms.components.project.command.removeproject",
    // Parent class
    "./_ProjectCommand"
], function (
    declare,
    lang,
    on,
    when,
    RemoveProjectConfirmation,
    // Resources
    res,
    // Parent class
    _ProjectCommand
) {

    return declare([_ProjectCommand], {
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "context",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: res.label,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconTrash",

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected
            var project = this.model.getProject();
            this.model.projectService.hasScheduledProjectItems(project.id)
                .then(this._createRemoveProjectConfirmationDialog.bind(this));
        },

        _createRemoveProjectConfirmationDialog: function (hasScheduledItems) {
            // summary:
            //      Creates different remove confirmation dialog whether there is scheduled items or not.
            // hasScheduledItems: Boolean
            //      If the project have scheduled items
            // tags:
            //      protected
            var isScheduled = this.model.getProject().status === "delayedpublished",
                dialog = new RemoveProjectConfirmation({ isScheduledProject: hasScheduledItems && isScheduled });

            on.once(dialog, "execute", lang.hitch(this, "_removeProject"));

            dialog.show();
        },

        _removeProject: function (keepScheduling) {
            // summary:
            //      Removes the project on the server and reactivates the project items if keepScheduling is set to false.
            // tags:
            //      private

            var model = this.model,
                project = model.getProject(),
                promise = !keepScheduling && model.reactivateProject(project.id);

            when(promise)
                .then(function () {
                    return model.removeProject();
                })
                .otherwise(function (error) {
                    console.error("An error occured while removing the project.", error);
                });
        },

        _onPropertyChanged: function () {
            var project = this.model.getProject();
            // The command shouldn't be executable if a project is not selected and the project is deleted
            this.set("canExecute", !!project && !project.isDeleted);
        }
    });
});
