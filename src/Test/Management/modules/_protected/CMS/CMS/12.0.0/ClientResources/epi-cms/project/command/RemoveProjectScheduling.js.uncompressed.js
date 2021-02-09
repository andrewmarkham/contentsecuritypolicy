define("epi-cms/project/command/RemoveProjectScheduling", [
    "dojo/_base/declare",

    // Parent class
    "epi-cms/project/command/_ProjectCommand",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command"

], function (
    declare,

    // Parent class
    _ProjectCommand,

    // Resources
    res
) {

    return declare([_ProjectCommand], {
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "publishmenu",

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconClose",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: res.removeschedulingprojectitem.label,

        postscript: function () {
            // tags:
            //      public

            this.inherited(arguments);

            if (!this.model.isProjectModeEnabled()) {
                this.set("label", res.removeschedulingproject.label);
            }
        },

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected
            var model = this.model;

            return model.reactivateProject(model.selectedProject.id);
        },

        _onPropertyChanged: function () {
            // summary:
            //      Sets canExecute based on the state of the model.
            // tags:
            //      protected

            var selectedProject = this.model.selectedProject,
                isScheduled;

            isScheduled = !!selectedProject &&
                            (this.model.isProjectModeEnabled() ?
                                selectedProject.itemStatusCount.delayedpublish > 0 :
                                selectedProject.status === "delayedpublished");

            this.set("canExecute", isScheduled);
            this.set("isAvailable", isScheduled);
        }
    });
});
