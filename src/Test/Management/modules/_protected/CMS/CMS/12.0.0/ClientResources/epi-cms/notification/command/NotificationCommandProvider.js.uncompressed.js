define("epi-cms/notification/command/NotificationCommandProvider", [
    "dojo/_base/declare",
    "epi-cms/component/command/_GlobalToolbarCommandProvider",
    "epi-cms/notification/NotificationButton",
    "epi-cms/notification/command/ViewNotifications"
], function (
    declare,
    _GlobalToolbarCommandProvider,
    NotificationButton,
    ViewNotificationsCommand
) {

    return declare([_GlobalToolbarCommandProvider], {
        // summary:
        //    A command provider providing notification commands to the global toolbar
        // tags:
        //      internal

        postscript: function () {
            this.inherited(arguments);

            var settings = {
                widget: NotificationButton,
                "class": "epi-chromeless"
            };
            this.addToTrailing(new ViewNotificationsCommand(), settings);
        }
    });
});
