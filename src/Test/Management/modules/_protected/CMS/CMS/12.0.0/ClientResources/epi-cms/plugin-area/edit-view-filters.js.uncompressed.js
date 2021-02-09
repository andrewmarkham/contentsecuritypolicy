define("epi-cms/plugin-area/edit-view-filters", [
    "epi/PluginArea"
], function (
    PluginArea
) {
    /*=====
    return {
        // summary:
        //      A plugin area to plugin custom view filtering for the view button drop down
        // tags:
        //      internal xproduct
    };
    =====*/

    var pluginArea = new PluginArea("epi-cms/edit-view/filters[]");
    return pluginArea;
});
