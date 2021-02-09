define("epi-cms/plugin-area/edit-notifications", [
    "epi/PluginArea",
    "epi-cms/contentediting/ContentReferencesNotification",
    "epi-cms/contentediting/LanguageNotification",
    "epi-cms/contentediting/ExpirationNotification",
    "epi-cms/contentediting/FuturePublishingDateNotification",
    "epi-cms/project/ProjectNotification",
    "epi-cms/contentediting/ShortcutNotification",
    "epi-cms/contentediting/ViewSettingsNotification"
], function (
    PluginArea,
    ContentReferencesNotification,
    LanguageNotification,
    ExpirationNotification,
    FuturePublishingDateNotification,
    ProjectNotification,
    ShortcutNotification,
    ViewSettingsNotification
) {
    /*=====
    return {
        // summary:
        //      A plugin area for the edit notifications.
        // tags:
        //      public
    };
    =====*/

    var pluginArea = new PluginArea("epi-cms/edit/notifications[]");

    // add default edit notifications here

    pluginArea.add(ProjectNotification);
    pluginArea.add(ShortcutNotification);
    pluginArea.add(ViewSettingsNotification);
    pluginArea.add(ContentReferencesNotification);
    pluginArea.add(LanguageNotification);
    pluginArea.add(ExpirationNotification);
    pluginArea.add(FuturePublishingDateNotification);


    return pluginArea;
});
