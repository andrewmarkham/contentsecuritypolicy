define("epi-cms/content-approval/command/EditApprovalDefinition", [
    "dojo/_base/declare",
    "epi/dependency",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command.edit",
    // Parent class and mixins
    "epi/shell/command/_Command"
], function (
    declare,
    dependency,
    ContentActionSupport,
    localization,
    // Parent class and mixins
    _Command
) {

    return declare([_Command], {
        // summary:
        //      Redirects to the content approval view if there is an approval definition.
        // tags:
        //      internal

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed.
        canExecute: false,

        // contentActionSupport: [public] object
        contentActionSupport: null,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconApproval",

        // isAvailable: [public] Boolean
        //      Flag which indicates whether this command is available in the current context.
        isAvailable: false,

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: null,

        postscript: function () {
            this.inherited(arguments);
            this.contentActionSupport = this.contentActionSupport || ContentActionSupport;

            this.approvalService = this.approvalService || dependency.resolve("epi.cms.ApprovalService");
        },

        _onModelChange: function () {
            // summary:
            //      Enable the command if the user has access and sets the correct label.
            // tags:
            //      protected

            if (this.model instanceof Array) {
                //this command should only be available if you have exactly one item selected
                if (this.model.length === 1)   {
                    this.model = this.model[0];
                } else {
                    this.model = null;
                }
            }

            if (!this.model) {
                this._setEnabledState(false);
                return;
            }

            this._setEnabledState(true);

            var hasAdminAccess = this.contentActionSupport.hasAccess(this.model.accessMask, this.contentActionSupport.accessLevel.Administer);
            this.set("label", hasAdminAccess ? localization.editlabel : localization.viewlabel);
        },

        _setEnabledState: function (enabled) {
            // summary:
            //      Handles availability and if the command is executable.
            // tags:
            //      private

            this.set("canExecute", !!enabled);

            var available = this.canExecute
                    // cannot check the typeidentifier because for the ones that were not created yet it's
                    // ContentFolder (fake asset folder) while for the ones that exist it's ContentAssetFolder
                    // ownerContentLink property is not null only for 'For this page' nodes
                    && !this.model.ownerContentLink
                    && this.model.capabilities.canconfigureapproval;

            this.set("isAvailable", !!available);
        },

        _execute: function () {
            // summary:
            //      Redirects to the content approval view.
            // tags:
            //      protected

            this.approvalService.navigateToDefinition(this.model.contentLink);
        }
    });
});
