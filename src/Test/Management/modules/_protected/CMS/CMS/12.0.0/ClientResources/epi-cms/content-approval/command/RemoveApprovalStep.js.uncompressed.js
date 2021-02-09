define("epi-cms/content-approval/command/RemoveApprovalStep", [
    "dojo/_base/declare",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command.removeapprovalstep",
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
        //      Removes the current approval step.
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.label,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconClose",

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "remove",

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["canBeDeleted", "isReadOnly"],

        _execute: function () {
            this.model.removeApprovalStep();
        },

        _onPropertyChanged: function () {
            // summary:
            //      Sets isAvailable and canExecute based on the properties to watch.
            // tags:
            //      protected

            var model = this.model,
                isAvailable = !model.isReadOnly && model.canBeDeleted;

            this.set({
                canExecute: isAvailable,
                isAvailable: isAvailable
            });
        }
    });
});
