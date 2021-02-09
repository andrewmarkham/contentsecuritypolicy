define("epi-cms/project/command/RemoveProjectConfirmation", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    // Resources
    "epi/i18n!epi/nls/episerver.cms.components.project.command.removeproject",
    "epi/i18n!epi/nls/episerver.shared.action",
    // Parent class
    "epi/shell/widget/dialog/Confirmation"
], function (
    declare,
    lang,
    // Resources
    localization,
    sharedLocalization,
    // Parent class
    Confirmation
) {

    return declare([Confirmation], {
        // tags:
        //      internal

        // isScheduledProject: [public] Boolean
        //      Flag which indicates whether the dialog should be formatted for a scheduled project.
        isScheduledProject: false,

        // dialogClass: [protected] String
        //      Class to apply to the root DOMNode of the dialog.
        dialogClass: "epi-dialog-confirm epi-dialog--wide",

        postMixInProperties: function () {
            // summary:
            //      Mixin language resources to the dialog.
            // tags:
            //      protected
            this.inherited(arguments);

            this.title = this.isScheduledProject ? localization.scheduledlabel : localization.label;
            this.description = this.isScheduledProject ? localization.scheduledconfirmation : localization.confirmation;
        },

        getActions: function () {
            // summary:
            //      Overridden from Dialog base to assemble the action collection
            // returns:
            //      A collection of action definitions that can be added to the action pane.
            // tags:
            //      protected

            var keepScheduling = {
                    name: "keepScheduling",
                    label: this.isScheduledProject ? localization.deleteandkeepscheduling : sharedLocalization.deletelabel,
                    action: lang.hitch(this, "onExecute", true) // true indicated that scheduling should be kept
                },
                removeScheduling = {
                    name: "removeScheduling",
                    label: localization.deleteandremovescheduling,
                    action: lang.hitch(this, "onExecute", false) // false indicated that scheduling should be removed
                },
                cancel = {
                    name: "cancel",
                    label: sharedLocalization.cancel,
                    action: lang.hitch(this, this.onCancel),
                    settings: { "class": "Salt", firstFocusable: true }
                };

            return this.isScheduledProject ? [keepScheduling, removeScheduling, cancel] : [keepScheduling, cancel];
        }
    });
});
