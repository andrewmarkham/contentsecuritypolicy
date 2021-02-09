define("epi-cms/project/ProjectSchedulingDialogViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/dependency",
    "dojo/topic",
    "epi-cms/dgrid/formatters",
    "./ContentReferenceGridModel",
    "epi-cms/contentediting/ScheduledPublishSelectorViewModel",
    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command.scheduleproject",
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.contentreferencelist",
    "epi/i18n!epi/cms/nls/episerver.shared.action",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.scheduledpublishselector"
], function (
    declare,
    lang,
    dependency,
    topic,
    formatters,
    ContentReferenceGridModel,
    ScheduledPublishSelectorViewModel,
    cmdRes,
    resources,
    action,
    res
) {

    return declare([ContentReferenceGridModel, ScheduledPublishSelectorViewModel], {
        // summary:
        //      Grid model for contents of a project returned from a project item store
        // tags:
        //      internal

        dateLabel: res.publishchangeson,

        notificationText: res.alreadyscheduleditems,

        _totalItemsSetter: function (value) {
            // summary:
            //      Updates the resultSummary property when totalItems changes

            this.totalItems = value;
            if (value) {
                var message = (value === 1 ? resources.itemintotal : resources.itemsintotal);
                this.set("resultSummary", lang.replace(message, [value]));
            }
        },

        onItemClicked: function (item) {
            // summary:
            //      Raised when navigation to an item is triggered from the view
            topic.publish("/epi/shell/context/request", { uri: item.contentUri });
        },

        postscript: function () {
            this.inherited(arguments);

            this.store = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.project.item");

            this.columns = {
                primaryTypeIdentifier: {
                    label: "",
                    className: "epi-grid-column--snug epi-cursor--default",
                    formatter: formatters.contentIcon
                },
                name: {
                    label: "",
                    className: "epi-grid--30 epi-cursor--default"
                },
                path: {
                    label: "",
                    formatter: formatters.path,
                    className: "epi-grid--35 epi-cursor--default"
                },
                delayPublishUntil: {
                    label: "",
                    formatter: formatters.localizedDate,
                    className: "epi-grid--25 epi-grid-column--centered epi-cursor--default dgrid-column-treePath"
                },
                contentUri: {
                    formatter: function () {
                        return "<a class=\"epi-visibleLink\">" + action.view + "</a>";
                    },
                    className: "dgrid-column-view"
                }
            };
        }
    });
});
