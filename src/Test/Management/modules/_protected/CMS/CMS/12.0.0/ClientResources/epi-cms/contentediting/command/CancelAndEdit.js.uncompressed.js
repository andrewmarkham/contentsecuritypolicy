define("epi-cms/contentediting/command/CancelAndEdit", [
    "dojo/_base/declare",
    "dojo/_base/lang",

    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/command/_ChangeContentStatus",

    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons.cancelandedit"
], function (
    declare,
    lang,

    ContentActionSupport,
    _ChangeContentStatus,

    resources
) {

    return declare([_ChangeContentStatus], {
        // summary:
        //      Cancel and edit content command. Available for any delayed published content, and puts the content to rejected when executed.
        //
        // tags:
        //      internal

        label: resources.label,

        tooltip: resources.title,

        iconClass: "epi-iconPen",

        action: ContentActionSupport.saveAction.CheckOut | ContentActionSupport.saveAction.ForceCurrentVersion
    });
});
