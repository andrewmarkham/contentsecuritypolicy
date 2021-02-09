define("epi/PluginArea", [
    "dojo/_base/declare",
    "dojo/Evented",
    "epi/locator"
], function (
    declare,
    Evented,
    locator
) {

    return declare([Evented], {
        // summary:
        //      Base class for plugin area modules.
        // tags:
        //      internal

        constructor: function (identifier) {
            // An identifier must be supplied.
            if (typeof identifier !== "string" || identifier === "") {
                throw new Error("The argument 'identifier' must be a non-empty string.");
            }

            this._identifier = identifier;

            //Auto register the key in the locator so that we always get an array back
            locator.add(identifier, []);

            locator.on(identifier, this.emit.bind(this));

        },

        add: function (service) {
            return locator.add(this._identifier, service);
        },

        get: function () {
            return locator.get(this._identifier);
        }
    });
});
