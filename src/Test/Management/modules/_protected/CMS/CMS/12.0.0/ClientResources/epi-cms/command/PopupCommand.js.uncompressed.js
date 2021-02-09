define("epi-cms/command/PopupCommand", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/Stateful",
    "epi/shell/command/_Command",
    "epi/shell/command/_CommandProviderMixin",
    "epi/shell/widget/ContextMenu"
], function (
    array,
    declare,
    Stateful,
    _Command,
    _CommandProviderMixin,
    ContextMenu
) {
    return declare([_Command, _CommandProviderMixin], {
        // tags:
        //      public

        category: "popup",

        canExecute: true,

        popup: null,

        popupClass: ContextMenu,

        popupCategory: "context",

        _commandsSetter: function (value) {
            if (!value) {
                return;
            }

            var commands = [];
            if (value instanceof Array) {
                commands = value;
            } else {
                for (var index in value) {
                    commands.push(value[index].command);
                }
            }

            this.commands = commands;

            this._updateIsAvailable();
        },

        _popupSetter: function (popup) {
            this.popup = popup;

            popup.addProvider(this);
        },

        _updateIsAvailable: function () {
            var isAvailable = array.some(this.get("commands"), function (command) {
                return command.get("isAvailable");
            });
            this.set("isAvailable", isAvailable);
        },

        _onModelChange: function () {
            //set the model on the contained commands
            this.updateCommandModel(this.model);
            this._updateIsAvailable();
        }
    });
});
