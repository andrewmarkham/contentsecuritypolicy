define("epi/shell/store/Realtime", [
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/when",
    "dojo/Deferred",
    "dojo/promise/all",
    "epi/shell/socket/hub",
    "epi/shell/TaskQueue",
    "epi/shell/store/storeDelegate"
],
function (
    lang,
    aspect,
    when,
    Deferred,
    all,
    hub,
    TaskQueue,
    storeDelegate) {

    return function (patchableStore, options) {
        // patchableStore:
        //       An instance to patchable store which needs realtime updates
        // options:
        //		RealtimeInfo object which must contains subscriptionKey.
        //
        // tags:
        //      internal

        if (!options || !options.subscriptionKey) {
            throw new Error("Realtime functionality can't be added to a store without providing realtimeInfo (i.e subscriptionKey & idProperty of the store)");
        }

        var idProperty = patchableStore.idProperty;
        var store = patchableStore;

        // provides functionality to listen to socket and process the requests as first come first serve with start/stop ability
        function socketRequestHandler() {

            // Try to refresh the store if possible based on given socket message
            function handleStoreRefresh(recordId, socketItem) {

                function refreshStoreByModified(itemInCache) {
                    // if socket message doesn't have modified (date) on item then refresh the store. (This might be the only extra refresh for Project store.)
                    if (!socketItem.modified) {
                        return store.refresh(recordId);
                    }

                    // in case local cached copy has same timestamp as the socket message, then avoid refresh.
                    var socketItemTimestamp = new Date(socketItem.modified).getTime();
                    var cachedItemTimeStamp = new Date(itemInCache.modified).getTime();
                    if (socketItemTimestamp !== cachedItemTimeStamp) {
                        return store.refresh(recordId);
                    } else {
                        // Item has changed but been updated in the store by other means. Just notify.
                        store.notify(itemInCache, recordId);
                    }

                    return true;
                }

                // we need to get the item from local cache without touching the backend.
                return when(store.getCached(recordId), function (itemInCache) {

                    // if there is no item in local cache, then it is a remote client and it must refresh
                    if (!itemInCache) {
                        return store.refresh(recordId);
                    } else {
                        return refreshStoreByModified(itemInCache);
                    }
                });
            }

            // Executes once per valid socket message and try to notify the changes
            function processMessage(message) {
                if (message) {
                    if (!(message instanceof Array)) {
                        message = [message];
                    }

                    var results = message.map(function (item) {
                        var id = item[idProperty];
                        var action = item.action;

                        switch (action) {
                            case 1: // Save/Update
                                return handleStoreRefresh(id, item);
                            case 2: // Delete
                                // notify the deletion of cached item only if it exists.
                                return when(store.getCached(id), function (itemInCache) {
                                    if (itemInCache) {
                                        store.evict(id);
                                        store.notify(undefined, id);
                                    }
                                });
                            default: // in case some unknown action from server
                                return true;
                        }
                    });

                    return all(results);
                }

                return true;
            }

            var queue = new TaskQueue(processMessage, { throttle: 5 });
            // subscribe to the given subscription key
            hub.subscribe(options.subscriptionKey, queue.enqueue);

            // starts processing the requests if there is any
            this.start = function () {
                queue.start();
            };

            // stops processing the requests
            this.stop = function () {
                queue.stop();
            };
        }

        var handler = new socketRequestHandler();

        var stopQueueAndExecute = function (backingStore, method) {
            return function () {
                handler.stop();
                var result = when(backingStore[method].apply(backingStore, arguments));
                result.always(function () {
                    handler.start();
                });

                return result;
            };
        };

        var realTimeStore = storeDelegate(store, {
            // wraper around store's add/put/remove requests so we can start/stop the processing of socket messages until the request finishes.
            add: stopQueueAndExecute(patchableStore, "add"),
            put: stopQueueAndExecute(patchableStore, "put"),
            remove: stopQueueAndExecute(patchableStore, "remove"),
            removeRange: stopQueueAndExecute(patchableStore, "removeRange")
        });





        return realTimeStore;
    };
});
