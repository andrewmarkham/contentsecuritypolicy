define("epi-cms/contentediting/ScheduledPublishSelectorViewModel", [
// Dojo
    "dojo/_base/declare",
    "dojo/Stateful",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.scheduledpublishselector"
],

function (
// Dojo
    declare,
    Stateful,

    // Resources
    resources
) {

    return declare([Stateful], {
        // tags:
        //      internal

        breadcrumbModel: null,

        title: "",

        dateLabel: "",

        dateValue: null,

        scheduleButtonEnabled: false,

        constructor: function () {
            // Create a default date. Set it to noon tomorrow.
            var noonTomorrow = new Date();
            noonTomorrow.setDate(noonTomorrow.getDate() + 1);
            noonTomorrow.setHours(12, 0, 0, 0);

            this.set("dateValue", noonTomorrow);
        },

        _isPublishedSetter: function (isPublished) {
            this.set("dateLabel", isPublished ? resources.publishchangeson : resources.publishon);
        },

        _contentDataSetter: function (contentData) {
            this.set("title", contentData.name);
            this.set("isPublished", !contentData.isPendingPublish);
            this.set("breadcrumbModel", contentData.contentLink);

            // Use any valid publish date in the future
            var publishDate = new Date(contentData.properties.iversionable_startpublish);
            if (!isNaN(publishDate) && publishDate > new Date()) {
                this.set("dateValue", publishDate);
            }
        },

        _dateValueSetter: function (value) {
            this.dateValue = value;

            this.set("scheduleButtonEnabled", !!(value && value > new Date()));
        }
    });
});
