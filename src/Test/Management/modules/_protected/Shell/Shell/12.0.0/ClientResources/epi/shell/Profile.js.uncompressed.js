define("epi/shell/Profile", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/json",
    "dojo/Evented",
    "dojo/Deferred",
    "dojo/store/Cache",
    "dojo/store/Memory",
    "dojo/when",
    "epi/routes",
    "epi/shell/store/JsonRest",
    "epi/shell/store/Throttle"
], function (declare, lang, json, Evented, Deferred, Cache, Memory, when, routes, JsonRest, Throttle) {

    return declare([Evented], {
        // summary:
        //      An object containing both locally and server stored profile settings.
        //
        // tags:
        //      public

        _store: null,

        constructor: function (params) {
            // summary:
            //		Instantiates a new profile instance connected to a common profile store on the server.
            declare.safeMixin(this, params);

            if (!this._store) {
                var store = new JsonRest({
                    target: routes.getRestPath({ moduleArea: "shell", storeName: "profile" }),
                    defaultRequestParams: {
                        preventLocalizationHeader: true,
                        isProfileRequest: true
                    },
                    preventCache: true });

                this._store = Cache(Throttle(store, "get"), new Memory());
            }

            when(this._store.get("userName"), lang.hitch(this, function (data) {
                this.userName = data.value;
            }));
        },

        get: function (name) {
            // summary:
            //      Get a property on the profile.
            // name: String
            //      The property to get.

            var value = sessionStorage[name];
            //if nothing is stored in the session, look in the localStorage
            if (!value) {
                value = localStorage[name];
            }
            if (value) {
                return json.parse(value);
            }

            if (name === "userName") {
                return this.userName;
            }

            return when(this._store.get(name),
                function (obj) {
                    return (obj && obj.value) || null;
                },
                function () {
                    return null;
                });
        },

        set: function (name, value, storageSettings) {
            // summary:
            //		Set a property on the profile.
            // name: String
            //		The property to set.
            // value: Object
            //		The value to set in the property.
            // storageSettings: Object
            //		If this object doesn't exists the value will be stored in local storage.
            //      Otherwise a location property can specify where the value should be stored.

            var valueAsString = json.stringify(value);
            if (storageSettings && storageSettings.location) {
                switch (storageSettings.location) {
                    case "session":
                        sessionStorage[name] = valueAsString;
                        this._emitChangedEvent(name, value);

                        return valueAsString;
                    case "server":
                        var putDeferred = new Deferred();
                        when(this._store.put({
                            id: name,
                            value: value
                        }), lang.hitch(this, function () {

                            this._emitChangedEvent(name, value);

                            putDeferred.resolve();

                        }), putDeferred.reject);

                        return putDeferred;
                    default:
                        throw "You need to specify a valid location ('session' or 'server').";
                }
            }
            localStorage[name] = valueAsString;
            this._emitChangedEvent(name, value);
            return valueAsString;
        },

        _emitChangedEvent: function (name, value) {
            this.emit("changed", {property: name, value: value});
        }
    });
});
