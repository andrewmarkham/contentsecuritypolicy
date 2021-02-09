define("epi/shell/command/_GlobalCommandProviderMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/shell/command/_CommandProviderMixin",
    "epi/dependency"
], function (array, declare, lang, _CommandProviderMixin, dependency) {

    return declare([_CommandProviderMixin], {
        // summary:
        //      A mixin that will add command providers from the global command registry.
        //      It requires a _CommandProviderMixin or _CommandConsumerMixin on the same object when used
        //
        // tags:
        //      internal xproduct

        commandKey: null,

        commandProviders: null,

        _consumer: null,

        _currentCommandModel: null,

        _providerWatch: null,

        _initialized: false,

        initializeCommandProviders: function () {
            // summary:
            //		Gets the providers for the given command key and registers them with a consumer.
            // tags:
            //		protected

            if (this.initialized || !this.commandKey || !this.getConsumer) {
                return;
            }

            this._consumer = this.getConsumer();

            if (!this._consumer) {
                return;
            }

            this.commandRegistry = this.commandRegistry || dependency.resolve("epi.globalcommandregistry");
            this.commandProviders = this.commandRegistry.get(this.commandKey, true);
            array.forEach(this.commandProviders.providers, function (provider) {
                this._consumer.addProvider(provider);
            }, this);

            this._providerWatch = this.commandProviders.watch("providers", lang.hitch(this, this.onProvidersChanged));

            this.initialized = true;
        },

        updateCommandModel: function (model) {
            // summary:
            //		Calls the updateCommandModel method for all provider that implements it.
            // tags:
            //		public

            this._currentCommandModel = model;
            array.forEach(this.commandProviders.providers, function (provider) {
                if (provider.updateCommandModel) {
                    provider.updateCommandModel(model);
                }
            }, this);
        },

        onProvidersChanged: function (name, removed, added) {
            // summary:
            //		Adds or removes the added/removed provider from any consumers.
            // tags:
            //		public
            if (removed) {
                array.forEach(removed, this._consumer.removeProvider, this._consumer);
            }
            if (added) {
                array.forEach(added, function (item) {
                    this._consumer.addProvider(item);
                    if (item.updateCommandModel) {
                        item.updateCommandModel(this._currentCommandModel);
                    }
                }, this);
            }
        },

        destroy: function () {
            // summary:
            //		Remove the provider from any consumers.
            // tags:
            //		public

            if (this._consumer && this.commandProviders) {
                array.forEach(this.commandProviders.providers, this._consumer.removeProvider, this);
            }

            this._providerWatch && this._providerWatch.unwatch();

            this.inherited(arguments);
        }
    });
});
