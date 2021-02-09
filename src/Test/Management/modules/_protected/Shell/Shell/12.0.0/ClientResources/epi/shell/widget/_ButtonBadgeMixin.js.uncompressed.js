define("epi/shell/widget/_ButtonBadgeMixin", [
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-attr"
], function (
    declare,
    domClass,
    domAttr
) {
    return declare(null, {
        // summary:
        //    A mixin that provide a badge
        // tags:
        //    internal

        // badgeClass: [public] String
        //    Css class for the badge
        badgeClass: "epi-badge-node",

        // badgeValue: [public] String
        //    Value for the badge. Empty strings, null, and undefined will remove the badge.
        badgeValue: null,

        _setBadgeValueAttr: function (value) {
            this._set("badgeValue", value);

            if (value || value === 0) {
                domClass.add(this.iconNode, this.badgeClass);
                domAttr.set(this.iconNode, "badge-value", value);
            } else {
                domClass.remove(this.iconNode, this.badgeClass);
            }
        }
    });
});
