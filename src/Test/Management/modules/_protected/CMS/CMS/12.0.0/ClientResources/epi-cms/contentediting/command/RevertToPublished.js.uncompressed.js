define("epi-cms/contentediting/command/RevertToPublished", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi-cms/contentediting/command/_ContentCommandBase",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
],

function (
    declare,
    lang,
    _ContentCommandBase,
    ContentActionSupport,
    resource
) {

    return declare([_ContentCommandBase], {
        // summary:
        //      Revert back to published version
        //
        // tags:
        //      internal

        name: "reverttopublished",

        tooltip: resource.reverttopublished.title,
        label: resource.reverttopublished.label,
        iconClass: "epi-iconRevert",

        _hasPendingChangeWatch: null,

        _execute: function () {
            // summary:
            //		Executes this command; publishes a change view request to change to the create content view.
            // tags:
            //		protected

            this.model.revertToPublished();
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            this.inherited(arguments);

            var contentData = this.model.contentData,
                status = contentData.status,
                versionStatus = ContentActionSupport.versionStatus;

            //Available when content is a draft or awaiting for approval
            var isAvailable = status === versionStatus.CheckedOut || status === versionStatus.Rejected;
            this.set("isAvailable", isAvailable);

            //If the models has pending changes, disable the command
            if (this._hasPendingChangeWatch) {
                this._hasPendingChangeWatch.unwatch();
            }
            this._hasPendingChangeWatch = this.model.watch("hasPendingChanges", lang.hitch(this, function (name, oldValue, newValue) {
                var originalCanExecute = this._getCanExecute(contentData, versionStatus);
                this.set("canExecute", !newValue && originalCanExecute);
            }));

            //Executable when available and not published, have published version and have edit access right
            this.set("canExecute", isAvailable && this._getCanExecute(contentData, versionStatus));
        },

        _getCanExecute: function (contentData, versionStatus) {
            // This condition indicates that the content has published version.
            var hasPublishedVersion = contentData.publishedBy !== null && contentData.publishedBy !== undefined;
            var currentStatusIsNotPublished = contentData.status !== versionStatus.Published;

            // Expired content is basically Published content with a expireDate set to the past
            var currentStatusIsNotExpired = contentData.status !== versionStatus.Expired;

            var contentCanBeChanged = this.model.canChangeContent(ContentActionSupport.action.Edit);
            var hasDeleteRights = ContentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Delete); // Ensure has delete action to the user
            return hasPublishedVersion && currentStatusIsNotPublished && currentStatusIsNotExpired && contentCanBeChanged && hasDeleteRights;

        }
    });
});
