define("epi-cms/project/viewmodels/ProjectCommentViewModel", [
    "dojo/_base/declare",
    "epi/i18n!epi/cms/nls/episerver.cms.activities.commentfeed",
    // Parent class and mixins
    "./_ProjectFeedViewModel"
], function (
    declare,
    localizations,
    // Parent class and mixins
    _ProjectFeedViewModel
) {

    return declare([_ProjectFeedViewModel], {
        // summary:
        //      View model for the project comments feed. Handles setting query and store state as well as
        //      saving new message activities.
        // tags:
        //      internal

        // isSingleItemSelected: [readonly] Boolean
        //      Indicates whether there is only a single item selected.
        isSingleItemSelected: true, //force show comment form

        // noDataMessage: [readonly] String
        //      The message displayed when no data is available.
        noDataMessage: localizations.nodatamessage,

        _selectedProjectIdSetter: function (projectId) {
            this.selectedProjectId = projectId;

            // If no project id is given then set the store to null to disable querying.
            this.set("store", projectId ? this.activitiesStore : null);
            this.set("query", { projectId: projectId, activityType: "ProjectMessageActivity" });
        }
    });
});
