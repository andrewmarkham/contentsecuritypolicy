define("epi-cms/content-approval/command/ApproveChanges", [
    "dojo/_base/declare",
    "./_ApprovalTransitionWithReasonTextCommand",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command.approvechanges"
], function (
    declare,
    _ApprovalTransitionWithReasonTextCommand,
    localization
) {

    return declare([_ApprovalTransitionWithReasonTextCommand], {
        // summary:
        //      Approve the current approval
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.label,

        // title [readonly] String
        //      The dialog title
        title: localization.title,

        dialogPlaceHolder: localization.placeholder,

        // confirmationActionText [readonly] String
        //      Approve label for the dialog
        confirmActionText: localization.confirmactiontext,

        // executingLabel: [readonly] String
        //      The executing action text of the command to be used in visual elements.
        executingLabel: localization.label,

        // executeMethod: [readonly] String
        //      The method to execute on the approval service
        executeMethod: "approveChanges",

        isCommentRequiredPropertyName: "isApproveCommentRequired"
    });
});
