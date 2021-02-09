define("epi-cms/command/TogglePreviewMode", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons.togglepreviewmode",
    // Parent class and mixins
    "epi/shell/command/ToggleCommand",
    "epi-cms/command/_NonEditViewCommandMixin",
    "epi-cms/_SidePanelsToggleMixin",
    "dijit/Destroyable"
], function (
    declare,
    lang,
    topic,
    // Resources
    localizations,
    // Parent class and mixins
    ToggleCommand,
    _NonEditViewCommandMixin,
    _SidePanelsToggleMixin,
    Destroyable
) {

    return declare([ToggleCommand, _NonEditViewCommandMixin, _SidePanelsToggleMixin, Destroyable], {
        // summary:
        //      Toggles the preview mode active state.
        // tags:
        //      internal

        // iconClass: [public] String
        //      The CSS class which represents the icon to be used in visual elements.
        iconClass: "epi-iconPreview",

        // tooltip: [public] String
        //      The description text of the command to be used in visual elements.
        tooltip: localizations.label,

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localizations.label,

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed; true by default.
        canExecute: true,

        constructor: function () {
            this.own(
                // Deactivate the option if we recieve a disable topic.
                topic.subscribe("/epi/cms/action/disablepreview", lang.hitch(this, "_deactivate"))
            );
        },

        _execute: function () {
            this.set("active", !this.active);

            if (this.active) {
                topic.publish("/epi/shell/action/changeview", "view");
                this._hideSidePanels();
            } else {
                this._restoreSidePanels();
                topic.publish("/epi/shell/action/changeview", null);
            }
        },

        _deactivate: function () {
            if (this.active) {
                this.set("active", false);
                this._restoreSidePanels();
            }
        },

        _viewChanged: function (type, args, data) {
            this.inherited(arguments);

            // Close the preview view if another view is opened.
            var view = data && data.viewName;
            if (view !== "view") {
                this._deactivate();
            }
        }
    });
});
