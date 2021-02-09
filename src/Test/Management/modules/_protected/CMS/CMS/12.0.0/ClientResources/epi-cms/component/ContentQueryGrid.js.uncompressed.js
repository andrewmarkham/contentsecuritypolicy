define("epi-cms/component/ContentQueryGrid", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",

    "dojo/aspect",
    // epi-cms
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/widget/_GridWidgetBase"
],

function (
    declare,
    lang,
    when,

    aspect,
    // epi-cms
    ContentActionSupport,
    _GridWidgetBase
) {

    return declare([_GridWidgetBase], {
        // summary: This component will list the latest changed pages for the web site.
        //
        // tags:
        //      public

        // queryName: string
        //    The name of the content query used to fetch data for the grid.
        queryName: null,

        queryParameters: null,

        dndTypes: ["epi.cms.contentreference"],

        postMixInProperties: function () {
            // summary:
            //
            // tags:
            //    protected
            this.storeKeyName = "epi.cms.content.search";

            this.inherited(arguments);
        },

        buildRendering: function () {
            // summary:
            //		Construct the UI for this widget with this.domNode initialized as a dgrid.
            // tags:
            //		protected

            this.inherited(arguments);

            var gridSettings = lang.mixin({
                columns: {
                    name: {
                        renderCell: lang.hitch(this, this._renderContentItem)
                    },
                    status: {
                        className: "epi-width35",
                        renderCell: function (item, value, node, options) {
                            node.innerHTML = ContentActionSupport.getVersionStatus(value);
                        }
                    }
                },
                store: this.store,
                dndSourceType: this.dndTypes
            }, this.defaultGridMixin);

            this.grid = new this._gridClass(gridSettings, this.domNode);

            this.grid.set("showHeader", false);

            this.own(
                aspect.around(this.grid, "insertRow", lang.hitch(this, this._aroundInsertRow))
            );
        },

        fetchData: function () {

            when(this._getCurrentItem(), lang.hitch(this, function (currentItem) {
                this.set("currentItem", currentItem);
            }));

            this.grid.set("queryOptions", { ignore: ["query"], sort: [{ attribute: "name", descending: false }] });
            var queryParameters = this.queryParameters || {};
            queryParameters.query = this.queryName;
            this.grid.set("query", queryParameters);
        },

        _setQueryNameAttr: function (value) {
            this.queryName = value;
            this.fetchData();
        }
    });
});
