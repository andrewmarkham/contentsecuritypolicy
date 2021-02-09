define("epi-cms/component/Versions", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/string",
    "dojo/topic",
    "dojo/when",
    "dojo/_base/json",
    "dojox/html/entities",

    // DGrid
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "epi-cms/dgrid/formatters",

    // EPi Framework
    "epi",
    "epi/dependency",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/command/_WidgetCommandProviderMixin",
    "epi/shell/command/withConfirmation",
    "epi/shell/widget/_FocusableMixin",
    "epi/shell/DialogService",

    // EPi CMS
    "epi-cms/_MultilingualMixin",
    "epi-cms/ApplicationSettings",
    "epi-cms/core/ContentReference",
    "epi-cms/component/command/DeleteVersion",
    "epi-cms/component/command/DeleteLanguageBranch",
    "epi-cms/component/command/SetCommonDraft",
    "epi-cms/command/ShowAllLanguages",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/widget/_GridWidgetBase",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.versions"

], function (
// Dojo
    array,
    declare,
    lang,
    aspect,
    domClass,
    string,
    topic,
    when,
    json,
    entities,

    // DGrid
    OnDemandGrid,
    Selection,
    formatters,

    // EPi Framework
    epi,
    dependency,
    TypeDescriptorManager,
    _WidgetCommandProviderMixin,
    withConfirmation,
    _FocusableMixin,
    dialogService,

    // EPi CMS
    _MultilingualMixin,
    ApplicationSettings,
    ContentReference,
    DeleteVersion,
    DeleteLanguageBranch,
    SetCommonDraft,
    ShowAllLanguagesCommand,
    ContentActionSupport,
    _GridWidgetBase,

    // Resources
    resources
) {

    return declare([_GridWidgetBase, _WidgetCommandProviderMixin, _FocusableMixin, _MultilingualMixin], {
        // summary:
        //      This component will list all versions of a content item.
        //
        // tags:
        //      internal

        // showAllLanguages: [readonly] Boolean
        //		Flag which indicates whether to show all languages. Value is true if all languages should be shown; otherwise false.
        showAllLanguages: true,

        // isMultilingual:  Boolean
        //		Flag which indicates whether the Show All Languages command should be enabled or disabled, based on Read access right and the number of available languages.
        isMultilingual: false,

        postMixInProperties: function () {
            // summary:
            //		Called after constructor parameters have been mixed-in; sets default values for parameters that have not been initialized.
            // tags:
            //		protected

            this._commonDrafts = {};

            this.storeKeyName = "epi.cms.contentversion";
            this.ignoreVersionWhenComparingLinks = false;
            this.forceContextReload = true;

            this.inherited(arguments);

            this._currentContentLanguage = ApplicationSettings.currentContentLanguage;

            this._showAllLanguagesCommand = new ShowAllLanguagesCommand({ model: this });

            var registry = dependency.resolve("epi.storeregistry");
            this._contentStore = registry.get("epi.cms.contentdata");
        },

        buildRendering: function () {
            // summary:
            //		Construct the UI for this widget with this.domNode initialized as a dgrid.
            // tags:
            //		protected

            this.inherited(arguments);

            var customGridClass = declare([OnDemandGrid, Selection]);
            this.grid = new customGridClass({
                columns: {
                    language: { label: epi.resources.header.language },
                    status: {
                        label: epi.resources.header.status,
                        renderCell: formatters.commonDraft
                    },
                    savedDate: {
                        label: epi.resources.header.saved,
                        formatter: this._localizeDate
                    },
                    savedBy: {
                        label: epi.resources.header.by,
                        formatter: this._createUserFriendlyUsername
                    }
                },
                selectionMode: "single",
                selectionEvents: "click,dgrid-cellfocusin",
                sort: [{ attribute: "savedDate", descending: true }]
            }, this.domNode);
        },

        postCreate: function () {
            this.inherited(arguments);

            this.add("commands", this._showAllLanguagesCommand);
            this._commonDraftCommand = new SetCommonDraft();
            this._deleteVersionCommand = new DeleteVersion();
            this._deleteLanguageBranchCommand = new DeleteLanguageBranch();

            this.own(
                aspect.after(this._commonDraftCommand, "execute", lang.hitch(this, function (deferred) {
                    //We force a new get when a value has changed in the store, otherwise we might have several common drafts
                    deferred.then(lang.hitch(this, this.fetchData), lang.hitch(this, this._onSetCommonDraftFailure));
                })),
                // Refresh after delete successfully
                aspect.after(this._deleteVersionCommand, "execute", lang.hitch(this, function (deferred) {
                    deferred.then(lang.hitch(this, this._onDeleteVersionSuccess), lang.hitch(this, this._onDeleteVersionFailure));
                })),
                aspect.after(this._deleteLanguageBranchCommand, "execute", lang.hitch(this, function (deferred) {
                    deferred.then(lang.hitch(this, this._onDeleteLanguageBranchSuccess), lang.hitch(this, this._onDeleteVersionFailure));
                }))
            );

            this.add("commands", this._commonDraftCommand);
            this.add("commands", withConfirmation(this._deleteVersionCommand, null, {
                title: resources.deletemenuitemtitle,
                heading: resources.deleteversion.note,
                description: resources.deleteversion.confirmquestion
            }));

            this._deleteLanguageBranchSettings = {
                cancelActionText: epi.resources.action.cancel,
                setFocusOnConfirmButton: false
            };
            this.add("commands", withConfirmation(this._deleteLanguageBranchCommand, null, this._deleteLanguageBranchSettings));
        },

        startup: function () {
            // summary: Overridden to connect a store to a DataGrid.

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            this.own(aspect.around(this.grid, "renderRow", lang.hitch(this, this._aroundRenderRow)));

            this._toggleLanguage();
            this.fetchData();
        },

        _setShowAllLanguagesAttr: function (newValue) {
            this._set("showAllLanguages", newValue);
            this._showAllLanguagesCommand.set("active", !newValue);
            this._toggleFilterByLanguage(newValue);
        },

        contextChanged: function (context, callerData) {
            // summary:
            //		When context change remove all data from list when its not content data.
            // context: Object
            // callerData: Object
            // tags:
            //      protected

            this.inherited(arguments);
            !this._isContentContext(context) && this.grid.set("store", null);
        },

        fetchData: function () {
            // summary:
            //		Updates the grid with the new data.
            // tags:
            //		private

            when(this.getCurrentContent(), lang.hitch(this, function (item) {
                if (!item) {
                    return;
                }

                this._setQuery(item.contentLink, this.showAllLanguages);

                // enable Show All Language command
                this.set("isMultilingual", true);
            }));
        },

        _aroundRenderRow: function (original) {
            // summary:
            //		Called 'around' the renderRow method in order to add a class which indicates published state.
            // tags:
            //		private

            return lang.hitch(this, function (item) {
                // If item is a common draft add it to the hash map.
                if (item.isCommonDraft) {
                    var common = this._commonDrafts[item.language];
                    if (common && common !== item.contentLink) {
                        this._removeCommonDraft(common);
                    }
                    this._commonDrafts[item.language] = item.contentLink;
                }

                this._versionsByLanguage[item.language] = this._versionsByLanguage[item.language] || [];
                if (array.every(this._versionsByLanguage[item.language], function (ver) {
                    return ver !== item.contentLink;
                })) {
                    this._versionsByLanguage[item.language].push(item.contentLink);
                }

                // Call original method
                var row = original.apply(this.grid, arguments);

                // Add state specific classes
                domClass.toggle(row, "dgrid-row-published", item.status === ContentActionSupport.versionStatus.Published);

                return row;
            });
        },

        _onError: function (e) {
            // summary:
            //		Shows an error message to the user when failing to load data.
            // tags:
            //		protected, extension

            if (e.error && e.error.status === 403) {
                when(this.getCurrentContent(), lang.hitch(this, function (item) {
                    this._showErrorMessage(epi.resources.messages.nopermissiontoviewdata);
                    this.set("isMultilingual", false); // disable Show All Language command since user does not have access right to view data
                    this._updateMenu(item);
                }));
            } else {
                this.inherited(arguments);
            }
        },

        _onSelect: function (e) {
            var item = e.rows[0].data;

            this._updateMenu(item);

            this.inherited(arguments);
        },

        _updateMenu: function (item) {
            this._commonDraftCommand.set("model", item);
            this._deleteVersionCommand.set("model", item);

            when(this._contentStore.get(item.contentLink), lang.hitch(this, function (content) {
                if (content && content.currentLanguageBranch) {
                    var heading = lang.replace(resources.deletelanguagebranch.label, [content.currentLanguageBranch.name]),
                        description = TypeDescriptorManager.getResourceValue(content.typeIdentifier, "deletelanguagebranchdescription");

                    lang.mixin(this._deleteLanguageBranchSettings, {
                        confirmActionText: heading,
                        description: lang.replace(description, [entities.encode(content.name), content.currentLanguageBranch.name]),
                        title: heading
                    });
                    this._deleteLanguageBranchCommand.set("label", heading);
                }

                this._deleteLanguageBranchCommand.set("model", content);
            }));
        },

        _showNotificationMessage: function (notification) {
            // summary:
            //     Show a notification message
            // notification:
            //     The notification message
            dialogService.alert({
                title: resources.notificationtitle,
                description: notification
            });
        },

        _selectCommonDraftVersion: function (uri, forceReload) {
            // summary:
            //      Selects the common draft version in the list.
            // tags:
            //      private
            var callerData = {
                sender: this
            };

            if (forceReload) {
                callerData.forceReload = forceReload;
            }

            topic.publish("/epi/shell/context/request", { uri: uri }, callerData);
        },

        _onDeleteLanguageBranchSuccess: function () {
            return when(this._onDeleteVersionSuccess(arguments), lang.hitch(this, function () {
                var language = this._deleteLanguageBranchCommand.model.currentLanguageBranch.languageId;

                array.forEach(this._versionsByLanguage[language], lang.hitch(this, function (ver) {
                    this.store.notify(undefined, new ContentReference(ver));
                }));
            }));
        },

        _onDeleteVersionSuccess: function () {
            // summary:
            //      Update the current context and display notification.
            // tags:
            //      private

            var self = this;
            return when(this.getCurrentContent(), function (currentContent) {
                var contentLink = new ContentReference(currentContent.contentLink);
                var referenceId = contentLink.createVersionUnspecificReference().toString();

                self._selectCommonDraftVersion("epi.cms.contentdata:///" + referenceId, true);
            });
        },

        _onDeleteVersionFailure: function (response) {
            // summary:
            //      Display alert with the delete failure message.
            // tags:
            //      private

            //If the user clicks cancel in the confirmation dialog we will end up here
            if (!response || !response.status) {
                return;
            } else if (response.status === 403) {
                this._showNotificationMessage(resources.deleteversion.cannotdeletepublished);
            } else if (response.status === 409) {
                var errorMessage = response.responseText ? json.fromJson(response.responseText).message : resources.deleteversion.cannotdelete;
                this._showNotificationMessage(errorMessage);
            } else {
                this._showNotificationMessage(resources.deleteversion.cannotdelete);
            }
        },

        _onSetCommonDraftFailure: function () {
            // summary:
            //      Display notification in the UI of failure.
            // tags:
            //      private

            this._showNotificationMessage(resources.setcommondraft.failuremessage);
        },

        _removeCommonDraft: function (reference) {
            // Refresh the previous common draft item, as it might be changed on the server side.
            if (reference) {
                var item = this.grid.row(reference).data;
                if (item) {
                    item.isCommonDraft = false;
                }
            }
        },

        _toggleFilterByLanguage: function (showAll) {
            // summary:
            //      handles filterByLanguage event.
            // tags:
            //      private
            // sender:
            //      the page version widget that triggers the filterByLanguage event

            return when(this.getCurrentContext()).then(function (currentContext) {
                if (!this._isContentContext(currentContext)) {
                    this.grid.set("store", null);
                } else {
                    this._setQuery(currentContext.id, showAll);
                    this._toggleLanguage();
                }
            }.bind(this));
        },

        _setQuery: function (contentLink, showAllLanguages) {
            // summary:
            //      Create a new query from the contentLink and showAllLanguages and set it on the grid
            // tags:
            //      private

            var query = {
                contentLink: new ContentReference(contentLink).createVersionUnspecificReference().toString()
            };
            if (!showAllLanguages) {
                query.language = this._currentContentLanguage;
            }

            this.grid.set("query", query);

            // The server side store requires the contentLink to be set.
            if (!this.grid.store) {
                this.grid.set("store", this.store);
            }

            this._versionsByLanguage = {};
        },

        _toggleLanguage: function () {
            // summary:
            //		Toggles the visibility of the language column.
            // tags:
            //		private

            var value = this.showAllLanguages ? "table-cell" : "none";

            this.grid.styleColumn("language", string.substitute("display:${0};", [value]));
        }
    });
});
