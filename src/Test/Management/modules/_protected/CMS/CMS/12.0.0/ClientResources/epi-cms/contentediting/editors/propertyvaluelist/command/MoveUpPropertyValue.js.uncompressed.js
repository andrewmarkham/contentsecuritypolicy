define("epi-cms/contentediting/editors/propertyvaluelist/command/MoveUpPropertyValue", [
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
        //      Moveup property value
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.moveup,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconUp",

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "itemContext",

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["selectedValue"],

        _execute: function () {
            this.model.moveUp();
        },

        _onPropertyChanged: function () {
            /// summary:
            //      Sets canExecute based on the properties to watch.
            // tags:
            //      protected

            var model = this.model;

            if (model.store.data.length > 1) {
                //Set canExecute to false if the item already is the first one in the list
                this.set("canExecute", model.get("selectedValue") && !!model.getPreviousElement(model.get("selectedValue").data));
            } else {
                this.set("canExecute", false);
            }
        }
    });
});
