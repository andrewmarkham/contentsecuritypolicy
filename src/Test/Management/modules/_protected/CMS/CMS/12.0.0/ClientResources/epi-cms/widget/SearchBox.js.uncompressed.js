define("epi-cms/widget/SearchBox", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/connect",
    "dojo/_base/json",
    "dojo/_base/lang",
    "dojo/when",

    "dojo/dom-construct",

    // Dijit
    "dijit/_Widget",

    // EPi Framework
    "epi/shell/SearchManager",

    // EPi CMS
    "epi-cms/widget/ContentSearchBox"
],

function (
// Dojo
    declare,
    connect,
    json,
    lang,
    when,

    domConstruct,

    // Dijit
    _Widget,

    // EPi Framework
    SearchManager,

    // EPi CMS
    ContentSearchBox
) {

    return declare([_Widget], {
        // summary:
        //    A composite widget, which wrap the ContentSearchBox, for setting up the search box.
        //
        // tags:
        //    internal

        // area: [protected] String
        //      Search area to search.
        area: null,

        // searchRoots: [protected] String
        //      Optional comma separated list of roots to search.
        searchRoots: null,

        // filterOnCulture: [protected] Boolean
        //      Flag to set if search results should be filtered on culture. Default value is true.
        filterOnCulture: null,

        // triggerContextChange: [public] Boolean
        //      If [true] will cause a contextChange topic to be published.
        triggerContextChange: true,

        // _searchBox: [private] ContentSearchBox
        //      Content search box widget.
        _searchBox: null,

        // _searchManager: [private] SearchManager
        //      Content search manager.
        _searchManager: null,

        // innerSearchBoxClass: [public] String
        //      CSS class for the inner ContentSearchBox
        innerSearchBoxClass: "",

        parameters: null,

        postCreate: function () {
            // summary:
            //      Add and setup search box
            // tags:
            //      protected
            this.inherited(arguments);

            this._searchManager = new SearchManager();
            when(this._searchManager.getStore(), lang.hitch(this, function (store) {
                this._searchBox = new ContentSearchBox({
                    baseClass: this.innerSearchBoxClass,
                    searchAttr: "searchQuery",
                    store: store
                });

                var parameters = lang.mixin({ filterOnDeleted: true }, this.parameters);
                lang.mixin(this._searchBox.query, { parameters: json.toJson(parameters) });

                // Event onSelect of search box
                this._searchBox.on("select", lang.hitch(this, function (value) {
                    // Set blank value for textbox
                    this._searchBox.set("value", "");
                    this._searchBox.focus();
                    this._searchBox.toggleClearButton();
                    this.onItemAction(value);
                }));
                //search results show contents in all languages
                this.set("filterOnCulture", false);
                // add search box to DOM
                domConstruct.place(this._searchBox.domNode, this.domNode);
            }));
        },

        _setAreaAttr: function (value) {
            this._set("area", value);
            if (this._searchBox) {
                // get query for current search area
                when(this._searchManager.getProviderQuery(value), lang.hitch(this, function (query) {
                    lang.mixin(this._searchBox.query, query);
                }));
            }
        },

        _setSearchRootsAttr: function (value) {
            this._set("searchRoots", value);
            if (this._searchBox) {
                lang.mixin(this._searchBox.query, { searchRoots: value });
            }
        },

        _setFilterOnCultureAttr: function (value) {
            this._set("filterOnCulture", value);
            if (this._searchBox) {
                lang.mixin(this._searchBox.query, { filterOnCulture: value });
            }
        },

        onItemAction: function (item) {
            // summary:
            //      Trigger the context change event when an item has been selected in search box.
            // tags:
            //      callback

            if (this.triggerContextChange) {
                var contextParameters = { uri: "epi.cms.contentdata:///" + item.metadata.id };
                if (item.metadata.isUntranslatedContent === "false") {
                    contextParameters.epslanguage = item.metadata.languageBranch;
                }
                connect.publish("/epi/shell/context/request", [contextParameters, { sender: null }]);
            }
        }
    });
});
