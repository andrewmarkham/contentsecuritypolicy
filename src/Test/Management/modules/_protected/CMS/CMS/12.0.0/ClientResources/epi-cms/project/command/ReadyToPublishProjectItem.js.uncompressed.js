define("epi-cms/project/command/ReadyToPublishProjectItem", [
    "dojo/_base/declare",
    "epi-cms/contentediting/ContentActionSupport",
    // Resources
    "epi/i18n!epi/nls/episerver.cms.components.project.command.readytopublishprojectitem",
    // Parent class
    "epi-cms/project/command/_ProjectCommand"
], function (
    declare,
    ContentActionSupport,
    // Resources
    localizations,
    // Parent class
    _ProjectCommand
) {

    return declare([_ProjectCommand], {
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "menuWithSeparator",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localizations.label,

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["selectedProjectItems"],

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected
            return this.model.markProjectItemsAsReadyToPublish();
        },

        _onPropertyChanged: function () {
            // summary:
            //      Sets canExecute based on the state of the model.
            // tags:
            //      protected
            var items = this.model && this.model.selectedProjectItems,
                status = ContentActionSupport.versionStatus,
                canExecute = items && items.length > 0 && items.every(function (item) {
                    return !item.isDeleted
                        && !item.hasApprovalDefinition
                        && (item.status === status.CheckedOut || item.status === status.Rejected)
                        && ContentActionSupport.hasAccess(item.accessMask, ContentActionSupport.accessLevel.Edit);
                });

            this.set("canExecute", !!canExecute);
        }
    });
});
