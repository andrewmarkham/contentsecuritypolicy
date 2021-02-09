// Currently only a place holder for the core epi namespace
// Needed to get the amd loading properly defined, but should contain core epi parts

define("epi/main", ["dojo", "epi/i18n!epi/shell/ui/nls/episerver.shared"], function (dojo, sharedResources) {

    var epi = dojo.getObject("epi", true);

    /*=====
    var epi = {
        // summary:
        //      The main module.
        // tags:
        //      public
    };
    =====*/

    epi.resources = dojo.mixin({}, sharedResources);
    return epi;
});
