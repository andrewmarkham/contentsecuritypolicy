define("epi/shell/layout/_LayoutWidget", [
    "dojo/_base/declare",

    "dijit/layout/_LayoutWidget"
],
function (
    declare,

    _LayoutWidget
) {

    return declare([_LayoutWidget], {
        // summary:
        //      Mix in that provides container notification method(s) after it layout.
        // tags:
        //      public

        onLayoutChanged: function () {
            // summary:
            //    Notify when layout has been changed. (resize)
            //
            // tags:
            //    callback
        },

        layout: function () {
            this.inherited(arguments);

            this.onLayoutChanged();
        }

    });
});
