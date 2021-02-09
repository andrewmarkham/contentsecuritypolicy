define("epi-cms/project/command/ToggleProjectActivities", [
    "dojo/_base/declare",
    // Parent class and mixins
    "epi/shell/command/ToggleCommand",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.activities.togglecommand.label"
], function (
    declare,
    // Parent class and mixins
    ToggleCommand,
    // Resources
    localizations
) {

    return declare([ToggleCommand], {
        // tags:
        //      internal

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed.
        canExecute: true,

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "projectButton",

        // iconClass: [readonly] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconBubble",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localizations.show,

        // property: [public] String
        //      The name of the property on the model which this command will toggle.
        property: "isActivitiesVisible",

        _activeSetter: function (active) {
            // summary:
            //      Sets the active property and updates the label to match.
            // tags:
            //      protected

            this.active = active;

            this.set("label", active ? localizations.hide : localizations.show);
        }
    });
});
