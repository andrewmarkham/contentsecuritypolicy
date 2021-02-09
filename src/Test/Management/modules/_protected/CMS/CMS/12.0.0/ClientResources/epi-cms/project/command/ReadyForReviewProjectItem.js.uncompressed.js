define("epi-cms/project/command/ReadyForReviewProjectItem", [
    "dojo/_base/declare",
    "dojo/Deferred",
    "epi-cms/contentediting/ContentActionSupport",
    // Resources
    "epi/i18n!epi/nls/episerver.cms.components.project.command.readyforreviewprojectitem",
    // Parent class
    "epi-cms/content-approval/command/ReadyForReview"
], function (
    declare,
    Deferred,
    ContentActionSupport,
    // Resources
    localizations,
    // Parent class
    ReadyForReview
) {

    return declare([ReadyForReview], {
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "itemContext",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localizations.label,

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["selectedProjectItems"],

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected
            var requiresComment = this.model.selectedProjectItems.some(function (item) {
                return item.isStartCommentRequired;
            });
            if (requiresComment) {
                this._executeDeferred = new Deferred();
                this.showDialog();
                return this._executeDeferred.promise;
            } else {
                return this._executeServiceMethod();
            }
        },

        _executeServiceMethod: function (reason) {
            return this.model.markProjectItemsAsReadyForReview(reason);
        },

        _onPropertyChanged: function () {
            // summary:
            //      Sets canExecute based on the state of the model.
            // tags:
            //      protected
            var items = this.model && this.model.selectedProjectItems,
                status = ContentActionSupport.versionStatus,
                canExecute = items && items.length > 0 && items.every(function (item) {
                    return !item.isDeleted
                        && item.hasApprovalDefinition
                        && (item.status === status.CheckedOut || item.status === status.Rejected)
                        && ContentActionSupport.hasAccess(item.accessMask, ContentActionSupport.accessLevel.Edit);
                });

            this.set("canExecute", !!canExecute);
        }
    });
});
