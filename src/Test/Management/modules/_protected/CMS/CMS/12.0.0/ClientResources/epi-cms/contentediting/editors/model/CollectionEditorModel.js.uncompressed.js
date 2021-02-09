define("epi-cms/contentediting/editors/model/CollectionEditorModel", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/Evented",
    "dojo/Stateful",
    "dojo/when",
    "dojo/promise/all",

    "dijit/Destroyable",

    "dojox/mvc/StatefulArray",

    "epi/dependency",
    "epi/string",
    "epi/shell/command/DelegateCommand",

    "epi-cms/contentediting/editors/model/CollectionEditorItemModel",
    "epi-cms/dgrid/formatters",

    "epi/i18n!epi/nls/episerver.shared"
],
function (
    array,
    declare,
    lang,

    aspect,
    Deferred,
    Evented,
    Stateful,
    when,
    all,

    Destroyable,

    StatefulArray,

    dependency,
    epiString,
    DelegateCommand,

    CollectionEditorItemModel,
    formatters,

    sharedResources
) {

    var commandMask = {
        // summary:
        //      Command mask enum.
        // tags:
        //      internal
        none: 0, add: 1, edit: 2, remove: 4, moveUp: 8, moveDown: 16
    };

    var CollectionEditorModel = declare([Stateful, Evented, Destroyable], {
        // summary:
        //      Model class for collection editor.
        //
        // tags:
        //      internal

        // data: Object[]
        //      The raw data collection.
        data: null,

        // itemType: String
        //      Server item type, which is used to retrieve item's metadata
        itemType: null,

        // itemModelType: Fuction
        //      Item Model constructor. Default is epi-cms/contentediting/editors/model/CollectionEditorItemModel.
        itemModelType: null,

        // itemMetadata: Object
        //      The item's metadata.
        itemMetadata: null,

        // metadataManager: Object
        //      The metadata manager reference.
        metadataManager: null,

        //  availableCommands: Object
        //      The available commands.
        availableCommands: null,

        // _itemModels: dojox/mvc/StatefulArray
        //      The item models array
        _itemModels: null,

        // _itemsUnchanged: Boolean
        //      Indicate that the items are unchanged (only order is changed)
        _itemsUnchanged: false,

        postscript: function () {
            // summary:
            //      Post script initialization.
            // description:
            //      Set default values.

            this.inherited(arguments);

            this.metadataManager = this.metadataManager || dependency.resolve("epi.shell.MetadataManager");

            this.itemModelType = this.itemModelType || CollectionEditorItemModel;
        },

        initialize: function () {
            // summary:
            //      Initialize the model.
            // return:
            //      A promise which resolves when initialization is done.
            // tags:
            //      public

            // Retrieve metadata and init data when finished.
            return when(this.metadataManager.getMetadataForType(this.itemType), lang.hitch(this, function (metadata) {
                // TODO: Don't retrieve metadata if we don't use it to generate columns
                this.set("itemMetadata", metadata);

                return this._initData();
            }));
        },

        _initData: function () {
            // summary:
            //      Initialize data.
            // return:
            //     A promise which resolves when all the data items are set up.
            // tags:
            //      private

            // Create a stateful array to hold item models.
            this._itemModels = new StatefulArray([]);
            this.own(aspect.before(this._itemModels, "sort", lang.hitch(this, function () {
                // Turn on flag
                this._itemsUnchanged = true;
            }, true)));

            // Watch the item models for change.
            this.own(this._itemModels.watchElements(lang.hitch(this, function () {
                if (!this._itemsUnchanged) {
                    this.emit("itemsChanged", this.get("items"));
                }
                // Reset flag Sortorder
                this._itemsUnchanged = false;
            })));

            // Create initializer for each item.
            var itemInitializers = array.map(this.data, function (item) {
                var itemModel = new this.itemModelType();
                return when(itemModel.fromItemData(item, this.itemType), function () {
                    return itemModel;
                });
            }, this);

            // Perform item initialization.
            return when(all(itemInitializers), lang.hitch(this, function (itemModels) {
                // Add the created ones to the item models list.
                this._itemModels.splice.apply(this._itemModels, [0, this._itemModels.length].concat(itemModels));
            }));
        },

        getListCommands: function (availableCommands) {
            // summary:
            //      Return list level commands.
            // availableCommands:
            //      The available commands bitmask. This value is Not needed to be passed since it's set up when the model is created.
            // tags:
            //      public

            return [
                new DelegateCommand({
                    name: "add",
                    tooltip: sharedResources.action.add,
                    iconClass: "epi-iconPlus",
                    canExecute: true,
                    isAvailable: this._commandIsAvailable(commandMask.add, availableCommands),
                    delegate: lang.hitch(this, this.addItemDelegate)
                })
            ];
        },

        getItemCommands: function (item, availableCommands, category) {
            // summary:
            //      Return item level commands.
            // item:
            //      The item
            // availableCommands:
            //      The available commands bitmask. This value is Not needed to be passed since it's set up when the model is created.
            // category:
            //      The category
            // tags:
            //      public

            return [
                new DelegateCommand({
                    name: "edit",
                    category: category,
                    label: sharedResources.action.edit,
                    iconClass: "epi-iconPen",
                    model: item,
                    canExecute: true,
                    isAvailable: this._commandIsAvailable(commandMask.edit, availableCommands),
                    delegate: lang.hitch(this, this.editItemDelegate)
                }),


                new DelegateCommand({
                    name: "moveUp",
                    category: category,
                    label: sharedResources.action.moveup,
                    iconClass: "epi-iconUp",
                    model: item,
                    canExecute: this._itemModels.indexOf(item) > 0,
                    isAvailable: this._commandIsAvailable(commandMask.moveUp, availableCommands),
                    delegate: lang.hitch(this, this.moveItemUpDelegate)
                }),

                new DelegateCommand({
                    name: "moveDown",
                    category: category,
                    label: sharedResources.action.movedown,
                    iconClass: "epi-iconDown",
                    model: item,
                    canExecute: this._itemModels.indexOf(item) < this._itemModels.length - 1,
                    isAvailable: this._commandIsAvailable(commandMask.moveDown, availableCommands),
                    delegate: lang.hitch(this, this.moveItemDownDelegate)
                }),

                new DelegateCommand({
                    name: "remove",
                    category: category,
                    label: sharedResources.action.remove,
                    iconClass: "epi-iconTrash",
                    model: item,
                    canExecute: true,
                    isAvailable: this._commandIsAvailable(commandMask.remove, availableCommands),
                    delegate: lang.hitch(this, this.removeItemDelegate)
                })
            ];
        },

        _commandIsAvailable: function (command, availableCommands) {
            // summary:
            //      Test if the command is available according to the bitmask.
            // command:
            //      The command.
            // availableCommands:
            //      The available commands bitmask. Not needed to be passed since it's set up when the model is created.
            // tags:
            //      private

            availableCommands = availableCommands || this.availableCommands;

            return !!(command & availableCommands);
        },

        generateColumnsDefinition: function (excludedColumns) {
            // summary:
            //      Generate columns definition from item type's metadata.
            // excludedColumns:
            //      The columns which are excluded.
            // tags:
            //      public

            var columnDefinitions = {};

            array.forEach(array.filter(this.itemMetadata.properties, function (property) {
                // filter exlcuded properties
                return array.every(excludedColumns, function (col) {
                    return col !== property.name;
                });
            }), function (property) {
                var columnName = epiString.pascalToCamel(property.name);

                columnDefinitions[columnName] = {
                    // TODO: More options?
                    label: property.displayName || property.name
                };
            });

            return columnDefinitions;
        },

        generateFormatters: function (columnDefinitions) {
            // summary:
            //      Generate formatters for the specified column definitions.
            // columnDefinitions:
            //      The definition for the columns that should get the generated formatters.
            // tags:
            //      public

            for (var columnName in columnDefinitions) {
                array.some(this.itemMetadata.properties, function (property) {
                    if (columnName === epiString.pascalToCamel(property.name)) {
                        this._setTypeFormatter(property, columnDefinitions[columnName]);
                        this._setSelectionFactoryFormatter(property, columnDefinitions[columnName]);
                        this._setWrappingFormatter(columnDefinitions[columnName]);
                        return true;
                    }
                }, this);
            }
            return columnDefinitions;
        },

        _typeFormatterMap: {
            "System.DateTime": formatters.localizedDate,
            "System.Boolean": formatters.friendlyBoolean
        },

        _wrappingFormatterMap: {
            SecondaryText: function (formatter) {
                if (formatter) {
                    return function (value) {
                        return formatters.secondaryText(formatter(value), true);
                    };
                }

                return function (value) {
                    return formatters.secondaryText(value);
                };
            },
            VisibleLink: function (formatter) {
                if (formatter) {
                    return function (value) {
                        return formatters.visibleLink(formatter(value), true);
                    };
                }

                return function (value) {
                    return formatters.visibleLink(value);
                };
            }
        },

        _setTypeFormatter: function (property, columnDefinition) {

            for (var typeName in this._typeFormatterMap) {
                //nullable types in model type forces this "strange" check for type
                if (property.modelType.indexOf(typeName) > -1) {
                    columnDefinition.formatter = this._typeFormatterMap[typeName];
                    break;
                }
            }
        },

        _setSelectionFactoryFormatter: function (property, columnDefinition) {
            function formatValue(value) {
                var valueText = value;

                property.selections.forEach(function (selection) {
                    if (selection.value == value) {
                        valueText = selection.text;
                    }
                });

                return valueText;
            }

            if (property.selections && property.selections.length > 0) {
                if (columnDefinition) {
                    var isMultiSelect = property.uiType === "epi-cms/contentediting/editors/CheckBoxListEditor";

                    if (isMultiSelect) {
                        columnDefinition.formatter = function (value) {
                            if (!value) {
                                return value;
                            }
                            return value.split(",").map(formatValue).join(", ");
                        };
                    } else {
                        columnDefinition.formatter = formatValue;
                    }
                }
            }
        },

        _setWrappingFormatter: function (columnDefinition) {

            // summary:
            //      Sets the formatter on the column definition by using a wrapping formatter, if a wrapping formatter exists for the column definition.
            // columnDefinitions:
            //      The definition for the columns that should get the generated formatters.
            // tags:
            //      private
            if (columnDefinition.wrappingFormatter && this._wrappingFormatterMap[columnDefinition.wrappingFormatter]) {
                columnDefinition.formatter = this._wrappingFormatterMap[columnDefinition.wrappingFormatter](columnDefinition.formatter);
            }
        },

        //----------------------------------------------------------------------------------
        // Command delagate methods
        //----------------------------------------------------------------------------------
        addItemDelegate: function () {
            // summary:
            //      execute delegate for add command.
            // tags:
            //      protected

            this.emit("toggleItemEditor", null);
        },

        editItemDelegate: function (cmd) {
            // summary:
            //      execute delegate for edit command.
            // tags:
            //      protected
            if (this._commandIsAvailable(commandMask.edit, this.availableCommands)) {

                var item = cmd.model;
                var index = this._itemModels.indexOf(item);

                this.emit("toggleItemEditor", item, index);
            }
        },

        removeItemDelegate: function (cmd) {
            // summary:
            //      execute delegate for remove command.
            // tags:
            //      protected

            this.removeItem(cmd.model);
        },

        moveItemUpDelegate: function (cmd) {
            // summary:
            //      execute delegate for move up command.
            // tags:
            //      protected

            var item = cmd.model;
            var index = this._itemModels.indexOf(item);
            var refIndex = index - 1;

            if (refIndex >= 0) {
                this.moveItem(item, this._itemModels[refIndex], true);
            }
        },

        moveItemDownDelegate: function (cmd) {
            // summary:
            //      execute delegate for move down command.
            // tags:
            //      protected

            var item = cmd.model;
            var index = this._itemModels.indexOf(item);
            var refIndex = index + 1;

            if (refIndex < this._itemModels.length) {
                this.moveItem(item, this._itemModels[refIndex], false);
            }
        },

        //----------------------------------------------------------------------------------
        // Model manipulation API methods
        //----------------------------------------------------------------------------------
        saveItem: function (item, index) {
            // summary:
            //      Save an item.
            // item: Object
            //      The item raw data
            // index: Number
            //      The item index
            // tags:
            //      public

            var itemModel = new this.itemModelType();

            return when(itemModel.fromItemData(item, this.itemType), lang.hitch(this, function () {
                this._itemModels.splice(index, 1, itemModel);
            }));
        },

        addItem: function (item, refItem, before) {
            // summary:
            //      Add new item.
            // item: Object
            //      The item raw data
            // refItem: Object
            //      The reference item (item model instance)
            // before: Boolean
            //      Indicates that the new item should be added before the reference item.
            // tags:
            //      public

            var itemModel = new this.itemModelType();

            return when(itemModel.fromItemData(item, this.itemType), lang.hitch(this, function () {
                var refIndex;
                if (!refItem) {
                    // If we have no reference item, put new item to the end (Add from item editor case)
                    refIndex = this._itemModels.length;
                } else {
                    // Drop from external source
                    refIndex = this._itemModels.indexOf(refItem);

                    if (!before) {
                        refIndex++;
                    }
                }

                this._itemModels.splice(refIndex, 0, itemModel);
            }));
        },

        moveItem: function (item, refItem, before) {
            // summary:
            //      Move an item.
            // item: Object
            //      The item model instance
            // refItem: Object
            //      The reference item (item model instance)
            // before: Boolean
            //      Indicates that the new item should be moved before the reference item.
            // tags:
            //      public

            // Indicate that is still moving
            this._itemsUnchanged = true;

            var itemIndex = this._itemModels.indexOf(item);

            // Remove item
            this._itemModels.splice(itemIndex, 1);

            // Get ref index
            var refIndex = this._itemModels.indexOf(refItem);
            var targetIndex = before ? refIndex : refIndex + 1;
            //are we moving the same item? use itemIndex since refIndex will be -1;
            targetIndex = refIndex === -1 ? itemIndex : targetIndex;

            this._itemModels.splice(targetIndex, 0, item);
        },

        removeItem: function (item) {
            // summary:
            //      Remove an item.
            // item: Object
            //      The item model instance
            // tags:
            //      public

            var index = this._itemModels.indexOf(item);
            this._itemModels.splice(index, 1);
        },

        //----------------------------------------------------------------------------------
        // Property accessors
        //----------------------------------------------------------------------------------

        _dataSetter: function (value) {
            // summary:
            //      Set data property.
            // tags:
            //      private

            this.data = value;
            this._initData();
        },

        _dataGetter: function () {
            // summary:
            //      Get data property.
            // tags:
            //      private

            return array.map(this._itemModels, function (itemModel) {
                return itemModel.toItemData();
            }, this);
        },

        _itemsGetter: function () {
            // summary:
            //      Get items property.
            // tags:
            //      private

            return this._itemModels;
        }
    });

    CollectionEditorModel.commandMask = commandMask;

    return CollectionEditorModel;
});
