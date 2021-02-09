define("epi-cms/contentediting/FuturePublishingDateNotification", [
// dojo
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojo/string",

    // epi
    "epi/datetime",
    "epi-cms/contentediting/ContentActionSupport",

    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.futurepublishingdate"
], function (
// dojo
    declare,
    Stateful,
    string,

    // epi
    datetime,
    ContentActionSupport,

    // resources
    resources
) {

    return declare([Stateful], {
        // summary:
        //      Show message if the page is published and the date is set to the "future"
        // tags:
        //      internal

        // order: [public] Number
        //      Sort order of notification
        order: 70,

        // notification: [public] Object
        //      Notification object format: { content: "notification message" }
        notification: null,

        _valueSetter: function (value) {
            // summary:
            //      Updates the notification when the property changes.
            // tags:
            //      private
            var contentData = value && value.contentData;

            if (contentData.status === ContentActionSupport.versionStatus.Published) {

                var publishedDate = new Date(contentData.properties.iversionable_startpublish);

                // compare the publish date with current server time without seconds/milliseconds part
                publishedDate.setSeconds(0, 0);

                if (publishedDate.getTime() > datetime.serverTime()) {

                    var message = string.substitute(resources.message, [datetime.toUserFriendlyHtml(publishedDate)]);

                    this.set("notification", { content: message });
                    return;
                }
            }
            this.set("notification", null);
        }
    });
});
