define("epi-cms/store/CustomQueryEngine", ["dojo/_base/array", "epi/obsolete"], function (arrayUtil, obsolete) {

    return function (query, options) {
        // summary:
        //      The module defines a filtering query engine that can be passed an array of ignore
        //      parameters enabling specific query parameters to be ignored when analyzing the query.
        // description:
        //		Simple query engine that matches using filter functions, named filter
        //		functions or objects by name-value on a query object hash.
        //
        // tags:
        //      internal xproduct deprecated

        obsolete("epi-cms/store/CustomQueryEngine", "Use epi-cms/store/configurableQueryEngine instead", "12.0");

        // create our matching query function
        switch (typeof query) {
            case "object": case "undefined":
                var queryObject = query;
                query = function (object) {
                    for (var key in queryObject) {
                        if (options && options.ignore) {
                            var skipKey;
                            for (var ignoreKey in options.ignore) {
                                if (key === options.ignore[ignoreKey]) {
                                    skipKey = true;
                                    break;
                                }
                            }
                            if (skipKey) {
                                skipKey = false;
                                continue;
                            }
                        }
                        var required = queryObject[key];
                        // check if we have external property comparer to use it.
                        // For example: comparer for typeIdentifiers, which is array.
                        // Only return false if the comparer returns false, otherwise, let the loop continue. Do NOT return true
                        if (options && options.comparers && options.comparers[key]) {
                            if (!options.comparers[key](required, object)) {
                                return false;
                            }
                        } else if (required && required.test) {
                            if (!required.test(object[key])) {
                                return false;
                            }
                        } else if (required && required !== object[key]) {
                            return false;
                        }
                    }
                    return true;
                };
                break;
            case "string":
                // named query
                if (!this[query]) {
                    throw new Error("No filter function " + query + " was found in store");
                }
                query = this[query];
                break;
            case "function":
                break;
            default:
                throw new Error("Can not query with a " + typeof query);
        }
        function execute(array) {
            // execute the whole query, first we filter
            var results = arrayUtil.filter(array, query);
            // next we sort
            if (options && options.sort) {
                results.sort(function (a, b) {
                    for (var sort, i = 0; (sort = options.sort[i]); i++) {
                        var aValue = a[sort.attribute];
                        var bValue = b[sort.attribute];

                        if (typeof aValue === "string" && typeof bValue === "string") {
                            aValue = aValue.toLowerCase();
                            bValue = bValue.toLowerCase();
                        }

                        if (aValue !== bValue) {
                            return sort.descending === (aValue > bValue) ? -1 : 1;
                        }
                    }
                    return 0;
                });
            }
            // now we paginate
            if (options && (options.start || options.count)) {
                var total = results.length;
                results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
                results.total = total;
            }
            return results;
        }
        execute.matches = query;
        return execute;
    };
});
