define("epi-cms/widget/ContentList", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/connect", // To use isCopyKey()
    "dojo/_base/lang",

    "dojo/dom-class",
    "dojo/dom-construct",

    "dojo/aspect",
    "dojo/Evented",
    "dojo/keys",
    "dojo/on",

    // dgrid
    "dgrid/Keyboard",
    "dgrid/OnDemandList",
    "dgrid/Selection",
    // dojox
    "dojox/html/entities",
    // epi
    "epi/epi",

    "epi/shell/dgrid/Formatter",
    "epi/shell/dgrid/selection/Extensions",
    "epi/shell/TypeDescriptorManager",

    "epi/shell/widget/_FocusableMixin",

    "epi-cms/core/ContentReference",

    "epi-cms/dgrid/formatters",
    "epi-cms/dgrid/DnD",
    "epi-cms/dgrid/WithContextMenu",

    "epi-cms/widget/ReadOnlyContentList"
],

function (
// dojo
    declare,
    connect,
    lang,

    domClass,
    domConstruct,

    aspect,
    Evented,
    keys,
    on,

    // dgrid
    Keyboard,
    OnDemandList,
    Selection,
    // dojox
    htmlEntities,
    // epi
    epi,

    Formatter,
    SelectionExtensions,
    TypeDescriptorManager,

    _FocusableMixin,

    ContentReference,

    formatters,
    DnD,
    WithContextMenu,

    ReadOnlyContentList
) {

    return declare([ReadOnlyContentList, _FocusableMixin, Evented], {
        // summary:
        //      Base class for lists for different content.
        // description:
        //      This is a base class that can be used to quickly create a list.
        // tags:
        //      public

        // _gridClass: [private] Object
        //      Content grid class declaration
        _gridClass: declare([OnDemandList, Formatter, Selection, SelectionExtensions, DnD, Keyboard, WithContextMenu]),

        // resources: [public] Object
        //      Public resources for grid content list
        resources: "",

        // noDataMessage: [public] String
        //      No data message text for grid content list incase it has no data to display
        noDataMessage: null,

        // editingItem: [public] dojo/data/Item
        //      Keeps the selected content information
        editingItem: null,

        postCreate: function () {

            this.inherited(arguments);

            domClass.add(this.domNode, "epi-contentList");
        },

        _setCurrentItemAttr: function (/*dojo/data/Item*/value) {
            // summary:
            //      Store the selected content information on the first load
            // value: [dojo/data/Item]
            // tags:
            //      protected

            if (!this.get("editingItem")) {
                this.set("editingItem", value);
            }

            this._set("currentItem", value);
            this.select(value);
        },

        _setNoDataMessageAttr: function (/*String*/value) {
            // summary:
            //      Set text message for grid content list incase it has no data.
            // value: [String]
            //      No data message text
            // tags:
            //      protected

            this.noDataMessage = value;
            this.grid.set("noDataMessage", value);
        },

        _dndNodeCreator: function (/*dojo/data/Item*/item, hint) {
            // summary:
            //      Custom DnD avatar creator method
            // item: [dojo/data/Item]
            // hint: [String]
            // tags:
            //      private

            var dndTypes = TypeDescriptorManager.getAndConcatenateValues(item.typeIdentifier, "dndTypes");
            if (!dndTypes && this.dndTypes) {
                dndTypes = this.dndTypes;
            }

            return {
                node: domConstruct.create("div").appendChild(document.createTextNode(item.name)),
                type: dndTypes,
                data: item
            };
        },

        getListSettings: function () {
            // summary:
            //      Initialization a list.
            // tags:
            //      protected, extension

            var menu = {
                hasMenu: !!this.contextMenu,
                settings: {
                    title: epi.resources.action.options
                }
            };

            // Init content list
            return lang.delegate(this._getBaseSettings(menu), {
                noDataMessage: this.noDataMessage,
                dndParams: {
                    copyOnly: true,
                    selfAccept: false,
                    accept: [],
                    creator: lang.hitch(this, this._dndNodeCreator)
                }
            });
        },

        setupEvents: function () {
            // summary:
            //      Initialization events on list.
            // tags:
            //      protected

            this.inherited(arguments);

            this.own(
                aspect.around(this.grid, "insertRow", lang.hitch(this, this._aroundInsertRow)),
                this.grid.on("dgrid-contextmenu", lang.hitch(this, "_itemSelected"))
            );
            this._bindKeys();
        },

        _bindKeys: function () {
            // summary:
            //      Setup key shortcuts for the list
            // tags:
            //      private

            var self = this;
            function addControlKeyHandler(key, eventName, eventValue, skipCtrlCheck) {
                return self.grid.addKeyHandler(key, function (e) {
                    if (skipCtrlCheck || connect.isCopyKey(e)) {
                        e.preventDefault();
                        eventValue ? self.emit(eventName, eventValue) : self.emit(eventName);
                    }
                });
            }

            this.own(
                addControlKeyHandler("C".charCodeAt(0), "copyOrCut", true),
                addControlKeyHandler("X".charCodeAt(0), "copyOrCut", false),
                addControlKeyHandler("V".charCodeAt(0), "paste"),
                addControlKeyHandler(keys.DELETE, "delete", undefined, true)
            );
        },

        _onSelect: function (/*Event*/evt) {
            // summary:
            //      Emit selected event
            // evt: [Event]
            //      Select event of the grid
            // tags:
            //      private

            this.inherited(arguments);

            if (this.grid.selectionMode === "single" && evt.rows[0].data) {
                this._itemSelected(evt.rows[0].element);
            }
        },

        _itemSelected: function (element) {
            var row = this.grid.row(element);
            this.emit("itemSelected", row.data);
        },

        editContent: function (/*dojo/data/Item*/item) {
            // summary:
            //      Enable editing mode for the given content
            // item: [dojo/data/Item]
            //      Content that wanted to edit
            // tags:
            //      public

            // Do nothing if we do not found the given content in the grid
            if (!item || !this.grid.row(item).element) {
                return;
            }

            this.emit("itemAction", item);

            // After the selected content loaded, save its information
            this.set("editingItem", this.currentItem);
        },

        editSelectedContent: function () {
            // summary:
            //      Enable editing mode for the currently selected content
            // tags:
            //      internal

            var selectedRow = this.grid.getFirstSelectedRow();
            if (!selectedRow) {
                return;
            }

            this.editContent(selectedRow.data);
        },

        _onChangeContext: function (evt) {
            // summary:
            //      Go to content edit mode when change context event raised
            // evt: [Event]
            //      The click event that caused the change context.
            // tags:
            //      public

            // Refocus the grid after refreshing the content to ensure that the focus
            // does not end up in neverland.
            var grid = this.grid;
            on.once(grid.domNode, "dgrid-refresh-complete", function (evt) {
                grid.focus(grid.getFirstSelectedRow());
            });

            this.editContent(grid.row(evt).data);
        },

        toggleCut: function (/*dojo/data/Item*/item, /*Boolean*/isCut) {
            // summary:
            //      Toggle cutting styles for the given item in the grid content list
            // item: [dojo/data/Item]
            // isCut: [Boolean]
            // tags:
            //      public

            var row;
            if (item) {
                row = this.grid.row(ContentReference.toContentReference(item.contentLink).id);
                if (row && row.element) {
                    domClass.toggle(row.element, "epi-opacity50", isCut);
                }
            }
        }

    });

});
