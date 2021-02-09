define("epi-cms/contextNavigation", [
    "dojo/_base/declare",
    "epi/dependency"
], function (
    declare,
    dependency
) {

    var ContextNavigation = declare([], {
        // summary:
        //      Provides helper functions to navigate through the Context History
        // tags:
        //      public

        back: function (/*Object*/ sender) {
            // summary:
            //      Removes the last context and all other same kind of context items from the history and navigates back to the previous context item.
            // sender:
            //      The object which intitiated the call.
            // tags:
            //      public

            var contextHistory = dependency.resolve("epi.cms.BackContextHistory");
            contextHistory.closeAndNavigateBack(sender || this);
        }
    });

    return new ContextNavigation();
});
