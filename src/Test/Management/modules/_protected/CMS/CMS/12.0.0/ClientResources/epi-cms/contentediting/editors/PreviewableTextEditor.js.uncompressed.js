define("epi-cms/contentediting/editors/PreviewableTextEditor", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom-construct",

    "dijit/form/ValidationTextBox",
    "epi-cms/contentediting/editors/_PreviewableEditor"
], function (
    array,
    declare,
    domConstruct,

    ValidationTextBox,
    _PreviewableEditor
) {
    return declare([_PreviewableEditor], {
        // tags:
        //      internal

        required: false,

        intermediateChanges: false,

        // controlParams: Array
        //      Properties to copy from this widget into the wrapped control
        controlParams: ["intermediateChanges", "regExp", "required", "invalidMessage"],

        _getRegExpAttr: function () {
            return this.regExp || "";
        }
    });
});
