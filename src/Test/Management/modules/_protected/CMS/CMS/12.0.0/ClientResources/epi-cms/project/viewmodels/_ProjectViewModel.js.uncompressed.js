define("epi-cms/project/viewmodels/_ProjectViewModel", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/Deferred",
    "dojo/Evented",
    "dojo/Stateful",
    "dojo/topic",
    "dojo/dom-class",
    "dojo/promise/all",
    "dojo/when",
    "dojo/string",

    // dijit
    "dijit/Destroyable",

    //epi
    "epi/epi",
    "epi/datetime",
    "epi/dependency",
    "epi/username",
    "epi/shell/_ContextMixin",
    "epi/shell/xhr/errorHandler",
    "epi-cms/plugin-area/project-overview",
    "../../contentediting/ContentActionSupport",

    // Commands
    "epi/shell/command/withConfirmation",
    "../command/AddProject",
    "../command/PublishProject",
    "../command/EditProjectItem",
    "../command/ReadyForReviewProjectItem",
    "../command/ReadyToPublishProjectItem",
    "../command/RefreshProjectItems",
    "../command/RemoveProject",
    "../command/RemoveProjectItem",
    "../command/RemoveProjectScheduling",
    "../command/RenameProject",
    "../command/SortProjectItems",
    "../command/ScheduleProject",

    // Resources
    "epi/i18n!epi/nls/episerver.cms.components.project",
    "epi/i18n!epi/nls/episerver.shared.action"
], function (
// dojo
    declare,
    lang,
    aspect,
    Deferred,
    Evented,
    Stateful,
    topic,
    domClass,
    all,
    when,
    string,

    // dijit
    Destroyable,

    // epi
    epi,
    epiDate,
    dependency,
    username,
    _ContextMixin,
    errorHandler,
    projectOverviewPluginArea,
    ContentActionSupport,

    // Commands
    withConfirmation,
    AddProject,
    PublishProject,
    EditProjectItem,
    ReadyForReviewProjectItem,
    ReadyToPublishProjectItem,
    RefreshProjectItems,
    RemoveProject,
    RemoveProjectItem,
    RemoveProjectScheduling,
    RenameProject,
    SortProjectItems,
    ScheduleProject,

    // Resources
    res,
    resShared
) {
    return declare([Stateful, Destroyable, Evented, _ContextMixin], {
        // summary:
        //      The view model for the epi-cms/project/ProjectComponent
        // tags:
        //      internal xproduct

        // commands: [readonly] epi/shell/command/_Command[]
        //      Commands to be consumed by the view.
        commands: null,

        // namedCommands: [readonly] Object
        //      Way to access commands using named keys.
        namedCommands: null,

        // created: [readonly] string
        //      A view prepared version of the date the selected project was created.
        created: "",

        // createdBy: [readonly] string
        //      A view prepared version of the user that created the selected project.
        createdBy: "",

        // profile: [readonly] Profile
        //      The current user profile
        profile: null,

        // contentLanguage: [readonly] string
        //      The current UI language
        contentLanguage: "",

        dndEnabled: false,

        // isActivitiesVisible: [readonly] Boolean
        //      A flag which indicates whether the activities panel
        //      should be visible.
        isActivitiesVisible: false,

        // projectStore: [readonly] Store
        //      A REST store for interacting with projects.
        projectStore: null,

        // projectSortOrder: [public] Object
        //      The order projects are sorted by.
        projectSortOrder: null,

        // projectItemStore: [readonly] Store
        //      A REST store for interacting with project items.
        projectItemStore: null,

        // projectItemQuery: Query
        //      Query object holding parameters to get a projects items.
        projectItemQuery: null,

        // activitiesStore: [readonly] Store
        //      A REST store for interacting with activities.
        activitiesStore: null,

        // projectItemSortOrder: [public] Object
        //      The order to sort project items by.
        projectItemSortOrder: null,

        // projectStatus: [public] string
        //      State that indicates if a project and it's contents are available.
        projectStatus: "",

        // projectName: [public] string
        //      The name of the selected project.
        projectName: "",

        // notificationMessage: [public] string
        //      The message to show in the notification bar.
        notificationMessage: "",

        // selectedProject: [public] Object
        //      The project that is currently selected.
        selectedProject: null,

        // selectedProjectItems: [public] Array
        //      An array of the project items that are selected through user interaction
        selectedProjectItems: null,

        // projectItemCountMessage: [public] String
        //      Message that is displayed when selecting items in the list
        projectItemCountMessage: "",

        // placeholderState: [public] string
        //      State that indicates if a project and it's contents are available.
        placeholderState: "noProjects",

        // _sortOrderProfileKey: [protected] String
        //      The profile key used to store the sort order
        _sortOrderProfileKey: "epi.project-sort-order",

        // _isActivitiesVisibleProfileKey: [protected] String
        //      The profile key used to store whether the activities panel is visible or not
        _isActivitiesVisibleProfileKey: "epi.project-is-activities-visible",

        _messages: null,

        constructor: function () {
            // Initialize default values for object typed properties.
            this.projectItemSortOrder = [];
            this.projectSortOrder = [{ attribute: "created", descending: true }];
            this.selectedProjectItems = [];

            this.own(projectOverviewPluginArea.on("added, removed", this._updateCommands.bind(this)));
        },

        postscript: function () {
            this.inherited(arguments);

            // Resolve the stores from the registry if they haven't been injected. This allows
            // us to mock the stores when testing.
            this.projectService = this.projectService || dependency.resolve("epi.cms.ProjectService");
            this.projectStore = this.projectStore || dependency.resolve("epi.storeregistry").get("epi.cms.project");
            this.projectItemStore = this.projectItemStore || dependency.resolve("epi.storeregistry").get("epi.cms.project.item");
            this.activitiesStore = this.activitiesStore || dependency.resolve("epi.storeregistry").get("epi.cms.activities");

            this.profile = this.profile || dependency.resolve("epi.shell.Profile");

            this._messages = this.isProjectModeEnabled() ? res.status.message : lang.mixin({}, res.status.message, res.status["messagelegacy"]);

            this._createCommands();

            this.own(
                this.projectService.on("project-item-updated", lang.hitch(this, this._updateSelectedItems)),
                this.projectService.on("project-updated", lang.hitch(this, this._projectUpdated))
            );

        },

        initialize: function () {
            // summary:
            //
            // returns: Promise
            //
            // tags:
            //      public

            return all(
                // Set the sort order based on what is stored in the profile, fall back to default value if nothing stored.
                when(this.profile.get(this._sortOrderProfileKey), lang.hitch(this, function (sort)  {
                    var option = this._findSortOption("key", sort) || this.namedCommands.sortProjectItems.options[0]; // default to name ascending
                    this._changeAttrValue("projectItemSortOrder", option.value); // use the internal setter to not trigger a profile save
                })),
                // Load the selected/current project
                when(this._loadSelectedProject(), lang.hitch(this, function (project) {
                    this._updateSelectedProjectDependencies(project);
                    this._changeAttrValue("selectedProject", project);  // use the internal setter to not trigger a profile save
                })),
                // Get the current content language from the profile
                when(this.profile.getContentLanguage(), lang.hitch(this, function (contentLanguage) {
                    this.set("contentLanguage", contentLanguage);
                })),
                when(this.profile.get(this._isActivitiesVisibleProfileKey), lang.hitch(this, function (isVisible) {
                    //Don´t set value if it is not a boolean
                    if (typeof isVisible === "boolean") {
                        this.set("isActivitiesVisible", isVisible);
                    }
                }))
            );
        },

        isProjectModeEnabled: function () {
            // summary:
            //      Indicates whether project mode is enabled or not
            // tags:
            //      public

            return this.projectService.isProjectModeEnabled;
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
            //      Adds a project and sets it as the selectedProject
            // tags:
            //      public

            this.projectStore.add(project)
                .then(lang.hitch(this, function (value) {
                    this.set("selectedProject", value);
                }))
                .otherwise(errorHandler.forXhr);
        },

        getProject: function () {
            // summary:
            //      Get the current project.
            // tags:
            //      public

            return this.get("selectedProject");
        },

        updateProject: function (project) {
            // summary:
            //      Adds a project and sets it as the selectedProject
            // tags:
            //      public

            this.projectStore.put(project)
                .then(lang.hitch(this, "set", "selectedProject"))
                .otherwise(errorHandler.forXhr);
        },

        publishProject: function (projectId, delayPublishUntil) {
            // summary:
            //      Publishes a project with given id right away or delay publishing until given delayPublish date.
            // projectId: Number
            //      Id of the project to publish
            // delayPublishUntil: Date?
            //      If supplied, then the project will be delay published.
            // returns: Promise
            // tags:
            //      public

            var self = this;

            return this.projectService.publishProject(projectId, delayPublishUntil)
                .then(function (updatedProject) {
                    return self._updateSelectedProjectAndRefreshContextRequest(updatedProject)
                        .then(function () {
                            return updatedProject;
                        });
                });
        },

        reactivateProject: function (projectId) {
            // summary:
            //      Reactivates a project that has been scheduled to publish.
            // projectId: Number
            //      The ID of the project to reactivate
            // returns: Promise
            // tags:
            //      public

            var self = this;

            if (isNaN(projectId)) {
                throw new Error("The given project ID is not a number.");
            }

            return this.projectService.reactivateProject(projectId)
                .then(function (updatedProject) {
                    return self._updateSelectedProjectAndRefreshContextRequest(updatedProject)
                        .then(function () {
                            return updatedProject;
                        });
                });
        },

        refreshActivities: function () {
            // summary:
            //      Refreshes the activity feed.
            // tags:
            //      public

            this.emit("refresh-activities");
        },

        refreshProject: function (refreshItems) {
            // summary:
            //      Refreshes the selected project, particularly information if the project can be published or not.
            // refreshItems: Boolean
            //      A flag indicating whether to emit a refresh event to also refresh project items. Default true.
            // tags:
            //      public

            var self = this;

            if (refreshItems === undefined) {
                refreshItems = true;
            }

            if (this.selectedProject) {
                return this.projectStore.refresh(this.selectedProject.id).then(
                    function (value) {
                        self.set("selectedProject", value);
                        if (refreshItems) {
                            self.emit("refresh");
                        }
                        return value;
                    },
                    function (ex) {
                        self.set("selectedProject", null);
                    }
                );
            }

            if (refreshItems) {
                this.emit("refresh");
            }
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
                self.set("selectedProject", null);
            });
        },

        canAddContent: function (contentReferences) {
            // summary:
            //      Verifies that the given content references can be added to the currently selected project
            // contentReferences: Array
            //      The content references to add to the currently selected project
            // returns: Promise
            //      A promise
            // tags:
            //      public

            var selectedProjectId = this.get("selectedProject").id;

            return this.projectService.canAddContent(selectedProjectId, contentReferences);
        },

        canPublishProject: function (project) {
            // summary:
            //      Checks if a project can be published. Uses either a project
            //      as an argument or the currently selected proejct.
            // tags:
            //      public

            var itemStatusCount;

            function noPublishAccess() {
                return Object.keys(itemStatusCount).some(function (key) {
                    if (key.indexOf("nopublishaccess") > -1) {
                        if (itemStatusCount[key] > 0) {
                            return true;
                        }
                    }
                });
            }

            function checkState(state) {
                return itemStatusCount[state] > 0;
            }

            project = project || this.selectedProject;
            itemStatusCount = project && project.itemStatusCount;

            if (this.isProjectModeEnabled()) {
                return !!project && project.itemStatusCount.checkedin > 0;
            } else {
                return !!project && (project.status === "active" || project.status === "publishfailed") &&
                       !noPublishAccess() && !checkState("notcreated") && !checkState("rejected") && !checkState("checkedout") &&
                       (checkState("checkedin") || checkState("published") || checkState("previouslypublished") || checkState("delayedpublish"));
            }
        },

        addProjectItems: function (contentReferences, projectId) {
            // summary:
            //      Adds the given content references as items of the project.
            // tags:
            //      public

            var selectedProject = this.get("selectedProject");

            projectId = projectId || (selectedProject && selectedProject.id);

            if (!projectId) {
                throw new Error("If no projectId is provided a selectedProject must be set in the context");
            }

            return this.projectService.addProjectItems(projectId, contentReferences);
        },

        removeSelectedProjectItems: function () {
            // summary:
            //      Removes the selected project items from the project.
            // tags:
            //      public
            var promise = this.projectService.removeProjectItems(this.selectedProjectItems);
            promise.then(function () {
                this.emit("item-removed");
            }.bind(this));

            return promise;
        },

        markProjectItemsAsReadyForReview: function (comment) {
            // summary:
            //      Mark the selected project items as ready to publish.
            // returns: Promise
            //      A promise that resolves when the refresh project has completed.
            // tags:
            //      public

            return this._setStatusOnProjectItems("markAsReadyForReview", { comment: comment });
        },

        markProjectItemsAsReadyToPublish: function () {
            // summary:
            //      Mark the selected project items as ready to publish.
            // returns: Promise
            //      A promise that resolves when the refresh project has completed.
            // tags:
            //      public

            this._setStatusOnProjectItems("markAsReadyToPublish");
        },

        _setStatusOnProjectItems: function (methodName, options) {
            // summary:
            //      Set the status of the project items using the given method.
            // tags:
            //      private

            // Do an early exit when there are no project items selected.
            if (!this.selectedProjectItems.length) {
                return new Deferred().resolve();
            }

            var self = this;
            var itemIds = this.selectedProjectItems.map(function (item) {
                return item.id;
            });

            return this.projectService[methodName](itemIds, options)
                .then(function () {
                    return when(self.getCurrentContext());
                })
                .then(function (ctx) {
                    var matchingItem;
                    self.selectedProjectItems.some(function (item) {
                        if (item.contentLink === ctx.id) {
                            matchingItem = item;
                            return true;
                        }
                    });
                    if (matchingItem) {
                        self.requestContextChange(matchingItem.contentLink);
                    }
                });
        },

        requestContextChange: function (contextOrContentReference) {
            // summary:
            //      Requests that the UI changes the context to the specified contentReference.
            // tags:
            //      public

            var context = contextOrContentReference.uri ? contextOrContentReference :
                { uri: "epi.cms.contentdata:///" +  contextOrContentReference};

            topic.publish("/epi/shell/context/request", context, { sender: this });
        },

        updateActivityFeed: function (selectedItems) {
            // summary:
            //      Used to update activity feed in project overview
            // tags:
            //      protected
        },

        _projectUpdated: function (project) {
            // summary:
            //      Handle project-updated event
            //      Check if provided project is the same as the currently selected one
            //      then set notificationMessage if projectstatus is publishfailed if true
            // tags:
            //      private
            if (this.selectedProject && this.selectedProject.id === project.id) {
                this.set("selectedProject", project);
            }
        },

        _updateSelectedItems: function (item) {
            // summary:
            //      Update selectedProjectItems with new one if provided item has changed
            // tags:
            //      private

            var selectedLength = this.selectedProjectItems.length;

            for (var i = 0; i < selectedLength; i++) {
                if (this.selectedProjectItems[i].id === item.id) {
                    this.selectedProjectItems[i] = item;
                    this.set("selectedProjectItems", this.selectedProjectItems);

                    // since store has already run refresh on these items, we need to highligt them again in the list
                    this.emit("selected-project-items-updated", this.selectedProjectItems);
                    break;
                }
            }
        },

        onCommandsChanged: function (name, removed, added) {
            // summary:
            //		Callback when available commands have been changed.
            // name: String
            //      Name of the affected command collection
            // removed: Array
            //      An array of removed commands
            // added: Array
            //      An array of added commands
            // tags:
            //		public callback
        },

        _updateCommands: function () {
            var oldCommands = this.commands;
            this._createCommands();
            this.onCommandsChanged("commands", oldCommands, this.commands);
        },

        _createCommands: function () {
            var namedCommands = this._getOrCreateNamedCommands();

            var commands = Object.keys(namedCommands).map(function (key) {
                return namedCommands[key];
            });

            projectOverviewPluginArea.get().forEach(function (command) {
                this.own(command);
                commands.push(command);
            }.bind(this));

            commands = commands.sort(function (a, b) {
                return a.order - b.order;
            });

            this.set("commands", commands);
        },

        _getOrCreateNamedCommands: function () {
            if (this.namedCommands) {
                return this.namedCommands;
            }
            var namedCommands = Object.assign(this._createProjectCommands(), this._createProjectItemCommands());
            this.own.apply(this, namedCommands);
            this.set("namedCommands", namedCommands);
            return namedCommands;
        },

        _createProjectCommands: function () {

            return {
                addProject: new AddProject({ model: this, order: 10 }),
                renameProject: new RenameProject({ model: this, order: 20 }),
                removeProject: new RemoveProject({ model: this, order: 30, store: this.projectStore }),
                publishProject: new PublishProject({ model: this, order: 40 }),
                scheduleProject: new ScheduleProject({ model: this, order: 50 }),
                removeProjectScheduling: withConfirmation(new RemoveProjectScheduling({ model: this, order: 60 }), null, {
                    title: res.command.removeschedulingprojectitem.title,
                    description: res.command.removeschedulingprojectitem.confirmation,
                    confirmActionText: resShared.remove,
                    cancelActionText: resShared.cancel
                })
            };
        },

        _createProjectItemCommands: function () {

            return {
                readyForReviewProjectItem: new ReadyForReviewProjectItem({ model: this, order: 90 }),
                readyToPublishProjectItem: new ReadyToPublishProjectItem({ model: this, order: 100 }),
                editProjectItem: new EditProjectItem({ model: this, order: 110 }),
                removeProjectItem: withConfirmation(new RemoveProjectItem({ model: this, order: 120 }), null, {
                    title: res.command.removeprojectitem.label,
                    description: res.command.removeprojectitem.confirmation,
                    confirmActionText: resShared.remove,
                    cancelActionText: resShared.cancel
                }),
                sortProjectItems: new SortProjectItems({ model: this, order: 130 }),
                refreshProjectItems: new RefreshProjectItems({ model: this, order: 140 })
            };
        },

        _loadSelectedProject: function () {
            // summary:
            //      Loads the selected project
            // returns: Promise
            // tags:
            //      protected

            return this.projectService.getCurrentProject();
        },

        _persistSelectedProject: function (selectedProject) {
            // summary:
            //      Store the selected project in the user profile
            // tags: protected

            this.profile.set(this._selectedProjectProfileKey, selectedProject && selectedProject.id, { location: "server" });
        },

        _persistSortOrder: function (sortOrder) {
            // summary:
            //      Store the project item sort order in the user profile
            // tags: protected

            var option = this._findSortOption("value", sortOrder),
                key = option && option.key || null;

            this.profile.set(this._sortOrderProfileKey, key, { location: "server" });
        },

        _persistIsActivitiesPanelVisible: function (isVisible) {
            // summary:
            //      Store whether the activities panel is visible or not
            // tags: protected

            this.profile.set(this._isActivitiesVisibleProfileKey, isVisible, { location: "server" });
        },

        _findSortOption: function (key, term) {

            var options = this.namedCommands.sortProjectItems.options,
                option = null;

            term && options.some(function (item) {
                if (term === item[key]) {
                    option = item;
                    return true;
                }
            });

            return option;
        },

        _updateSelectedProjectDependencies: function (selectedProject) {

            var created = "",
                createdBy = "",
                delayPublish = "",
                dndEnabled = false,
                notificationMessage = "",
                projectItemQuery = null,
                projectStatus = "",
                projectName = "",
                isProjectModeEnabled = this.isProjectModeEnabled();

            if (selectedProject) {
                created = epiDate.toUserFriendlyString(new Date(selectedProject.created));
                createdBy = username.toUserFriendlyString(selectedProject.createdBy, null, true);
                dndEnabled = (isProjectModeEnabled && selectedProject.status !== "publishing") || selectedProject.status === "active" || selectedProject.status === "publishfailed";
                projectItemQuery = { projectId: selectedProject.id };
                projectName = selectedProject.name;

                if (!this.canPublishProject(selectedProject) || isProjectModeEnabled) {
                    projectStatus = this._messages[selectedProject.status] || "";

                    if (selectedProject.status === "delayedpublished" && !isProjectModeEnabled) {
                        delayPublish = epiDate.toUserFriendlyString(selectedProject.delayPublishUntil);
                        projectStatus = lang.replace(projectStatus, { date: delayPublish });
                        notificationMessage = lang.replace(res.status.state.delayedpublished, { delayPublishUntil: delayPublish });
                    }
                }

                if (selectedProject.status === "publishfailed") {
                    notificationMessage = this._getProjectFailedMessage(selectedProject);
                }
            }

            this.set({
                created: created,
                createdBy: createdBy,
                dndEnabled: dndEnabled,
                notificationMessage: notificationMessage,
                projectItemQuery: projectItemQuery, // Refresh the list query when the selected project changes.
                projectStatus: projectStatus,
                projectName: projectName
            });
        },

        _getProjectFailedMessage: function (selectedProject) {
            // summary:
            //      Helper function to get the project failed notification message
            // returns: String
            // tags: private
            var failedItemsCount = 0,
                notificationMessage = "",
                publishfailed = res.notifications.publishfailed;

            failedItemsCount = this._getUnpublishedItems(selectedProject.itemStatusCount);

            if (failedItemsCount > 0) {
                notificationMessage = lang.replace(failedItemsCount > 1
                    ? publishfailed.notificationtextmultipleitems
                    : publishfailed.notificationtextsingleitem, { failedItemsCount: failedItemsCount });
            }
            return notificationMessage;
        },

        _getUnpublishedItems: function (statuses) {
            // summary:
            //      Helper function to count the amount of unpublished items in the project
            // returns: Integer
            // tags: private
            var count = 0;

            Object.keys(statuses).forEach(function (key) {
                if (key.indexOf("checkedin") === 0) {
                    count += statuses[key];
                }
            });
            return count;
        },

        _isActivitiesVisibleSetter: function (isVisible) {

            if (isVisible === this.isActivitiesVisible) {
                return;
            }
            this.isActivitiesVisible = isVisible;
            this._persistIsActivitiesPanelVisible(isVisible);
        },

        _selectedProjectSetter: function (selectedProject) {

            //Store return the same instance sometimes.
            selectedProject = lang.clone(selectedProject);

            // Early exit if the project has not changed
            if (epi.areEqual(this.selectedProject, selectedProject)) {
                return;
            }

            // Only clear the selection if a new project is selected and
            // not when the current project has been updated.
            if (this.selectedProject && (!selectedProject || this.selectedProject.id !== selectedProject.id)) {
                this.emit("clear-selection");
            }

            this.selectedProject = selectedProject;
            this._updateSelectedProjectDependencies(selectedProject);
        },

        _projectItemSortOrderSetter: function (sortOrder) {
            // summary:
            //      Store the selected project in the user profile

            if (sortOrder && sortOrder === this.projectItemSortOrder) {
                return;
            }

            this.projectItemSortOrder = sortOrder;

            this._persistSortOrder(sortOrder);

        },

        _updateSelectedProjectAndRefreshContextRequest: function (updatedProject) {
            // summary:
            //      Updates the selectedProject with given project and runs the context request change with currently available context
            // returns: Promise
            //      The context which is reloaded/refreshed.
            // tags:
            //      internal

            var self = this;

            // update the selected project and also change context request to current context.
            self.set("selectedProject", updatedProject);

            return when(this.getCurrentContext()).then(function (context) {
                self.requestContextChange(context);
                return context;
            });
        },

        _selectedProjectItemsSetter: function (selectedItems) {
            this.selectedProjectItems = selectedItems;
            this._updateProjectCountMessage(selectedItems);
        },

        _updateProjectCountMessage: function (selectedItems) {

            var items = selectedItems && selectedItems.length > 0 ? selectedItems.length : null,
                message = "";

            function createMessage(count, resourceKey) {
                message = string.substitute(res.notifications.selecteditems[resourceKey], {
                    count: count
                });
            }

            if (items) {
                if (items === 1) {
                    createMessage(items, "singular");
                } else if (items > 1) {
                    createMessage(items, "plural");
                }
            }

            this.set("projectItemCountMessage", message);
        }

    });
});
