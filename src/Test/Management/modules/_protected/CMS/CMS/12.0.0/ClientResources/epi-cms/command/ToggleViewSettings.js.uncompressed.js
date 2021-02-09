define("epi-cms/command/ToggleViewSettings", [
    "dojo/_base/declare",
    "dojo/topic",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons.viewsetting",
    // Parent class and mixins
    "epi/shell/command/ToggleCommand",
    "epi/dependency",
    "epi-cms/command/_NonEditViewCommandMixin"
], function (
    declare,
    topic,
    // Resources
    localizations,
    // Parent class and mixins
    ToggleCommand,
    dependency,
    _NonEditViewCommandMixin
) {

    return declare([ToggleCommand, _NonEditViewCommandMixin], {
        // summary:
        //      Command for toggling the view settings' active state.
        // tags:
        //      internal

        // iconClass: [public] String
        //      The CSS class which represents the icon to be used in visual elements.
        iconClass: "epi-iconEye",

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed; true by default.
        canExecute: true,

        // property: [readonly] Boolean
        //      The property on the model to reflect in toggle state by. Defaults to "enabled".
        property: "enabled",

        // label: [public] String
        //      The 'view settings' text of the command to be used in visual elements.
        label: localizations.viewsettingbutton,

        postscript: function () {
            this.inherited(arguments);
            if (!this.model) {
                this.set("model", dependency.resolve("epi.viewsettingsmanager"));
            }
        },

        _execute: function () {
            // summary:
            //      Overridden to publish "/epi/cms/action/eyetoggle" with the enabled state from the model
            this.inherited(arguments);
            topic.publish("/epi/cms/action/eyetoggle", this.model.get(this.property));
        },

        _viewChanged: function (type, args, data) {
            this.inherited(arguments);

            // Close the view settings button when compare becomes active.
            var view = data && data.viewName;
            if (this.active && view && view.indexOf("compare") !== -1) {
                this.execute();
            }
        }
    });
});
