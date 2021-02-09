define("epi/shell/widget/dialog/_DialogMixin", [
    "dojo",
    "dojo/dom-style"
], function (dojo, domStyle) {

    return dojo.declare(null, {
        // summary:
        //    Base class to mixin properties of dialog
        // tags:
        //    public

        // closeIconVisible: [public] Boolean
        //		Flag which indicates whether the close icon should be visible.
        closeIconVisible: true,

        _setCloseIconVisibleAttr: function () {
            // summary:
            //    Show or hide 'Close' icon at top right corner of the dialog
            // tags:
            //    private

            this._set("closeIconVisible", this.closeIconVisible);
            domStyle.set(this.closeButtonNode, "visibility", this.closeIconVisible ? "visible" : "hidden");
            //If the close icon is visible add a right margin to the titleNode
            domStyle.set(this.titleNode, "margin-right", this.closeIconVisible ? "25px" : "0");
        }
    });
});
