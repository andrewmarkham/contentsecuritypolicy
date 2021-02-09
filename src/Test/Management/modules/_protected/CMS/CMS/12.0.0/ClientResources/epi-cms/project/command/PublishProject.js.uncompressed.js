define("epi-cms/project/command/PublishProject", [
    "dojo/_base/declare",
    "dojo/string",
    // Parent class
    "epi-cms/project/command/_ProjectCommand",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command.publishproject"
], function (
    declare,
    string,
    // Parent class
    _ProjectCommand,
    // Resources
    res
) {

    return declare([_ProjectCommand], {
        // summary:
        //      Publish project
        //
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "publishmenu-primary",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: res.label,

        // isExecuting: [public] Boolean
        //      Indicates whether the command is currently executing.
        isExecuting: false,

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected

            var model = this.model,
                self = this;

            self.set("isExecuting", true);

            model.publishProject(this.model.selectedProject.id).then(
                function () {
                    self.set("isExecuting", false);
                },
                function () {
                    self.set("isExecuting", false);
                });
        },

        _onPropertyChanged: function () {
            // summary:
            //      Sets canExecute based on the state of the model.
            // tags:
            //      protected
            //
            var selectedProject = this.model.selectedProject,
                status = selectedProject && selectedProject.status,
                canExecute = this.model.canPublishProject(selectedProject),
                projectMode = this.model.isProjectModeEnabled();

            // The command shouldn't be executable if a project is not selected or cannot be published.
            this.set({
                canExecute: canExecute,
                isAvailable: projectMode || (status !== "published" && status !== "delayedpublished"),
                isExecuting: status === "publishing"
            });
        },

        _updateLabel: function () {
            // summary:
            //      Updates the label with the itemcount
            // tags:
            //      private

            var project = this.model && this.model.selectedProject,
                itemCount = (project && project.itemStatusCount.checkedin) || 0,
                data = { count: itemCount > 0 ? itemCount + " " : "" },
                label;

            if (this.isExecuting) {
                label = itemCount === 1 ? res.labelexecuting.singular : res.labelexecuting.plural;
            } else if (!this.isAvailable) {
                label = res.labelexecuted;
            } else {
                label = itemCount === 1 ? res.label.singular : res.label.plural;
            }

            this.set("label", string.substitute(label, data));
        },

        _isExecutingSetter: function (value) {
            // summary:
            //      Sets the state whether the command is currently executing.
            // value: Boolean
            // tags:
            //      private

            this.isExecuting = value;
            this._updateLabel();
        }
    });
});
