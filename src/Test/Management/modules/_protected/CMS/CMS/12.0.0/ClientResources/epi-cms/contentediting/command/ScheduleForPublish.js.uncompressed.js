define("epi-cms/contentediting/command/ScheduleForPublish", [
//Dojo
    "dojo/_base/declare",
    //EPi shell
    "epi/shell/DialogService",
    //EPi cms
    "epi-cms/contentediting/command/_ChangeContentStatus",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/ScheduledPublishSelector",
    "epi-cms/contentediting/ScheduledPublishSelectorViewModel",

    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.scheduledpublishselector"
],

function (
//Dojo
    declare,
    //EPi
    dialogService,
    _ChangeContentStatus,
    ContentActionSupport,
    ScheduledPublishSelector,
    ScheduledPublishSelectorViewModel,

    //Resources
    buttonResources,
    widgetResources
) {

    return declare([_ChangeContentStatus], {
        // summary:
        //      Schedules publish command.
        //
        // tags:
        //      internal

        label: buttonResources.scheduleforpublish.label,

        tooltip: buttonResources.scheduleforpublish.title,

        iconClass: "epi-iconClock",

        action: ContentActionSupport.saveAction.Schedule,

        _execute: function () {
            // summary:
            //		Schedules the content for publish with the time selected by the user
            // tags:
            //		protected

            var viewModel = new ScheduledPublishSelectorViewModel();
            viewModel.set("contentData", this.model.contentData);
            var widget = new ScheduledPublishSelector({ model: viewModel });

            return dialogService.dialog({ content: widget, title: widgetResources.title, defaultActionsVisible: false })
                .then(function () {
                    return this.model.scheduleForPublish(viewModel.get("dateValue"));
                }.bind(this))
                .then(this._onContentStatusChange.bind(this));
        }
    });
});
