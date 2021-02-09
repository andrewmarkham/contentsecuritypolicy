define("epi-cms/component/ContentContextMenuCommandProvider", [
    "dojo/_base/declare",
    "dijit/Destroyable",
    // epi
    "epi/shell/command/_CommandProviderMixin",
    "../command/CopyContent",
    "../command/CutContent",
    "../command/PasteContent",
    "../command/TranslateContent",
    "../command/DeleteContent",
    "../plugin-area/navigation-tree",
    "../widget/CreateCommandsMixin",
    "epi/shell/command/_SelectionCommandMixin",
    "epi/shell/selection"
],

function (
    declare,
    Destroyable,
    // epi
    _CommandProviderMixin,
    CopyCommand,
    CutCommand,
    PasteCommand,
    TranslateCommand,
    DeleteCommand,
    navigationTreePluginArea,
    CreateCommandsMixin,
    _SelectionCommandMixin,
    Selection
) {

    return declare([_CommandProviderMixin, CreateCommandsMixin, Destroyable], {
        // summary:
        //      Command provider for content context menus
        // tags:
        //      internal xproduct

        // treeModel: [Object]
        //      Model use for the commands
        treeModel: null,

        clipboardManager: null,

        _settings: null,

        constructor: function (params) {
            declare.safeMixin(this, params);

            this.own(navigationTreePluginArea.on("added, removed", this._updateCommands.bind(this)));
        },

        postscript: function () {
            this.inherited(arguments);

            this._updateCommands();
        },

        updateCommandModel: function (contentData) {
            // summary:
            //      Updates the model for the commands.
            // tags:
            //      public

            this.get("commands").forEach(function (command) {
                if (!command.isInstanceOf(_SelectionCommandMixin)) {
                    command.set("model", contentData);
                }
            });

            this._settings.selection.set("data", [{ type: "epi.cms.contentdata", data: contentData }]);
        },

        _updateCommands: function () {

            this.get("commands").forEach(function (command) {
                if (typeof command.destroy === "function") {
                    command.destroy();
                }
            });

            //Create the commands
            this._settings = {
                category: "context",
                model: this.treeModel,
                clipboard: this.clipboardManager,
                selection: new Selection()
            };

            var createCommands = this.getCreateCommands(),
                commands = [];

            for (var key in createCommands) {
                commands.push(createCommands[key].command);
            }

            commands.push(
                new TranslateCommand({ category: "context" }),
                new CutCommand(this._settings),
                new CopyCommand(this._settings),
                new PasteCommand(this._settings),
                new DeleteCommand(this._settings)
            );

            navigationTreePluginArea.get().forEach(function (command) {
                command.category = "context";
                commands.push(command);
            });

            this.set("commands", commands);
        }
    });
});
