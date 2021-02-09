define("epi-cms/component/ContextHistory", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",

    // EPi Framework
    "epi/dependency",
    "epi/UriParser",

    // EPi CMS
    "epi-cms/ApplicationSettings",
    "epi-cms/core/ContentReference",
    "epi-cms/widget/_GridWidgetBase"
], function (
// Dojo
    array,
    declare,
    lang,
    topic,

    // EPi Framework
    dependency,
    UriParser,

    // EPi CMS
    ApplicationSettings,
    ContentReference,
    _GridWidgetBase
) {

    return declare([_GridWidgetBase], {
        // summary:
        //      This component will list the latest changed pages for the web site.
        //      This is currently bound to handle only "content" but could be generalized to handle any content that has a name and an URI.
        //
        // tags:
        //      public

        // ignoreVersionWhenComparingLinks: [public] Boolean
        //      Use version when compare uris or not. That inherited from _ContentContextMixin.
        ignoreVersionWhenComparingLinks: false,

        // sort: [private] String
        //    Default sort parameter name.
        _sort: "dateAdded",

        postMixInProperties: function () {
            // summary:
            //
            // tags:
            //    protected
            this.inherited(arguments);

            this.store = this.store || dependency.resolve("epi.shell.ContextHistory").store;
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
                    }
                },
                store: this.store,
                selectionMode: "single",
                dndFormatSuffix: this.dndFormatSuffix,
                sort: this._sort
            }, this.defaultGridMixin);

            this.grid = new this._gridClass(gridSettings, this.domNode);

            this.grid.set("showHeader", false);
        },

        postCreate: function () {
            // summary:
            //      The widget ready, listen event or do something
            // tags:
            //      public virtual

            this.inherited(arguments);

            // Listen event when trash is empty
            this.own(
                topic.subscribe("/epi/cms/trash/empty", lang.hitch(this, function (deletedContents) {
                    if (deletedContents) {
                        deletedContents.forEach(function (contentRef) {
                            this.store.remove("epi.cms.contentdata:///" + contentRef);
                        }, this);
                    }
                }))
            );
        },

        startup: function () {
            // summary: Overridden to connect a store to a DataGrid.

            this.inherited(arguments);
            this.fetchData();
        },

        _dndNodeCreator: function (item, hint) {
            // summary:
            //      Custom DnD avatar creator method

            var originalResults = this.inherited(arguments);

            //Since we currently only handle content data we can add an additional contentLink property
            //to the data since it specifies type to be content data.
            originalResults.data.contentLink = new UriParser(originalResults.data.uri).getId();

            return originalResults;
        },

        contextChanged: function () {
            // summary:
            //      Override base in order to call set every time we get a context change.

            this.inherited(arguments);
            this.grid.set("sort", this._sort, true);
        },

        fetchData: function () {
            var wasteBasketId = ApplicationSettings.wastebasketPage;

            // We need to filter the wastebasket. We do so by adding a regex to ignore it. The regex says the following:
            // uri must start with epi.cms.contentdata:///
            // followed by either any single digit except the waste basket id, or two or more digits.
            this.grid.set("query", { uri: new RegExp("epi\\.cms\\.contentdata:///([^" + wasteBasketId + "]|\\d{2,})") });
            this.grid.set("sort", this._sort, true);
        }
    });
});
