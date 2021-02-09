define("epi-cms/project/command/AddProject", [
    "dojo/_base/declare",
    // epi
    "./_ProjectCommand",
    "epi-cms/project/ProjectDialogContent",
    "epi-cms/contentediting/command/_CommandWithDialogMixin",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command.newproject"

], function (
    declare,

    // epi
    _ProjectCommand,
    ProjectDialogContent,
    _CommandWithDialogMixin,

    res
) {
    return declare([_ProjectCommand, _CommandWithDialogMixin], {
        // summary:
        //      A command for creating a new project
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: res.label,

        // title: [public] String
        //      The title text of the command to be used in visual elements.
        title: res.label, // Title for the dialog

        // canExecute: [public] bool
        //      Indicating if the command can execute or not.
        canExecute: true,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconPlus",

        // defaultActionsVisible: [public] bool
        //      Setting for the dialog buttons.
        defaultActionsVisible: true,

        // dialogClass: [public] String
        //      Setting for the dialog size.
        dialogClass: "epi-dialog-landscape",

        // dialogContentClass: [public] bool
        //      Setting for what dialog content to create.
        dialogContentClass: ProjectDialogContent,

        onDialogExecute: function () {
            this.model.addProject(this.dialogContent.get("value"));
        },

        _execute: function () {
            this.showDialog();
        }
    });
});
