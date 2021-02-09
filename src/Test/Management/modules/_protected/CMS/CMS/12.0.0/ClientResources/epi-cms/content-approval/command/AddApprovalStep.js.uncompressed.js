define("epi-cms/content-approval/command/AddApprovalStep", [
    "dojo/_base/declare",
    "epi/i18n!epi/nls/episerver.shared.action",
    // Parent class and mixins
    "epi/shell/command/_PropertyWatchCommand"
], function (
    declare,
    localization,
    // Parent class and mixins
    _PropertyWatchCommand
) {

    return declare([_PropertyWatchCommand], {
        // summary:
        //      Adds an approval step after the current approval step.
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.add,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-icon--inverted epi-iconPlus",

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "add",

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["isReadOnly"],

        _execute: function () {
            this.model.createApprovalStep();
        },

        _onPropertyChanged: function () {
            /// summary:
            //      Sets isAvailable and canExecute based on the properties to watch.
            // tags:
            //      protected

            var isAvailable = !this.model.isReadOnly;

            this.set({
                canExecute: isAvailable,
                isAvailable: isAvailable
            });
        }
    });
});
