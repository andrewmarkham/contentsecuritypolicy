define("epi/shell/command/builder/MenuAssembler", [
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful"
],
function (array, connect, declare, lang, Stateful) {

    return declare([Stateful], {
        // summary:
        //      The MenuAssembler serves as a bridge between command sources, i.e. an instance of
        //      epi/shell/command/_CommandConsumer and the builder instances inheriting from
        //      epi/shell/command/builder/_Builder
        //
        // tags:
        //      internal

        // commandSource: [public] epi/shell/command/_CommandConsumerMixin
        //      The source providing commands for this assembler. Use set("commandSource", value) when updating this property
        commandSource: null,

        // configuration: [public]
        //
        configuration: null,

        // _commandSourceConnect: [private]
        //      A reference to the event listener for observing command changes on the commandSource
        _commandSourceConnect: null,

        destroy: function () {
            connect.disconnect(this._commandSourceConnect);
        },

        build: function () {
            // summary:
            //      Trigger an explicit ui assembly of the currently available commands
            // tags: public

            this.set("commandSource", this.commandSource);
        },

        _commandSourceSetter: function (value) {
            // summary:
            //      Sets the commandSource property and re-assembles the ui using the new commands
            // tags: private

            if (this._commandSourceConnect && this.commandSource) {
                // When used from the build method and set for the first time we don't wanna tear down anything that hasn't yet been created.
                // When this._commandSourceConnect is set it means that we've populated previously.
                connect.disconnect(this._commandSourceConnect);
                this._removeCommands(this.commandSource.getCommands());
            }
            this.commandSource = value;
            if (this.commandSource) {
                this._addCommands(this.commandSource.getCommands());
                this._commandSourceConnect = connect.connect(this.commandSource, "onCommandsChanged", this, this._commandsChanged);
            }
        },

        _commandsChanged: function (name, removed, added) {
            // summary:
            //      Event handler invoked when the available commands changes
            // name: String
            //      Name of the affected array in the observed object
            // removed: Array
            //      An array of removed commands
            // added: Array
            //      An array with added commands
            // tags: private

            if (removed) {
                this._removeCommands(removed);
            }
            if (added) {
                this._addCommands(added);
            }
        },

        _getBuildInfo: function (command) {
            // summary:
            //      Return the builder information for a specific command based on its category property
            // tags: private

            var buildInfo,
                category = command.category;

            array.some(this.configuration, function (item) {
                if (item.category == category) { // eslint-disable-line eqeqeq
                    buildInfo = item;
                    return true;
                }
                return false;
            });

            return buildInfo;
        },


        _addCommands: function (commands) {
            // summary:
            //      Adds a collection of commands to the
            // commands: Array[epi/shell/command/_Command]
            //      An array of commands to build a ui representation for
            // tags: private

            array.forEach(commands, this._addCommand, this);
        },

        _addCommand: function (command) {
            // summary:
            //
            // command: epi/shell/command/_Command
            //      An array of commands to build a ui representation for
            // tags: private

            var buildInfo = this._getBuildInfo(command);
            if (buildInfo) {
                buildInfo.builder.create(command, buildInfo.target);
            }
        },

        _removeCommands: function (commands) {
            // summary:
            //		Removes the commands from the toolbar.
            // commands: Array[epi/shell/command/_Commands]
            // tags:
            //		private

            array.forEach(commands, function (command) {
                var buildInfo = this._getBuildInfo(command);
                if (buildInfo) {
                    buildInfo.builder.remove(command, buildInfo.target);
                }
            }, this);
        }

    });

});
