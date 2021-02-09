define("epi-cms/store/configurableQueryEngine", [
    "epi/shell/store/queryUtils"
], function (queryUtils) {

    return function (query, options) {
        // summary:
        //      The module defines a filtering query engine that can be passed an array of ignore
        //      parameters enabling specific query parameters to be ignored when analyzing the query.
        // description:
        //		Simple query engine that matches using filter functions, named filter
        //		functions or objects by name-value on a query object hash.
        //
        // tags:
        //      internal xproduct

        options = options || {};

        return queryUtils.createEngine(query, options);
    };
});
