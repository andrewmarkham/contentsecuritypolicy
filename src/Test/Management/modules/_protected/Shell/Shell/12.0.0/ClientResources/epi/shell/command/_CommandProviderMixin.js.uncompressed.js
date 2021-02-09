define("epi/shell/command/_CommandProviderMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "epi/shell/StatefulArray"
], function (array, declare, StatefulArray) {

    return declare([StatefulArray], {
        // summary:
        //      A mixin for objects that will provide commands to consumers.
        //
        // tags:
        //      public

        // commands: [public] Array
        //		Array of commands that this provider exposes.
        commands: null,

        constructor: function () {
            // summary:
            //		Ensure that an array of commands has been initialized.
            // tags:
            //		public

            this.commands = this.commands || [];
        },

        updateCommandModel: function (model) {
            // summary:
            //		Updates the model for the commands.
            // tags:
            //		public
            array.forEach(this.commands, function (command) {
                command.set("model", model);
            });
        }
    });
});
