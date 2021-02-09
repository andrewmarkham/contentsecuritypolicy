define("epi/shell/store/queryUtils", [], function () {

    function validSortOptions(sortOptions) {
        return sortOptions instanceof Array && sortOptions.length > 0;
    }

    var module =  {
        // summary:
        //      A QueryEngine configured to work with project items
        // tags:
        //      internal

        createFilter: function (query, options) {
            // summary:
            //      A factory usable for when creating filters for store queryEngines.
            //
            // query: Object
            //
            // options: dojo/store/api/Store.QueryOptions?
            //		An object that contains optional information such as sort, start, and count.
            //      It also supports having an array of ignore key values for query parts that
            //      should not be used in the filter and a compare dictionary for custom
            //      filtering logic.
            //
            //          {
            //              ignore: ["query", "prop2"],
            //              comparers: {
            //                  "prop3": function (queryPart, instance) { return true; }
            //              }
            //          }
            //
            // returns: Function
            //		A filter function

            var filter;

            options = options || {};

            // create our matching query function
            switch (typeof query) {

                case "object" :
                case "undefined" :
                    filter = function (item) {

                        return !query || Object.keys(query).every(function (key) {

                            var ignoreKeys = options.ignore,
                                comparer = options.comparers && options.comparers[key],
                                queryValue = query[key];

                            // Check if the query value should be ignored by the filter
                            if (ignoreKeys && ignoreKeys.indexOf(key) !== -1) {
                                return true;
                            }

                            // If there is a special comparer function registered for the query key then use that
                            if (comparer) {
                                return comparer(queryValue, item);
                            }

                            // Default to equality comparison of the query value and what's in in the items property
                            return queryValue === item[key];
                        });
                    };

                    break;
                default:
                    throw new Error("Can not query with a " + typeof query);
            }

            return filter;
        },

        createSorter: function (sortOptions) {
            // summary:
            //      A factory usable when creating sorters for store queryEngines.
            //
            // sortOptions: Object[]
            //          [
            //              { attribute: "name", descending: false },
            //              { attribute: "startDate", descending: true }
            //          ]
            //
            // returns: Function
            //		A sort function

            if (!validSortOptions(sortOptions)) {
                throw new Error("Argument must be an array containing sortOptions");
            }

            return function (a, b) {

                var aValue, bValue;

                for (var sort, i = 0; (sort = sortOptions[i]); i++) {
                    aValue = a[sort.attribute];
                    bValue = b[sort.attribute];

                    if (typeof aValue === "string" && typeof bValue === "string") {
                        aValue = aValue.toLowerCase();
                        bValue = bValue.toLowerCase();
                    }

                    if (aValue !== bValue) {
                        return sort.descending === (aValue > bValue) ? -1 : 1;
                    }
                }

                return 0;
            };
        },

        createExecuter: function (filter, sorter, start, count) {
            // summary:
            //      A factory usable for when creating the execute function of a queryEngines.
            //
            // filter: Function?
            //      A function capable of matching objects against a query
            //
            // sorter: Function?
            //      A function capable of sorting a collection
            //
            // start: Number?
            //      If used with pagination the starting point of the result collection
            //
            // count: Number?
            //      If used with pagination the number of items to return from the result collection
            //
            // returns: Function
            //		An execute function

            var begin = start || 0,
                end = count ? begin + count : Infinity;

            return function (results) {

                var total;

                // Make sure to create a new array
                results = filter ? results.filter(filter) : results.slice(0);

                sorter && results.sort(sorter);

                if (start || count) {
                    total = results.length;
                    results = results.slice(begin, end);
                    results.total = total;
                }

                return results;
            };
        },

        createEngine: function (query, options) {
            // summary:
            //      A factory for creating store queryEngines.
            //
            // query: Object
            //
            // options: dojo/store/api/Store.QueryOptions?
            //		An object that contains optional information such as sort, start, and count.
            //      It also supports having an array of ignore key values for query parts that
            //      should not be used in the filter and a compare dictionary for custom
            //      filtering logic.
            //
            //          {
            //              ignore: ["query", "prop2"],
            //              comparers: {
            //                  "prop3": function (queryPart, instance) { return true; }
            //              }
            //          }
            //
            // returns: Function
            //		A queryEngine function

            var filter,
                sorter,
                engine;

            options = options || {};

            filter = module.createFilter(query, options);
            sorter = validSortOptions(options.sort) ? module.createSorter(options.sort) : null;
            engine = module.createExecuter(filter, sorter, options.start, options.count);
            engine.matches = filter;

            return engine;
        }
    };

    return module;
});
