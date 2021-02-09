define("epi/shell/widget/_FocusableMixin", [
    "dojo/dom-class",
    "dojo/_base/declare",
    "dijit/_FocusMixin"
], function (domClass, declare, _FocusMixin) {
    return declare(_FocusMixin, {
        // tags:
        //      internal xproduct

        onFocus: function () {
            domClass.add(this.domNode, "epi-focused");
        },
        onBlur: function () {
            domClass.remove(this.domNode, "epi-focused");
        }
    });
});
