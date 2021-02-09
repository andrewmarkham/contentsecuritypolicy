define("epi-cms/activity/viewmodels/MessageActivityViewModel", [
    "dojo/_base/declare",
    // Parent class and mixins
    "./_ActivityViewModel",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.shared.action"
],
function (
    declare,
    // Parent class and mixins
    _ActivityViewModel,
    // Resources
    localization
) {

    return declare([_ActivityViewModel], {
        // summary:
        //      The view model for a message activity.
        // tags:
        //      internal

        // sendLabel: [public] String
        //      Label for sending form
        sendLabel: localization.save,

        _save: function (comment) {
            // summary:
            //      Saves the message activity.
            // tags:
            //      protected

            return this.activityService.saveMessage(this.id, comment);
        }
    });
});
