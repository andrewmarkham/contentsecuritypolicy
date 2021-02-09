define("epi-cms/activity/viewmodels/ActivityCommentViewModel", [
    "dojo/_base/declare",
    // Parent class and mixins
    "./_ActivityViewModel",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.shared.action"
], function (
    declare,
    // Parent class and mixins
    _ActivityViewModel,
    // Resources
    localization
) {

    return declare([_ActivityViewModel], {
        // summary:
        //      The view model for an activity comment.
        // tags:
        //      internal

        // sendLabel: [public] String
        //      Label for sending form
        sendLabel: localization.save,

        _save: function (comment) {
            // summary:
            //      Saves the new activity comment.
            // tags:
            //      protected

            var promise = this.activityService.saveComment(this.id, comment);
            // Keep the comment view model up to date with the comment returned from the server
            promise.then(this.set.bind(this));
            return promise;
        }
    });
});
