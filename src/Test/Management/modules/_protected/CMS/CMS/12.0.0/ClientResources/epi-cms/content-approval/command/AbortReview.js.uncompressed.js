define("epi-cms/content-approval/command/AbortReview", [
    "dojo/_base/declare",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command.abortreview",
    "epi-cms/contentediting/ContentActionSupport",
    // Parent class and mixins
    "epi-cms/contentediting/command/_ChangeContentStatus"
], function (
    declare,
    localization,
    ContentActionSupport,
    // Parent class and mixins
    _ChangeContentStatus
) {

    return declare([_ChangeContentStatus], {
        // summary:
        //      Back out of the AwaitingApproval state. This is for when something goes wrong and a content is stuck waiting for an approval but no approval definition can be found.
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.label,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconWarning",

        action: ContentActionSupport.saveAction.CheckOut | ContentActionSupport.saveAction.SkipValidation
    });
});
