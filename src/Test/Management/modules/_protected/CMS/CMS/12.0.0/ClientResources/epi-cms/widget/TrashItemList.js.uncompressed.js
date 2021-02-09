require({cache:{
'url:epi-cms/widget/templates/TrashItemList.html':"﻿<div>\r\n    <div class=\"epi-trashHeader clearfix\">\r\n        <div class=\"epi-gadgetInnerToolbar\" data-dojo-attach-point=\"searchBoxContainer\">\r\n            <div data-dojo-type=\"epi/shell/widget/SearchBox\" data-dojo-attach-point=\"searchBox\"></div>\r\n        </div>\r\n    </div>\r\n    <div data-dojo-attach-point=\"gridContainerNode\"></div>\r\n</div>\r\n"}});
﻿define("epi-cms/widget/TrashItemList", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/window",

    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-style",

    "dojo/aspect",
    "dojo/keys",
    "dojo/Evented",
    "dojo/query",
    "dojo/html",
    "dojo/Stateful",
    "dojo/string",
    "dojo/when",
    // Dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Select",

    // Dojox
    "dojox/widget/Standby",

    // DGrid
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dgrid/Keyboard",
    "dgrid/tree",
    "dgrid/extensions/ColumnResizer",
    "dgrid/util/mouse",
    "put-selector/put",

    // EPi
    "epi",
    "epi/dependency",
    "epi/shell/dgrid/Formatter",
    "epi/shell/dgrid/util/misc",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/SearchBox",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/datetime",
    "epi/username",
    "epi-cms/dgrid/formatters",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.trash",
    "dojo/text!./templates/TrashItemList.html"
],

function (
// Dojo
    array,
    declare,
    lang,
    window,

    domClass,
    domConstruct,
    domGeometry,
    domStyle,

    aspect,
    keys,
    Evented,
    query,
    html,
    Stateful,
    string,
    when,
    // Dijit
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    Select,

    // Dojox
    Standby,

    // DGrid
    OnDemandGrid,
    DgridSelection,
    Keyboard,
    Tree,
    ColumnResizer,
    MouseUtil,
    put,

    // EPi
    epi,
    dependency,
    Formatter,
    GridMiscUtil,
    TypeDescriptorManager,
    SearchBox,
    _ModelBindingMixin,
    epiDate,
    username,
    formatters,

    // Resources
    resources,
    template
) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, Evented, Stateful, _ModelBindingMixin], {
        // summary:
        //      A widget to display content in trash for a specific trash.
        //
        // tags:
        //      internal

        resources: resources,

        epi: epi,

        templateString: template,

        _grid: null,

        _observers: {},

        _setQueryOptionsAttr: function (queryOptions) {
            this._set("queryOptions", queryOptions);
            this._initialize();
        },

        destroy: function () {
            // summary:
            //      Destroy the object.
            for (var id in this._observers) {
                this._observers[id].cancel();
                delete this._observers[id];
            }

            if (this._standby) {
                this._standby.destroyRecursive();
                this._standby = null;
            }

            if (this._grid) {
                this._grid.destroy();
                this._grid = null;
            }

            this.inherited(arguments);
        },

        clearSelection: function () {
            this._grid.clearSelection();
            // NOTE:
            // It is necessary to set the _lastSelected to null due a bug on the dgrid where
            // after deselecting a row it cannot be selected again. If the _lastSelected isn't
            // "clear", it will assume that the same row is selected and it will not apply all
            // styling (highlighted selected classes).
            // The bug report can be found here: https://github.com/SitePen/dgrid/issues/295
            this._grid._lastSelected = null;
        },

        postCreate: function () {
            this.inherited(arguments);

            this.searchBox.encodeSearchText = true;
            this.searchBox.on("searchBoxChange", lang.hitch(this, function (queryText) {
                this.emit("searchBoxChange", queryText);
            }));
        },

        resize: function () {
            // summary:
            //      Resize this widget to the given dimensions.
            // tags:
            //      protected

            // make the grid 100% height
            if (this._grid) {
                var top = domGeometry.position(this._grid.domNode).y;
                var bodyHeight = domGeometry.position(window.body()).h;
                domStyle.set(this._grid.domNode, "height", (bodyHeight - top) + "px");
            }
        },

        _initialize: function () {
            // Enable/Disable search box by content provider search capability
            this.searchBox.set("disabled", !this.queryOptions.query.isSearchable);

            if (!this._grid) {
                this._grid = this._createGrid(this.store, this.queryOptions);
                domConstruct.place(this._grid.domNode, this.gridContainerNode);
            } else { // update _grid's store and query instead of creating new instance
                this._showStandby(true);
                if (this.queryOptions) {
                    this._grid.set("queryOptions", this.queryOptions.options);
                    this._grid.set("query", this.queryOptions.query);
                }
            }
            this.resize(); // grid data changed, so we need to update its height
        },

        _createGrid: function (store, queryOptions) {
            // summary:
            //      Creates and returns grid for displaying content.
            // tags:
            //      private

            var gridClass = declare([OnDemandGrid, DgridSelection, Keyboard, Formatter, ColumnResizer]);
            var grid = new gridClass({
                store: store,
                columns: {
                    name: Tree({
                        field: "name",
                        label: epi.resources.header.name,
                        renderCell: lang.hitch(this, this._renderTreeNode)
                    }),
                    removedOn: {
                        field: "deleted",
                        label: epi.resources.header.removed,
                        formatters: [this._localizeDate, GridMiscUtil.ellipsis]
                    },
                    by: {
                        field: "deletedBy",
                        label: epi.resources.header.by,
                        formatters: [this._createUserFriendlyUsername, GridMiscUtil.ellipsis]
                    },
                    action: { // Restore menu
                        label: " ",
                        formatter: this._renderActionMenu,
                        sortable: false
                    }
                },
                minWidth: 100,
                noDataMessage: this._getNoDataMessage(),
                selectionMode: "single"

            });

            // Set the zIndex to 500 so it appears under the withConfirmation dialog to make it possible for the user to empty the trash even though it still loads
            this._standby = new Standby({ target: grid.domNode, color: "#fff", zIndex: 500 }).placeAt(document.body);
            this._standby.startup();

            this.own(
                aspect.after(grid, "expand", function (target) {
                    var row = target.element ? target : grid.row(target),
                        container = query(row.element).parent()[0];

                    // In firefox, at the first time of expand in grid tree, container's height always smaller than its child.
                    // So that, on the first click to expand a node, nothing happenned.
                    // Clear container's height in order to make container take auto height in this case.
                    if (container) {
                        domStyle.set(container, "height", "");
                    }
                }, true)
            );

            aspect.after(grid, "_processScroll", lang.hitch(this, function () {
                this._showStandby(false);
            }));

            this._showStandby(true);

            // small hack here to remove noDataMessage when store has been notified that new content has been moved to Trash.
            // This should have been implemented in dgrid/List
            // TODO consider a better fix?
            aspect.before(grid, "adjustRowIndices", function (firstRow) {
                if (firstRow) {
                    array.forEach(query("div.dgrid-no-data", this.contentNode), function (div) {
                        html.set(div, "");
                    });
                }
            });

            aspect.around(grid, "insertRow", lang.hitch(this, this._aroundInsertRow));

            // Don't show collap/expand icon when searching
            aspect.before(grid, "renderArray", lang.hitch(this, function (results, beforeNode, options) {
                var querySearch = this.queryOptions.query;
                if (querySearch && querySearch.query === "searchdeletedcontent") {
                    results.map(function (object) {
                        if (object) {
                            object.hasChildren = false;
                        }
                    });
                }
            }));


            if (queryOptions) {
                grid.set("queryOptions", queryOptions.options);
                grid.set("query", queryOptions.query);
            }

            var mouseOverClass = "epi-dgrid-mouseover";
            grid.on(MouseUtil.enterRow, function (evt) {
                domClass.add(this, mouseOverClass); // add mouse over css class when hover a row
            });
            grid.on(MouseUtil.leaveRow, function (evt) {
                domClass.remove(this, mouseOverClass); // remove mouse over css class
            });

            grid.on(".epi-gridRestoreAction:click", lang.hitch(this, function (evt) { // on restore action clicking
                var row = grid.row(evt);
                this.emit("restoreItem", row);
            }));
            grid.on(".epi-gridDeleteAction:click", lang.hitch(this, function (evt) { // on delete action clicking
                var row = grid.row(evt);
                this.emit("deleteItem", row);
            }));

            // Handle ENTER key event for the restore action
            grid.on(".dgrid-column-action:keydown", lang.hitch(this, function (e) {
                if (e.keyCode === keys.ENTER && !e.shiftKey && !e.altKey && !e.ctrlKey) {
                    var row = grid.row(e);
                    this.emit("restoreItem", row);
                }
            }));

            return grid;
        },

        _renderTreeNode: function (object, data, td, options) {
            var title = GridMiscUtil.htmlEncode(formatters.title(data, object.contentLink, object.contentTypeName));

            if (object.thumbnailUrl) {
                domConstruct.create("img", {
                    src: object.thumbnailUrl + string.substitute("?${0}", [new Date().getTime()]),
                    "class": "epi-thumbnail"
                }, td);
                domConstruct.place(GridMiscUtil.ellipsis(GridMiscUtil.htmlEncode(data), title), td);
            } else {
                var iconNodeClass = TypeDescriptorManager.getValue(object.typeIdentifier, "iconClass") || "epi-iconObjectPage";
                domConstruct.place(GridMiscUtil.icon(iconNodeClass + " epi-objectIcon", GridMiscUtil.ellipsis(GridMiscUtil.htmlEncode(data), title)), td);
            }
        },

        _renderActionMenu: function (value) {
            // summary:
            //      Returns HTML string, represents the actions restore and delete
            // tags:
            //      private

            var restoreLink = lang.replace("<a class=\"epi-gridAction epi-gridRestoreAction epi-visibleLink\" title=\"{title}\">{label}</a>",
                { title: resources.restore.tooltip, label: resources.restore.label });

            var deleteLink = lang.replace("<a class=\"epi-gridAction epi-gridDeleteAction epi-visibleLink\" title=\"{title}\">{label}</a>",
                { title: resources.singledelete.tooltip, label: resources.singledelete.label });

            return restoreLink + deleteLink;
        },

        _localizeDate: function (value) {
            // summary:
            //      Returns localized, friendly date as string.
            // tags:
            //      private
            return epiDate.toUserFriendlyString(value);
        },

        _createUserFriendlyUsername: function (name) {
            // summary:
            //      Returns friendly user name as string.
            // tags:
            //      private
            return username.toUserFriendlyString(GridMiscUtil.htmlEncode(name));
        },

        _showStandby: function (visible) {
            // summary:
            //      Set standby visibility.
            // tags:
            //      private

            if (!this._standby) {
                return;
            }
            if (visible) {
                if (!this._standby.isVisible()) {
                    this._standby.show();
                }
            } else {
                this._standby.hide();
            }
        },

        _getNoDataMessage: function () {
            // summary:
            //      Get message in case have no data.
            // tags:
            //      private

            return "<span><span class=\"dijitReset dijitInline\">" + resources.trashitemempty + "</span></span>";
        },

        _aroundInsertRow: function (original) {
            // summary:
            //      Called 'around' the insertRow method to add more class for current row.
            // tags:
            //      protected

            return lang.hitch(this, function (object, parent, beforeNode, i, options) {

                // Call original method
                var row = original.apply(this._grid, arguments);

                if (object && object.thumbnailUrl) {
                    domClass.add(row, "epi-mediaContent");
                }

                return row;
            });
        }

    });

});
