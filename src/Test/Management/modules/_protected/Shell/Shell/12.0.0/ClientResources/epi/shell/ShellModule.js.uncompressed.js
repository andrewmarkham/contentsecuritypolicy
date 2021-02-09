define("epi/shell/ShellModule", [
    // Pull in the patches. Not used here, just evaluated, since this is the first module loaded when starting the application.
    "epi/patch/patches",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/topic",
    "dojo/when",
    "dojo/dnd/Manager",
    "epi",
    "epi/_Module",
    "epi/routes",
    "epi/Url",
    "epi/shell/applicationSettings",
    "epi/shell/store/Registry",
    "epi/shell/widget/Application",
    "epi/shell/Profile",
    "epi/shell/layout/PositioningUtility",
    "epi/shell/ContextService",
    "epi/shell/ContextHistory",
    "epi/shell/HashWrapper",
    "epi/shell/ViewContextHistory",
    "epi/shell/widget/ComponentController",
    "epi/shell/command/GlobalCommandRegistry",
    "epi/shell/dnd/Avatar",
    "epi/shell/MetadataManager",
    "epi/shell/widget/WidgetFactory",
    "epi/shell/MessageService",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/ViewSettings",
    "epi/shell/StickyViewSelector",
    "epi/shell/socket/hub",
    "epi/shell/customFocusIndicator",
    "dojo/has!epi-socket-logging?epi/shell/socket/log"
],

function (
    patches,
    declare,
    lang,
    aspect,
    topic,
    when,
    dndManager,
    epi,
    _Module,
    routes,
    Url,
    applicationSettings,
    StoreRegistry,
    ApplicationWidget,
    Profile,
    PositioningUtility,
    ContextService,
    ContextHistory,
    HashWrapper,
    ViewContextHistory,
    ComponentController,
    GlobalCommandRegistry,
    Avatar,
    MetadataManager,
    WidgetFactory,
    MessageService,
    TypeDescriptorManager,
    viewSettings,
    StickyViewSelector,
    hub
) {

    return declare([_Module], {
        // summary:
        //		Shell module implementation.
        //
        // tags:
        //      internal

        _settings: null,

        _initializeHandle: null,

        constructor: function (settings) {
            this._settings = settings;
        },

        initialize: function () {
            // summary:
            //		Initialize module
            //
            // description:
            //      Dependencies registered by this module are: `epi.shell.ViewManager`, `epi.shell.MetadataManager`, `epi.shell.widget.WidgetFactory`,
            //      `epi.shell.MessageService`, `epi.shell.layout.PositioningUtility`, `epi.shell.controller.Views`, `epi.shell.conversion.ObjectConverterRegistry` and `epi.shell.controller.Components`
            //

            return when(this.inherited(arguments), lang.hitch(this, function () {

                declare.safeMixin(applicationSettings, this._settings);

                StickyViewSelector.disable();

                // Initialize shared stores.
                var registry = new StoreRegistry();
                this._initializeStores(registry);

                // in case websockets are disabled, don't start the messagehub
                if (this._settings.enableWebSockets) {
                    hub.start();
                }

                // register first so other classes can use it
                this.registerDependency("epi.storeregistry", registry);
                this.registerDependency("epi.shell.Profile", new Profile());

                // lazy dependencies, only created when
                this.registerDependency("epi.shell.MetadataManager", MetadataManager);
                this.registerDependency("epi.shell.widget.WidgetFactory", WidgetFactory);
                this.registerDependency("epi.shell.MessageService", MessageService);
                this.registerDependency("epi.shell.layout.PositioningUtility", PositioningUtility);
                this.registerDependency("epi.globalcommandregistry", GlobalCommandRegistry);

                // register object created from start
                var hashWrapper = new HashWrapper();
                var viewContextHistory = new ViewContextHistory();
                this.registerDependency("epi.shell.controller.Components", new ComponentController({ moduleArea: "Shell" }));
                this.registerDependency("epi.shell.ContextService", new ContextService());
                this.registerDependency("epi.shell.ContextHistory", new ContextHistory());
                this.registerDependency("epi.shell.HashWrapper", hashWrapper);

                // DnD manager customizations
                var manager = dndManager.manager();
                manager.makeAvatar = function () {
                    return new Avatar(this);
                };
                manager.OFFSET_X = 6;
                manager.OFFSET_Y = 6;

                // Add topic to publish when all dnd is finished, ie after drop and cancel
                aspect.after(manager, "stopDrag", function (value) {
                    topic.publish("/dnd/stop", null);
                    return value;
                });

                this._initializeHandle = topic.subscribe("/epi/shell/application/initialized", lang.hitch(this, this._requestInitialContext, hashWrapper, viewContextHistory));

                return TypeDescriptorManager.initialize();
            }));
        },

        uninitialize: function () {
            if (this._requestFailedHandle) {
                this._requestFailedHandle.remove();
            }

            this.inherited(arguments);
        },

        _initializeStores: function (registry) {
            var metadataStoreUrl = routes.getRestPath({ moduleArea: "shell", storeName: "metadata" }),
                contextStoreUrl = routes.getRestPath({ moduleArea: "shell", storeName: "context" }),
                searchProvidersUrl = routes.getRestPath({ moduleArea: "shell", storeName: "searchproviders" }),
                searchResultsUrl = routes.getRestPath({ moduleArea: "shell", storeName: "searchresults" }),
                componentCategoryUrl = routes.getRestPath({ moduleArea: "shell", storeName: "componentcategory" }),
                componentDefinitionUrl = routes.getRestPath({ moduleArea: "shell", storeName: "componentdefinition" }),
                componentUrl = routes.getRestPath({ moduleArea: "shell", storeName: "component" }),
                componentSortOrderUrl = routes.getRestPath({ moduleArea: "shell", storeName: "componentsortorder" }),
                licenseinformationUrl = routes.getRestPath({ moduleArea: "shell", storeName: "licenseinformation" }),
                uiDescriptorUrl = routes.getRestPath({ moduleArea: "shell", storeName: "uidescriptor" });

            // Create metadata store
            registry.create("epi.shell.metadata", metadataStoreUrl, { idProperty: "modelType" });

            // Create context store
            registry.create("epi.shell.context", contextStoreUrl, { idProperty: "uri" });

            // Create search providers store
            registry.create("epi.shell.searchproviders", searchProvidersUrl);

            // Create search results store
            registry.create("epi.shell.searchresults", searchResultsUrl);

            // Create component category store
            registry.create("epi.shell.componentcategory", componentCategoryUrl, { idProperty: "name" });

            // Create component definition store
            registry.create("epi.shell.componentdefinition", componentDefinitionUrl);

            // Create component store
            registry.create("epi.shell.component", componentUrl);

            // Create component sort store
            registry.create("epi.shell.componentsortorder", componentSortOrderUrl);

            // Create license information store
            registry.create("epi.shell.licenseinformation", licenseinformationUrl);

            // Create license information store
            registry.create("epi.shell.uidescriptor", uiDescriptorUrl);
        },

        _requestInitialContext: function (hashWrapper, viewContextHistory) {

            if (this._initializeHandle) {
                this._initializeHandle.remove();
            }

            var _loadContextOrDefault = lang.hitch(this, function (context) {
                var newContext = context || viewSettings.settings.defaultContext;
                var target = null;
                if (newContext) {
                    // Send blank callerData object in order to save desired data on first load of site to context history
                    this._requestFailedHandle = topic.subscribe("/epi/shell/context/requestfailed", lang.hitch(this, function (context, params, callerData) {
                        if (callerData && callerData.sender === this) {
                            this._requestFailedHandle.remove();

                            // Reload the context with the defaultContext
                            _loadContextOrDefault(null);
                        }
                    }));

                    target = { uri: newContext };
                }

                topic.publish("/epi/shell/context/request", target, {sender: this});
            });

            // If url contain hash part (ex:  http://localhost/head/episerver/cms/home/#context=epi.cms.contentdata:///3_145)
            // use context from hash unless it's empty
            var hash = hashWrapper.getHash();
            if (hash && hash.context) {
                _loadContextOrDefault(hash.context);
                return;
            }

            // If the url hasn't been set, try to get the last requested url for the view
            when(viewContextHistory.getLastContextForView(), function (context) {
                var initialUri = null;
                if (context && context.versionAgnosticUri) {
                    initialUri = context.versionAgnosticUri;
                }
                _loadContextOrDefault(initialUri);
            });
        }
    });
});
