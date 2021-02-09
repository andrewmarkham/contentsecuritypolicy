define("epi-cms/project/ProjectViewSetting", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",

    "dijit/Destroyable",
    // Parent class
    "epi-cms/contentediting/_ViewSetting"
], function (
    declare,
    lang,
    Deferred,
    Destroyable,
    // Parent class
    _ViewSetting
) {

    return declare([Destroyable, _ViewSetting], {
        // summary:
        //      The view setting for previewing projects.
        // tags:
        //      internal

        key: "project",

        usedForRendering: true,

        isTagItem: false,

        constructor: function (contextService) {
            // Register a request interceptor so we can add the correct params on the request when the view setting is enabled
            this.own(contextService.registerRequestInterceptor(lang.hitch(this, this._onContextChange)));
        },

        beforePreviewLoad: function (previewParams, enabled) {
            // summary:
            //      Determines whether to add the projects parameter to the preview
            //      before loading the preview.
            this.inherited(arguments);

            if (enabled && this.value) {
                previewParams.epiprojects = this.value;
            } else {
                delete previewParams.epiprojects;
            }
        },

        _onContextChange: function (contextParams, callerData) {
            var dfd = new Deferred();

            if (this.get("enabled") && this.value) {
                //Add epiprojects and epieditmode to the context params
                //both are need to so for the content api to deliver the correct values
                contextParams.epiprojects = this.value;
                contextParams.epieditmode = true;
            }

            dfd.resolve();

            return dfd.promise;
        }
    });
});
