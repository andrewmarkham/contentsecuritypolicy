define("epi-cms/component/RecentlyChanged", [
    "dojo/_base/declare",
    "dojo/_base/lang",

    "epi",
    "epi/dependency",

    "epi/shell/command/_WidgetCommandProviderMixin",
    "epi/shell/command/_Command",
    "epi/shell/command/ToggleCommand",
    "epi/shell/widget/layout/ComponentContainer",
    "epi/shell/DialogService",
    "epi/shell/widget/_FocusableMixin",

    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/_GridWidgetBase",

    "epi/i18n!epi/cms/nls/episerver.cms.components.recentlychanged"
],
function (
    declare,
    lang,

    epi,
    dependency,

    _WidgetCommandProviderMixin,
    _Command,
    ToggleCommand,
    ComponentContainer,
    dialogService,
    _FocusableMixin,

    ContentActionSupport,
    ContentReference,
    _GridWidgetBase,

    resources
) {
    return declare([_GridWidgetBase, _WidgetCommandProviderMixin, _FocusableMixin], {
        // summary:
        //      This component will list the latest changed content for the web site.
        //
        // tags:
        //      internal

        // _componentsController: [private] epi/shell/widget/Application
        _componentsController: null,

        onlyShowMyChanges: false,

        postMixInProperties: function () {
            // summary:
            //    Overridden to wrap the gridcontainer and add our toolbar after
            //
            // tags:
            //    protected
            this.storeKeyName = "epi.cms.content.search";
            this._componentsController = dependency.resolve("epi.shell.controller.Components");
            this.ignoreVersionWhenComparingLinks = false;
            this.inherited(arguments);
        },

        buildRendering: function () {
            // summary:
            //		Construct the UI for this widget with this.domNode initialized as a dgrid.
            // tags:
            //		protected

            this.inherited(arguments);

            var gridSettings = lang.mixin({
                columns: this._createGridColumns(),
                store: this.store,
                selectionMode: "single"
            }, this.defaultGridMixin);

            this.grid = new this._gridClass(gridSettings, this.domNode);
        },

        startup: function () {
            // summary:
            //      Overridden to connect a store to a DataGrid.

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            var commands = [
                new ToggleCommand({
                    label: resources.showmychanges,
                    category: "setting",
                    model: this,
                    property: "onlyShowMyChanges"
                }),
                new _Command({
                    iconClass: "epi-iconReload",
                    label: epi.resources.action.refresh,
                    canExecute: true,
                    _execute: lang.hitch(this, function () {
                        this.grid.refresh();
                    })
                })];

            this.add("commands", commands);

            this.fetchData();
        },

        _setOnlyShowMyChangesAttr: function (value) {
            this._set("onlyShowMyChanges", value);
            if (this._started) {
                this._saveSettingComponent("onlyShowMyChanges", value);
            }
        },

        fetchData: function () {
            // summary:
            //		Updates the grid with the new data.
            // tags:
            //		private

            var query = this._getQuery();

            this.grid.set("query", query.query, query.options);
        },

        _getQuery: function () {
            return {
                query: { query: "recentlychanged", onlyShowMyChanges: this.onlyShowMyChanges, keepversion: true },
                options: { ignore: ["query"], sort: [{ attribute: "saved", descending: true}] }
            };
        },

        _createGridColumns: function () {
            var columns = {
                name: {
                    label: epi.resources.header.name,
                    className: "epi-width50",
                    renderCell: lang.hitch(this, this._renderContentItem)
                },
                status: {
                    label: epi.resources.header.status,
                    renderCell: function (item, value, node, options) {
                        node.innerHTML = ContentActionSupport.getVersionStatus(value);
                    },
                    className: "epi-width15"
                },
                saved: {
                    label: epi.resources.header.saved,
                    formatter: this._localizeDate,
                    className: "epi-width25"
                }
            };

            if (!this.get("onlyShowMyChanges")) {
                columns.changedBy = {
                    label: epi.resources.header.by,
                    formatter: this._createUserFriendlyUsername,
                    className: "epi-width10"
                };
            }

            return columns;
        },

        _saveSettingComponent: function (type, value) {
            // summary:
            //		Save setting handle by component controller.
            // type: String
            //      The type of a setting.
            // value: value
            //      The value of a setting.
            // tags:
            //		private

            var item = this._componentsController.getComponentDefinition(this.id),
                query;

            if (item) {
                item.settings.onlyShowMyChanges = value;

                // save the settings
                var saved = this._componentsController.saveComponents([item]);
                saved.then(function (done) {

                }, function () {
                    // Show alert dialog on errorCallback
                    dialogService.alert(resources.errormessage);
                });

                // Updated this way on purpose. Both set query and columns will trigger
                // a refresh of data leading to bad rendering behaviour of the grid.
                query = this._getQuery();
                this.grid.query = query.query;
                this.grid.queryOptions = query.options;
                this.grid.set("columns", this._createGridColumns());
            }
        },

        onContextChanged: function (context) {
            // summary:
            //      Selects the current context item if it exists in the grid.

            this.grid.clearSelection();

            var versionAgnosticLink = new ContentReference(context.id).createVersionUnspecificReference().toString();

            var row = this.grid.row(versionAgnosticLink);
            if (row) {
                this.grid.select(row);
            }
        }
    });
});
