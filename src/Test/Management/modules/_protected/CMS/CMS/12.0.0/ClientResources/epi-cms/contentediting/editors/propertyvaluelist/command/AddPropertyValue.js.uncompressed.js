define("epi-cms/contentediting/editors/propertyvaluelist/command/AddPropertyValue", [
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
        //      Adds an propertyvalue
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.add,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconPlus",

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["readOnly", "value"],

        _execute: function () {
            this.model.addItem();
        },

        _onPropertyChanged: function () {
            /// summary:
            //      Sets isAvailable and canExecute based on the properties to watch.
            // tags:
            //      protected

            var canAddNewItem = !this.model.maxLength || (this.model.get("value") && this.model.get("value").length < this.model.maxLength);
            var isAvailable = !this.model.readOnly && canAddNewItem;

            this.set({
                canExecute: isAvailable,
                isAvailable: isAvailable
            });
        }
    });
});
