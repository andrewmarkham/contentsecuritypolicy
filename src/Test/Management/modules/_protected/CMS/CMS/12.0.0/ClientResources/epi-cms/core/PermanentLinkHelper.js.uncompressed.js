define("epi-cms/core/PermanentLinkHelper", [
// dojo
    "dojo/_base/lang",
    "dojo/when",

    // epi
    "epi/dependency",
    "epi/shell/XhrWrapper",
    "epi/routes"
],

function (
// dojo
    lang,
    when,

    // epi
    dependency,
    XhrWrapper,
    routes
) {

    var xhr = new XhrWrapper();

    return {
        // summary:
        //      Get the content from a permanent link
        // tags:
        //      public

        getContent: function (/*String*/link, /*Object*/options) {
            // summary:
            //      Get linked content data with the permanent link
            // tags:
            //      public

            if (!link) {
                return null;
            }

            var registry = dependency.resolve("epi.storeregistry"),
                store = registry.get("epi.cms.content.light"),
                query = lang.mixin({
                    query: "getcontentbypermanentlink",
                    permanentLink: link
                }, options || {});

            return when(store.query(query)).then(function (contentItems) {
                return contentItems && contentItems instanceof Array ? contentItems[0] : contentItems;
            });
        },

        getPermanentLink: function (href) {
            // summary:
            //     Get the permanent link for the given href, if it can be converted. Otherwise it returns the given href
            // tags:
            //      internal

            var route = routes.getActionPath({ moduleArea: "CMS", controller: "Links", action: "GetPermanentLink" });

            return xhr.xhrGet({
                url: route,
                content: {
                    href: href
                }
            });
        }
    };
});
