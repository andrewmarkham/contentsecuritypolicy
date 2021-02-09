define("epi-cms/project/command/RefreshProjectItems", [
    "dojo/_base/declare",
    // Parent class
    "./_ProjectCommand",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.shared.action"
], function (
    declare,
    // Parent class
    _ProjectCommand,
    // Resources
    res
) {

    return declare([_ProjectCommand], {
        // summary:
        //      Refreshes the current project.
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: res.refresh,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconReload",

        category: "projectButton",

        canExecute: true,

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected
            this.model.refreshProject();
            this.model.refreshActivities();
        }
    });
});
