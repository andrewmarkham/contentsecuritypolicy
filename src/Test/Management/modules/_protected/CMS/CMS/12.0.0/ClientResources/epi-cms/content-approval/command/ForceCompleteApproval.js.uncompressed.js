define("epi-cms/content-approval/command/ForceCompleteApproval", [
    "dojo/_base/declare",
    // Parent class and mixins
    "./_ApprovalTransitionWithReasonTextCommand",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command.forcecompleteapproval"
],
function (
    declare,
    // Parent class and mixins
    _ApprovalTransitionWithReasonTextCommand,
    localization
) {

    return declare([_ApprovalTransitionWithReasonTextCommand], {
        // summary:
        //      Force completes an approval instance as approved.
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.label,

        // title [readonly] String
        //      The dialog title
        title: localization.title,

        // dialogPlaceHolder [readonly] String
        //      Placeholder text for the text area
        dialogPlaceHolder: localization.placeholder,

        // dialogText [readonly] String
        //      Text to display above text area
        dialogText: localization.description,

        // confirmActionText [readonly] String
        //      Approve label for the dialog
        confirmActionText: localization.ok,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconRight",

        isCommentRequiredPropertyName: "isForcedApproveCommentRequired",

        _executeServiceMethod: function (reason) {
            // Override to only send approval id and reject reason.
            return this.approvalService.forceCompleteApproval(this.approval.id, reason)
                .then(this._onContentStatusChange.bind(this));
        }
    });
});
