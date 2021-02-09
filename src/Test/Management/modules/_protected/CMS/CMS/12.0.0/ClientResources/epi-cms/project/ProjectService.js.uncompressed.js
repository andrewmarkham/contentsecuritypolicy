define("epi-cms/project/ProjectService", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/Evented",
    "dojo/aspect",

    //dijit
    "dijit/Destroyable",

    // epi
    "epi/dependency",
    "epi/shell/xhr/errorHandler",
    "epi-cms/ApplicationSettings",
    "epi-cms/core/ContentReference"
],

function (
// dojo
    declare,
    lang,
    when,
    Deferred,
    all,
    Evented,
    aspect,

    // dijit
    Destroyable,

    // epi
    dependency,
    errorHandler,
    ApplicationSettings,
    ContentReference
) {

    return declare([Evented, Destroyable], {
        // summary:
        //      A service for interacting with projects
        // tags:
        //      internal xproduct

        // isProjectModeEnabled: [readonly] Boolean
        //      Indicates whether project mode is enabled.
        isProjectModeEnabled: false,

        // projectItemStore: [readonly] Store
        //      A REST store for interacting with project items.
        projectItemStore: null,

        // projectStore: [readonly] Store
        //      A REST store for interacting with projects.
        projectStore: null,

        _currentProjectProfileKey: "epi.current-project-id",

        constructor: function (params) {
            declare.safeMixin(this, params);

            this.projectItemStore = this.projectItemStore || dependency.resolve("epi.storeregistry").get("epi.cms.project.item");
            this.projectStore = this.projectStore || dependency.resolve("epi.storeregistry").get("epi.cms.project");
            this.profile = this.profile || dependency.resolve("epi.shell.Profile");

            this.isProjectModeEnabled = ApplicationSettings.isProjectModeEnabled;

            this.own(
                this.projectItemStore.on("update", this._onProjectItemUpdated.bind(this)),
                this.projectItemStore.on("delete", this._onProjectItemRemoved.bind(this)),
                this.projectStore.on("update", this._onProjectUpdated.bind(this)),
                this.projectStore.on("delete", this._onProjectRemoved.bind(this))
            );
        },

        hasScheduledProjectItems: function (projectId) {
            // summary:
            //      Checks if the project have any scheduled items
            // projectId: Number
            //      ProjectId
            // returns: Promise
            //      true/false
            // tags:
            //      internal
            return errorHandler.wrapXhr(this.projectStore.refresh(projectId)).then(function (project) {
                return project.itemStatusCount.delayedpublish > 0 || project.itemStatusCount.delayedpublish_nopublishaccess > 0;
            }.bind(this));
        },

        getProjectItemsForContent: function (contentLinks) {
            // summary:
            //      Get the associated projects items for the given content links
            //
            // contentLinks: String|Array
            //      The content links to get the project items for for
            // tags:
            //      internal

            if (!(contentLinks instanceof Array)) {
                contentLinks = [contentLinks];
            }

            return when(this.projectItemStore.query({contentLinks: contentLinks}));
        },

        getProjectItemForContent: function (contentLink) {
            // summary:
            //      Get the associated project item for the given content link
            // contentLink: String
            //      The content link to get the project item for
            // returns: Promise
            //      Returns the associated project item if found otherwise null
            // tags:
            //      internal

            var contentReference = new ContentReference(contentLink);

            if (contentReference.workId === 0) {
                return new Deferred().reject("The content link needs to be version specific");
            }

            return this.getProjectItemsForContent(contentLink)
                .then(function (projectItems) {
                    for (var i = 0; i < projectItems.length; i++) {
                        if (projectItems[i].contentLink === contentLink) {
                            return projectItems[i];
                        }
                    }
                    return null;
                });
        },

        getProjectsForContent: function (contentLinks) {
            // summary:
            //      Get the associated projects for the given content links
            //
            // contentLinks: String|Array
            //      The content links to get the projects for
            // tags:
            //      internal

            var self = this;

            if (!(contentLinks instanceof Array)) {
                contentLinks = [contentLinks];
            }

            return this.getProjectItemsForContent(contentLinks).then(function (projectItems) {
                // If no project items where found return an empty array
                if (projectItems.length === 0) {
                    return new Deferred().resolve([]);
                }

                return self.getProjects(projectItems);
            });
        },

        canAddContent: function (projectId, contentLinks, languageId) {
            // summary:
            //      Verifies that the given content links are unique and can be added to the project
            //
            // projectId: Number
            //      The project id to check
            // contentLinks: Array
            //      The content links to add
            // languageId: string
            //      The language to check
            // returns: Promise
            //      A promise with the result from the server
            // tags:
            //      internal
            var uniqueContentLinks = contentLinks.filter(function (elem, pos) {
                return contentLinks.indexOf(elem) === pos;
            });

            return this.projectStore.executeMethod("CanAddContent", projectId, { contentReferences: uniqueContentLinks, languageId: languageId});
        },

        getProjects: function (projectItems) {
            // summary:
            //      Get the projects for the project items
            //
            // projectItems: int[]
            //      The project items to get the projects for
            // tags:
            //      internal

            var projectStore = this.projectStore;
            var projectPromises = projectItems.map(function (projectItem) {
                return projectStore.get(projectItem.projectId);
            });

            return all(projectPromises);
        },

        exists: function (projectId) {
            // summary:
            //      Checks if the given project still exists
            // projectId: Number
            //      The id of the project
            // returns: Promise
            //      True if it still exists otherwise False

            return errorHandler.wrapXhr(this.projectStore.executeMethod("exists", projectId));
        },

        addProjectItems: function (projectId, contentReferences) {
            // summary:
            //      Adds the given content references as items of the project.
            //
            // projectId: Number
            //      The target project for adding items to.
            // contentReferences: ContentReference[]
            //      An array of references to content items to add to the project.
            // tags:
            //      public

            // Ensure the content reference we received are valid and unique.
            contentReferences = contentReferences.filter(function (reference, pos) {
                if (ContentReference.isContentReference(reference) && contentReferences.indexOf(reference) === pos) {
                    return true;
                }
            });

            var result = this.projectItemStore
                .executeMethod("addItems", projectId, { contentLinks: contentReferences })
                .then(function (result) {
                    result.forEach(function (item) {
                        this.projectItemStore.notify(item, this.projectItemStore.getIdentity(item));
                    }, this);
                    return result;
                }.bind(this));
            return errorHandler.wrapXhr(result);
        },

        removeProjectItems: function (projectItems) {
            // summary:
            //      Removes the project items from a project.
            // projectItems: Array
            //      An array of project items to remove from the project
            // tags:
            //      public

            var itemIds = projectItems.map(function (item) {
                return item.id;
            });

            return errorHandler.wrapXhr(this.projectItemStore.removeRange(itemIds));
        },

        markAsReadyForReview: function (projectItems, options) {
            // summary:
            //      Mark the project items as ready for review.
            // returns: Promise
            //      A promise that resolves when the items have been marked as ready for review.
            // tags:
            //      public

            var args = lang.mixin({ projectItems: projectItems }, options);
            return errorHandler.wrapXhr(this.projectItemStore.executeMethod("ReadyForReview", "", args));
        },

        markAsReadyToPublish: function (projectItems) {
            // summary:
            //      Mark the project items as ready to publish.
            // returns: Promise
            //      A promise that resolves when the items have been marked as ready to publish.
            // tags:
            //      public

            return errorHandler.wrapXhr(this.projectItemStore.executeMethod("ReadyToPublish", "", projectItems));
        },

        isPartOfDelayedPublishedProject: function (contentLink) {
            // summary:
            //      Determines if the content is part of any project that is set to delayed publish
            // contentLink: String
            //      The content link to check
            // returns:
            //      Promise
            // tags:
            //      public

            return this.getProjectsForContent([contentLink])
                .then(function (projects) {
                    return projects.some(function (project) {
                        return project.status === "delayedpublished";
                    });
                });
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

            var store = this.projectStore;

            if (isNaN(projectId)) {
                throw new Error("projectId is not a number");
            }

            // we need to patch the store to update cache and notify the observers.
            return errorHandler.wrapXhr(store.executeMethod("Publish", projectId, { delayPublishUntil: delayPublishUntil }))
                .then(store.patchCache.bind(store));
        },

        reactivateProject: function (projectId) {
            // summary:
            //      Reactivates a project that has been scheduled for publishing.
            // projectId: Number
            //      The ID of the project to reactivate
            // returns: Promise
            // tags:
            //      public

            var store = this.projectStore;

            if (isNaN(projectId)) {
                throw new Error("The given project ID is not a number.");
            }

            // we need to patch the store to update cache and notify the observers.
            return errorHandler.wrapXhr(store.executeMethod("Reactivate", projectId))
                .then(store.patchCache.bind(store));
        },

        getCurrentProjectId: function () {
            // summary:
            //      Gets the id of the currently selected project from the user profile
            // returns: Promise
            //      Id of the currently selected project as set in the user.
            // tags:
            //      public

            if (!this.isProjectModeEnabled) {
                return new Deferred().resolve(null);
            }
            return when(this.profile.get(this._currentProjectProfileKey));
        },

        getCurrentProject: function () {
            // summary:
            //      Load the current project
            // returns: Promise
            //      The project that was stored in the profile
            // tags:
            //      public

            var projectStore = this.projectStore;
            var that = this;

            //Load the selected project from the profile
            return this.getCurrentProjectId().then(function (projectId) {
                if (!projectId) {
                    return null;
                }

                // Need to get the project from the store in order to ensure it still exists.
                // Otherwise return null
                return when(projectStore.get(projectId)).otherwise(function (ex) {
                    console.log(ex);

                    // Reset the project if it's not found. Can happen when another user deletes the project.
                    if (ex.status === 404) {
                        that.setCurrentProject(null);
                    }

                    return null;
                });
            });
        },

        setCurrentProject: function (currentProject) {
            // summary:
            //      Set the current project, it will be stored in the profile.
            //
            // returns: Promise
            //
            // tags:
            //      public

            this.emit("currentProjectChanged", currentProject);

            return this.profile.set(this._currentProjectProfileKey, currentProject && currentProject.id, { location: "server" });
        },

        _onProjectItemUpdated: function (event) {
            // summary:
            //      Emits a project item updated event.
            // tags:
            //      private

            this.emit("project-item-updated", event.target);
        },

        _onProjectItemRemoved: function (event) {
            // summary:
            //      Emits a project item removed event.
            // tags:
            //      private

            this.emit("project-item-removed", event.id);
        },

        _onProjectUpdated: function (event) {
            // summary:
            //      Emits a project updated event.
            // tags:
            //      private

            this.emit("project-updated", event.target);
        },

        _onProjectRemoved: function (event) {
            // summary:
            //      Emits a project removed event.
            // tags:
            //      private

            this.emit("project-removed", event.id);
        }
    });
});
