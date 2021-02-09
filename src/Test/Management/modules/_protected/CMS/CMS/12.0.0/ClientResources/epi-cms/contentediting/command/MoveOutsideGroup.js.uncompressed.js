define("epi-cms/contentediting/command/MoveOutsideGroup", [
    // General application modules
    "dojo/_base/declare",
    // Parent class
    "epi-cms/contentediting/command/_ContentAreaCommand",

    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea.personalize"
], function (declare, _ContentAreaCommand, resource) {

    return declare([_ContentAreaCommand], {
        // summary:
        //      Moves the selected content block outside the group if it belongs to a group
        //
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: resource.moveoutsidegroup,

        // tooltip: [public] String
        //      The description text of the command to be used in visual elements.
        tooltip: resource.moveoutsidegroup,

        // iconClass: [readonly] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "",

        // category: [readonly] String
        //      Indicates that this command should created with a separator.
        category: "menuWithSeparator",

        _execute: function () {
            // summary:
            //      Moves the block after the next sibling; this could be abother block or a visitor group.
            // tags:
            //      protected

            this.model.moveOutsideGroup();
        },

        _onModelValueChange: function () {
            // summary:
            //      Updates canExecute after the model value has changed.
            // tags:
            //      protected

            this.set("canExecute", this.model.contentGroup && !this.model.get("readOnly"));
        }
    });
});
