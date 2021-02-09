define("epi-cms/contentediting/viewsettings/ViewLanguageViewSetting", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dijit/Destroyable",
    "epi-cms/contentediting/_ViewSetting"
],
function (declare, lang, Deferred, Destroyable, _ViewSetting) {
    return declare([Destroyable, _ViewSetting], {
        // tags:
        //      internal

        key: "viewlanguage",
        usedForRendering: true,
        isTagItem: false,

        constructor: function (contextService) {
            this.own(contextService.registerRequestInterceptor(lang.hitch(this, this._onContextChange)));
        },

        _onContextChange: function (contextParams, callerData) {
            var dfd = new Deferred();
            dfd.resolve();
            if (this.get("enabled") && this.value) {
                contextParams.epslanguage = this.value;
            }

            return dfd;
        }
    });
});
