define("epi-cms/project/ProjectItemQueryEngine", [
    "epi-cms/core/ContentReference",
    "epi/shell/store/queryUtils"
], function (
    ContentReference,
    queryUtils
) {
    return function (query, options) {
        // summary:
        //      A QueryEngine configured to work with project items.
        //
        // query: Object
        //
        // options: dojo/store/api/Store.QueryOptions?
        //      An object that contains optional information such as sort, start, and count
        //
        // tags:
        //      internal xproduct
        //
        // returns: Function
        //		A QueryEngine matching the queries sent to the ProjectItemStore

        options = options || {};

        options.comparers = {
            contentLinks: function (queryValue, instance) {
                return queryValue.some(function (link) {
                    return ContentReference.compareIgnoreVersion(link, instance.contentLink);
                });
            }
        };

        return queryUtils.createEngine(query, options);
    };
});
