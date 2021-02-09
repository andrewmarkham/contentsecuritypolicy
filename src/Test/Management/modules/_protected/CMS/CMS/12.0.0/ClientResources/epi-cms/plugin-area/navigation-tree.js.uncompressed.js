define("epi-cms/plugin-area/navigation-tree", [
    "epi/PluginArea",
    // Commands
    "epi-cms/content-approval/command/EditApprovalDefinition"
], function (
    PluginArea,
    // Commands
    EditApprovalDefinition
) {

    /*=====
    return {
        // summary:
        //      A plugin area for the page tree component and context menu.
        // tags:
        //      public
    };
    =====*/
    var pluginArea = new PluginArea("epi-cms/navigation-tree/commands[]");

    pluginArea.add(EditApprovalDefinition);

    return pluginArea;
});
