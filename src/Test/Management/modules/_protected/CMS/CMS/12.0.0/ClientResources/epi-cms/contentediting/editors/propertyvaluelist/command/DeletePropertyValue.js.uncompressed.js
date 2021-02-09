define("epi-cms/contentediting/editors/propertyvaluelist/command/DeletePropertyValue", [
    "dojo/_base/declare",

    // Parent class and mixins
    "epi/shell/command/_Command",

    "epi/i18n!epi/nls/episerver.shared.action"
], function (
    declare,

    // Parent class and mixins
    _Command,

    localization
) {

    return declare([_Command], {
        // summary:
        //      Remove property value
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localization.deletelabel,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconTrash",

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "itemContext",

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed.
        canExecute: true,

        // isAvailable: [readonly] Boolean
        //      Flag which indicates whether this command is available in the current context.
        isAvailable: true,

        _execute: function () {
            this.model.remove();
        }
    });
});
