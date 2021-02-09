define("epi/shell/store/SortableMemory", [
    "dojo/_base/declare",
    "epi/shell/store/queryUtils",
    // Parent class
    "dojo/store/Memory"
], function (
    declare,
    queryUtils,
    // Parent class
    Memory
) {

    return declare(Memory, {
        // summary:
        //      A memory store that supports natural ordering.
        // tags:
        //      internal

        getSibling: function (object, previous) {
            // summary:
            //      Gets the next sibling of a given object. Will retrieve the previous sibling if
            //      the previous flag is set to true. Returns null if no sibling is found.
            // object: Object
            //      The object to get the sibling of.
            // previous: Boolean
            //      Indicates that the previous sibling should be retrieved.
            // returns:
            //      Object

            var data = this.data,
                index = this.index,
                id = this.getIdentity(object);

            if (!(id in index)) {
                throw new Error("Object specified in options.before does not exist");
            }

            var delta = previous ? -1 : 1,
                pos = index[id] + delta;

            if (pos < 0 || pos >= data.length) {
                return null;
            }

            return data[pos];
        },

        put: function (object, options) {
            // summary:
            //      Stores an object.
            // object: Object
            //      The object to store.
            // options: dojo/store/api/Store.PutDirectives?
            //      Additional metadata for storing the data.
            // returns:
            //      Number

            var data = this.data,
                idProperty = this.idProperty;

            var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
            var existingObject = false;
            if (id in this.index) {
                existingObject = true;
            }

            if (options) {
                if (options.overwrite === false) {
                    if (existingObject) {
                        throw new Error("Object already exists");
                    }
                }

                // If the `before` property exists with a value of null or undefined and an existing object is being
                // updated then it is being moved to the end of the collection.
                if (options.before || (options.hasOwnProperty("before") && existingObject)) {
                    // Get the previous index and default the destination to the last item.
                    var previousIndex = this.index[id],
                        destination = data.length;

                    // Get the index of the given object.
                    if (options.before) {
                        var beforeRefId = this.getIdentity(options.before);
                        destination = this.index[beforeRefId];
                    }

                    // Account for the removed item
                    if (previousIndex < destination) {
                        --destination;
                    }

                    if (destination !== undefined) {
                        if (existingObject) {
                            // The object is being moved so remove it from its current position.
                            this.remove(id);
                        }
                        // carve out a spot for the new item
                        data.splice(destination, 0, object);
                        // now we have to reindex
                        this.setData(data);

                        return id;
                    } else {
                        throw new Error("Object specified in options.before does not exist");
                    }
                }
            }

            if (existingObject) {
                // replace the entry in data
                data[this.index[id]] = object;
            } else {
                // add the new object
                this.index[id] = data.push(object) - 1;
            }
            return id;
        },

        queryEngine: function (query, options) {
            // summary:
            //        A query engine that supports natural ordering in the memory store. It therefore
            //        does not support the sort query option.

            query = queryUtils.createFilter(query, options);

            function execute() {
                // Return the store data instead of the given results data since the store data is
                // in the correct order. Filter this through the query.
                return this.data.filter(query);
            }

            execute.matches = query;

            return execute.bind(this);
        }
    });
});
