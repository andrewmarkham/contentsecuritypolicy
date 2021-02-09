define("epi-cms/contentediting/viewsettings/ChannelViewSetting", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi-cms/contentediting/_ViewSetting"
], function (declare, lang, _ViewSetting) {

    return declare([_ViewSetting], {
        // tags:
        //      internal

        key: "epichannel",

        usedForRendering: true,

        isTagItem: false,

        beforePreviewLoad: function (previewParams, enabled) {
            this.inherited(arguments);

            if (enabled && this.value) {
                previewParams.epichannel = this.value;
            } else {
                delete previewParams.epichannel;
            }
        }
    });
});
