define("epi-cms/content-approval/command/_ApprovalTransitionCommand", [
    "dojo/_base/declare",
    "epi/dependency",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command.rejectchanges",
    // Parent class and mixins
    "epi-cms/contentediting/command/_ChangeContentStatus"
],
function (
    declare,
    dependency,
    localization,
    // Parent class and mixins
    _ChangeContentStatus
) {

    return declare([_ChangeContentStatus], {
        // summary:
        //      Base class for any changes to the model and for executing
        // tags:
        //      internal

        // approval: [public] Object
        //      The Approval step
        approval: null,

        // executeMethod: [public] String
        //      The method to execute on the approval service
        executeMethod: null,

        postscript: function () {
            this.inherited(arguments);
            this.approvalService = this.approvalService || dependency.resolve("epi.cms.ApprovalService");
        },

        _onModelChange: function () {
            // summary:
            //      Get the approval so its available when we execute the command
            // tags:
            //      protected

            this.set("canExecute", false);

            if (!this.model) {
                return;
            }

            return this.approvalService.getApproval(this.model.contentLink).then(function (approval) {
                this.set({
                    canExecute: !!approval,
                    approval: approval
                });
            }.bind(this));
        },

        _execute: function () {
            return this._executeServiceMethod();
        },

        _executeServiceMethod: function () {
            // summary:
            //      Executes the this.executeMethod on the approval service.
            // tags:
            //      protected

            return this.approvalService[this.executeMethod](this.approval).then(this._onContentStatusChange.bind(this));
        },

        _onContentStatusChange: function () {
            // Modify the arguments and send the contentLink of the model
            this.inherited(arguments, [{ id: this.model.contentLink }]);
        }
    });
});
