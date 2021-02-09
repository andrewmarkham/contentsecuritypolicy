define("epi-cms/CMSModule", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    // epi
    "epi",
    "epi/_Module",
    "epi/dependency",
    "epi/shell/request/mutators",
    "epi/routes",

    "epi/shell/conversion/ObjectConverterRegistry",
    "epi/shell/store/JsonRest",
    "epi/shell/store/Throttle",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/ViewSettings",
    "epi/shell/StickyViewSelector",

    "epi-cms/ApplicationSettings",
    "epi-cms/BackContextHistory",
    "epi-cms/ContextSynchronizer",
    "epi-cms/ContentRepositoryDescriptorService",

    "epi-cms/conversion/ContentFragmentConverter",
    "epi-cms/conversion/ContentLightUriConverter",
    "epi-cms/conversion/ContentReferenceConverter",
    "epi-cms/conversion/PropertyDateConverter",

    "epi-cms/core/ContentReference",

    "epi-cms/store/configurableQueryEngine",
    "epi-cms/store/PageVersionQueryEngine",
    "epi-cms/project/ProjectActivitiesQueryEngine",

    "epi-cms/component/command/GlobalToolbarCommandProvider",
    "epi-cms/compare/command/CompareCommandProvider",
    "epi-cms/notification/command/NotificationCommandProvider",
    "epi-cms/command/ViewSettingsCommandProvider",
    "epi-cms/content-activity/command/ContentActivityCommandProvider",
    "epi-cms/contentediting/ContentHierarchyService",
    "epi-cms/contentediting/EditorFactory",
    "epi-cms/contentediting/InUseNotificationManager",
    "epi-cms/contentediting/ViewSettingsManager",

    "epi-cms/content-approval/ApprovalService",

    "epi-cms/project/ProjectService",
    "epi-cms/activity/ActivityService",
    "epi-cms/notification/NotificationService",
    "epi-cms/project/request/projectMode",
    "epi-cms/request/contentLanguage",
    "epi-cms/project/ProjectModeRequestInterceptor",
    "epi-cms/project/ProjectItemQueryEngine",

    "epi-cms/contentediting/command/Editing",

    "epi-cms/contentediting/commandproviders/ContentDetails",
    "epi-cms/contentediting/commandproviders/PublishMenu",
    "epi-cms/contentediting/commandproviders/PublishMenuGlobal",

    "epi-cms/contentediting/viewsettings/ChannelViewSetting",
    "epi-cms/contentediting/viewsettings/ResolutionViewSetting",
    "epi-cms/contentediting/viewsettings/ViewLanguageViewSetting",
    "epi-cms/contentediting/viewsettings/VisitorGroupViewSetting",
    "epi-cms/project/ProjectViewSetting",
    "epi-cms/widget/ContentTypeService",

    "epi-cms/Profile"
],

function (
// dojo
    array,
    declare,
    lang,
    when,
    // epi
    epi,
    _Module,
    dependency,
    mutators,
    routes,

    ObjectConverterRegistry,
    JsonRest,
    Throttle,
    TypeDescriptorManager,
    ViewSettings,
    StickyViewSelector,

    ApplicationSettings,
    BackContextHistory,
    ContextSynchronizer,
    ContentRepositoryDescriptorService,

    ContentFragmentConverter,
    ContentLightConverter,
    ContentReferenceConverter,
    PropertyDateConverter,

    ContentReference,

    configurableQueryEngine,
    PageVersionQueryEngine,
    ProjectActivitiesQueryEngine,

    GlobalToolbarCommandProvider,
    CompareCommandProvider,
    NotificationCommandProvider,
    ViewSettingsCommandProvider,
    ContentActivityCommandProvider,

    ContentHierarchyService,
    EditorFactory,
    InUseNotificationManager,
    ViewSettingsManager,

    ApprovalService,

    ProjectService,
    ActivityService,
    NotificationService,
    projectMode,
    contentLanguage,
    ProjectModeRequestInterceptor,
    projectItemQueryEngine,

    Editing,

    ContentDetailsCommandProvider,
    PublishMenuCommandProvider,
    PublishMenuGlobalCommandProvider,

    ChannelViewSetting,
    ResolutionViewSetting,
    ViewLanguageViewSetting,
    VisitorGroupViewSetting,
    ProjectViewSetting,
    ContentTypeService,

    Profile
) {

    return declare([_Module], {
        // tags:
        //      internal

        _settings: null,

        // _hashWrapper: Object
        //    HashWrapper instance, which will be used to manipulate hash.
        _hashWrapper: null,

        _firstTimeHashUpdated: false,

        constructor: function (settings) {
            this._settings = settings;
        },

        initialize: function () {
            // summary:
            //		Initialize module
            //
            // description:

            this.inherited(arguments);

            mutators.add(projectMode);
            mutators.add(contentLanguage);

            declare.safeMixin(ApplicationSettings, this._settings);

            var profile = dependency.resolve("epi.shell.Profile");

            return when(profile.getContentLanguage()).then(lang.hitch(this, function (language) {

                //Set the current edit language on the profile object (this property has the same life-cycle as the application)
                //This property is used by the xhrwrapper
                ApplicationSettings.currentContentLanguage = profile.contentLanguage = language;
                if (ApplicationSettings.enableStickyView) {
                    StickyViewSelector.enable();
                } else {
                    StickyViewSelector.disable();
                }

                this.registerDependency("epi.cms.BackContextHistory", new BackContextHistory());
                this.registerDependency("epi.cms.ContextSynchronizer", new ContextSynchronizer(), undefined, function (value) {
                    value.destroy();
                });
                this.registerDependency("epi.cms.contentEditing.command.Editing", Editing);
                this._hashWrapper = dependency.resolve("epi.shell.HashWrapper");

                var contextService = this.resolveDependency("epi.shell.ContextService");

                this.registerDependency("epi.cms.contentRepositoryDescriptors",
                    new ContentRepositoryDescriptorService(this._settings.contentRepositoryDescriptors));

                // register route for redirecting page.
                // Consider: the second param (callback) might be replace to an object, which has "redirect" function, so we can extend it.
                contextService.registerRoute("epi.cms.contentdata", lang.hitch(this, this._redirectContentDataContext));
                contextService.registerRoute("epi.cms.project", lang.hitch(this, this._redirectContext));
                contextService.registerRoute("epi.cms.approval", lang.hitch(this, this._redirectContext));

                //initialize editor factory
                this._initializeEditorFactory();

                // Initialize stores
                this._initializeStores();

                // Setup the Content Approval service
                this.registerDependency("epi.cms.ApprovalService", new ApprovalService());

                // Setup the Project service after the stores has been initialized
                this.registerDependency("epi.cms.ProjectService", new ProjectService());
                this.registerDependency("epi.cms.ActivityService", new ActivityService());

                this.registerDependency("epi.cms.NotificationService", new NotificationService());

                this.registerDependency("epi.cms.ContentHierarchyService",  new ContentHierarchyService());

                this._projectModeRequestInterceptor = new ProjectModeRequestInterceptor();

                // Setup the ContentTypeService
                this.registerDependency("epi.cms.ContentTypeService", new ContentTypeService());

                this._setupConverters();
                this._setupViewSettings(contextService);

                var contentActivityCommandProvider = new ContentActivityCommandProvider();
                this.registerDependency("contentActivityCommandProvider", contentActivityCommandProvider);

                var commandregistry = dependency.resolve("epi.globalcommandregistry");

                // PublishMenuGlobal is dependent on ProjectService
                commandregistry.registerProvider("epi.cms.publishmenu", new PublishMenuGlobalCommandProvider());
                //We need to wait for the viewsettings to initialized before creating the global toolbar command provider
                commandregistry.registerProvider("epi.cms.globalToolbar", new GlobalToolbarCommandProvider());
                commandregistry.registerProvider("epi.cms.globalToolbar", new CompareCommandProvider());
                commandregistry.registerProvider("epi.cms.globalToolbar", new ViewSettingsCommandProvider());
                commandregistry.registerProvider("epi.cms.globalToolbar", new NotificationCommandProvider());
                commandregistry.registerProvider("epi.cms.globalToolbar", contentActivityCommandProvider);

                this._setupInUseNotificationManager(commandregistry);
            }));
        },

        _redirectContentDataContext: function (context, callerData, uri) {
            // summary:
            //      Process redirect action for content data context.
            //
            // context: Object
            //      Context from context service
            //
            // callerData: Object
            //      Sources that fire the event
            //
            // uri: Object
            //      Content Uri
            //
            // tags:
            //      Private

            if (ViewSettings.viewName === "/episerver/dashboard") { // we are in Dashboard mode
                // in Dashboard mode, we need to redirect to the cms editorial view.
                var homeUrl = routes.getActionPath({ moduleArea: "CMS", controller: "Home", action: "" });
                // remove last '/', which is unnecessary.
                homeUrl = homeUrl.substring(0, homeUrl.length - 1);
                var editPage = homeUrl + "#" + this._hashWrapper.extractHash(context, callerData);
                this._redirect(editPage);
            } else {
                if (context.hasSiteChanged) {
                    //we need to reload ui when a content from a different site has been requested.
                    var urlToPageOnOtherSite = context.fullHomeUrl + "#" + this._hashWrapper.extractHash(context, callerData);
                    this._redirect(urlToPageOnOtherSite);
                } else {
                    // currently in Home mode, need to update Hash only, instead of redirecting
                    // Not update hash in case of internal trigger and hash has been updated
                    if (callerData && callerData.trigger === "internal" && this._firstTimeHashUpdated) {
                        return;
                    }
                    this._firstTimeHashUpdated = true;
                    this._hashWrapper.onContextChange(context, callerData);
                }
            }
        },

        _redirectContext: function (/*Object*/context, /*Object*/callerData) {
            // summary:
            //      Redirect context
            // tags:
            //      private
            this._hashWrapper.onContextChange(context, callerData);
        },

        _redirect: function (url) {
            // summary:
            //      Redirect to another page (url).
            //
            // url: String
            //      Page url to navigate to.
            //
            // tags:
            //      Private

            window.location = url;
        },

        _setupConverters: function () {

            var contentLightConverter = new ContentLightConverter(),
                contentReferenceConverter = new ContentReferenceConverter(),
                contentFragmentConverter = new ContentFragmentConverter(),
                propertyDateConverter = new PropertyDateConverter(),
                repositoryDescriptors = this.resolveDependency("epi.cms.contentRepositoryDescriptors"),
                key;

            // Register converters for all linkable types known
            for (key in repositoryDescriptors) {
                var repo = repositoryDescriptors[key];
                if (repo.linkableTypes) {
                    repo.linkableTypes.forEach(function (type) {
                        ObjectConverterRegistry.registerConverter(type, type + ".link", contentLightConverter);
                        // Convert from content fragment to a link
                        ObjectConverterRegistry.registerConverter(type + ".fragment", type + ".link", contentLightConverter);
                        // Non specific type to link conversion
                        ObjectConverterRegistry.registerConverter(type, "link", contentLightConverter);
                    });
                }
            }

            for (key in TypeDescriptorManager._uiDescriptors) {
                //Currently we are registering converters for all types. Since uiDescriptors does not have to be content this might be a potential problem
                //but we ignore this until we need to fix this.
                var descriptor = TypeDescriptorManager._uiDescriptors[key].descriptor;
                ObjectConverterRegistry.registerConverter(descriptor.typeIdentifier, descriptor.typeIdentifier + ".reference", contentReferenceConverter);
                ObjectConverterRegistry.registerConverter(descriptor.typeIdentifier + ".fragment", descriptor.typeIdentifier + ".reference", contentReferenceConverter);
                ObjectConverterRegistry.registerConverter(descriptor.typeIdentifier, descriptor.typeIdentifier + ".light", contentLightConverter);
                ObjectConverterRegistry.registerConverter(descriptor.typeIdentifier, descriptor.typeIdentifier + ".fragment", contentFragmentConverter);
            }

            contentLightConverter.registerDefaultConverters(ObjectConverterRegistry);
            propertyDateConverter.registerDefaultConverters(ObjectConverterRegistry);
        },

        _setupViewSettings: function (contextService) {

            var viewSettingsManager = new ViewSettingsManager({ viewSettings: [
                new ResolutionViewSetting(),
                new VisitorGroupViewSetting(),
                new ChannelViewSetting(),
                new ProjectViewSetting(contextService),
                new ViewLanguageViewSetting(contextService)
            ]
            });

            this.registerDependency("epi.viewsettingsmanager", viewSettingsManager);
        },

        _initializeStores: function () {

            var registry = this.resolveDependency("epi.storeregistry"),
                authority,
                light,
                version;

            // Create complete page data store. This is the authority store.
            authority = registry.create("epi.cms.contentdata", this._getRestPath("contentdata"), { idProperty: "contentLink" });

            // Create content structure store
            light = registry.create("epi.cms.content.light", this._getRestPath("contentstructure"), { idProperty: "contentLink", queryEngine: configurableQueryEngine });

            // Create page version store
            version = registry.create("epi.cms.contentversion", this._getRestPath("contentversion"), { idProperty: "contentLink", queryEngine: PageVersionQueryEngine });

            // Create display options store
            registry.create("epi.cms.displayoptions", this._getRestPath("displayoptions"));

            // Create category store
            registry.create("epi.cms.category", this._getRestPath("categories"));

            // Create page editing session store
            registry.create("epi.cms.inusenotification", this._getRestPath("inusenotification"))
                .addDependentStore(authority);

            // Create visitor group store
            registry.create("epi.cms.visitorgroup", this._getRestPath("visitorgroup"));

            // Create language store
            registry.create("epi.cms.language", this._getRestPath("language"), { idProperty: "languageId" });

            // Create a site structure store
            registry.create("epi.cms.sitestructure", this._getRestPath("sitestructure"), { idProperty: "url" });

            // Create a display channel store.
            registry.create("epi.cms.displaychannels", this._getRestPath("channel"));

            // Create a content provider store.
            registry.create("epi.cms.wastebasket", this._getRestPath("wastebasket"));

            // Create the project stores
            registry.create("epi.cms.project", this._getRestPath("project"), { queryEngine: configurableQueryEngine, realtimeInfo: { subscriptionKey: "/episerver/cms/project" }});
            registry.create("epi.cms.project.item", this._getRestPath("project-item"), { queryEngine: projectItemQueryEngine, realtimeInfo: { subscriptionKey: "/episerver/cms/project-item" }});

            // Create the activities store.
            registry.create("epi.cms.activities", this._getRestPath("activities"), { queryEngine: ProjectActivitiesQueryEngine, realtimeInfo: { subscriptionKey: "/episerver/cms/activity" } });

            // Create the activities store.
            registry.create("epi.cms.activities.comments", this._getRestPath("activities-comments"), { realtimeInfo: { subscriptionKey: "/episerver/cms/activity-comment" } });

            // Create content type store, and fill it
            registry.create("epi.cms.contenttype", this._getRestPath("contenttype")).query();

            // Create the notification store
            registry.create("epi.cms.notification", this._getRestPath("notification"), { queryEngine: configurableQueryEngine, realtimeInfo: { subscriptionKey: "/episerver/cms/notification" }});

            // Create the notification users store.
            registry.create("epi.cms.notification.users", this._getRestPath("notification-users"), { idProperty: "userName" });

            // Create personalized content store.
            registry.create("epi.cms.personalized.content", this._getRestPath("personalized-content"), { idProperty: "id" });

            // Create the approval definition store.
            registry.add("epi.cms.approval.definition",
                new Throttle(
                    new JsonRest({
                        idProperty: "contentLink",
                        target: this._getRestPath("approval-definition"),
                        preventCache: true
                    })
                )
            );

            // Create the approval store.
            registry.add("epi.cms.approval",
                new Throttle(
                    new JsonRest({
                        target: this._getRestPath("approval"),
                        preventCache: true
                    })
                )
            );

            // Create language settings store
            registry.add("epi.cms.languagesettings", new Throttle(
                new JsonRest({
                    idProperty: "contentLink",
                    target: this._getRestPath("languagesettings"),
                    preventCache: true
                })
            ));

            // Create access rights store
            registry.add("epi.cms.accessrights", new Throttle(
                new JsonRest({
                    idProperty: "contentLink",
                    target: this._getRestPath("accessrights"),
                    preventCache: true
                })
            ));

            // Create content references store
            registry.add("epi.cms.contentreferences",
                new Throttle(
                    new JsonRest({
                        target: this._getRestPath("contentreferences"),
                        idProperty: "contentLink",
                        preventCache: true
                    })
                )
            );
            registry.add("epi.cms.referenced-content",
                new Throttle(
                    new JsonRest({
                        target: this._getRestPath("referenced-content"),
                        idProperty: "contentLink",
                        preventCache: true
                    })
                )
            );

            // Create non-cached content structure store
            registry.add("epi.cms.content.search",
                new Throttle(
                    new JsonRest({
                        target: this._getRestPath("contentstructure"),
                        idProperty: "contentLink"
                    })
                )
            );

            authority.addDependentStore(light, {
                refreshOnPatch: true,
                refresh: function (patchObject) {
                    // Running the refresh in timeout to bypass the notification chain between
                    // Observable queries and dependant stores. Updating light store which is dependant
                    // on the master store is a postprocessing operation and can be deferred.
                    setTimeout(function () {
                        // The lightweight page store should only get updates for the published page
                        var id = authority.getIdentity(patchObject);
                        var versionAgnosticId = new ContentReference(id).createVersionUnspecificReference().toString();
                        light.refresh(versionAgnosticId);
                    });
                }
            });

            authority.addDependentStore(version, {
                transformDelegate: function (patchObject) {

                    //TODO: This is temporary until we have implemented dependant store capabilities checks
                    if (patchObject.capabilities && !patchObject.capabilities.versionable) {
                        return null;
                    }
                    // remap properties from the pagedata store to match the page version store
                    // source name : target name
                    if (!patchObject.properties) {
                        return null;
                    }

                    var propMap = {
                        pageChangedBy: "savedBy",
                        pageSaved: "savedDate",
                        pageLanguageBranch: "language",
                        pageName: "name",
                        name: "name",
                        icontent_name: "name"
                    };
                    var transformed = lang.mixin({}, patchObject);
                    for (var p in propMap) {
                        if (p in transformed.properties) {
                            transformed[propMap[p]] = transformed.properties[p];
                        }
                    }
                    return transformed;
                }
            });
        },

        _getRestPath: function (name) {
            return routes.getRestPath({ moduleArea: "cms", storeName: name });
        },

        _initializeEditorFactory: function () {
            // summary:
            //		Initialize editor bridge factory
            //

            this.registerDependency("epi.cms.contentediting.EditorFactory", function () {

                var editorFactory = new EditorFactory();

                // Inline
                editorFactory.registerEditorWrapper("inline", "epi-cms/contentediting/InlineEditorWrapper", function (wrapper, initParams) {
                });

                // Rich text inline editor wrapper
                editorFactory.registerEditorWrapper("richtextinline", "epi-cms/contentediting/RichTextInlineEditorWrapper", function (wrapper, initParams) {

                });

                // Flyout
                editorFactory.registerEditorWrapper("flyout", "epi-cms/contentediting/FlyoutEditorWrapper", function (wrapper, initParams) {
                });

                // Floating editor wrapper
                editorFactory.registerEditorWrapper("floating", "epi-cms/contentediting/FloatingEditorWrapper", function (wrapper, initParams) {
                });

                // Inline content editable
                editorFactory.registerEditorWrapper("contenteditable", "epi-cms/contentediting/ContentEditableWrapper", function (wrapper, initParams) {
                });

                // Legacy
                editorFactory.registerEditorWrapper("legacyProperty", "epi-cms/contentediting/DialogEditorWrapper", function (wrapper, initParams) {
                    // summary:
                    //
                    // wrapper:
                    //
                    // initParams:
                    //     { propertyName, propertyType, .... }

                    wrapper.closeOnChange = true;
                    wrapper.showButtons = false;
                });

                return editorFactory;
            });
        },

        _setupInUseNotificationManager: function (commandregistry) {
            var notificationManager = new InUseNotificationManager();
            this.registerDependency("epi.cms.contentediting.inUseNotificationManager", notificationManager);
            commandregistry.registerProvider("epi.cms.publishmenu", new PublishMenuCommandProvider());
            commandregistry.registerProvider("epi.cms.contentdetailsmenu", new ContentDetailsCommandProvider());
        }
    });
});
