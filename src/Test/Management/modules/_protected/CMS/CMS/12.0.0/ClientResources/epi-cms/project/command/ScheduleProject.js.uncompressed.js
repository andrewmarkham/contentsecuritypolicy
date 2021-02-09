define("epi-cms/project/command/ScheduleProject", [
    "dojo/_base/declare",

    "./_ProjectCommand",
    "../ProjectSchedulingDialog",
    "../ProjectSchedulingDialogViewModel",

    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command"
],
function (
    declare,

    _ProjectCommand,
    ProjectSchedulingDialog,
    ProjectSchedulingDialogViewModel,

    res
) {

    return declare([_ProjectCommand], {
        // summary:
        //      Command for setting scheduled publishing on a project.
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "publishmenu",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: res.scheduleprojectitem.label,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconClock",

        postscript: function () {
            // tags:
            //      public

            this.inherited(arguments);

            if (!this.model.isProjectModeEnabled()) {
                this.set("label", res.scheduleproject.label);
            }
        },

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected

            var model = this.model,
                project = model.selectedProject,
                viewModel = new ProjectSchedulingDialogViewModel({
                    title: project.name,
                    query: { projectId: project.id, scheduled: true }
                }),
                dialog = new ProjectSchedulingDialog({model: viewModel});

            dialog.on("execute", function () {
                model.publishProject(project.id, viewModel.dateValue);
            });

            dialog.show();
        },

        _onPropertyChanged: function () {
            // summary:
            //      Sets canExecute based on the state of the model.
            // tags:
            //      protected

            this.set("canExecute", this.model.canPublishProject());
            this._updateIsAvailable();
        },

        _updateIsAvailable: function () {
            // summary:
            //      Update isAvailable state on the project
            // tags:
            //      private

            var isAvailable,
                project = this.model.selectedProject,
                status = project && project.status;

            if (this.model.isProjectModeEnabled()) {
                isAvailable = true;
            } else {
                // Check delay published as well
                isAvailable = status !== "published" && status !== "delayedpublished";
            }

            this.set("isAvailable", isAvailable);
        }
    });
});
