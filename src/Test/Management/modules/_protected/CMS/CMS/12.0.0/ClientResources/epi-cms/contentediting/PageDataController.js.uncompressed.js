require({cache:{
'url:epi-cms/contentediting/templates/PageDataController.html':"<div style=\"width: 100%; height: 100%;\">\r\n    <div data-dojo-attach-point=\"mainLayoutContainer\" data-dojo-type=\"epi/shell/layout/PreserveRatioBorderContainer\" data-dojo-props=\"gutters: false, livesplitters: false\" style=\"width: 100%; height: 100%\">\r\n        <div data-dojo-attach-point=\"toolbar\" data-dojo-type=\"epi-cms/contentediting/EditToolbar\" data-dojo-props=\"region:'top'\"></div>\r\n        <div data-dojo-attach-point=\"notificationBar\" data-dojo-type=\"epi-cms/contentediting/NotificationBar\" data-dojo-props=\"region:'top', layoutPriority: 90\"></div>\r\n        <div data-dojo-attach-point=\"activityFeed\" data-dojo-type=\"epi-cms/activity/ActivityFeed\" data-dojo-props=\"region: 'right', model: this.activityModel, layoutPriority: 95, splitter: true, minSize: 200\" style=\"width: 25%; min-width: 200px\" class=\"dijitHidden\"></div>\r\n        <div data-dojo-attach-point=\"editLayoutContainer\" data-dojo-type=\"epi/shell/layout/CardContainer\" data-dojo-props=\"region: 'center', layoutPriority: 100\">\r\n            <div data-dojo-attach-point=\"iframeWithOverlay\" data-dojo-type=\"epi/shell/widget/IframeWithOverlay\" data-dojo-props=\"fitContainer: true, iframeName:'${iframeName}'\">\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
define("epi-cms/contentediting/PageDataController", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",
    "dojo/dom-style",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/topic",
    "dojo/when",
    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/_WidgetsInTemplateMixin",

    "epi/debounce",

    // epi
    "epi/dependency",
    "epi/Url",

    "epi/shell/StickyViewSelector",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/postMessage",

    "epi-cms/_ContentContextMixin",

    "epi-cms/contentediting/EditNotifications",
    "epi-cms/contentediting/ContentViewModel",
    "epi-cms/contentediting/viewmodel/ContentActivityFeedViewModel",

    "epi-cms/contentediting/command/Editing",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting",
    "dojo/text!./templates/PageDataController.html",
    // Used in template
    "dijit/layout/BorderContainer",
    "epi/shell/layout/CardContainer",
    "epi/shell/layout/PreserveRatioBorderContainer",
    "epi/shell/widget/IframeWithOverlay",
    "epi-cms/contentediting/EditToolbar",
    "epi-cms/contentediting/NotificationBar",
    "epi-cms/activity/ActivityFeed"
],

function (
// dojo
    array,
    declare,
    lang,

    domClass,
    domStyle,

    aspect,
    Deferred,
    topic,
    when,
    // dijit
    _TemplatedMixin,
    _Widget,
    _WidgetsInTemplateMixin,

    debounce,

    // epi
    dependency,
    Url,

    StickyViewSelector,
    TypeDescriptorManager,
    postMessage,

    _ContentContextMixin,

    EditNotifications,
    ContentViewModel,
    ContentActivityFeedViewModel,

    EditingCommands,
    // resources
    res,
    template
) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _ContentContextMixin], {
        // summary:
        //      This component will list all versions of a cms page.
        // tags:
        //      internal

        templateString: template,

        // contextTypeName: String
        //      Type name for the context we can handle
        contextTypeName: "epi.cms.contentdata",

        // iframeName: [readonly] String
        //      The name to assign to the iframe. Used for topics generated within the iframe.
        iframeName: "sitePreview",

        pendingNotificationTimeOutId: null, // holds the timeout handler when pending the notification

        isActive: true,

        // defaultEditCssRules: Array
        //      The CSS rules to inject when we're editing
        defaultEditCssRules: [
            { selector: ".epi-injected-minSize", css: "min-height: 30px;" },
            { selector: ".epi-injected-minSize-inline", css: "min-height: 30px; min-width: 100px; display: inline-block !important;" },
            { selector: "[contenteditable=true]:focus", css: "outline: 3px #1456F1 solid;" } // #1456F1 - @primary500
        ],

        _currentViewComponent: null,
        _viewModels: null,
        _notificationHandlerId: null,
        _messageService: null,

        _postMessage: null,
        _editingCommands: null,
        _currentViewModel: null,
        _pageDataStore: null,

        _availableViews: null,

        _previewQueryParameters: null,
        _viewSettingsManager: null,
        _inUseNotificationManager: null,

        _ensurePreviewReadyPromise: null,

        // _stickyViewSelector: epi/shell/StickyViewSelector
        //    Responsible for storing view selected by editor
        _stickyViewSelector: null,

        // componentTypeName: [public] String
        //      Component type name, used to differentiate between instances (such as edit and compare).
        componentTypeName: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            var registry = dependency.resolve("epi.storeregistry");
            this._pageDataStore = this._pageDataStore || registry.get("epi.cms.contentdata");

            this._stickyViewSelector = new StickyViewSelector();

            //resolve _viewSettingsManager
            this._viewSettingsManager = dependency.resolve("epi.viewsettingsmanager");

            // get dependency properties
            this._messageService = this._messageService || dependency.resolve("epi.shell.MessageService");
            this._profile = this._profile || dependency.resolve("epi.shell.Profile");

            this._postMessage = this._postMessage || postMessage;
            this._editingCommands = EditingCommands;

            // create new data for views to persist
            if (!this._viewModels) {
                this._viewModels = [];
            }

            this._inUseNotificationManager = this.inUseNotificationManager || dependency.resolve("epi.cms.contentediting.inUseNotificationManager");

            this._editNotifications = this._editNotifications || new EditNotifications();
            this.own(
                this._editNotifications,
                this._editNotifications.on("changed", function (e) {
                    this._defaultNotificationWatchHandler("", e.oldValue, e.newValue, e.notification);
                }.bind(this)));

            this.activityModel = this.activityModel || new ContentActivityFeedViewModel({ componentTypeName: this.componentTypeName});
            this.own(this.activityModel.watch("isActivitiesVisible", this._toggleActivities.bind(this)));
        },

        postCreate: function () {

            var cs;

            this.inherited(arguments);

            this.subscribe("/epi/cms/action/switcheditmode", this._switchEditMode.bind(this));

            // connect to context service
            cs = dependency.resolve("epi.shell.ContextService");
            this._interceptorHandle = cs.registerRequestInterceptor(this._interceptRequestContext.bind(this));

            this.own(
                this.notificationBar.on("notificationsChanged", function () {
                    this.mainLayoutContainer.layout();
                }.bind(this)),
                topic.subscribe("/epi/cms/action/undo", this._undoAction.bind(this)),
                topic.subscribe("/epi/cms/action/redo", this._redoAction.bind(this)),
                topic.subscribe("/epi/cms/action/save", this._saveAction.bind(this))
            );
        },

        startup: function () {

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            this.iFrame = this.iframeWithOverlay.iframe;

            this.connect(this.iFrame, "onLoad", "_iFrameLoaded");
            this.connect(this.iFrame, "onUnload", "_iFrameUnLoaded");

            domClass.add(this.toolbar.domNode, "epi-localToolbar epi-viewHeaderContainer");

            this._injectCssRules();

            when(this.getCurrentContext(), function (context) {
                this.contextChanged(context);
            }.bind(this));

            this._toggleActivities();

            var splitter = this.mainLayoutContainer.getSplitter("right");
            aspect.after(splitter, "_stopDrag", function () {
                var settings = {
                    size: domStyle.get(this.activityFeed.domNode, "width")
                };
                this.activityModel._persistActivityFeedSettings(settings);
            }.bind(this));
        },

        buildRendering: function () {
            this.inherited(arguments);
            this._loadSettings();
        },

        destroy: function () {
            this._interceptorHandle && this._interceptorHandle.remove();
            this._destroyCurrentViewComponent();
            this._viewModels.forEach(function (vm) {
                vm.destroy();
            });
            this._viewModels = null;

            this.inherited(arguments);
        },

        _defaultNotificationWatchHandler: function (/*String*/name, /*Object*/oldValue, /*Object*/newValue, /*Object*/notification) {
            // summary:
            //      Add/remove notification to/from notification bar
            // tags:
            //      private

            if (oldValue) {
                this.notificationBar.remove(oldValue);
            }

            if (newValue && newValue.content) {
                var availableNotificationIndex = notification ? this._editNotifications.getAvailableNotificationIndex(notification) : 0;
                this.notificationBar.add(newValue, availableNotificationIndex);
            }
        },

        _switchEditMode: function (switchToPrevious, viewParams, saveView) {
            var newView,
                currentView = this._currentViewModel.viewName,
                reloadIFrame = false,
                previewView = "view",
                onPageEditView = "onpageedit",
                allPropertiesView = "formedit";

            // If this is not the active editing component then don't react on
            // edit mode switch events.
            if (!this.isActive) {
                return;
            }

            if (currentView === previewView) {
                topic.publish("/epi/cms/action/disablepreview");
            }
            if (currentView === allPropertiesView) {
                newView = onPageEditView;

                // whenever display onPageEdit view, let the iframe reload content in order to render overlay
                reloadIFrame = true;
            } else {
                newView = allPropertiesView;
            }

            if (saveView) {
                // saving is deferred but it's not blocking operation
                this._stickyViewSelector.save(this._currentViewModel.contentData.hasTemplate, this._currentViewModel.contentData.typeIdentifier, newView);
            }
            return this._ensurePreviewReady(this.setView(newView, viewParams), reloadIFrame, true, newView);
        },

        _iFrameLoaded: function (url, triggeredExternally) {
            // summary:
            //  Event handler when a new document has been loaded into the inner iframe.
            //
            // url: string
            //  url of the frame source
            //
            // triggeredExternally: Boolean
            //  True when the load was initiated by an external context change, as opposed to a click on a link inside the iframe.

            if (!!url && !triggeredExternally) {

                // Iframe is reloaded when user clicks on a link in preview iframe.
                // set dirty flag

                // request a context change
                this._requestContextChangeByUrl(url, true, true);
            }

            var initialData = this._getInitialData(url);
            var window = this.iFrame.getWindow();
            this._postMessage.publish("beta/epiReady", initialData, window);
            this._postMessage.publish("epiReady", initialData, window);
        },

        _getInitialData: function (url) {
            url = new Url(url);
            if (!url.query || url.query.epieditmode !== "True") {
                // if we're not in edit mode we always return editable false
                return { isEditable: false };
            }

            return {
                isEditable: !!this._currentViewModel && this._currentViewModel.canChangeContent()
            };
        },

        _iFrameUnLoaded: function (url) {
            //Disable the overlay before loading the new view
            this.iframeWithOverlay.overlay.set("enabled", false);
        },

        _destroyCurrentViewComponent: function () {

            if (this._currentViewComponentReloadRequireHandle) {
                this._currentViewComponentReloadRequireHandle.remove();
                this._currentViewComponentReloadRequireHandle = null;
            }

            if (this._currentViewComponent) {
                this._currentViewComponent.destroyRecursive();
                this._currentViewComponent = null;
            }
        },

        _getViewModelIndex: function (id) {

            var index = -1;

            array.some(this._viewModels, function (item, idx) {
                if (item.contentLink === id) {
                    index = idx;
                    return true;
                }
            });

            return index;
        },

        _getViewModel: function (id) {

            var index = this._getViewModelIndex(id);

            if (index >= 0) {
                return this._viewModels[index];
            } else {
                return null;
            }
        },

        _removeViewModel: function (id) {

            var index = this._getViewModelIndex(id);

            if (index >= 0) {

                // remove from list
                var viewModel = this._viewModels.splice(index, 1)[0];

                viewModel.clear();
            }
        },

        _createViewModel: function (contentData, ctx) {

            var viewModel = new ContentViewModel({ contentLink: contentData.contentLink, contextTypeName: this.contextTypeName });
            viewModel.set("contentData", contentData);
            viewModel.set("languageContext", ctx.languageContext);

            this._viewModels.push(viewModel);

            return viewModel;
        },

        contentContextUpdated: function (ctx, callerData) {
            // summary:
            //    Called when the currently loaded content updated.
            // tags:
            //    protected

            var contentLink = ctx.id;
            this._pageDataStore.refresh(contentLink).then(function (contentData) {
                if (this._currentViewModel) {
                    this._updateContentViewModel(contentData, ctx.languageContext);
                    this._refreshModel(contentData, ctx);

                    // In some cases (dynamic properties change) we need to reload the view because the data is changed on server.
                    // Since there is no way to render newly changed server-side data so we reload the view on every contentContextUpdated.
                    this._onViewRequireReload();
                }
            }.bind(this));
        },

        updateView: function (callerData, ctx, additionalParams) {
            this._setActivityCommandModel();
            when(this._ensurePreviewReadyPromise, function () {
                if (callerData && callerData.skipUpdateView && callerData.viewName === this._currentViewModel.viewName) {
                    return;
                }

                // Hide our self when content is
                if (additionalParams && additionalParams.widgetResumed) {
                    domStyle.set(this.domNode, "visibility", "hidden");
                }


                if (callerData && callerData.contextIdSyncChange) {
                    //We need to refresh content data when content link change on sync.
                    this._pageDataStore.refresh(ctx.id).then(function (contentData) {
                        var oldContentLink = this._currentViewModel.contentData.contentLink;
                        this._updateContentViewModel(contentData, ctx.languageContext);
                        this._currentViewComponent.onContentLinkSyncChange(oldContentLink, contentData.contentLink);
                        this._refreshModel(contentData, ctx);
                    }.bind(this));
                } else {
                    if (this._currentViewModel) {
                        this._currentViewModel.suspend();
                    }

                    var viewName;

                    if (callerData && callerData.viewName) {
                        if (callerData.availableViews) {
                            // receive the available views list from widget switcher
                            // convert to hashtable for easier looking up.
                            this._availableViewsLookup = {};
                            array.forEach(callerData.availableViews, function (availableView) {
                                this._availableViewsLookup[availableView.key] = availableView;
                            }, this);
                        }
                        viewName = callerData.viewName;
                    }

                    // forceReload iframe in Preview mode or OPE mode (CMS-13478) when coming from all properties edit mode
                    var forceReload = callerData.forceReload;
                    if ((viewName === "view" || viewName === "onpageedit") && this._currentViewModel && this._currentViewModel.viewName === "formedit") {
                        forceReload = true;
                    }

                    return this._ensurePreviewReady(this._loadContentDataAndSetView(ctx.id, viewName, ctx, callerData.availableViews), true, forceReload, viewName);
                }
            }.bind(this));
        },

        _getPreviewUrl: function (viewName) {
            // summary:
            //      Gets the URL for the preview based on the requested view.
            // tags:
            //      private

            return when(this.getCurrentContext(), function (context) {
                return (viewName === "view" && context.previewUrl) ? context.previewUrl : context.editablePreviewUrl;
            });
        },

        _ensurePreviewReady: function (action, reload, forceReload, viewName) {
            // summary:
            //      Perform an action and reload preview iframe if needed.
            //      Raise OnPreviewReady event on the current view component when both are finished.
            // action: [Deferred|null]
            //      Action to execute
            //
            // reload: [Boolean]
            //      Flag indicating if the preview frame should be reloaded or not
            //
            // forceReload: [Boolean]
            //    if true then reloads the page even if its the same url
            //    by default load will not trigger any request for the same url
            //
            // tags:
            //      private

            var def = new Deferred();

            if (action) {
                def = action;
            } else {
                def.resolve();
            }

            // Only reload the iframe when not in all properties mode. This is to optimize the load
            // times for all properties mode.
            if (reload && viewName !== "formedit") {
                def = def.then(function (actionPromiseResult) {
                    return when(this._getPreviewUrl(viewName), function (url) {
                        return when(this._changeUrl(url, forceReload), function () {
                            return actionPromiseResult;
                        });
                    }.bind(this));
                }.bind(this));
            }

            this._ensurePreviewReadyPromise = when(def,
                function (actionPromiseResult) {
                    var doc = this.iframeWithOverlay.iframe.getDocument();
                    // wait for the setup of the overlay to become ready(update the overlay items needed) which will happen async in onPreviewReady
                    var handle = this.connect(this._currentViewComponent, "onPrepareOverlayComplete", function () {
                        this.disconnect(handle);
                        handle = null;

                        this.iframeWithOverlay.overlay.set("enabled", this._currentViewModel.get("showOverlay"));

                        // TODO: Enable the overlay again when we implement the user story #116539 - Projects - Editing while in Preview
                        // If the Projects preview is enabled disable the editing overlay
                        if (this._viewSettingsManager.get("enabled") && this._viewSettingsManager.getSettingProperty("project")) {
                            this.iframeWithOverlay.overlay.set("enabled", false);
                        }
                        this.iframeWithOverlay.layout(true);
                    });

                    // Make sure we're visible
                    domStyle.set(this.domNode, "visibility", "visible");

                    this._viewSettingsManager.onPreviewReady(this.iframeWithOverlay);
                    this._currentViewComponent.onPreviewReady(this._currentViewModel, doc, !!actionPromiseResult);

                    this._editNotifications.updateSettings({ viewModel: this._currentViewModel, viewSetting: this._viewSettingsManager });
                }.bind(this)
            );
            return this._ensurePreviewReadyPromise;
        },

        _loadContentDataAndSetView: function (contentLink, viewName, ctx, availableViews) {
            var def = new Deferred();

            // When we're editing data it will get already the fresh data from the server.
            when(this._pageDataStore.refresh(contentLink)).then(function (contentData) {

                // We need to update the toolbar even though we did not receive andy data
                this.toolbar.update({
                    currentContext: ctx,
                    viewConfigurations: {
                        availableViews: availableViews,
                        viewName: viewName
                    },
                    contentData: contentData
                });

                if (!contentData) {
                    return;
                }

                //Clear the notification bar when we are loading new content
                if (this._currentViewModel && this._currentViewModel.contentLink !== contentLink) {
                    this.notificationBar.clear();
                }

                this._currentViewModel = this._getViewModel(contentData.contentLink);

                // create a new viewModel if empty
                if (!this._currentViewModel) {
                    this._currentViewModel = this._createViewModel(contentData, ctx);
                    this._setActivityModel(contentData);
                } else {
                    // Always set the currentPage property since it might have been updated.
                    this._updateContentViewModel(contentData, ctx.languageContext);
                }

                this._currentViewModel.set("viewLanguage", this._viewSettingsManager.get("enabled") ? this._viewSettingsManager.getSettingProperty("viewlanguage") : null);

                this._refreshModel(contentData, ctx);

                when(this.setView(viewName)).then(function () {
                    // load content data should force the edit mode to setup because when the contentModel is re-populated, all the watches will go.
                    def.resolve(true);
                }).otherwise(function () {
                    def.cancel();
                });
            }.bind(this)).otherwise(function () {
                def.reject();
            });

            return def.promise;
        },

        _updateContentViewModel: function (contentData, languageContext) {
            this._currentViewModel.wakeUp();
            this._currentViewModel.set("contentData", contentData);
            this._currentViewModel.set("languageContext", languageContext);
            this._setActivityModel(contentData);
        },

        _refreshModel: function (contentData, context) {
            // summary:
            //      Sets the updated model on all the commands and notifications.

            // NOTE: This method should be the target of some serious PageDataController refactoring.
            var model = this._currentViewModel;
            if (model) {
                // Update the toolbars model
                this.toolbar.set("contentViewModel", model);

                // Set view model to the extensions first
                this._inUseNotificationManager.updateCommandModel(model);

                // Push the new content to the commands
                this._editingCommands.set("model", model);

                // update all custom notifications
                this._editNotifications.update(contentData, context, model);
            }
        },

        itemChanged: function (id, item) {
            // summary:
            //		Notification event when an item has been patched or reloaded.
            // object: id
            //		The id of the updated item.
            // object: item
            //		The updated item.
            // tags:
            //		public


        },

        setView: function (viewName, viewParams) {
            // summary:
            //      Set and load current view handler.
            // viewName: String
            //      Alias name of view handler class. Known views are: view, onpageedit, formedit, readonly.
            // viewParams: Object
            //      Parameters to be mixed in view handler on creation.
            // tags:
            //      public

            var def = new Deferred();

            // Quick fix for the content that do not have template and default view is ope or the ope is not avaiable.
            // The proper fix will come after 7.5 release when we have strong type representation for system pages and content type which have no template.
            if (viewName === "onpageedit" && (!this._currentViewModel.contentData.hasTemplate || !(viewName in this._availableViewsLookup))) {
                viewName = "formedit";
            }

            // exit if it's the current view or view is unknown
            if (viewName && !(viewName in this._availableViewsLookup)) {
                return;
            }

            var onResolved = function () {
                when(this._setView(viewName, viewParams), function () {
                    def.resolve();
                }, function () {
                    def.cancel();
                });
            }.bind(this);

            var onRejected = function () {
                topic.publish("/epi/cms/action/showerror");
                def.cancel();
            };

            when(this._savePendingChanges(), onResolved, onRejected);

            return def;
        },

        _setView: function (viewName, viewParams) {
            var def = new Deferred(),
                component = this._currentViewComponent,
                reuseCurrentViewComponent = component && component.viewModel && component.viewModel.viewName === viewName;

            var resolveDeferred = function (def) {
                // NOTE: The leftover is kept on the editLayoutContainer for the sake of a better feeling when switching between ope and form.
                // Other views rather than ones that implement _FormEditingMixin may have no idea about it. Therefore, the controller should be responsible for a cleanup.
                // For the long run, to avoid the left over things, form editing and ope should be combined into one view.
                if (this.editLayoutContainer.leftOver && !this._currentViewComponent.canHandleLeftOver) {
                    when(this.editLayoutContainer.selectedChildWidget === this.editLayoutContainer.leftOver ? this.editLayoutContainer.selectChild(this.iframeWithOverlay) : null,
                        function () {
                            this.editLayoutContainer.removeChild(this.editLayoutContainer.leftOver);
                            this.editLayoutContainer.leftOver.destroyRecursive();
                            this.editLayoutContainer.leftOver = null;
                        }.bind(this)
                    );
                }

                def.resolve();
            }.bind(this);

            topic.publish("/epi/shell/action/changeview/updatestate", { viewName: viewName });

            if (reuseCurrentViewComponent) {
                this._currentViewModel.viewName = viewName;
                this.toolbar.set("contentViewModel", this._currentViewModel);

                resolveDeferred(def);
            } else {
                // destroy current view
                this._destroyCurrentViewComponent();

                var widgetType = this._availableViewsLookup[viewName].viewType;

                require([widgetType], function (widgetClass) {
                    // create new instance
                    this._currentViewComponent = new widgetClass(lang.mixin({
                        mainLayoutContainer: this.mainLayoutContainer,
                        editLayoutContainer: this.editLayoutContainer,
                        iframeWithOverlay: this.iframeWithOverlay,
                        contextTypeName: this.contextTypeName,
                        toolbar: this.toolbar
                    }, viewParams));

                    this._currentViewComponentReloadRequireHandle = this.connect(this._currentViewComponent, "onReloadRequired", this._onViewRequireReload);

                    this._currentViewComponent.on("dom-updated", debounce(this._onDomUpdated, this, 100));

                    this._currentViewComponent.startup();

                    this._currentViewModel.viewName = viewName;
                    this.toolbar.set("contentViewModel", this._currentViewModel);

                    resolveDeferred(def);
                }.bind(this));
            }

            return def;
        },

        _onViewRequireReload: function () {
            return this._ensurePreviewReady(null, true, true, this._currentViewModel.viewName);
        },

        resize: function (size) {
            // summary:
            //    Call this to resize a widget, or after its size has changed.
            // tags:
            //    public
            this.inherited(arguments);

            if (this._started) {
                this.mainLayoutContainer.resize(size);
            }
        },

        onShow: function () {
            // summary:
            //    Called by container widgets when showing this widget.
            this.iframeWithOverlay.overlay.set("enabled", true);

            // make sure the overlay isn't read only when we show it.
            this.iframeWithOverlay.overlay.set("readOnly", false);
        },

        onHide: function () {
            // summary:
            //    Called by container widgets when hiding this widget.
            this.iframeWithOverlay.overlay.set("enabled", false);

            // The notification area is shared between multiple views
            // so we need to reset the notifications for this view before loading the new
            if (this._currentViewModel) {
                this._currentViewModel.resetNotifications();
            }
        },

        _requestContextChangeByUrl: function (url, forceContextChange, suppressFailure, params, mixWithExistingParams) {
            var newUrl = new Url(url, params, mixWithExistingParams),
                contextParameters = { url: newUrl.toString() },
                callerData = {
                    sender: this,
                    forceContextChange: forceContextChange,
                    suppressFailure: suppressFailure,
                    viewName: this._currentViewModel && this._currentViewModel.viewName
                };

            topic.publish("/epi/shell/context/request", contextParameters, callerData);
        },

        _changeUrl: function (url, forceReload) {
            var previewParams = lang.mixin(this._previewQueryParameters, this._viewSettingsManager.get("previewParams"));

            // we want a reload even if its a same url in order to render all kind of contents (i.e videos)
            return this.iframeWithOverlay.iframe.load(url, { query: previewParams }, true, forceReload);
        },

        _interceptRequestContext: function (newContextParams, callerData) {
            // intercept all context requests so we can resolve any pending changes before context changes

            if (!(callerData && callerData.sender && callerData.sender === this)) {
                // a new context request, resolve pending changes
                return this._savePendingChanges();
            } else {
                var def = new Deferred();
                def.resolve();
                return def;
            }
        },

        _savePendingChanges: function () {
            // summary:
            //      Save all pending changes if they haven't allready been saved
            // tags:
            //      private

            //If we currently are waiting for a save to complete return the old promise
            if (this._saveDeferred && !this._saveDeferred.isFulfilled()) {
                return this._saveDeferred.promise;
            } else {
                this._saveDeferred = new Deferred();
            }
            //If the there are unsaved changes on the viewmodel and no errors, save and wait until all changes has been saved
            if (this._currentViewModel && this._currentViewModel.get("hasPendingChanges") && !this._currentViewModel.get("hasErrors")) {
                var handle = this._currentViewModel.watch("hasPendingChanges", function (name, oldValue, newValue) {
                    if (!newValue) {
                        handle.remove();
                        handle = null;

                        //Resolve the save deferred when all changes has been saved
                        this._saveDeferred.resolve();
                    }
                }.bind(this));

                this._currentViewModel.save();
            } else {
                // resolve immediately
                this._saveDeferred.resolve();
            }
            return this._saveDeferred.promise;
        },

        savePendingChanges: function () {
            // summary:
            //      Save all pending changes if they haven't already been saved
            // tags:
            //      internal

            return this._savePendingChanges();
        },

        _injectCssRules: function () {
            this.iFrame.addCssRules(this.defaultEditCssRules);
        },

        _undoAction: function () {
            // summary:
            //    Undo changes on the current viewmodel
            // tags:
            //    protected

            if (this.get("isActive") && this._currentViewModel) {
                this._currentViewModel.undo();
            }
        },

        _redoAction: function () {
            // summary:
            //    Redo the changes on the current viewmodel
            // tags:
            //    protected

            if (this.get("isActive") && this._currentViewModel) {
                this._currentViewModel.redo();
            }
        },

        _saveAction: function () {
            // summary:
            //    Trigger save on the current viewmodel
            // tags:
            //    protected

            if (this.get("isActive") && this._currentViewModel) {
                this._currentViewModel.save();
            }
        },

        _onDomUpdated: function () {
            // summary:
            //    Remaps the overlays
            // tags:
            //    private

            if (!this._currentViewComponent) {
                return;
            }
            var doc = this.iframeWithOverlay.iframe.getDocument();
            this._currentViewComponent.onPreviewReady(this._currentViewModel, doc, false);
        },

        _setIsActiveAttr: function (value) {
            this._set("isActive", value);

            if (value) {
                this._currentViewModel && this._currentViewModel.wakeUp();
                this._editNotifications.wakeUp();
            } else {
                this._viewModels.forEach(function (viewModel) {
                    viewModel.suspend();
                });
                this._editNotifications.suspend();
            }
        },

        _toggleActivities: function () {
            domClass.toggle(this.activityFeed.domNode, "dijitHidden", !this.activityModel.isActivitiesVisible);
            domClass.toggle(this.activityFeed._splitterWidget.domNode, "dijitHidden", !this.activityModel.isActivitiesVisible);
            this._loadSettings();
            this.mainLayoutContainer.layout();
        },

        _setActivityCommandModel: function () {
            var commandProvider = dependency.resolve("contentActivityCommandProvider");
            commandProvider.updateCommandModel(this.activityModel);
        },

        _setActivityModel: function (contentData) {
            this.activityModel.set({
                contentLink: contentData.contentLink,
                name: contentData.name
            });
        },

        _loadSettings: function () {
            // summary:
            //    Loads comments pane settings
            //    Use the default size when the settings' size is larger than the mainLayoutContainer's size
            // tags:
            //    private
            var settings = this.activityModel.getActivityFeedSettings();
            if (!settings || !settings.size
                || domStyle.get(this.mainLayoutContainer.domNode, "width") < settings.size) {
                return;
            }
            domStyle.set(this.activityFeed.domNode, "width", settings.size + "px");
        }
    });
});
