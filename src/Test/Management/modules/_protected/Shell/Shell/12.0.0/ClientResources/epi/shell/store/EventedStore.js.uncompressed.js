define("epi/shell/store/EventedStore", [
    "dojo/Evented",
    "dojo/when"
], function (Evented, when) {

    return function (store) {
        // summary:
        //      The evented store wrapper takes a store and wraps its methods in order to emit
        //      dstore-like events when the methods are executed. Also adds the evented methods on
        //      and emit to the store object.
        // store:
        //      The store to make evented.
        // tags:
        //      internal

        // Create an evented object and add evented methods to the store that delegate to the
        // evented object.
        var evented = new Evented();
        store.emit = evented.emit.bind(evented);
        store.on = evented.on.bind(evented);

        var inMethod;
        function whenFinished(method, action) {
            var original = store[method];
            if (original) {
                store[method] = function () {
                    var args = arguments;
                    // If one method calls another (like add calling put or refresh calling evict)
                    // we don't want two events.
                    if (inMethod) {
                        return original.apply(this, args);
                    }
                    inMethod = true;
                    try {
                        var results = original.apply(this, args);
                        when(results).then(function (result) {
                            action(result, args);
                        });
                        return results;
                    } finally {
                        inMethod = false;
                    }
                };
            }
        }

        // Emits a dstore-like update event.
        function emitUpdateEvent(type) {
            return function (result) {
                when(result).then(function (result) {
                    store.emit(type, { target: result });
                });
                return result;
            };
        }

        // Emits a dstore-like remove event.
        function emitRemoveEvent(type) {
            return function (result, args) {
                when(result).then(function () {
                    store.emit(type, { id: args[0] });
                });
                return result;
            };
        }

        // Wrap the methods that should generate events.
        whenFinished("add", emitUpdateEvent("update")); // to match the local and remote client events, we need to emit update on both add/put
        whenFinished("put", emitUpdateEvent("update"));
        whenFinished("refresh", emitUpdateEvent("update"));
        whenFinished("remove", emitRemoveEvent("delete"));
        whenFinished("evict", emitRemoveEvent("delete"));

        return store;
    };
});
