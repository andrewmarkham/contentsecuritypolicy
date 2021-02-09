define("epi-cms/project/viewmodels/OverviewViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/when",
    "epi/dependency",
    "epi-cms/project/command/RefreshProjectItems",
    "epi-cms/project/command/ToggleProjectActivities",
    "./_ProjectViewModel",
    "./ActivityFeedViewModel",
    "./ProjectCommentViewModel",
    "epi/i18n!epi/nls/episerver.cms.components.project.overview.eventfeed"
], function (
    declare,
    lang,
    topic,
    when,
    dependency,
    RefreshProjectItems,
    ToggleProjectActivities,
    _ProjectViewModel,
    ActivityFeedViewModel,
    ProjectCommentViewModel,
    localizations
) {
    return declare([_ProjectViewModel], {
        // summary:
        //
        // tags:
        //      internal

        // contextHistory: [readonly] epi-cms/BackContextHistory
        //      The context history stack
        contextHistory: null,

        // isProjectOverviewActive: [public] Boolean
        //      Indicates if the overview is open
        isProjectOverviewActive: false,

        // _sortOrderProfileKey: [protected] String
        //      The profile key used to store the sort order
        _sortOrderProfileKey: "epi.project-overview-sort-order",

        // _isActivitiesVisibleProfileKey: [protected] String
        //      The profile key used to store whether the activities panel is visible or not
        _isActivitiesVisibleProfileKey: "epi.project-overview-is-activities-visible",

        postscript: function () {
            this.inherited(arguments);
            this.contextHistory = this.contextHistory || dependency.resolve("epi.cms.BackContextHistory");
            this.own(this.projectService.on("currentProjectChanged", lang.hitch(this, this.projectOverviewChanged)));

            this.activityFeedModel = new ActivityFeedViewModel({
                noQueryMessage: localizations.noquerymessage,
                noAccessMessage: localizations.noaccessmessage,
                activitiesStore: this.activitiesStore
            });

            this.projectCommentFeedModel = new ProjectCommentViewModel({
                noQueryMessage: localizations.noquerymessage,
                activitiesStore: this.activitiesStore
            });

        },

        contextChanged: function (/*Object*/context, /*Object*/callerData) {
            // summary:
            //      When context changes
            // tags:
            //      protected
            this.inherited(arguments);

            if (context && context.type === "epi.cms.project") {
                var projectId = parseInt(context.id, 10);
                when(this.projectStore.refresh(projectId)).then(this.set.bind(this, "selectedProject"));
            } else {
                this.set("selectedProject", null);
            }
        },

        projectOverviewChanged: function (project) {
            // summary:
            //      When the project overview changes
            // project: Object
            //      Project
            // tags:
            //      public

            var active = this.get("isProjectOverviewActive"),
                newProjectUri;

            // id is empty when selecting None.
            if (active) {
                if (project && project.id) {
                    newProjectUri = "epi.cms.project:///" + project.id;
                    topic.publish("/epi/shell/context/request", { uri: newProjectUri }, { sender: this });
                } else {
                    this.requestPreviousContext();
                }
            }
        },

        requestPreviousContext: function () {
            // summary:
            //      Navigates back to previous context
            // tags:
            //      public

            this.contextHistory.closeAndNavigateBack(this);
        },

        _createProjectCommands: function () {
            var commands = this.inherited(arguments);

            commands.refreshProject = new RefreshProjectItems({ model: this, category: "project-comments", order: 120 });

            return commands;
        },

        _createProjectItemCommands: function () {

            var commands = this.inherited(arguments);

            commands.toggleProjectActivities = new ToggleProjectActivities({ model: this, order: 100 });

            return commands;
        },

        updateActivityFeed: function (selectedItems) {

            // Update the activity feed view model with the user selection.
            this.activityFeedModel.set({
                selectedProjectId: this.selectedProject && this.selectedProject.id,
                selectedProjectItems: selectedItems
            });
        },

        _selectedProjectSetter: function (selectedProject) {
            this.inherited(arguments);
            this._updateProjectFeedViewModel(selectedProject);
        },

        _updateSelectedProjectDependencies: function (selectedProject) {
            this.inherited(arguments);
            this._updateProjectFeedViewModel(selectedProject);
        },

        _updateProjectFeedViewModel: function (selectedProject) {
            // Update the Project comments feed view model with the new project name and id.
            this.projectCommentFeedModel.set({
                placeholderName: selectedProject && selectedProject.name,
                selectedProjectId: selectedProject && selectedProject.id
            });
        }
    });
});
