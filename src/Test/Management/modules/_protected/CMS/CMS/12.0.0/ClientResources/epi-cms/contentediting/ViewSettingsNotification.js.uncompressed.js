define("epi-cms/contentediting/ViewSettingsNotification", [
// dojo
    "dojo/_base/declare",
    "dojo/Stateful",
    // epi
    "epi-cms/contentediting/ContentActionSupport",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.viewsettingsnotification"
],

function (
// dojo
    declare,
    Stateful,
    // epi
    ContentActionSupport,
    // resources
    resources
) {

    return declare([Stateful], {
        // summary:
        //      Show visitorgroup notification into warning notifications for the notification bar.
        // tags:
        //      internal

        // order: [public] Number
        //      Sort order of notification
        order: 30,

        _settingsSetter: function (/*Object*/value) {
            var isReadOnlyUser = value.viewModel.contentData && value.viewModel.contentData.accessMask <= ContentActionSupport.accessLevel.Read,
                setNotification = isReadOnlyUser && value.viewSetting.get("enabled") && value.viewSetting.hasVisitorGroup();

            this.set("notification", setNotification ? { content: resources.visitorgroups.noaccessright} : null);
        }

    });

});
