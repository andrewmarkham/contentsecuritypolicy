define("epi/shell/widget/_ActionConsumer", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/aspect",
    "epi/shell/widget/_ActionProviderBase"
],

function (declare, lang, array, aspect, _ActionProviderBase) {

    return declare(_ActionProviderBase, {
        // summary:
        //    Mixin for components that are responsible for rendering controls and executing custom actions provided by action providers.
        //
        // tags:
        //    public deprecated

        // _actionProviders: [private] Array
        //    An array of action providers used by this instance to get and handle the list of custom actions.
        _actionProviders: null,

        constructor: function (args) {
            this._actionProviders = [];
            if (args && lang.isArray(args.actionProviders)) {
                args.actionProviders.forEach(function (provider) {
                    this.addProvider(provider);
                }, this);
            }
        },

        isProviderRegistered: function (actionProvider) {
            // summary:
            //    Returns a boolean value indicating whether specified action provider is registered in this action consumer.
            //
            // actionProvider:
            //      An action provider to verify.
            //
            // tags:
            //    public

            if (!actionProvider) {
                return false;
            }
            return this._actionProviders.some(function (providerStruct) {
                return providerStruct.provider === actionProvider;
            });
        },

        addProvider: function (actionProvider) {
            // summary:
            //    Registers specified action provider for this action consumer.
            //
            // actionProvider:
            //      An action provider to add.
            //
            // tags:
            //    public

            if (!actionProvider || this.isProviderRegistered(actionProvider)) {
                return;
            }
            this._actionProviders.push({
                provider: actionProvider,
                connects: [
                    aspect.after(actionProvider, "onActionAdded", lang.hitch(this, "onActionAdded"), true),
                    aspect.after(actionProvider, "onActionRemoved", lang.hitch(this, "onActionRemoved"), true),
                    aspect.after(actionProvider, "onActionPropertyChanged", lang.hitch(this, "onActionPropertyChanged"), this)]
            });
        },

        removeProvider: function (actionProvider) {
            // summary:
            //    Removes specified action provider from the list of this action consumer.
            //
            // actionProvider:
            //      An action provider to remove.
            //
            // tags:
            //    public

            if (!actionProvider || !this.isProviderRegistered(actionProvider)) {
                return;
            }
            for (var i = 0; i < this._actionProviders.length; i++) {
                if (this._actionProviders[i].provider === actionProvider) {
                    var provider = this._actionProviders.splice(i, 1);
                    array.forEach(provider.connects, function (handle) {
                        handle.remove();
                    });
                    break;
                }
            }
        },

        getActions: function () {
            // summary:
            //    Returns an array of custom actions provided by all action providers in actionProviders array.
            //    Returns the empty array if action providers are not defined or don't provide any actions.
            //
            // tags:
            //    protected

            var actions = [];
            this._actionProviders.forEach(function (provider, index) {
                actions = actions.concat(this._getProviderActions(provider.provider));
            }, this);
            return actions;
        },

        _getProviderActions: function (actionProvider) {
            // summary:
            //    Returns an array of custom actions provided by specified action provider.
            //    Returns the empty array if action provider is null or not defined or does not provide any action.
            //
            // actionProvider:
            //      An action provider to get actions from.
            //
            // tags:
            //    private

            if (actionProvider && typeof (actionProvider.getActions) == "function") {
                return actionProvider.getActions();
            } else {
                return [];
            }
        }
    });
});
