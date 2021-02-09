define("epi-cms/project/command/EditProjectItem", [
    "dojo/_base/declare",

    "epi-cms/contentediting/ContentActionSupport",

    // Parent class
    "./_ProjectCommand",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.shared.action"
],
function (
    declare,
    ContentActionSupport,
    // Parent class
    _ProjectCommand,
    // Resources
    actionStrings
) {
    return declare([_ProjectCommand], {
        // summary:
        //      A command for switching to the edit view for a project item.
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "menuWithSeparator",

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconPen",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: actionStrings.edit,

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["selectedProjectItems"],

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected

            // Get the one and only project item from the array.
            var selectedItem = this.model.selectedProjectItems[0];

            this.model.requestContextChange(selectedItem.contentLink);
        },

        _onPropertyChanged: function () {
            // summary:
            //      This command is able to execute if there is a single selected project item.
            // tags:
            //      protected
            var canExecute = false,
                permissionMap;

            var items = this.model && this.model.selectedProjectItems;

            this.set("label", actionStrings.edit);
            this.set("iconClass", "epi-iconPen");

            if (items && items.length === 1) {
                permissionMap = ContentActionSupport.getPermissionMap(items[0].accessMask);

                if (permissionMap.Read && !permissionMap.Edit) {
                    canExecute = permissionMap.Read;
                    this.set("label", actionStrings.view);
                    this.set("iconClass", "epi-iconSearch");
                } else {
                    canExecute = permissionMap.Edit;
                }
            }

            this.set("canExecute", !!canExecute);
        }

    });
});
