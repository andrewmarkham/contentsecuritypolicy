define("epi-cms/project/command/RemoveProjectItem", [
    "dojo/_base/declare",

    // Parent class
    "./_ProjectCommand",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command.removeprojectitem"
],
function (
    declare,
    // Parent class
    _ProjectCommand,
    // Resources
    res
) {
    return declare([_ProjectCommand], {
        // summary:
        //      A command for removing items from a project.
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "itemContext",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: res.label,

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["selectedProjectItems"],

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected
            return this.model.removeSelectedProjectItems();
        },

        _onPropertyChanged: function () {
            // summary:
            //      This command is able to execute if there is a selected project and item and the project
            //      is in an active or publish failed state.
            // tags:
            //      protected

            var self = this,
                model = this.model,
                hasItems = model && model.selectedProjectItems && model.selectedProjectItems.length,
                project = model.selectedProject;

            this.set("canExecute", false);

            this.model.projectService.getCurrentProject()
                .then(function (currentProject) {
                    var isActive = project && (project.status === "active" || project.status === "publishfailed" || currentProject);
                    self.set("canExecute", !!(hasItems && isActive));
                });
        }
    });
});
