define("epi-cms/content-approval/command/RejectChanges", [
    "dojo/_base/declare",
    "./_ApprovalTransitionWithReasonTextCommand",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command.rejectchanges"
],
function (
    declare,
    _ApprovalTransitionWithReasonTextCommand,
    localization
) {

    return declare([_ApprovalTransitionWithReasonTextCommand], {
        // summary:
        //      Reject the changes in the current approval step
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

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconStop",

        // executeMethod: [public] String
        //      The method to execute on the approval service
        executeMethod: "rejectChanges",

        isCommentRequiredPropertyName: "isDeclineCommentRequired"
    });
});
