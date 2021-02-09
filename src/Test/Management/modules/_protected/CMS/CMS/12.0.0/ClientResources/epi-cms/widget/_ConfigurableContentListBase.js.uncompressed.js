require({cache:{
'url:epi-cms/widget/templates/_ConfigurableContentListBase.html':"﻿<div>\r\n    <div data-dojo-attach-point=\"toolbar\" data-dojo-type=\"epi-cms/contentediting/StandardToolbar\" class=\"epi-viewHeaderContainer epi-localToolbar\"></div>\r\n    <div data-dojo-attach-point=\"gridNode\"></div>\r\n</div>"}});
﻿define("epi-cms/widget/_ConfigurableContentListBase", [
// Dojo
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-geometry",

    // Dijit
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

    // Dgrid
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dgrid/extensions/ColumnResizer",

    // epi
    "epi",
    "epi/shell/dgrid/Formatter",
    "epi/shell/dgrid/Keyboard", // in order to support short cut key for cut, copy and paste action on grid

    // EPi CMS
    "epi-cms/dgrid/DnD",
    "epi-cms/dgrid/formatters",
    "epi-cms/dgrid/WithContextMenu",
    "epi-cms/widget/_ContentListBase",

    // Resources
    "dojo/text!./templates/_ConfigurableContentListBase.html",

    // Widgets in the template
    "epi-cms/contentediting/StandardToolbar"
], function (
// Dojo
    dojo,
    declare,
    lang,
    domGeometry,

    // Dijit
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    // Dgrid
    OnDemandGrid,
    Selection,
    ColumnResizer,

    // epi
    epi,
    Formatter,
    Keyboard,

    // EPi CMS
    DnD,
    formatters,
    WithContextMenu,
    _ContentListBase,

    // Resources
    template) {

    return declare([_ContentListBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //    Base class for lists with different column needs
        // description:
        //    This is a base class that can be used to quickly create a list with different columns.
        // tags:
        //    public

        _gridClass: declare([OnDemandGrid, Formatter, Selection, DnD, Keyboard, WithContextMenu, ColumnResizer]),

        templateString: template,

        postCreate: function () {
            //need to set gridAttachNode before this.inherited because it's used in the base class
            this.gridAttachNode = this.gridNode;
            this.inherited(arguments);
        },

        getListSettings: function () {
            var columnSettings = this.getColumnSettings();
            var hasModelWithCommands = this.model && this.model.commands && this.model.commands.length > 0;

            if (hasModelWithCommands) {
                //mixin the context menu column last.
                columnSettings = lang.mixin(columnSettings, {
                    contextMenu: {
                        renderHeaderCell: function (node) {},
                        formatter: function () {
                            return formatters.menu({
                                title: epi.resources.action.options
                            });
                        },
                        className: "epi-columnNarrow",
                        sortable: false
                    }
                });
            }
            return {
                columns: columnSettings,
                store: this.store
            };
        },

        getColumnSettings: function () {
            // summary:
            //      Override to create the column settings for the grid.
            // tags:
            //      protected
        },

        _onChangeContext: function (e) {
            var row = this.grid.row(e);
            if (row) {
                this._requestNewContext({ uri: row.data.uri }, { sender: this });
            }
        },

        resize: function (changeSize) {
            this.inherited(arguments);

            if (changeSize) {
                var height = changeSize.h - domGeometry.getMarginBox(this.toolbar.domNode).h;
                domGeometry.setContentSize(this.gridNode, { h: height });
            }
        },

        updateView: function (data, context) {
            // summary:
            //		This is called when the context has changed.
            // tags:
            //		public

            this.toolbar.update({
                currentContext: context,
                viewConfigurations: {
                    availableViews: data.availableViews,
                    viewName: data.viewName
                }
            });

            this.fetchData(context);
        }
    });
});
