define("epi-cms/form/Hidden", ["dojo/_base/declare", "dijit/form/_FormValueWidget"], function (declare, _FormValueWidget) {

    return declare([_FormValueWidget], {
        // tags:
        //      internal

        title: "Hidden",

        templateString: "<input data-dojo-attach-point=\"focusNode\" ${!nameAttrSetting} type=\"hidden\" />"
    });
});
