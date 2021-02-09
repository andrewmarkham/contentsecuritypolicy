require({cache:{
'url:epi-cms/project/templates/ProjectItemList.html':"<div class=\"epi-project-item-list\">\r\n    <div data-dojo-type=\"dijit/Toolbar\"\r\n         data-dojo-attach-point=\"toolbar\"\r\n         class=\"epi-project-item-list__toolbar epi-flatToolbar\">\r\n        <span data-dojo-attach-point=\"toolbarSection\"></span>\r\n    </div>\r\n    <div data-dojo-attach-point=\"listContainer\" class=\"epi-project-item-list__container\">\r\n        <div data-dojo-attach-point=\"notificationBarNode\" class=\"epi-notificationBar dijitHidden\">\r\n            <div class=\"epi-notificationBarItem\">\r\n                <div class=\"epi-notificationBarText\">\r\n                    <p data-dojo-attach-point=\"notificationTextNode\"></p>\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div data-dojo-attach-point=\"overlayNode\"\r\n             class=\"epi-project-item-list__dnd-area epi-visible-dnd-area epi-project-list-area__dnd-area--empty-list dijitHidden\">\r\n            <span class=\"epi-project-item-list__dnd-area-content\">${res.droptoadditems}</span>\r\n        </div>\r\n        <div data-dojo-attach-point=\"itemListNode\"\r\n             class=\"epi-card-list dgrid--centered-no-data-message\"></div\r\n        ><div data-dojo-attach-point=\"activitySection\"\r\n              class=\"epi-activity-section\"></div>\r\n    </div>\r\n</div>\r\n"}});
define("epi-cms/project/ProjectItemList", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/keys",
    "dojo/on",

    // dijit
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/_LayoutWidget",
    "dijit/_CssStateMixin",

    // dgrid
    "dgrid/Keyboard",
    "dgrid/OnDemandList",
    "dgrid/Selection",
    "dgrid/extensions/DijitRegistry",

    // epi
    "epi",
    "epi/shell/dnd/Target",
    "epi/shell/dgrid/Focusable",
    "epi/shell/dgrid/Formatter",
    "epi/shell/dgrid/Responsive",
    "epi/shell/widget/_FocusableMixin",
    "epi/shell/widget/_SectionedTemplatedMixin",
    "epi-cms/extension/events",
    "epi-cms/dgrid/listItemFormatters",
    "epi-cms/dgrid/WithContextMenu",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project",

    // template
    "dojo/text!./templates/ProjectItemList.html"
],
function (
// dojo
    declare,
    lang,
    aspect,
    domGeometry,
    domClass,
    keys,
    on,

    // dijit
    _WidgetsInTemplateMixin,
    _LayoutWidget,
    _CssStateMixin,

    // dgrid
    Keyboard,
    OnDemandList,
    Selection,
    DijitRegistry,

    // epi
    epi,
    Target,
    Focusable,
    Formatter,
    Responsive,
    _FocusableMixin,
    _SectionedTemplatedMixin,
    events,
    listItemFormatters,
    WithContextMenu,

    // Resources
    res,

    // template
    template
) {

    return declare([_LayoutWidget, _SectionedTemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _FocusableMixin], {
        // summary:
        //
        // tags:
        //      internal

        contentLanguage: null,

        commandProvider: null,

        dndEnabled: false,

        sections: ["toolbarSection", "listContainer", "activitySection"],

        templateString: template,

        // listItemType: [public] String
        //      What type of formatting to use from listItemFormatters
        listItemType: "card",

        res: res,

        _listClass: declare([OnDemandList, Formatter, Selection, Keyboard, WithContextMenu, DijitRegistry, Focusable, Responsive]),

        _list: null,

        _noDataMessageWrapper: "<span class=\"dgrid-no-data__content\">{0}</span>",

        buildRendering: function () {
            this.inherited(arguments);
            this._setupList();
        },

        focus: function () {
            // summary:
            //      Set focus to the project item list.
            // tags:
            //      public
            if (this._list) {
                this._list.focus();
            }
        },

        layout: function () {

            var toolbarHeight, size;

            if (!this._contentBox) {
                return;
            }

            toolbarHeight = domGeometry.getMarginBox(this.toolbar.domNode).h + domGeometry.getMarginBox(this.notificationBarNode).h;
            size = lang.mixin({}, this._contentBox, { h: this._contentBox.h - toolbarHeight });

            domGeometry.setMarginBox(this.listContainer, size);
            this._list.resize();
        },

        clearSelection: function () {
            // summary:
            //      Clears the selection in the list.
            // tags:
            //      public
            this._list.clearSelection();
            this.emit("selection-changed", { items: [] });
        },

        refresh: function () {
            // summary:
            //      Refreshes the item list
            // tags:
            //      public

            this._list.refresh({ keepScrollPosition: true });
        },

        setSelection: function (projectItems) {
            // summary:
            //      Sets the selection in the list and emit selection-chaged with the given project items
            // tags:
            //      public

            this.selectItems(projectItems);
            this.emit("selection-changed", { items: projectItems });
        },

        selectItems: function (projectItems) {
            // summary:
            //      Sets the selection in the list to the given project items.
            // tags:
            //      public

            this._list.clearSelection();
            projectItems.forEach(function (item) {
                this._list.select(item);
            }, this);
        },

        toggleActivities: function (visible) {
            domClass.toggle(this.domNode, "epi-project-item-list--activities-visible", visible);
        },

        updateQuery: function (store, query) {
            // summary:
            //      Updates query and store for the item list.
            // tags:
            //      public
            var messageText = !query && this.res.noquery ? this.res.noquery : this.res.nodata,
                message = lang.replace(this._noDataMessageWrapper, [messageText]);

            this._list.set("noDataMessage", message);

            // Don't refresh the data if neither the store nor the query has changed
            if (this._list.store !== store || !epi.areEqual(this._list.query, query)) {
                this._list.set("store", store, query);
            }
        },

        _setupList: function () {
            // summary:
            //    Setting up the list
            // tags:
            //    private

            var list, target;

            listItemFormatters.contentLanguage = this.contentLanguage;

            list = new this._listClass({
                formatters: listItemFormatters[this.listItemType],
                cleanEmptyObservers: false,
                commandCategory: "itemContext",
                deselectOnRefresh: false,
                farOffRemoval: Infinity,
                refocusOnRefresh: true,
                responsiveMap: {
                    "epi-card-list--narrow": 570
                }
            }, this.itemListNode);

            list.contextMenu.addProvider(this.commandSource);

            this.own(
                this._list = list,
                list.on("dgrid-cellfocusin, .dgrid-content:click", lang.hitch(this, function (evt) {
                    if (evt.target === list.contentNode) {
                        this.clearSelection();
                    }

                    var items = this._getSelectedItems(list);
                    this.emit("selection-changed", { items: items });
                })),
                list.on("dgrid-select, dgrid-deselect", lang.hitch(this, function (evt) {
                    var items = this._getSelectedItems(list);
                    this.emit("active-items-changed", { items: items });
                })),
                list.on(".dgrid-row:dblclick", lang.hitch(this, function (evt) {
                    var item = this._list.row(evt).data;
                    this.emit("itemaction", { item: item });
                })),
                list.addKeyHandler(keys.ENTER, lang.hitch(this, function (evt) {
                    var item = this._list.row(evt).data;
                    this.emit("itemaction", { item: item });
                })),
                list.on(on.selector(".dgrid-row", events.keys.del), lang.hitch(this, function (evt) {
                    var item = this._list.row(evt).data;
                    this.emit("itemremove", { item: item });
                })),
                target = new Target(this.overlayNode, {
                    createItemOnDrop: false,
                    allowMultipleItems: true,
                    accept: ["episerver.core.icontentdata.reference"]
                }),
                aspect.after(target, "onDropData", lang.hitch(this, this._onDropData), true)
            );
        },

        _getSelectedItems: function (list) {
            var items = [];
            Object.keys(list.selection).forEach(function (key) {
                if (list.selection[key]) {
                    var item = list.row(key).data;
                    items.push(item);
                }
            });
            return items;
        },

        _onDropData: function (dndItems) {
            var items = dndItems.map(function (item) {
                return item.data;
            });
            this.emit("itemsdropped", { items: items });
        },

        _setDndEnabledAttr: function (value) {
            this._set("dndEnabled", value);
            domClass.toggle(this.overlayNode, "dijitHidden", !value);
        },

        _setNotificationMessageAttr: function (value) {
            this.notificationTextNode.textContent = value;
            domClass.toggle(this.notificationBarNode, "dijitHidden", !value);
            this.layout();
        },

        _setSortOrderAttr: function (value) {
            //Set the sort if it has changed
            if (this._list.get("sort") !== value) {
                this._list.set("sort", value);
            }
        },

        _setContentLanguageAttr: function (value) {
            this._set("contentLanguage", value);
            listItemFormatters.contentLanguage = value;
        }
    });
});
