define("epi-cms/store/PageVersionQueryEngine", ["dojo/_base/array", "epi-cms/core/ContentReference"], function (arrayUtil, ContentReference) {

    return function (query, options) {
        // tags:
        //      internal

        // Create our matching query function
        switch (typeof query) {
            case "object": case "undefined":
                var queryObject = query;
                query = function (object) {
                    for (var key in queryObject) {
                        var required = queryObject[key],
                            original = required.toString();

                        // If the value is not a content reference and don't match return false, else if the value is a content reference
                        // then compare by ignoring versions.
                        if (original !== object[key] && (!ContentReference.isContentReference(original) || !ContentReference.compareIgnoreVersion(original, object[key]))) {
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
