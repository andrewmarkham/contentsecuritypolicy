define("epi-cms/content-approval/command/ReadyForReview", [
    "dojo/_base/declare",
    "epi-cms/contentediting/ContentActionSupport",
    // Parent class
    "epi-cms/content-approval/command/_ApprovalTransitionWithReasonTextCommand",
    // Resources
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command.requestapproval"
], function (
    declare,
    ContentActionSupport,
    // Parent class
    _ApprovalTransitionWithReasonTextCommand,
    // Resources
    localization
) {

    return declare([_ApprovalTransitionWithReasonTextCommand], {
        // summary:
        //      Set the content as ready to review.
        // tags:
        //      internal

        label: localization.label,

        executingLabel: localization.label,

        action: ContentActionSupport.saveAction.RequestApproval,

        // title [readonly] String
        //      The dialog title
        title: localization.title,

        dialogPlaceHolder: localization.placeholder,

        // confirmationActionText [readonly] String
        //      Send label for the dialog
        confirmActionText: localization.confirmactiontext,

        isCommentRequiredPropertyName: "isStartCommentRequired",

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected

            this._watchModelProperty();
        },

        _getApprovalDefinition: function () {
            // summary:
            //      Get approval definition when we execute the command
            //      to determine if a comment is required
            // tags:
            //      protected

            return this.approvalService.getDefinition(this.model.contentLink);
        },

        _executeServiceMethod: function (reason) {
            return this.model.changeContentStatus(this.action)
                .then(function () {
                    if (reason) {
                        return this.approvalService.getApproval(this.model.contentLink)
                            .then(function (approval) {
                                this.set({
                                    canExecute: !!approval,
                                    approval: approval
                                });
                                return this.approvalService.commentChanges(this.approval.id, reason);
                            }.bind(this));
                    }
                }.bind(this))
                .then(this._onContentStatusChange.bind(this));
        }

    });
});
