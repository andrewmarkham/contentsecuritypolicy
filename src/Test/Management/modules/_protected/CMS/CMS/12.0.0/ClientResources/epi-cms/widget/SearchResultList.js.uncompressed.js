require({cache:{
'url:epi-cms/widget/templates/SearchResultList.html':"﻿<div class=\"epi-searchResultList\">\r\n    <div data-dojo-attach-point=\"containerNode\">\r\n        <div data-dojo-attach-point=\"errorMessage\" class=\"epi-searchResultListEmptyMessage\"></div>\r\n    </div>\r\n    <div class=\"dijitReset epi-searchResultListNavigation\">\r\n        <div data-dojo-attach-point=\"previousButton\" role=\"option\"></div>\r\n        <div data-dojo-attach-point=\"nextButton\" role=\"option\"></div>\r\n    </div>\r\n</div>"}});
﻿define("epi-cms/widget/SearchResultList", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Evented",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",

    // Dojox
    "dojox/widget/Standby",

    // Dijit
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/form/_ListMouseMixin",
    "dijit/form/_ComboBoxMenuMixin",

    // EPi Framework
    "epi/dependency",
    "epi-cms/widget/_ContentListKeyMixin",
    "epi-cms/widget/_ContentListMouseMixin",
    "epi-cms/dgrid/formatters",
    "epi/shell/dgrid/Formatter",

    // DGrid
    "dgrid/OnDemandList",
    "dgrid/Selection",
    "dgrid/Keyboard",

    // Templates
    "dojo/text!./templates/SearchResultList.html"
],

function (
// Dojo
    declare,
    lang,
    Evented,
    domConstruct,
    domClass,
    domStyle,

    // Dojox
    Standby,

    // Dijit
    _WidgetBase,
    _TemplatedMixin,
    _ListMouseMixin,
    _ComboBoxMenuMixin,

    // EPi Framework
    dependency,
    _ContentListKeyMixin,
    _ContentListMouseMixin,
    formatters,
    Formatter,
    // DGrid
    OnDemandList,
    Selection,
    Keyboard,

    // Templates
    template
) {

    return declare([_WidgetBase, _TemplatedMixin, Evented, _ListMouseMixin, _ComboBoxMenuMixin, _ContentListKeyMixin, _ContentListMouseMixin], {
        // summary:
        //    A grid to display content list.
        //
        // tags:
        //    internal

        templateString: template,

        // _standby: Standby
        //      The standby object to indicate the loading process for grid.
        // tags:
        //      Protected
        _standby: null,

        // _messages: Object
        //		Holds "next" and "previous" text for paging buttons on drop down.
        _messages: { nextMessage: "", previousMessage: "" },

        postCreate: function () {
            // summary:
            //		Initialize grid for displaying content list.
            // tags:
            //      Protected
            this.inherited(arguments);

            var self = this,
                profile = dependency.resolve("epi.shell.Profile"),
                gridClass = declare([OnDemandList, Selection, Keyboard, Formatter]),
                // Get item's title
                titleSelector = function (item) {
                    return item.title;
                },
                // Get item's typeIdentifier
                iconSelector = function (item) {
                    return item.metadata.typeIdentifier;
                },
                // Get item's thumbnail url
                thumbnailSelector = function (item) {
                    var container = self.grid.domNode,
                        thumbnailClass = "epi-thumbnailContentList";

                    (item.metadata.thumbnailUrl && !domClass.contains(container, thumbnailClass)) && domClass.add(container, thumbnailClass);

                    return item.metadata.thumbnailUrl;
                },
                languageSelector = function (item) {
                    if (item.metadata && item.metadata.languageBranch !== profile.contentLanguage) {
                        return { language: item.metadata.languageBranch };
                    }
                };

            this.grid = new gridClass({
                formatters: [formatters.contentItemFactory("title", titleSelector, iconSelector, null, thumbnailSelector, languageSelector, false)],
                selectionMode: "single", // for Selection; only select a single row at a time
                cellNavigation: false // for Keyboard; allow only row-level keyboard navigation
            });

            // Hide header of the grid
            this.grid.set("showHeader", false);

            domConstruct.place(this.grid.domNode, this.containerNode);

            // trigger onSelect event when clicking on grid row
            this.grid.on(".dgrid-row:click", lang.hitch(this, function (event) {
                var row = this.grid.row(event);
                if (row) {
                    this._onSelect(row.data);
                }
            }));

            this._standby = new Standby({ target: this.domNode, color: "#fff" }).placeAt(document.body);
            this.own(this._standby);

            // assign the grid container as containerNode, so _ListMouseMixin and _ComboBoxMenuMixin can get the properly container
            this.containerNode = this._getGridContainer();
        },

        startup: function () {
            // summary:
            //		handle processing after any DOM fragments have been actually added to the document.
            // tags:
            //      Protected
            this.inherited(arguments);
            this._standby.startup();
        },

        showStandby: function (show) {
            // summary:
            //		Set standby visibility.
            // tags:
            //      Protected

            if (!this._standby) {
                return;
            }
            if (show) {
                if (!this._standby.isVisible()) {
                    this._standby.show();
                }
            } else {
                this._standby.hide();
            }
        },

        showGrid: function (show) {
            // summary:
            //		Set grid visibility.
            // tags:
            //      Protected
            domStyle.set(this.grid.domNode, "display", show ? "block" : "none");
        },

        _onSelect: function (value) {
            // summary:
            //		Emit onSelect event when an item has been selected.
            // tags:
            //      Private
            this.emit("select", value);
        },

        _getGridContainer: function () {
            // summary:
            //		Returns the grid container, which contains grid rows.
            // tags:
            //      Private
            return this.grid.contentNode;
        },

        createOptions: function (results, options, labelFunc) {
            // summary:
            //		Fills in the items in the list
            // results:
            //		Array of items
            // options:
            //		The options to the query function of the store
            //
            // labelFunc:
            //		Function to produce a label in the drop down list from a dojo/data item

            this.grid.renderArray(results);
            return this.containerNode.childNodes;
        },

        clearResultList: function () {
            // summary:
            //		Clears the entries in the list.

            this.grid.refresh();
        },

        getHighlightedOption: function () {
            // summary:
            //		This will be used to highlight the text in the textbox, to allow screen readers to know what is happening in the menu.
            //      Return null since we don't want this feature.

            return null;
        },

        showErrorMessage: function (show, message) {
            // summary:
            //		Set error message visibility.
            // tags:
            //      Protected

            this.clearResultList();
            this.showStandby(false);
            if (show && message) {
                this.errorMessage.innerHTML = message;
            }
            domStyle.set(this.errorMessage, "display", show ? "block" : "none");
        }
    });
});
