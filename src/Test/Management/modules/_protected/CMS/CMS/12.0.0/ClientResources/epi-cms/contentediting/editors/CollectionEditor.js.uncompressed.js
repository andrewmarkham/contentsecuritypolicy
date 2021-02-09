require({cache:{
'url:epi-cms/contentediting/editors/templates/CollectionEditor.html':"﻿<div class=\"dijitInline\">\r\n    <div class=\"command-area\"><div data-dojo-attach-point=\"commandTargetNode\"></div></div>\r\n    <div data-dojo-attach-point=\"gridNode\"></div>\r\n</div>"}});
define("epi-cms/contentediting/editors/CollectionEditor", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/json",
    "dojo/on",
    "dojo/Stateful",
    "dojo/when",

    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_Widget",

    // dgrid
    "dgrid/Keyboard",
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dgrid/extensions/ColumnResizer",
    "dgrid/extensions/ColumnReorder",
    "put-selector/put",

    // epi shell
    "epi/shell/dgrid/Formatter",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/FormContainer",
    "epi/string",
    "epi/shell/command/withConfirmation",

    // epi cms
    "epi-cms/contentediting/editors/model/CollectionEditorModel",
    "epi-cms/contentediting/editors/model/CollectionEditorItemModel",
    "epi-cms/contentediting/_EditorWrapperBase",
    "epi-cms/dgrid/DnD",
    "epi-cms/dgrid/formatters",
    "epi-cms/dgrid/WithContextMenu",
    "epi-cms/contentediting/editors/DefaultGridAssembler",
    "./_AddItemDialogMixin",

    // resources
    "dojo/text!./templates/CollectionEditor.html",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.collectioneditor"
],
function (
// dojo
    array,
    declare,
    lang,

    aspect,
    domConstruct,
    domClass,
    json,
    on,
    Stateful,
    when,

    // dijit
    _TemplatedMixin,
    _Widget,

    // dgrid
    Keyboard,
    OnDemandGrid,
    Selection,
    ColumnResizer,
    ColumnReorder,
    put,

    // epi shell
    Formatter,
    _ModelBindingMixin,
    FormContainer,
    epiString,
    withConfirmation,

    // epi cms
    CollectionEditorModel,
    CollectionEditorItemModel,
    _EditorWrapperBase,
    DnD,
    formatters,
    WithContextMenu,
    DefaultGridAssembler,
    _AddItemDialogMixin,

    // resources
    template,
    resources
) {
    return declare([_Widget, _TemplatedMixin, _ModelBindingMixin, _AddItemDialogMixin], {
        // tags:
        //      public

        // templateString: String
        //      The widget's template.
        templateString: template,

        // multiple: Boolean
        //      Indicates that the widget's value is array-like.
        multiple: true,

        // baseClass: String
        //      The widget's base css class.
        baseClass: "epi-collection-editor",

        // value: Array
        //      The widget's value.
        value: null,

        // model: epi-cms/contentediting/editors/CollectionEditor
        //      The widget's model.
        model: null,

        // modelType: Function
        //      The widget's model class. By default it is epi-cms/contentediting/editors/model/CollectionEditorModel
        modelType: CollectionEditorModel,

        // itemType: String
        //      The collection item type on the server. This is used to retrieve item metadata.
        itemType: null,

        // generateColumn: Boolean
        //      Indicates that grid columns definition should be generated from item type's metadata.
        generateColumns: true,

        // excludedColumns: Array
        //      List of columns those are excluded from generated columns
        excludedColumns: null,

        // includedColumns: Array
        //      List of columns which are configured to assemble the grid.
        includedColumns: null,

        // gridType: Function
        //      The grid class. By default it is OnDemandGrid with Formatter, Selection, Keyboard, and DnD supports.
        gridType: declare([OnDemandGrid, Formatter, Selection, Keyboard, DnD, ColumnResizer, ColumnReorder, WithContextMenu]),

        // gridAssemblerType: Function
        //      The grid assembler class.
        gridAssemblerType: DefaultGridAssembler,

        // gridSettings: Object
        //      The grid settings.
        gridSettings: null,

        // itemModelType: Function
        //      Item Model constructor. Default is epi-cms/contentediting/editors/model/CollectionEditorItemModel.
        itemModelType: null,

        // itemEditorType: Function
        //      The item editor class. By default, it is FormContainer
        itemEditorType: FormContainer,

        // useFullWidth: Boolean
        //      Specifies that this widget should be rendered in full width.
        useFullWidth: true,

        _noDataMessage: "<span><span class=\"dijitReset dijitInline\">" + resources.noitems + "</span></span>",

        _currentProviderHandler: null,

        postMixInProperties: function () {
            // summary:
            //      Post mix in properties initialization.
            // description:
            //      Fullfills properties that needed to start up the widget.
            // tags:
            //      protected

            this.inherited(arguments);

            this.dialogParams = lang.mixin(this.dialogParams, {
                "class": this.baseClass + "--dialog"
            });

            this.itemModelType = this.itemModelType || CollectionEditorItemModel;

            // Create model
            this.model = this.model || new this.modelType({
                itemType: this.itemType,
                itemModelType: this.itemModelType,
                data: this.value,
                availableCommands: this.commands
            });
            this.own(this.model);

            // Connect to model events
            this.own(on(this.model, "itemsChanged", lang.hitch(this, this._onItemsChanged)));

            // Initialize grid settings
            this.gridSettings = lang.mixin(this.gridSettings || {}, { noDataMessage: this._noDataMessage });

            // Disable gridDnd if the grid is readOnly for instance when another user is editing current page.
            if (this.readOnly) {
                this.allowedDndTypes = [];
                this.gridSettings.dndDisabled = true;
            }

            this.gridSettings.dndParams = {
                copyOnly: true,
                accept: this.allowedDndTypes || [],
                creator: lang.hitch(this, this._dndNodeCreator)
            };
        },

        postCreate: function () {
            // summary:
            //      Post create initialization.
            // description:
            //      Setup related components.
            // tags:
            //      protected

            this.inherited(arguments);

            // When the model is initialized, setup the grid
            when(this.model.initialize(), lang.hitch(this, function () {
                if (this._destroyed) {
                    return;
                }
                this._setupGrid();
            }));
        },

        onChange: function (value) {
            // summary:
            //      Triggered when the widget's value changes.
            // tags:
            //      public, callback
        },

        _setValueAttr: function (value) {
            // summary:
            //      Value setter.
            // description:
            //      Push value to the model to be its data.
            // tags:
            //      private

            this._set("value", value);

            if (this.model) {
                this.model.set("data", value);
            }
        },

        _dndNodeCreator: function (/*Object*/item, /*Object*/hint) {
            // summary:
            //      Custom DnD avatar creator method
            // tags:
            //      private

            // No reason for adding anything but a div.
            // The epi/shell/Avatar will replace its innerHTML with the item name property anyway.
            var node = domConstruct.create("div");

            return {
                node: node,
                type: this.allowedDndTypes,
                data: item
            };
        },

        _setupGrid: function () {
            // summary:
            //      Set up the grid.
            // tags:
            //      private

            // Contains columns definition
            var columns = this._getGridDefinition();

            // Create grid assembler
            var gridAssembler = new this.gridAssemblerType({
                gridType: this.gridType,
                gridSettings: this.gridSettings,
                columnDefinitions: columns,
                listCommands: this.readOnly ? [] : this.model.getListCommands(),
                itemCommandsFactory: lang.hitch(this, function (item, category) {
                    return this.readOnly ? [] : this.model.getItemCommands(item, this.commands, category);
                })
            });

            // Build the grid.
            this.own(this.grid = gridAssembler.build(this.gridNode, this.commandTargetNode));

            //style Grid
            domClass.add(this.gridNode, "epi-plain-grid-modal epi-plain-grid--margin-bottom epi-plain-grid--cell-borders");

            // Setup dnd
            if (!this.gridSettings.dndDisabled) {
                this._setupDnD();
            }

            var items = this.model.get("items");
            this.grid.renderArray(items);

            if (!items || items.length <= 0) {
                this._renderNoDataMessage();
            }

            this.own(this.grid.on(".dgrid-row:click", lang.hitch(this, this.onGridRowClick)));

            this.own(this.grid.on(".dgrid-row:dblclick", lang.hitch(this, this.onGridRowDblClick)));
        },

        _setupDnD: function () {
            // summary:
            //      Set up the dnd on the grid.
            // tags:
            //      private

            this.own(aspect.after(this.grid.dndSource, "onDropData", lang.hitch(this, this.onDndDrop), true));
        },

        onDndDrop: function (dndData, source, nodes, copy) {
            var i;

            // internal move
            if (this.grid.dndSource === source) {
                for (i = 0; i < nodes.length; i++) {
                    this.model.moveItem(
                        this.grid.dndSource.getItem(nodes[i].id).data,
                        this.grid.dndSource.current != null ?
                            this.grid.dndSource.getItem(this.grid.dndSource.current.id).data :
                            null,
                        this.grid.dndSource.before
                    );
                }
                // external drop
            } else {
                // Set focus to mark start editing
                // make sure editor will be marked as start-editing immediately by invoking onDropping
                // to fix an issue in IE9, which was caused by the race condition,
                // which would lead to a problem of auto save.
                this.onDropping && this.onDropping();
                this.onFocus();

                for (i = 0; i < dndData.length; i++) {
                    this._addItem(dndData[i]);

                    // Remove from source?
                    // TODO: Simplify
                    if (source && source.grid && source.grid.consumer && source.grid.consumer !== this) {
                        source.grid.consumer.model.removeItem(this.grid.dndSource.getItem(nodes[i].id).data);
                    }
                }
            }
        },

        _addItem: function (item) {
            when(this._dndGetItemData(item), lang.hitch(this, function (itemData) {
                this.model.addItem(
                    itemData,
                    this.grid.dndSource.current != null ?
                        this.grid.dndSource.getItem(this.grid.dndSource.current.id).data :
                        null,
                    this.grid.dndSource.before
                );
            }));
        },

        _dndGetItemData: function (item) {
            return item.data;
        },

        _getGridDefinition: function () {
            // summary:
            //      Returns grid's columns definition.
            // tags:
            //      private

            var columns = this.generateColumns ?
                this.model.generateColumnsDefinition(this.excludedColumns) : // If auto generate is on, ask model to compute columns definition.
                this.includedColumns || {}; // Otherwise, use configured ones.

            return this.model.generateFormatters(columns);
        },

        _onGridRowSelect: function (e) {
            // summary:
            //      Makes sure the right commands are available in the context menu when selecting a row in the grid.
            // tags:
            //      private

            if (!this.grid.itemCommandProviderMap) {
                return;
            }
            if (this._currentProviderHandler) {
                this._currentProviderHandler.removeProvider();
            }
            var item = this.grid.row(e).data;
            this._currentProviderHandler = this.grid.contextMenu.addProvider(this.grid.itemCommandProviderMap[json.stringify(item)]);
        },

        onGridRowClick: function (e) {
            // summary:
            //      Makes sure the right commands are available in the context menu when selecting a row in the grid.
            // tags:
            //      protected
            this._onGridRowSelect(e);
        },

        onGridRowDblClick: function (e) {
            // summary:
            //      Makes sure the right commands are available in the context menu when selecting a row in the grid.
            // tags:
            //      protected
            if (this.readOnly) {
                return;
            }

            var item = {
                model: this.grid.row(e).data
            };
            this.model.editItemDelegate(item);
        },

        _getDialogConfirmActionText: function () {
            return this.gridSettings.confirmActionText ? this.gridSettings.confirmActionText : this.inherited(arguments);
        },

        onExecuteDialog: function () {
            var item = this._itemEditor.get("value");

            if (this._editingItemIndex !== undefined) {
                this.model.saveItem(item, this._editingItemIndex);
            } else {
                this.model.addItem(item);
            }
        },

        _onCancelDialog: function () {
            // summary:
            //      Blur widget to force stop editing the EditingWrapper
            // tags:
            //      protected

            this.inherited(arguments);
            this._onBlur();
        },

        _onItemsChanged: function (items) {
            // summary:
            //      The model's itemsChanged event handler.
            // items: Array
            //      The items list (Note that it is an item model instance, not the raw data item).
            // tags:
            //      private

            // If grid is created, rerender.
            if (this.grid) {
                for (var item in this.grid.itemCommandProviderMap) {
                    delete this.grid.itemCommandProviderMap[item];
                }
                this.grid.refresh();
                this.grid.renderArray(items);

                if (!items || items.length <= 0) {
                    this._renderNoDataMessage();
                }
            }

            // Set value and trigger change event
            var value = this.model.get("data"); // Get raw data which is unwrapped from item models.
            this._set("value", value);

            if (!this.readOnly) { // disable auto save if read only is true
                this.onChange(value);
            }
        },

        _renderNoDataMessage: function () {
            if (this.grid.noDataNode) {
                return;
            }

            this.grid.noDataNode = put(this.grid.contentNode, "div.dgrid-no-data");
            this.grid.noDataNode.innerHTML = this.grid.noDataMessage;
        }
    });
});
