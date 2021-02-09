define("epi-cms/contentediting/editors/DefaultGridAssembler", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/json",
    "dojo/Stateful",

    // epi shell
    "epi",
    "epi/shell/command/builder/ButtonBuilder",
    "epi/shell/command/withConfirmation",

    // epi cms
    "epi-cms/dgrid/formatters"

],
function (
    // dojo
    array,
    declare,
    lang,

    json,
    Stateful,

    // epi shell
    epi,
    ButtonBuilder,
    withConfirmation,
    formatters
) {


    // Base grid assembler
    var _GridAssembler = declare([], {
        // gridType: Function
        //      The grid constructor.
        gridType: null,

        // gridSettings: Object
        //      The grid settings.
        gridSettings: null,

        // columnDefinitions: Array|Object
        //      The grid's column definition.
        columnDefinitions: null,

        // listCommands: Array<Command>
        //      The list level commands.
        listCommands: null,

        // itemCommandFactory: Array<Command>
        //      The item level commands.
        itemCommandsFactory: null,

        // summary:
        //      Construct _GridAssembler object.
        // params: Object
        //      The parameters.
        constructor: function (params) {
            lang.mixin(this, params);
        },

        // summary:
        //      Build the grid from given parameters.
        // gridNode: DomNode
        //      The dom node where the grid is created on.
        // listCommandNode: DomNode
        //      The dom node where the list command is created on.
        // tags:
        //      public abstract
        build: function (gridNode, listCommandNode) {
        },

        // summary:
        //      Instantiate a dgid object.
        // gridType: Function
        //      The grid constructor.
        // gridSettings: Object
        //      The grid settings.
        // columnDefinitions: Array|Object
        //      The grid's columns definition.
        // node: DomNode
        //      The dom node where the grid is created on.
        // tags:
        //      protected
        instantiateGrid: function (gridType, gridSettings, columnDefinitions, node) {
            return new gridType(lang.mixin(gridSettings, {
                columns: columnDefinitions,
                className: "epi-plain-grid epi-grid-height--auto"
            }), node);
        }
    });

    return declare([_GridAssembler], {
        // summary:
        //      Editor widget for collection like value.
        //
        // tags:
        //      public

        itemCommandProviderMap: null,

        constructor: function () {
            this.itemCommandProviderMap = {};
        },

        build: function (gridNode, listCommandNode) {
            // summary:
            //      Build the grid from given parameters.
            // gridNode: DomNode
            //      The dom node where the grid is created on.
            // listCommandNode: DomNode
            //      The dom node where the list command is created on.
            // tags:
            //      public, abstract

            // add an action column
            this.columnDefinitions["_epiGrid_Action"] = {
                renderHeaderCell: function () { }, // no header
                renderCell: lang.hitch(this, function (item, value, node, options) {
                    var commands = this._getItemCommands(item);
                    this.itemCommandProviderMap[json.stringify(item)] = new Stateful({
                        commands: commands
                    });
                    this.renderActionMenu(item, node, commands);
                }),
                className: "epi-columnNarrow",
                sortable: false
            };

            var grid = this.instantiateGrid(this.gridType, this.gridSettings, this.columnDefinitions, gridNode);
            grid.itemCommandProviderMap = this.itemCommandProviderMap;

            this._setupCommands(this.listCommands, listCommandNode);

            return grid;
        },

        renderActionMenu: function (item, node, commands) {

            node.innerHTML = commands && commands.length > 0 ?
                formatters.menu({
                    title: epi.resources.action.options
                }) : ""; //if there are no commands, dont render any context menu
        },

        _getItemCommands: function (item) {
            var commands = this.itemCommandsFactory(item, "context");
            array.some(commands, function (command) {
                if (command.name === "remove" && this.gridSettings.useDeleteWithConfirmation) {
                    command = withConfirmation(command, null, {
                        title: this.gridSettings.deleteConfirmationTitle,
                        description: this.gridSettings.deleteConfirmationMessage
                    });
                    return true;
                }
            }, this);
            return commands;
        },

        _setupCommands: function (commands, target) {
            // summary:
            //      Setup UI for commands on the target.
            // tags:
            //      private

            var builder = this.getListCommandBuilder();
            array.forEach(commands, function (command) {
                builder.create(command, target);
            }, this);
        },

        getListCommandBuilder: function () {
            return new ButtonBuilder({
                settings: {
                    showLabel: true
                },
                optionClass: "epi-menu--inverted",
                optionItemClass: "epi-radioMenuItem"
            });
        }
    });
});
