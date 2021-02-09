define("epi/shell/command/_CommandConsumerMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang"
], function (array, declare, lang) {

    return declare(null, {
        // summary:
        //      A mixin for objects that will consume commands from providers.
        // tags:
        //      internal xproduct

        // providers: [readonly] Array
        //		Array of providers that commands are being consumed from.
        providers: null,

        constructor: function () {
            // summary:
            //		Ensure that an array of providers has been initialized.
            // tags:
            //		public

            this.providers = this.providers || [];
        },

        destroy: function () {
            // summary:
            //		Detach all the watch handles before uninitializing.
            // tags:
            //		public

            this.inherited(arguments);

            // make sure no providers are left behind with watches
            array.forEach(this.providers, function (item) {
                item.watch.unwatch();
            });
        },

        getConsumer: function () {
            // summary:
            //		Returns a command consumer, in this case this.
            return this;
        },

        addProvider: function (provider) {
            // summary:
            //		Add a provider to consume commands from.
            // tags:
            //		public

            var watch = provider.watch("commands", lang.hitch(this, this._commandsChanged));

            this.providers.push({
                provider: provider,
                watch: watch
            });

            // Notify a change to commands with the added provider's commands.
            this.onCommandsChanged("commands", null, provider.commands);

            return {
                removeProvider: lang.hitch(this, this.removeProvider, provider)
            };
        },

        removeProvider: function (provider) {
            // summary:
            //		Remove a provider that commands are being consumed from.
            // tags:
            //		public

            var providers = this.providers;

            // Find the index of the given provider.
            for (var i = providers.length - 1; i >= 0; i--) {
                if (providers[i].provider === provider) {
                    break;
                }
            }

            if (i >= 0) {
                var item = providers.splice(i, 1)[0];

                // release watch
                item.watch.unwatch();
                item = null;

                // Notify a change to commands with the removed provider's commands.
                this.onCommandsChanged("commands", provider.commands, null);
            }
        },

        getCommands: function () {
            // summary:
            //		Gets all the commands being consumed from providers.
            // tags:
            //		public

            var commands = [];
            array.forEach(this.providers, function (item) {
                commands = commands.concat(item.provider.commands);
            });
            return commands;
        },

        onCommandsChanged: function (name, removed, added) {
            // summary:
            //		Callback when available commands have been changed.
            // name: String
            //      Name of the affected command collection
            // removed: Array
            //      An array of removed commands
            // added: Array
            //      An array of added commands
            // tags:
            //		public callback
        },

        _commandsChanged: function () {
            this.onCommandsChanged.apply(this, arguments);
        }
    });
});
