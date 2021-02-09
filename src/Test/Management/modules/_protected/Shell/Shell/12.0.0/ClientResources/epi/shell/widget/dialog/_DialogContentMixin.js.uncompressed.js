define("epi/shell/widget/dialog/_DialogContentMixin", [
    "dojo/_base/declare"
], function (declare) {

    return declare(null, {
        // summary:
        //    Mixin which provides widgets capability to tell the container dialog to execute or cancel.
        // tags:
        //    internal xproduct

        executeDialog: function () {
            // summary:
            //	    Call this method to ask the container dialog to execute.
            // tags:
            //		protected
        },

        cancelDialog: function () {
            // summary:
            //	    Call this method to ask the container dialog to cancel.
            // tags:
            //		protected
        }

    });
});
