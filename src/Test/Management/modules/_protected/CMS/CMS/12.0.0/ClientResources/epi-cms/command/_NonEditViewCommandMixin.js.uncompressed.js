define("epi-cms/command/_NonEditViewCommandMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    // Parent class
    "dijit/Destroyable"
], function (
    declare,
    lang,
    topic,
    // Parent class
    Destroyable
) {

    return declare([Destroyable], {
        // summary:
        //      Mixin for commands that appear in the global toolbar. This mixin sets whether a
        //      command should be available depending on whether the current view supports editing.
        // tags:
        //      internal

        constructor: function () {
            this.own(
                topic.subscribe("/epi/shell/action/viewchanged", lang.hitch(this, "_viewChanged"))
            );
        },

        _viewChanged: function (type, args, data) {
            // summary:
            //      Callback function when the view is changed. Ensures that the command is only
            //      available if the view controller is PageDataController or CompareView.
            // tags:
            //      internal

            this.set("isAvailable",
                type === "epi-cms/contentediting/PageDataController" ||
                type === "epi-cms/compare/views/CompareView");
        }
    });
});
