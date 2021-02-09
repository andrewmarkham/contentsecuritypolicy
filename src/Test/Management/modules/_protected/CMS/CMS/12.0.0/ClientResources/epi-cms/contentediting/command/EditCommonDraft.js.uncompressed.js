define("epi-cms/contentediting/command/EditCommonDraft", [
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
        //      Edit the common draft version.
        //
        // tags:
        //      internal

        name: "editcommondraft",
        label: resources.editcommondraft.label,
        tooltip: resources.editcommondraft.title,
        iconClass: "epi-iconPen",

        contentActionSupport: null,

        postscript: function () {
            this.inherited(arguments);
            this.contentActionSupport = this.contentActionSupport || ContentActionSupport;
        },

        _execute: function () {
            // summary:
            //    Executes this command; edit the common draft version.
            //
            // tags:
            //		protected

            this.model.editCommonDraft();
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            this.inherited(arguments);

            var contentData = this.model.contentData,
                status = contentData.status,
                versionStatus = ContentActionSupport.versionStatus,
                hasAccessRights = this.contentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Edit),
                canExecute = (status === versionStatus.Published || status === versionStatus.PreviouslyPublished) && !contentData.isCommonDraft &&
                    hasAccessRights &&  this.contentActionSupport.hasProviderCapability(contentData.providerCapabilityMask, ContentActionSupport.providerCapabilities.Edit);

            // The status is publish or previously published, and it is not the common draft and user must have sufficient access rights.
            this.set("canExecute", canExecute && this.model.canEditCurrentLanguage());
            this.set("isAvailable", canExecute);
        }
    });

});
