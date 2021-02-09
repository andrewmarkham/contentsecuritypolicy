define("epi-cms/contentediting/command/CreateDraft", [
    "dojo/_base/declare",
    "epi-cms/contentediting/command/_ContentCommandBase",
    "epi-cms/contentediting/ContentActionSupport",

    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
],

function (
    declare,
    _ContentCommandBase,
    ContentActionSupport,
    resources
) {

    return declare([_ContentCommandBase], {
        // summary:
        //      Create a draft version out of the current content
        //
        // tags:
        //      internal

        name: "createdraft",
        label: resources.createdraft.label,
        tooltip: resources.createdraft.title,
        iconClass: "epi-iconVersions",

        // ignoreContentStatus: [public] Boolean
        //      Indicates whether the status of the content should be considered
        //      when determining whether this command can be executed.
        ignoreContentStatus: false,

        _execute: function () {
            // summary:
            //    Executes this command; create a new draft version out of the current content
            //
            // tags:
            //		protected

            this.model.createDraft();
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var contentData = this.model.contentData,
                status = contentData.status,
                versionStatus = ContentActionSupport.versionStatus,
                hasAccess,
                draftPossible;

            this.inherited(arguments);

            // The user has to have sufficient access rights
            hasAccess = ContentActionSupport.hasAccessToAction(
                contentData,
                ContentActionSupport.action.Edit,
                ContentActionSupport.providerCapabilities.Edit
            );

            draftPossible =
                // Either we ignore the content status
                this.ignoreContentStatus ||
                // Or the status is delayed publish
                status === versionStatus.DelayedPublish ||
                // Or the status is publish or previously published and it's the common draft
                (status === versionStatus.Published || status === versionStatus.PreviouslyPublished) && !contentData.isCommonDraft;

            this.set({
                canExecute: hasAccess && draftPossible,
                isAvailable: hasAccess && draftPossible
            });
        }
    });

});
