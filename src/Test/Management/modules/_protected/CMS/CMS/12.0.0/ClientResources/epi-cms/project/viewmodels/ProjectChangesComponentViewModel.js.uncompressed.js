define("epi-cms/project/viewmodels/ProjectChangesComponentViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",

    "./_ProjectViewModel"
], function (
//dojo
    declare,
    lang,

    _ProjectViewModel
) {
    return declare([_ProjectViewModel], {
        // summary:
        //
        // tags:
        //      internal

        // _sortOrderProfileKey: [protected] String
        //      The profile key used to store the sort order
        _sortOrderProfileKey: "epi.project-changes-sort-order",

        postscript: function () {
            this.inherited(arguments);

            this.own(this.projectService.on("currentProjectChanged", lang.hitch(this, this._projectChanged)));
        },

        refreshProject: function () {
            // summary:
            //      Refreshes the selected project, particularly information if the project can be published or not.
            // tags:
            //      public

            if (!this.selectedProject) {
                this._updateHasProject();
            }

            this.inherited(arguments);
        },

        _createProjectCommands: function () {
            // summary:
            //    No project commands should be available from this view.
            // tags:
            //    protected

            return {};
        },

        _createProjectItemCommands: function () {

            var commands = this.inherited(arguments),
                commandsToAdd = {};

            Object.keys(commands).forEach(function (key) {

                var command = commands[key];

                switch (key) {
                    case "refreshProjectItems" :
                        break;
                    case "sortProjectItems" :
                        command.set({
                            category: "projectButton",
                            iconClass: "epi-iconSort"
                        });

                        break;

                    case "readyToPublishProjectItem" :
                        commandsToAdd.primaryReadyToPublishProjectItem = lang.delegate(command, {
                            iconClass: "epi-iconCheckmark",
                            category: null
                        });

                        break;

                    default :
                        commandsToAdd[key + "_context"] = lang.delegate(command, { category: "context" });
                }
            });

            return lang.mixin(commands, commandsToAdd);
        },

        _projectChanged: function (project) {
            // summary:
            //      When the project overview changes
            // project: Object
            //      Project
            // tags:
            //      private

            this.set("selectedProject", project);
        },

        _updateSelectedProjectDependencies: function (selectedProject) {

            var dndEnabled = false,
                projectItemQuery = null,
                isProjectModeEnabled = this.isProjectModeEnabled();

            if (selectedProject) {
                dndEnabled = (isProjectModeEnabled && selectedProject.status !== "publishing") || selectedProject.status === "active" || selectedProject.status === "publishfailed";
                projectItemQuery = { projectId: selectedProject.id };
            }

            this.set({
                dndEnabled: dndEnabled,
                projectItemQuery: projectItemQuery
            });
        }
    });
});
