define("epi-cms/contentediting/ContentReferenceList", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/keys",
    "dojo/when",
    // dijit
    "dijit/_WidgetBase",
    // dgrid
    "dgrid/_StoreMixin",
    "dgrid/Keyboard",
    "dgrid/List",
    "dgrid/Selection",
    "dgrid/extensions/DijitRegistry",
    // epi
    "epi/dependency",
    "epi/shell/dgrid/Formatter",
    "epi/shell/dgrid/Responsive",
    // epi-cms
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/dgrid/DnD",
    "epi-cms/dgrid/listItemFormatters",
    "epi-cms/dgrid/WithContextMenu",
    // put
    "put-selector/put",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentreferencelisteditor"
], function (
// dojo
    declare,
    lang,
    aspect,
    domClass,
    keys,
    when,
    // dijit
    _WidgetBase,
    // dgrid
    _StoreMixin,
    Keyboard,
    List,
    Selection,
    DijitRegistry,
    // epi
    dependency,
    Formatter,
    Responsive,
    // epi-cms
    ContentActionSupport,
    DnD,
    listItemFormatters,
    WithContextMenu,
    // put
    put,
    // resources
    resources
) {

    var _AllStoreItemsMixin = declare(_StoreMixin, {
        // summary:
        //      dgrid mixin which implements the refresh method to
        //      always perform a single query with no start or count
        //      specified, to retrieve all relevant results at once.
        //      Appropriate for grids using memory stores with small
        //      result set sizes.
        //
        //      based on http://dgrid.io/tutorials/0.3/single_query/
        // tags:
        //      internal

        refresh: function () {
            var self = this;

            // First defer to List#refresh to clear the grid's
            // previous content
            this.inherited(arguments);

            if (!this.store) {
                return;
            }
            return this._trackError(function () {
                var queryOptions = self.get("queryOptions"),
                    results = self.store.query(
                        self.query, queryOptions);

                return self.renderArray(
                    results, null, queryOptions);
            });
        },

        renderArray: function () {
            var rows = this.inherited(arguments);

            if (rows && rows.length === 0) {
                this.noDataNode = put(this.contentNode, "div.dgrid-no-data");
                this.noDataNode.innerHTML = this.noDataMessage;
            }
            // Clear _lastCollection which is ordinarily only used for
            // store-less grids
            this._lastCollection = null;

            return rows;
        }
    });

    return declare([_WidgetBase], {
        // summary:
        //      A widget that lists content references
        // tags:
        //      internal

        // listItemType: String
        //      What type of formatting to use from listItemFormatters
        listItemType: "card",

        // store: [readonly] Store
        //      A Memory store for the list.
        store: null,

        // query: [public] Object
        //      The query object for the store. It should define a query and queryOptions.
        query: null,

        _listClass: declare([List, Formatter, Selection, Keyboard, WithContextMenu, DijitRegistry, DnD, _AllStoreItemsMixin, Responsive]),

        buildRendering: function () {
            // summary:
            //      Construct the UI for this widget, setting this.domNode and this._list.
            // tags:
            //      protected

            this.inherited(arguments);
            this.query = this.query || { query: {}, queryOptions: {} };
            this.profile = this.profile || dependency.resolve("epi.shell.Profile");
            this._setupList();
        },

        startup: function () {
            this.inherited(arguments);
            this._list.startup();
        },

        _setupList: function () {
            // summary:
            //      Creates the list and setup all events.
            // tags:
            //      private

            // Get the current content language from the profile
            when(this.profile.getContentLanguage(), lang.hitch(this, function (contentLanguage) {
                listItemFormatters.contentLanguage = contentLanguage;
            }));

            var list = new this._listClass({
                "class": "epi-grid-height--auto epi-card-list epi-card-list--numbered",
                formatters: [lang.hitch(this, this._numberedCardFormatter)],
                commandCategory: "itemContext",
                deselectOnRefresh: false,
                store: this.store,
                noDataMessage: resources.nodatamessage,
                selectionMode: this.readOnly ? "none" : "extended",
                selectionEvents: "click,dgrid-cellfocusin",
                dndDisabled: this.readOnly,
                sort: this.query.queryOptions.sort,
                query: this.query.query,
                queryOptions: this.query.queryOptions,
                responsiveMap: {
                    "epi-card-list--narrow": 500
                },
                dndParams: {
                    copyOnly: false,
                    accept: this.allowedTypes,
                    reject: this.restrictedTypes,
                    alwaysCopy: false
                }
            }, this.domNode);
            list.contextMenu.addProvider(this.commandSource);

            this.own(this._list = list);

            if (this.readOnly) {
                this.own(
                    list.on(".dgrid-row:click",this._updateReadOnlyCommands.bind(this))
                );
                return;
            }

            var self = this;

            this.own(
                list.on("dgrid-select", lang.hitch(this, this._updateCommands)),
                list.on(".dgrid-row:dblclick", lang.hitch(this, function (evt) {
                    var item = this._list.row(evt).data;
                    this.emit("itemaction", { item: item });
                })),
                list.addKeyHandler(keys.ENTER, lang.hitch(this, function (evt) {
                    var item = this._list.row(evt).data;
                    this.emit("itemaction", { item: item });
                })),
                list.addKeyHandler(keys.DELETE, lang.hitch(this, this._removeItems)),
                aspect.after(list.dndSource, "onDropData", function (dndData, source, nodes, copy) {
                    var items = dndData.map(function (item) {
                        return item.data;
                    });
                    if (this.grid.dndSource === source) {
                        var itemsToMove = self.getSelectedIds();
                        self.emit("itemsmoved", {ids: itemsToMove });
                    } else {
                        self.emit("itemsdropped", { items: items });
                    }
                }, true),
                aspect.before(list.dndSource, "delItem", lang.hitch(this, this._removeItems), true)
            );
        },

        setSelection: function (itemsToSelect) {
            // summary:
            //      Sets the selection in the list to the specified items.
            // tags:
            //      public

            this._list.clearSelection();
            itemsToSelect.forEach(function (item) {
                this._list.select(item);
            }, this);
        },

        getSelectedIds: function () {
            // summary:
            //      Gets the ids of all selected items in the list.
            // tags:
            //      public

            var ids = [];
            for (var selectedId in this._list.selection) {
                ids.push(selectedId);
            }
            return ids;
        },

        _updateReadOnlyCommands: function () {
            var cmdModel = {
                ids: this.getSelectedIds()
            };

            this._list.clearSelection();

            this.commandSource.updateCommandModel(cmdModel);
        },

        _updateCommands: function () {
            // summary:
            //      Updates this.commandSource with a model defining the ids of the selected items.
            // tags:
            //      private

            var cmdModel = {
                ids: this.getSelectedIds()
            };

            this.commandSource.updateCommandModel(cmdModel);
        },

        _numberedCardFormatter: function (value, object, node, options) {
            // summary:
            //      The formatters used to render each item in the list.
            // tags:
            //      protected

            var baseFormatters = listItemFormatters[this.listItemType];

            domClass.add(node, "epi-card--numbered");

            return baseFormatters[0](value, object, node, options);
        },

        _removeItems: function () {
            // summary:
            //      emit event to remove items with selected ids
            // tags:
            //      private

            var itemsToDelete = this.getSelectedIds();
            this.emit("itemsremove", { ids: itemsToDelete});
        },

        refresh: function () {
            // summary:
            //      Refreshes the list.
            // tags:
            //      public

            this._list.refresh();
            //we need to reset the command model since the values have been updated
            this._updateCommands();
        },

        getDndSource: function () {
            // summary:
            //      Gets the dnd source from this widget.
            // tags:
            //      public

            return this._list.dndSource;
        },

        focus: function () {
            // summary:
            //    Sets focus on the list and its selected items.
            // tags:
            //    public

            //since focus on the list will reset selection we first
            //grab our current selection to re-select after focus.
            var selectedIds =  this.getSelectedIds();
            var firstSelectedId = selectedIds[0];
            if (firstSelectedId) {
                var firstSelectedRow = this._list.row(firstSelectedId);
                this._list.focus(firstSelectedRow);
            } else {
                this._list.focus();
            }
            selectedIds.forEach(function (id) {
                var row = this._list.row(id);
                this._list.select(row);
            }, this);
        }
    });
});
