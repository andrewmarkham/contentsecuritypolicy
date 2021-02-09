define("epi-cms/content-approval/command/CancelChanges", [
    "dojo/_base/declare",
    "epi/dependency",
    "epi/i18n!epi/nls/episerver.shared.action",
    // Parent class and mixins
    "epi/shell/command/_PropertyWatchCommand"
], function (
    declare,
    dependency,
    localization,
    // Parent class and mixins
    _PropertyWatchCommand
) {

    return declare([_PropertyWatchCommand], {
        // summary:
        //      Cancel the changes made to the model by loading the previous context
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.cancel,

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed.
        canExecute: true,

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["isDirty"],

        // contextHistory: [readonly] epi-cms/BackContextHistory
        //      The context history
        contextHistory: null,

        postscript: function () {
            this.inherited(arguments);
            this.contextHistory = this.contextHistory || dependency.resolve("epi.cms.BackContextHistory");
        },

        _execute: function () {
            this.contextHistory.closeAndNavigateBack(this);
        },

        _onPropertyChanged: function () {
            // summary:
            //      This is called whenever the specified property is changed on the model and sets
            //      whether a confirmation is required.
            // tags:
            //      protected

            var isDirty = !!this.model.isDirty;

            this.set("label", isDirty ? localization.cancel : localization.close);
        }
    });
});
