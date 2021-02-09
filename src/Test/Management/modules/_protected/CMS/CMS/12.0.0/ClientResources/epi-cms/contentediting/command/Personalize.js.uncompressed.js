define("epi-cms/contentediting/command/Personalize", [
    // General application modules
    "dojo/_base/declare",
    "epi-cms/contentediting/viewmodel/PersonalizedGroupViewModel",
    // Parent class
    "epi-cms/contentediting/command/_ContentAreaCommand",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea.personalize"
], function (declare, PersonalizedGroupViewModel, _ContentAreaCommand, resources) {

    return declare([_ContentAreaCommand], {
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: resources.label,

        // iconClass: [readonly] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconUsers",

        // category: [readonly] String
        //      A category which hints that this item should be displayed with a separator.
        category: "menuWithSeparator",

        _execute: function () {
            // summary:
            //      Opens the personalization dialog and adds the selected item to a visitor group if necessary.
            // tags:
            //      protected
            if (!this.model.contentGroup) {
                this.model.personalize();
            }
        },

        _onModelValueChange: function () {
            // summary:
            //      Updates canExecute after the model value has changed.
            // tags:
            //      protected
            this.set("canExecute", !!this.model && this.model.contentLink && !this.model.contentGroup && !this.model.get("readOnly"));
        }
    });
});
