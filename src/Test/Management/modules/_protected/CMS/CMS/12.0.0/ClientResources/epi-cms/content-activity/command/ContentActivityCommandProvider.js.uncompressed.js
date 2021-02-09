define("epi-cms/content-activity/command/ContentActivityCommandProvider", [
    "dojo/_base/declare",
    "dijit/form/ToggleButton",
    "epi-cms/component/command/_GlobalToolbarCommandProvider",
    "epi-cms/content-activity/command/ContentActivityCommand"

], function (
    declare,
    ToggleButton,
    _GlobalToolbarCommandProvider,
    ContentActivityCommand
) {

    return declare([_GlobalToolbarCommandProvider], {
        // summary:
        //    A command provider providing content activity commands to the global toolbar
        // tags:
        //      internal
        model: null,

        postscript: function () {
            this.inherited(arguments);

            var settings = {
                widget: ToggleButton,
                "class": "epi-chromeless epi-mediumButton"
            };

            this.addToTrailing(new ContentActivityCommand({model: this.model, order: -10001}), settings);
        }
    });
});
