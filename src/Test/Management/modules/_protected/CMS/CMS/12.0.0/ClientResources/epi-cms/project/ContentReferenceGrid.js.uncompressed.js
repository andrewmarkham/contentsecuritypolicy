require({cache:{
'url:epi-cms/project/templates/ContentReferenceGrid.html':"<div class=\"epi-contentReferences\">\r\n    <div data-dojo-attach-point=\"notificationBar\" class=\"dijitHidden epi-notificationBar epi-notificationBarWithBorders epi-notificationBarItem\">\r\n        <div data-dojo-attach-point=\"notificationNode\" class=\"epi-notificationBarText\"></div>\r\n    </div>\r\n    <div class=\"epi-captionPanel\" data-dojo-attach-point=\"captionPanelNode\">\r\n        <strong data-dojo-attach-point=\"resultSummaryNode\"></strong>\r\n        <div class=\"epi-floatRight\">\r\n            <button class=\"epi-chromelessButton\"\r\n                    data-dojo-type=\"dijit/form/Button\"\r\n                    data-dojo-attach-event=\"onClick:_refresh\"\r\n                    data-dojo-props=\"iconClass:'epi-iconReload'\">${res.buttons.refresh}</button>\r\n        </div>\r\n    </div>\r\n    <div data-dojo-attach-point=\"gridNode\"></div>\r\n</div>\r\n"}});
define("epi-cms/project/ContentReferenceGrid", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/keys",
    "dojo/on",
    "dojo/when",

    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

    "dgrid/OnDemandGrid",
    "dgrid/Keyboard",
    "dgrid/Selection",

    "epi/shell/dgrid/Formatter",



    "epi/shell/widget/_ModelBindingMixin",

    "dojo/text!./templates/ContentReferenceGrid.html",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentreferences",

    "dijit/form/Button"

], function (
    declare,
    lang,
    domClass,
    keys,
    on,
    when,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    OnDemandGrid,
    Keyboard,
    Selection,

    Formatter,
    _ModelBindingMixin,
    template,
    resources
) {

    // Helper function to set a property on the grid
    function setGridProperty(prop) {
        return function (value) {
            if (this._grid) {
                this._grid.set(prop, value);
            }
        };
    }

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      A grid with a notification area, refresh button and a short summary of the shown items.
        // description:
        //      A composite widget consisting of a dgrid with a refresh button and summary node
        //      describing the loaded items. A notification area is also rendered above the grid,
        //      but only visible when the notificationText property is non-empty.
        //      The event 'contentreferencegrid-loading-complete' will be emitted once the grid
        //      has completed loading content
        // tags:
        //      internal

        res: resources,

        templateString: template,

        // model: [public] epi-cms/project/ContentReferenceGridModel
        //      The view model containing column and store configuration.
        model: null,

        // _gridClass: [private]
        _gridClass: declare([OnDemandGrid, Keyboard, Selection, Formatter]),

        // _grid: [private]
        //      The grid instance
        _grid: null,

        // _loadCompleteEmitted: [private] Boolean
        //      A flag indicating if the initial loading complete event has been emitted
        _loadCompleteEmitted: false,

        // modelBindingMap: [protected] Object
        //      The model binding configuration
        modelBindingMap: {
            query: ["query"],
            store: ["store"],
            columns: ["columns"],
            notificationText: ["notificationText"],
            resultSummary: ["resultSummary"]
        },

        _setResultSummaryAttr: { node: "resultSummaryNode", type: "innerText" },
        _setQueryAttr: setGridProperty("query"),
        _setColumnsAttr: setGridProperty("columns"),
        _setStoreAttr: setGridProperty("store"),

        _setNotificationTextAttr: function (text) {
            // summary:
            //      Sets the text in the notification area and toggles its visibility based the text content.
            //      If the notificationText is null opr empty the notification area is hidden.

            var showNotification = text && text.length;
            domClass.toggle(this.notificationBar, "dijitHidden", !showNotification);
            this.notificationNode.textContent = text || "";
        },

        _onRowClicked: function (e) {
            // summary:
            //      Called when the an a tag is clicked in the grid or when enter or space is pressed on a grid row
            // tags:
            //      private

            if (this.model && typeof this.model.onItemClicked === "function") {
                var data = this._grid.row(e).data;
                this.model.onItemClicked(data);
            }
        },

        buildRendering: function () {
            // summary:
            //      Overridden to create and configure the grid from the model

            this.inherited(arguments);

            var columns = this.model && this.model.get("columns");

            this._grid = new this._gridClass({
                "class": "epi-plain-grid epi-plain-grid--no-border epi-plain-grid--no-header epi-plain-grid--margin-bottom",
                columns: columns,
                showHeader: false,
                cellNavigation: false,
                selectionMode: "single"
            }, this.gridNode);

            this._grid.addKeyHandler(keys.ENTER, lang.hitch(this, "_onRowClicked"));
            this._grid.addKeyHandler(keys.SPACE, lang.hitch(this, "_onRowClicked"));
            this._grid.on(".dgrid-cell a:click", lang.hitch(this, "_onRowClicked"));

            this.own(
                this._grid,
                on(this._grid, "dgrid-refresh-complete", lang.hitch(this, "_onGridRefreshComplete"))
            );
        },

        startup: function () {
            this.inherited(arguments);
            this._grid.startup();
            if (!this._grid.store) {
                // When no store is configured the grid won't load anything when started
                this._emitLoadComplete();
            }
        },

        _onGridRefreshComplete: function (data) {
            // summary:
            //      Called to update the totalItems property on the model when the grid has queried the store
            // tags:
            //      private

            var results = data.results;
            when(results.total, lang.hitch(this, function (total) {
                this.model.set("totalItems", total);
                this._emitLoadComplete();
            }));
        },

        _emitLoadComplete: function () {
            // summary:
            //      Emit a contentreferencegrid-loading-complete event if it hasn't been emitted

            if (!this._loadCompleteEmitted) {
                this.emit("contentreferencegrid-loading-complete", {});
                this._loadCompleteEmitted = true;
            }
        },

        _refresh: function () {
            // summary:
            //      Calls refresh on the inner grid
            // tags:
            //      private

            this._grid.refresh();
        }
    });
});
