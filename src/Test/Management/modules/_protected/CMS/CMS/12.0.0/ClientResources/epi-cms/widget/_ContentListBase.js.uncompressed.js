define("epi-cms/widget/_ContentListBase", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/when",
    "./_GridWidgetBase"
], function (
    declare,
    lang,
    domConstruct,
    domGeometry,
    when,
    _GridWidgetBase) {
    return declare([_GridWidgetBase], {
        // tags:
        //      internal

        storeKeyName: "epi.cms.content.search",

        trackActiveItem: false,

        gridAttachNode: null,

        // _defaultGridNode: [private] DOMNode
        //      Reference to the node where the grid is attached when no gridAttachNode is configured.
        _defaultGridNode: null,

        // contextChangeEvent: [public] String
        //      Configure double click on a row to cause a context change.
        contextChangeEvent: "dblclick",

        postMixInProperties: function () {
            this.inherited(arguments);
            this.model = this.model || this.createModel();
        },

        postCreate: function () {
            // summary:
            //      Construct the UI for this widget.
            // tags:
            //      protected

            this.inherited(arguments);
            this.createList();
        },

        createModel: function () {
            // summary:
            //      Override to construct the default model for the list and context menu.
            // tags:
            //      protected
        },

        createList: function () {
            // summary:
            //      Creates the list for this widget.
            // tags:
            //      protected

            var settings = this.getListSettings();
            settings = lang.mixin(settings, this.defaultGridMixin);

            // Need a separate element for the grid in case it behaves like a widget and adds itself to dijit/registry.
            // See dgrid/extensions/DijitRegistry.
            if (!this.gridAttachNode) {
                this._defaultGridNode = domConstruct.create("div", null, this.domNode);
            }
            this.grid = new this._gridClass(settings, this.gridAttachNode || this._defaultGridNode);

            var hasModelWithCommands = this.model && this.model.commands && this.model.commands.length > 0;
            if (hasModelWithCommands) {
                this.grid.contextMenu.addProvider(this.model);
            }
            if (this.contextMenu) {
                this.grid.contextMenu = this.contextMenu;
            }

            this.own(this.grid);
            this.setupEvents();
        },

        layout: function () {
            // summary:
            //      Overridden to resize the _defaultGridNode

            // Need to resize the default grid node to the size of our domNode,
            // but if gridAttachNode was supplied then let whoever supplied it
            // be responsible for resizing.
            this.inherited(arguments);
            if (this._defaultGridNode) {
                domGeometry.setMarginBox(this._defaultGridNode, this._contentBox);
            }
        },

        getListSettings: function () {
            // summary:
            //      Override to specify the settings used to create the list.
            // tags:
            //      protected

            return {};
        },

        setupEvents: function () {
            // summary:
            //      Initialization of events on the list.
            // tags:
            //      protected, extension
        },

        onContextChanged: function () {
            //Disable default triggering of fetchData.
        },

        _onSelect: function (e) {

            when(this.getCurrentContext(), lang.hitch(this, function (currentContext) {

                var grid = this.grid;
                var model = {
                    contextId: currentContext.id,
                    data: []
                };

                if (this.model) {
                    for (var id in grid.selection) {
                        if (grid.selection[id]) {
                            var row = grid.row(id);
                            model.data.push(row.data);
                        }
                    }

                    this.model.set("model", model);
                }
            }));
        }
    });
});
