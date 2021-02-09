require({cache:{
'url:epi-cms/project/templates/ProjectNotification.html':"<span class=\"dijitReset dijitInline dijitIcon epi-objectIcon epi-iconProject\"></span>\r\n<span class=\"dijitReset dijitInline epi-project-notification__content\">{partOfProject}</span>"}});
define("epi-cms/project/ProjectNotification", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/promise/all",
    "dojo/Stateful",
    "dojox/html/entities",

    // epi
    "epi/dependency",
    "epi/shell/DestroyableByKey",
    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/command/CreateDraft",
    "epi-cms/core/ContentReference",

    // template
    "dojo/text!./templates/ProjectNotification.html",

    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.notifications"
], function (
// dojo
    declare,
    lang,
    all,
    Stateful,
    entities,
    // epi
    dependency,
    DestroyableByKey,
    ApplicationSettings,
    CreateDraft,
    ContentReference,

    //template
    template,

    // resources
    resources
) {

    return declare([Stateful, DestroyableByKey], {
        // summary:
        //      Show notification if the content is part of a project
        // tags:
        //      internal

        // order: [public] Number
        //      Sort order of notification
        order: 10,

        // _projectService: [private] ProjectService
        //      A service for interacting with projects
        _projectService: null,

        // _createDraftCommand: [private] Command
        //      The create draft command that will be displayed when the current
        //      content is not part of the selected project.
        _createDraftCommand: null,

        constructor: function (params, projectService) {
            // summary:
            //      Constructs the ProjectNotification
            //
            // params: Object
            //      The keyword arguments
            //
            // projectService: ProjectService?
            //      ProjectService dependency, it is isn't provided it will load it from the epi/dependency

            this._projectService = projectService || dependency.resolve("epi.cms.ProjectService");

            this._createDraftCommand = new CreateDraft({ ignoreContentStatus: true });

            this.own(
                this._projectService.on("project-item-updated", lang.hitch(this, this._onItemUpdated)),
                this._projectService.on("project-item-removed", lang.hitch(this, this._onItemRemoved)),
                this._projectService.on("project-updated", function () {
                    this._onModelChanged(this.value);
                }.bind(this))
            );
        },

        _valueSetter: function (value) {
            // summary:
            //      Updates the notification when the property changes.
            // tags:
            //      private

            var contentModel = value.contentViewModel;
            this.value = contentModel;

            if (!contentModel || !contentModel.contentLink) {
                this.set("model", null);
                this._currentProjectItemId = 0;
                return;
            }

            this._createDraftCommand.set("model", contentModel);

            // Watch the model for changes to the content link since will occur when a new draft is created.
            var ownKey = "contentLinkWatch";
            this.destroyByKey(ownKey);
            this.ownByKey(ownKey, contentModel.watch("contentLink", lang.hitch(this, "_onModelChanged", contentModel)));

            // Invoke the model change callback since we have just set the model.
            this._onModelChanged(contentModel);
        },

        _onItemUpdated: function (item) {
            this._onItemsAddedOrRemoved(item.id);
        },

        _onItemRemoved: function (id) {
            this._onItemsAddedOrRemoved(id);
        },

        _onItemsAddedOrRemoved: function (projectItemId) {
            if (!this.model) {
                return;
            }

            if (this._currentProjectItemId === projectItemId) {
                this._updateNotification(this.model.contentLink);
            }
        },

        _onModelChanged: function (contentModel) {
            // summary:
            //      Updates the notification when the model changes.
            // tags:
            //      private

            // If the model is suspended do not load or update the notification
            if (contentModel.get("isSuspended")) {
                return;
            }

            this._projectService.getProjectItemForContent(contentModel.contentLink)
                .then(function (projectItem) {
                    var languageContext = contentModel.languageContext,
                        isTranslationNeeded =
                            languageContext && languageContext.isTranslationNeeded &&
                            ApplicationSettings.currentContentLanguage === languageContext.preferredLanguage;

                    this.set("model", contentModel);
                    this._currentProjectItemId =  projectItem && projectItem.id || 0;

                    this._updateNotification(contentModel.contentLink, contentModel.contentData.isPartOfAnotherProject, isTranslationNeeded);
                }.bind(this))
                .otherwise(function () {
                    this._currentProjectItemId = 0;
                }.bind(this));
        },

        _updateNotification: function (contentLink, isPartOfAnotherProject, isTranslationNeeded) {
            var self = this;

            all([this._projectService.getProjectsForContent(contentLink), this._projectService.getCurrentProject()]).then(function (result) {
                var projects = result[0],
                    currentProject = result[1];

                if (projects.length === 0) {
                    self.set("notification", null);
                    return;
                }

                var projectNames = projects.map(function (project) {
                    return entities.encode(project.name);
                }).join(", ");

                //Create the part of project text
                var partOfProjectText = "";
                if (isPartOfAnotherProject) {
                    partOfProjectText = resources.partofanotherproject + ": " + projectNames;
                } else if (currentProject) {
                    partOfProjectText = resources.partofcurrentproject;
                } else {
                    partOfProjectText = resources.partofproject + ": " + projectNames;
                }

                // Replace the text in the template
                var content = lang.replace(template, {
                    partOfProject: partOfProjectText
                });

                var commands =
                    isPartOfAnotherProject && self._projectService.isProjectModeEnabled && !isTranslationNeeded ?
                        [self._createDraftCommand] : [];

                self.set("notification", {
                    content: content,
                    commands: commands
                });
            });
        }
    });
});
