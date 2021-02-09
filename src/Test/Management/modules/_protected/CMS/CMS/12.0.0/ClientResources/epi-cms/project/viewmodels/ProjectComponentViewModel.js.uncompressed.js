define("epi-cms/project/viewmodels/ProjectComponentViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/when",

    "./_ProjectViewModel",

    // Resources
    "epi/i18n!epi/nls/episerver.cms.components.project"

], function (
//dojo
    declare,
    lang,
    Deferred,
    when,

    _ProjectViewModel,

    res
) {
    return declare([_ProjectViewModel], {
        // summary:
        //
        // tags:
        //      internal

        // createdProjectInfo: [readonly] string
        //      A view prepared version of the placeholder info.
        createProjectInfo: "",

        // hasProject: [readonly] bool
        //      Indicates if there are any projects available.
        hasProject: false,

        _selectedProjectProfileKey: "epi.selected-project-id",

        initialize: function () {
            this._updateHasProject();
            return this.inherited(arguments);
        },

        removeProject: function () {
            // summary:
            //      Removes the selected project and sets the selected project property to null.
            // tags:
            //      public

            var self = this,
                store = this.projectStore;

            if (!this.selectedProject) {
                return new Deferred().resolve();
            }

            return store.remove(this.selectedProject.id).then(function () {
                self._selectNextProject();
            });
        },

        _loadSelectedProject: function () {
            // summary:
            //      Loads the selected project
            // returns: Promise
            //      The project that was stored in the profile
            // tags:
            //      internal

            var projectStore = this.projectStore;

            //Load the selected project from the profile
            return when(this.profile.get(this._selectedProjectProfileKey), function (projectId) {

                if (!projectId) {
                    return null;
                }

                // Need to get the project from the store in order to ensure it still exists.
                // Otherwise return null
                return when(projectStore.get(projectId)).then(function (project) {

                    // if a project has been resolved we know that there is at least one available
                    // so that we can pass it along to the hasProject check
                    var hasProject = !!project || undefined;

                    return this._updateHasProject(hasProject).then(function () {
                        return project;
                    });

                }.bind(this)).otherwise(function (ex) {
                    return null;
                });
            }.bind(this));
        },

        _updatePlaceholderState: function () {

            var hasProjects = this.get("hasProject"),
                hasSelectedProject = !!this.get("selectedProject"),
                state = "";

            if (!hasProjects) {
                // should set placeholderState to 'noProjects' when there are no projects
                state = "noProjects";
                this.set("createProjectInfo", res.placeholder.noprojectscreated);
            } else if (hasProjects && !hasSelectedProject) {
                // should set placeholderState to 'noSelectedProject' when there are projects available and no project is selected
                state = "noSelectedProject";
                this.set("createProjectInfo", res.placeholder.noprojectselected);
            }

            this.set("placeholderState", state);
        },

        _getProjects: function (start, count, sort) {
            // summary:
            //      Gets projects based on attributes
            // tags:
            //      private

            return this.projectStore.query(null, { start: start, count: count, sort: sort });
        },

        _updateHasProject: function (hasProject) {
            // summary:
            //      updates hasProject boolean depending on getHasProject result
            // tags:
            //      private

            return when(hasProject === true ? [hasProject] : this._getProjects(0, 1)).then(function (results) {
                var result = results.length > 0;
                this.set("hasProject", result);

                return result;
            }.bind(this));
        },

        _selectNextProject: function () {
            // summary:
            //      Selects next project
            // tags:
            //      protected

            when(this._getProjects(0, 1, this.get("projectSortOrder")), lang.hitch(this, function (results) {
                var value = results.length > 0 ? results[0] : null;
                this.set("selectedProject", value);
                this.set("hasProject", results.length > 0);
            }));
        },

        _hasProjectSetter: function (value) {
            this.hasProject = value;
            this._updatePlaceholderState();
        },

        _selectedProjectSetter: function (selectedProject) {

            this.inherited(arguments);

            if (!this.hasProject && selectedProject) {
                this.set("hasProject", true);
            } else {
                this._updatePlaceholderState();
            }

            // Store the selected project.
            this.profile.set(this._selectedProjectProfileKey, selectedProject && selectedProject.id, { location: "server" });
        }
    });
});
