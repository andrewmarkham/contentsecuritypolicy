define("epi-cms/contentediting/command/Withdraw", [
    "dojo/_base/declare",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/command/_ChangeContentStatus",
    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
], function (
    declare,
    ContentActionSupport,
    _ChangeContentStatus,
    resources
) {

    return declare([_ChangeContentStatus], {
        // summary:
        //    Withdraw a ready to publish version to edit command.
        // tags:
        //      internal

        label: resources.withdraw.label,

        tooltip: resources.withdraw.title,

        iconClass: "epi-iconPen",

        action: ContentActionSupport.saveAction.Reject | ContentActionSupport.saveAction.ForceCurrentVersion | ContentActionSupport.saveAction.SkipValidation
    });
});
