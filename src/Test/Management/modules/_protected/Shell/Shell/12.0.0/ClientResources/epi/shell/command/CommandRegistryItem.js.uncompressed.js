define("epi/shell/command/CommandRegistryItem", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "epi/shell/StatefulArray"
],
function (array, declare, StatefulArray) {

    return declare([StatefulArray], {
        // summary:
        //      Hold registered global command providers for a given key.
        // tags:
        //      internal

        // providers: [public] Array
        //		Array of providers that are registered for this key.
        providers: null,

        constructor: function () {
            // summary:
            //		Ensure that an array of providers has been initialized.
            // tags:
            //		public

            this.providers = this.providers || [];
        }
    });
});
