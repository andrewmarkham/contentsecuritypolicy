define("epi-cms/project/ProjectActivitiesQueryEngine", [
    "dojo/_base/lang",
    "epi/shell/store/queryUtils"
], function (
    lang,
    queryUtils
) {

    return function (query, options) {
        // summary:
        //      Determines if the given activity instance matches the query object
        // query: Object
        //
        // options: dojo/store/api/Store.QueryOptions?
        //      An object that contains optional information such as sort, start, and count.
        //
        // tags:
        //      internal
        //
        // returns: Function
        //      A function that caches the passed query under the field "matches".  See any
        //      of the "query" methods on dojo/stores.

        options = lang.mixin({
            comparers: {
                projectId: function (projectId, instance) {
                    return !instance.projectId || projectId === instance.projectId;
                },
                contentReferences: function (references, instance) {
                    return references && references.some(function (reference) {
                        return reference === instance.contentLink;
                    });
                }
            }
        }, options);

        return queryUtils.createEngine(query, options);
    };
});
