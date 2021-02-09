define("epi/locator", ["dojo/Evented", "dojo/has", "dojo/string"], function (Evented, has, string) {

    var arrayRegex = /.+\[\]$/,
        cache = {},
        evented = new Evented();

    return {
        // summary:
        //      This module functions as a service locator, allowing classes or objects to be
        //      added against an identifier. Identifiers can end with array notation to indicate
        //      that the service should be added to a collection.
        // tags:
        //      internal

        add: function (identifier, service) {
            // summary:
            //      Adds the service for the given identifier.
            // identifier: String
            //      The identifier against which the service will be registered.
            // service: Class|Object
            //      The class or object to be registered.
            // tags:
            //      public

            // An identifier must be supplied.
            if (typeof identifier !== "string" || identifier === "") {
                throw new Error("The argument 'identifier' must be a non-empty string.");
            }

            // Do not allow registered services to be overridden.
            var isArray = arrayRegex.test(identifier);
            if (!isArray && cache[identifier]) {
                throw new Error(string.substitute("A service with the identifier '${0}' has already been registered.", [identifier]));
            }

            cache[identifier] = isArray ? (cache[identifier] || []).concat(service) : service;

            // Emit an event indicating that the service for the identifier has changed.
            evented.emit(identifier, "added");

            return {
                remove: this.remove.bind(this, identifier, service)
            };
        },

        get: function (identifier) {
            // summary:
            //      Gets the service associated with the given identifier.
            // identifier: String
            //      The identifier of the service to load.
            // tags:
            //      public

            var cachedService = cache[identifier];
            if (cachedService === undefined) {
                if (has("epi-ignore-undefined-dependencies")) {
                    return;
                }
                throw new Error(string.substitute("No service has been registered for the identifier '${0}'.", [identifier]));
            }

            // Helper method to construct classes if needed.
            var initializeService = function (service) {
                return (typeof service === "function") ? new service() : service;
            };

            if (arrayRegex.test(identifier)) {
                return cachedService.map(initializeService);
            }

            return initializeService(cachedService);
        },

        // Expose evented on method so that it is possible to observe changes on a service.
        on: evented.on.bind(evented),

        remove: function (identifier, service) {
            // summary:
            //      Removes the service associated with the given identifier.
            // identifier: String
            //      The identifier associated with the service to be removed.
            // service: Class|Object
            //      The class or object to be removed.
            // tags:
            //      public

            // Early exit if the service doesn't exist since it may have been removed already.
            var cachedService = cache[identifier];
            if (cachedService === undefined) {
                return;
            }

            if (arrayRegex.test(identifier)) {
                // Remove the service from the array for collection identifiers.
                var index = cachedService.indexOf(service);
                if (index > -1) {
                    cachedService.splice(index, 1);
                }
            } else {
                // Remove the service for individual identifiers.
                delete cache[identifier];
            }

            // Emit an event indicating that the service for the identifier has changed.
            evented.emit(identifier, "removed");
        }
    };
});
