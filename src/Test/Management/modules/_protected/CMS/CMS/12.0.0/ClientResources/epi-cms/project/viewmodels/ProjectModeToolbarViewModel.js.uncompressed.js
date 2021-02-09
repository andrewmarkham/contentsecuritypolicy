define("epi-cms/project/viewmodels/ProjectModeToolbarViewModel", [
    // dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/Deferred",
    "dojo/Evented",
    "dojo/Stateful",
    "dojo/topic",
    "dojo/when",
    // dijit
    "dijit/Destroyable",

    //epi
    "epi/shell/command/_CommandProviderMixin",
    "epi/epi",
    "epi/dependency",
    "epi-cms/_ContentContextMixin",
    "../command/AddProject",
    "../command/RenameProject",
    "../command/RemoveProject",
    "epi/shell/xhr/errorHandler"
],

function (
    // dojo
    declare,
    lang,
    aspect,
    Deferred,
    Evented,
    Stateful,
    topic,
    when,
    // dijit
    Destroyable,

    // epi
    _CommandProviderMixin,
    epi,
    dependency,
    _ContentContextMixin,
    AddProject,
    RenameProject,
    RemoveProject,
    errorHandler
) {
    return declare([Stateful, Destroyable, Evented, _ContentContextMixin, _CommandProviderMixin], {
        // summary:
        //      The view model for the epi-cms/project/ProjectModeToolbar
        // tags:
        //      internal

        // projectStore: [readonly] Store
        //      A REST store for interacting with projects.
        projectStore: null,

        // currentProject: [public] Object
        //      The project that is currently selected.
        currentProject: null,

        // overviewButtonVisible: [public] Boolean
        //       Visiblity of overview button
        overviewButtonVisible: false,

        postscript: function () {
            this.inherited(arguments);

            // Resolve the project service and store from the dependency if they
            // haven't been injected. This allows us to mock them when testing.
            this.projectService = this.projectService || dependency.resolve("epi.cms.ProjectService");
            this.projectStore = this.projectStore || dependency.resolve("epi.storeregistry").get("epi.cms.project");

            this._createCommands();

            var projectRemoved = function (id) {
                if (this.currentProject && this.currentProject.id === id) {
                    this._markCurentProjectAsDeleted();
                }
            }.bind(this);

            var projectUpdated = function (project) {
                if (this.currentProject && this.currentProject.id === project.id) {
                    this.set("currentProject", project);
                }
            }.bind(this);

            this.own(
                this.projectService.on("project-removed", projectRemoved),
                this.projectService.on("project-updated", projectUpdated)
            );

            when(this.getCurrentContext()).then(this.contextChanged.bind(this));
        },

        initialize: function () {
            // summary:
            //
            // returns: Promise
            //
            // tags:
            //      public


            // Set the current project based on what is stored in the profile
            return when(this.projectService.getCurrentProject()).then(lang.hitch(this, function (project) {
                this._changeAttrValue("currentProject", project, false); // use the internal setter to not trigger a profile save
                this.set("overviewButtonVisible", !!project);
            }));
        },

        contentContextChanged: function (context, callerData) {
            // summary:
            //      Callback method for when the current content context has changed
            // context: Object
            // callerData: Object
            // tags:
            //      protected
            this.inherited(arguments);

            if (this.get("currentProject")) {
                var self = this;
                this.projectService.exists(this.currentProject.id).then(function (exists) {
                    if (!exists) {
                        self.emit("currentProjectDoesNotExists");
                    }
                });
            }
        },

        _markCurentProjectAsDeleted: function () {
            // summary:
            //      Set the currentProject with property indicating that the project is deleted.
            // tags:
            //      private

            var currentProject = lang.clone(this.currentProject);
            currentProject.isDeleted = true;
            this.set("currentProject", currentProject, false);
            this.set("overviewButtonVisible", false);
        },

        contextChanged: function (/*Object*/context, /*Object*/callerData) {
            // summary:
            //      On context changed
            // tags:
            //      protected
            this.inherited(arguments);

            if (context && context.type === "epi.cms.project") {
                var projectId = parseInt(context.id, 10);
                when(this.projectStore.get(projectId)).then(lang.hitch(this, function (project) {
                    //only animate icon and text in toolbar when url changes
                    if (callerData && callerData.sender && callerData.sender._requestContext) {
                        //Animates toolbar when URL changes.
                        this.emit("animateToolbar");
                    }
                    this.set("currentProject", project);
                }));
            }

        },

        _currentProjectSetter: function (currentProject, persist) {
            // summary:
            //      Sets the current project
            // currentProject: Object
            //      The current project
            // persist: Boolean
            // tags:
            //      private

            // Early exit if the project has not changed
            if (epi.areEqual(this._clearProjectStats(this.currentProject), this._clearProjectStats(currentProject))) {
                return;
            }

            this.set("overviewButtonVisible", !!currentProject);

            this.currentProject = currentProject;

            var promise = new Deferred().resolve();

            // Store the selected project.
            if (persist || persist === undefined) {
                promise = this.projectService.setCurrentProject(currentProject);
            }

            // Refresh the current context when switching projects to ensure
            // that the preview is correct.
            promise
                .then(lang.hitch(this, "getCurrentContext"))
                .then(function (context) {
                    // In order to avoid a page refresh, for instance when creating or translating a page with required fields,
                    // we make sure to not request any new context while we're still in these modes (create, translate)
                    // in order not to lose any data entered into the required fields.
                    if (context.type !== "epi.cms.project" && context.currentMode === undefined) {
                        topic.publish("/epi/shell/context/request", { uri: context.versionAgnosticUri }, { sender: this });
                    }

                });

        },

        _clearProjectStats: function (project) {
            // summary:
            //      Remove itemStatusCount statistics from project object
            // project: Object?
            //      project object
            // tags:
            //      private

            if (!project) {
                return project;
            }
            return Object.assign({}, project, { itemStatusCount: {} });
        },

        showProjectOverview: function (projectId) {
            // summary:
            //      Publishes request change for project overview
            // projectId: Int
            //      The id of the project
            // tags:
            //      public
            var newProjectUri = "epi.cms.project:///" + projectId;
            topic.publish("/epi/shell/context/request", { uri: newProjectUri }, { sender: this });
        },

        getCommands: function () {
            // summary:
            //      Returns all available commands
            // tags:
            //      public

            return this.commands;
        },

        addProject: function (project) {
            // summary:
            //      Adds a project and sets it as the currentProject
            // tags:
            //      public
            this.projectStore.add(project)
                .then(lang.hitch(this, function (value) {
                    this.set("currentProject", value);
                }))
                .otherwise(errorHandler.forXhr);
        },

        getProject: function () {
            // summary:
            //      Get the current project.
            // tags:
            //      public

            return this.get("currentProject");
        },

        updateProject: function (project) {
            // summary:
            //      Adds a project and sets it as the currentProject
            // tags:
            //      public

            this.projectStore.put(project)
                .then(lang.hitch(this, "set", "currentProject"))
                .otherwise(errorHandler.forXhr);
        },

        reactivateProject: function () {
            // summary:
            //      Reactivates a project that has been scheduled to publish.
            // returns:
            //      Promise
            // tags:
            //      public

            if (!this.currentProject) {
                return new Deferred().resolve();
            }

            return this.projectService.reactivateProject(this.currentProject.id);
        },

        removeProject: function () {
            // summary:
            //      Removes the selected project and sets the currentProject property to null.
            // tags:
            //      public
            if (!this.currentProject) {
                return new Deferred().resolve();
            }

            return this.projectStore.remove(this.currentProject.id).then(lang.hitch(this, function () {
                this.set("currentProject", null);
            }));
        },

        _createCommands: function () {

            var commandArgs = {
                    model: this,
                    category: "context",
                    propertiesToWatch: ["currentProject"]
                },
                commands = this.own(
                    new AddProject(commandArgs),
                    new RenameProject(commandArgs),
                    new RemoveProject(commandArgs)
                );

            this.set("commands", commands);
        }
    });
});
