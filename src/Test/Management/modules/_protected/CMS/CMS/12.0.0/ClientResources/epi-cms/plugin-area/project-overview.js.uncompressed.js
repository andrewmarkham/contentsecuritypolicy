define("epi-cms/plugin-area/project-overview", [
    "epi/PluginArea"
], function (
    PluginArea
) {

    /*=====
    return {
        // summary:
        //      A plugin area for project items context menu and project publish menu
        // tags:
        //      internal xproduct
    };
    =====*/
    var pluginArea = new PluginArea("epi-cms/project-overview/commands[]");

    return pluginArea;
});
