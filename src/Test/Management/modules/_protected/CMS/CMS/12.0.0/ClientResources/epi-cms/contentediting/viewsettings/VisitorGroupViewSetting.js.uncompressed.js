define("epi-cms/contentediting/viewsettings/VisitorGroupViewSetting", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi-cms/contentediting/_ViewSetting"
], function (declare, lang, _ViewSetting) {

    return declare([_ViewSetting], {
        // tags:
        //      internal

        key: "visitorgroup",

        usedForRendering: true,

        isTagItem: false,

        beforePreviewLoad: function (previewParams, enabled) {
            this.inherited(arguments);

            if (enabled && this.value) {
                previewParams.visitorgroupsByID = this.value;
            } else {
                delete previewParams.visitorgroupsByID;
            }
        }
    });
});
