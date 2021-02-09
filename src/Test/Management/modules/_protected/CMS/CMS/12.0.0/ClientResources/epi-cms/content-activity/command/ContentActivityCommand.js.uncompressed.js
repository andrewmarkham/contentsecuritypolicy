define("epi-cms/content-activity/command/ContentActivityCommand", [
    "dojo/_base/declare",
    // Parent class and mixins
    "epi-cms/project/command/ToggleProjectActivities",
    "epi-cms/command/_NonEditViewCommandMixin"
], function (
    declare,
    // Parent class and mixins
    ToggleProjectActivities,
    _NonEditViewCommandMixin

) {
    return declare([ToggleProjectActivities, _NonEditViewCommandMixin], {
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "content-activities"
    });
});
