define("epi-cms/component/SiteTreeNode", [
// dojo
    "dojo/_base/declare",
    "dojo/dom-class",
    // epi
    "epi-cms/widget/_ContentTreeNode"
],

// Review: Do we need proper documentation and unit tests?.
function (
// dojo
    declare,
    domClass,
    // epi
    _ContentTreeNode
) {

    return declare([_ContentTreeNode], {
        // tags:
        //      internal

        _updateItemClasses: function (item) {
            this.inherited(arguments);

            if (item.isLanguageNode && !item.isAvailable) {
                domClass.add(this.domNode, "epi-st-disabledRow");
            } else {
                domClass.remove(this.domNode, "epi-st-disabledRow");
            }

            if (!item.isLanguageNode) {
                domClass.add(this.iconNode, "epi-iconObjectStart");
            }
        }
    });

});
