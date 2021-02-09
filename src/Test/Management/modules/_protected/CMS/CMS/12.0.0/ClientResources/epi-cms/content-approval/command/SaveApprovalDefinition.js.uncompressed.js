define("epi-cms/content-approval/command/SaveApprovalDefinition", [
    "dojo/_base/declare",
    "epi/i18n!epi/nls/episerver.shared.action",
    "epi/shell/DialogService",
    // Parent class and mixins
    "epi/shell/command/_PropertyWatchCommand"
], function (
    declare,
    localization,
    dialogService,
    // Parent class and mixins
    _PropertyWatchCommand
) {

    return declare([_PropertyWatchCommand], {
        // summary:
        //      Validates and saves the content approval definition that is being edited.
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.save,

        // isAvailable: [public] Boolean
        //      Flag which indicates whether this command is available in the current context.
        isAvailable: true,

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed.
        canExecute: false,

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["isDirty", "isValid", "isReadOnly"],

        _execute: function () {
            // summary:
            //      Validate the model to see if it's ok to save. Otherwise let the user confirm the save if possible,
            //      or inform that saving is not possible due to validation errors.
            // tags:
            //      private

            this.model.set("showValidations", true);

            var validationIssue = this.model.validate();

            if (!validationIssue) {
                this.model.saveApprovalDefinition();
                return;
            }

            switch (validationIssue.level) {
                case "error":
                    dialogService.alert(validationIssue.dialog);
                    break;
                case "warning":
                    dialogService.confirmation(validationIssue.dialog).then(function () {
                        this.model.saveApprovalDefinition();
                    }.bind(this));
                    break;
            }
        },

        _onPropertyChanged: function () {
            // summary:
            //      Updates isAvailable after the model has been changed.
            // tags:
            //      private

            this.set("isAvailable", !this.model.isReadOnly);
            this.set("canExecute", this.model.isDirty && this.model.isValid);
            this.set("label", this.model.isDirty ? localization.save : localization.saved);
        }
    });
});
