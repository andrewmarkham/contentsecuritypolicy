define("epi-cms/project/command/RenameProject", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi-cms/project/ProjectDialogContent",
    // Parent class and mixins
    "epi-cms/project/command/_ProjectCommand",
    "epi-cms/contentediting/command/_CommandWithDialogMixin",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command.renameproject"
], function (
    declare,
    lang,
    ProjectDialogContent,
    // Parent class and mixins
    _ProjectCommand,
    _CommandWithDialogMixin,
    // Resources
    localization
) {

    return declare([_ProjectCommand, _CommandWithDialogMixin], {
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "context",

        // dialogClass: [public] String
        //      The CSS class to be applied to the .
        dialogClass: "epi-dialog-landscape",

        // dialogContentClass: [public] Function
        //      Setting for what dialog content to create.
        dialogContentClass: ProjectDialogContent,

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.label,

        // title: [public] String
        //      The text to be displayed as the title in the dialog.
        title: localization.label,

        iconClass: "epi-iconRename",

        onDialogExecute: function () {
            // summary:
            //      Process the value returned from the dialog after it's executed.
            // tags:
            //      protected callback
            var value = lang.mixin(this.value, this.dialogContent.get("value"));

            this.model.updateProject(value);
        },

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked.
            // tags:
            //      protected
            this.showDialog();
        },

        _onPropertyChanged: function () {
            var project = this.model.getProject();

            // The command shouldn't be executable if a project is not selected and the project is deleted
            this.set("canExecute", !!project && !project.isDeleted);

            // Set the value that will be used as the default values in the dialog.
            this.set("value", lang.clone(project));
        }
    });
});
