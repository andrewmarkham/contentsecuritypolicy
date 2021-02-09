define("epi-cms/component/command/_GlobalToolbarCommandProvider", [
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dijit/form/Button",

    "epi/shell/command/_CommandProviderMixin"
], function (
    declare,
    lang,

    Button,

    _CommandProviderMixin) {

    return declare([_CommandProviderMixin], {
        // summary:
        //      Base class for command providers that adds command to the epi-cms/component/GlobalToolbar
        // tags:
        //      internal abstract

        addToLeading: function (command, settings) {
            // summary:
            //      Append the given command to the command list
            // command:
            //      The command to append
            // settings:
            //      The settings to use when creating the menu item for the command
            // tags:
            //      protected
            this.addCommand(command, settings);
        },

        addToCenter: function (command, settings) {
            // summary:
            //      Append the given command to the command list
            // command:
            //      The command to append
            // settings:
            //      The settings to use when creating the menu item for the command
            // tags:
            //      protected
            settings = lang.mixin({
                category: "center"
            }, settings);

            this.addCommand(command, settings);
        },

        addToTrailing: function (command, settings) {
            // summary:
            //      Append the given command to the command list
            // command:
            //      The command to append
            // settings:
            //      The settings to use when creating the menu item for the command
            // tags:
            //      protected
            settings = lang.mixin({
                category: "trailing"
            }, settings);

            this.addCommand(command, settings);
        },

        addCommand: function (/*_Command*/command, /*Object*/settings) {
            // summary:
            //      Append the given command to the command list, un-categorized commands will be added to the "leading" category
            // command:
            //      The command to append
            // settings:
            //      The settings to use when creating the menu item for the command
            // tags:
            //      protected
            settings = lang.mixin({
                iconClass: command.iconClass,
                category: "leading",
                label: command.label,
                tooltip: command.tooltip,
                showLabel: false,
                widget: Button,
                model: command
            }, settings);


            //Create a delegate for the command
            command = lang.delegate(command, { settings: settings });

            //Add to the command list
            this.add("commands", command);
        },

        updateCommandModel: function (model) {
            // summary:
            //		Updates the model for the commands.
            // tags:
            //		public
            this.commands.forEach(function (command) {
                command.settings.model.set("model", model);
            });
        }
    });
});
