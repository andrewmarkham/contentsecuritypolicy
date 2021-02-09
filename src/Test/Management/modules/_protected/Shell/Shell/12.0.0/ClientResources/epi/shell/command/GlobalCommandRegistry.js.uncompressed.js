define("epi/shell/command/GlobalCommandRegistry", [
    "dojo/_base/declare",
    "epi/shell/command/CommandRegistryItem"],
function (declare, CommandRegistryItem) {

    return declare(null, {
        // summary:
        //    A registry that keeps a list of command providers for a given key.
        //
        // tags:
        //    public

        // _mappings: [private] Object
        //    They object with the registered command provider mappings.
        _mappings: null,

        constructor: function (params) {
            // summary:
            //    The constructor function
            //
            // params: Object
            //    The parameters that define the object.
            // tags:
            //    public
            this._mappings = {};
        },

        registerProvider: function (/*String*/key, provider) {
            // summary:
            //    Registers a command provider for a given key.
            //
            // key: String
            //    The source data type.
            //
            // provider: Object
            //    The command provider.
            // tags:
            //    public
            // returns:
            //    An object with an unregister() method for removing the provider from the registry.

            var mapping = this._mappings[key];
            if (!mapping) {
                //First registration of the sourceType, register a mapping object
                mapping = new CommandRegistryItem();
                this._mappings[key] = mapping;
            }
            //Add the provider to the mapping
            mapping.add("providers", provider);

            return {
                unregister: function () {
                    mapping.remove("providers", provider);
                }
            };
        },

        get: function (/*String*/key, createIfMissing) {
            // summary:
            //    Gets an object with properties for the different registered converters for the given type.
            //
            // key: string
            //    The key for the command providers.
            //
            // createIfMissing: boolean
            //    If we should add an item to the registry if not already registered.
            //
            // tags:
            //    public

            var mapping = this._mappings[key];

            if (createIfMissing && !mapping) {
                //First registration of the sourceType, register a mapping object
                mapping = new CommandRegistryItem();
                this._mappings[key] = mapping;
            }
            //Add the provider to the mapping
            return mapping;
        }
    });
});
