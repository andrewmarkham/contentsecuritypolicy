define("epi/shell/layout/GroupContainer", [
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-construct",

    "./SimpleContainer"
],
function (
    declare,
    domClass,
    domConstruct,
    SimpleContainer
) {

    return declare([SimpleContainer], {
        // summary:
        //      Widget that contains a group form items widgets, aimed to apply the html formatting specific to a group
        //
        // tags:
        //      internal

        labelNode: null,

        templateString: "<fieldset><ul class=\"epi-form-container__section\" data-dojo-attach-point=\"containerNode\"></ul></fieldset>",

        _setTitleAttr: function (value) {

            var placement, node;

            if (value) {
                placement = this.labelNode ? "replace" : "first";
                node = this.labelNode || this.domNode;

                this.labelNode = domConstruct.create("legend", { innerHTML: value }, node, placement);

            } else if (this.labelNode) {
                domConstruct.destroy(this.labelNode);
            }
        }
    });
});
