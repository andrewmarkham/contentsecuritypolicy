define("epi-cms/plugin-area/assets-pane", [
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
        //      A plugin area for the assets components and context menu.
        // tags:
        //      public
    };
    =====*/

    var pluginArea = new PluginArea("epi-cms/assets-pane/commands[]");

    pluginArea.add(EditApprovalDefinition);

    return pluginArea;
});
