define("epi/shell/store/Patchable", [
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/store/Cache",
    "dojo/store/Observable",
    "dojo/when",
    "epi/shell/store/storeDelegate"
], function (lang, aspect, Deferred, all, Cache, Observable, when, storeDelegate) {

    return function (masterStore, cachingStore, /*dojo/store/__CacheArgs*/options) {
        // masterStore:
        //		This is the authoritative store, all uncached requests or non-safe requests will
        //		be made against this store.
        // cachingStore:
        //		This is the caching store that will be used to store responses for quick access.
        //		Typically this should be a local store.
        // options:
        //		These are additional options for how caching is handled.
        //
        // tags:
        //      internal

        var cache = Cache(masterStore, cachingStore, options || {}),
            dependencies = [];

        var checkTypeEquality = function (queriedValue, actualValue) {
            if (typeof queriedValue !== typeof actualValue) {
                console.error("The store was queried with a [" + typeof queriedValue + "] but the entity id is a [" + typeof actualValue + "]");
            }
        };

        // Override put and add methods in Cache since the default implementation doesn't update returned id.
        var updateId = function (object, result) {
            // now put result in cache
            if (typeof result == "object") {
                object[store.idProperty] = result[store.idProperty]; //eslint-disable-line no-use-before-define
            } else {
                object[store.idProperty] = result; //eslint-disable-line no-use-before-define
            }
        };

        var stamp = function (object) {
            // summary: Time stamp the object
            if (object._cached) {
                object._cached = new Date();
            } else {
                Object.defineProperty(object, "_cached", {
                    value: new Date(),
                    enumerable: false
                });
            }

            return object;
        };

        var isOld = function (object) {
            //If the object does not have a cache key, then it is not considered as old
            if (!object._cached) {
                return false;
            }

            //Check if the object is older than 5 minutes, if so consider it as old
            var now = new Date();
            now.setMinutes(now.getMinutes() - 5);

            return now > object._cached;
        };

        cache.get = function (id, directives) {
            return when(cachingStore.get(id), function (result) {

                if (result) {
                    if (isOld(result)) {
                        //If the result is old, remove it and get new data
                        cache.evict(id, directives);
                        result = null;
                    }
                }

                return result || when(masterStore.get(id, directives), function (result) {
                    if (result) {
                        checkTypeEquality(id, result[masterStore.idProperty]);
                        cachingStore.put(stamp(result), { id: id });
                    }
                    return result;
                });
            });
        };

        cache.put = function (object, directives) {
            // first remove from the cache, so it is empty until we get a response from the master store
            cachingStore.remove((directives && directives.id) || this.getIdentity(object));
            return when(masterStore.put(object, directives), function (result) {
                updateId(object, result);
                cachingStore.put(typeof result == "object" ? stamp(result) : stamp(object), directives);
                return result;
            });
        };

        cache.add = function (object, directives) {
            return when(masterStore.add(object, directives), function (result) {
                // now put result in cache
                updateId(object, result);
                cachingStore.add(typeof result == "object" ? stamp(result) : stamp(object), directives);
                return result;
            });
        };

        var _isObject = function (obj) {
            // summary:
            //      Returns true if obj is a non-null object, but not an array or function.

            return obj && lang.isObject(obj) && !lang.isArray(obj) && !lang.isFunction(obj);
        };

        var _mixin = function (dest, source) {
            // summary:
            //      Updates properties in dest using properties from source.
            //      Differences from dojo/mixin are:
            //          * When mixing in recursively this mixin method merges objects
            //            whereas dojo/mixin overwrites sub-properties in dest.
            //          * Properties that doesn't exist in dest won't be created

            var name, s, empty = {};

            for (name in source) {
                // the (!(name in empty) || empty[name] !== s) condition avoids copying properties in "source"
                // inherited from Object.prototype.	 For example, if dest has a custom toString() method,
                // don't overwrite it with the toString() method that source inherited from Object.prototype

                s = source[name];
                if (name in dest && (dest[name] !== s && (!(name in empty) || empty[name] !== s))) {

                    // When both source and target are objects merge recursively.
                    // objects, arrays and functions are mixed
                    if (_isObject(s) && _isObject(dest[name])) {
                        _mixin(dest[name], s);
                    } else {
                        dest[name] = s;
                    }
                }
            }

            return dest;
        };

        var observable = Observable(cache);

        // We need to create a store wrapper which can trigger notify from obserable to patchable and vice versa.
        // Because dojo's aspect doesn't work properly with the lang.delegate
        var store = storeDelegate(observable, {

            getCached: function (id) {
                // summary:
                //		Returns the item from cache if it exists. Doesn't make any call to backend.
                // id: Number
                //		The identifier for the object in question.
                // tags:
                //      internal

                return cachingStore.get(id);
            },

            refresh: function (id, silent) {
                // summary:
                //		Removes the object with the given id from the underlying caching store if it exists
                //		and then gets the object with the given id from the master store and caches it again.
                // id: Number
                //		The identifier for the object in question.
                // silent: Boolean
                //		Prevent notifications on the item refreshed is set to true.
                // returns: Object
                //		The updated object in the store that matches the given id.
                // tags:
                //		public

                return when(this.evict(id), lang.hitch(this, function () {
                    return when(this.get(id), lang.hitch(this, function (result) {
                        if (result) {
                            !silent && this.notify(result, id);
                            this.updateDependentStores(result);
                            !silent && this.onItemChanged(id, result);
                        }
                        return result;
                    }));
                }));
            },

            removeRange: function (ids) {
                // summary:
                //      Removes a range of entities based on their IDs.
                // ids: Array
                //      An array of the IDs to be removed.
                // returns: Promise
                //      A promise that resolves to the results of the evictions and removal.
                // tags:
                //      internal

                var self = this;

                // Evict each ID from the cache and create an array of the resulting promises.
                var evictionPromises = ids.map(function (id) {
                    self.evict(id);
                });

                // Execute the delete range method on the store and add the
                // resulting promise to the list of promises.
                var result = all(evictionPromises)
                    .then(function () {
                        return when(self.executeMethod("DeleteRange", "", ids));
                    });

                // Notify for each removal after the result has resolved.
                result.then(function () {
                    ids.forEach(function (id) {
                        self.notify(undefined, id);
                    });
                });

                return result;
            },

            patchCache: function (object) {
                // summary:
                //		Patches an object in the caching store but not in the master store.
                // object: Object
                //		The object to update in the caching store.
                // returns: Object
                //		The updated object in the caching store.
                // tags:
                //		public

                if (!object) {
                    return;
                }

                var id = this.getIdentity(object);
                return when(this.get(id), lang.hitch(this, function (result) {
                    if (result) {
                        result = _mixin(result, object);
                        when(cachingStore.put(result, { overwrite: true }), lang.hitch(this, function () {
                            this.notify(result, id);
                            this.updateDependentStores(object);
                            this.onItemChanged(id, result);
                        }));
                    }
                    return result;
                }));
            },

            addDependentStore: function (store, options) {
                // summary:
                //		Adds a dependent store which will get updated when this store is updated.
                // store: epi/shell/store/Patchable
                //		The store to update when this store gets updated.
                // options: Object (Optional)
                //      options.refreshOnPatch: bool
                //          If set to true the a refresh will be done against the store instead of a transformDelegate
                //      options.refresh: function(Optional)
                //          If specifed the default refresh behaviour is overriden
                //      transformDelegate: function (Optional)
                //          A function taking the patch object as argument and returning a transformed
                //          object for patching the store. Take care not to modify the source object,
                //          since that would cause side effects in other dependency patched stores.
                // tags:
                //		public
                //
                // example:
                //      In the following example store will be updated whenever authoritativeStore is updated
                //      and name will be inserted as itemName.
                //  |   authoritativeStore.addDependentStore(store, function(sourceObject){
                //  |       return {
                //  |           itemName: sourceObject.name,
                //  |       };
                //  |   }));

                if (!store.patchCache) {
                    throw new Error("addDependentStore: The store must implement the patch method.");
                }
                dependencies.push({ store: store, options: options || {} });
            },

            updateDependentStores: function (object) {
                // summary:
                //		Adds a dependent store which will get updated when this store is updated.
                // object: Object
                //		The object to update in the dependent stores.
                // tags:
                //		public

                for (var i = dependencies.length - 1; i >= 0; i--) {
                    var store = dependencies[i].store;

                    if (dependencies[i].options.refreshOnPatch) {
                        var refresh = dependencies[i].options.refresh;
                        if (typeof refresh === "function") {
                            refresh(object);
                        } else {
                            store.refresh(this.getIdentity(object));
                        }
                    } else {

                        var transform = dependencies[i].options.transformDelegate;
                        store.patchCache(typeof transform === "function" ? transform(object) : object);
                    }
                }
            },

            onItemChanged: function (id, item) {
                // summary:
                //		Notification event when an item has been patched or reloaded.
                //      Deprecated, use notify instead.
                // id: object
                //		The id of the updated item.
                // item: object
                //		The updated item.
                // tags:
                //		public deprecated
            }
        });

        return store;
    };
});
