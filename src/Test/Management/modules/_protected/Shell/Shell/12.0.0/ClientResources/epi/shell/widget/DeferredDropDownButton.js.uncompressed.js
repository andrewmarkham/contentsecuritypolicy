define("epi/shell/widget/DeferredDropDownButton", [
    "dojo/_base/declare",
    // Parent class and mixins
    "dijit/form/DropDownButton",
    "epi/shell/widget/_HasDeferredDropDown"
], function (
    declare,
    // Parent class and mixins
    DropDownButton,
    _HasDeferredDropDown
) {
    return declare([DropDownButton, _HasDeferredDropDown], {
        // tags:
        //      internal
    });
});
