define("epi-cms/project/command/SortProjectItems", [
    "dojo/_base/declare",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.command.sort",
    // Parent class
    "epi/shell/command/OptionCommand"
], function (
    declare,
    // Resources
    localizations,
    // Parent class
    OptionCommand
) {

    return declare([OptionCommand], {
        // tags:
        //      internal

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "projectButton",

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconSort",

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: localizations.label,

        // options: [readonly] Array
        //      An array of options objects that can be selected.
        options: null,

        // property: [readonly] String
        //      The name of the property on the model that will be set with the selected value on execute.
        property: "projectItemSortOrder",

        constructor: function () {
            this.options = [
                { label: localizations.nameascending,      key: "+Name",                  value: [{ attribute: "name", descending: false }]},
                { label: localizations.namedescending,     key: "-Name",                  value: [{ attribute: "name", descending: true }]},
                { label: localizations.status,             key: "+Status",                value: [{ attribute: "status", descending: false }, { attribute: "name", descending: false }]},
                { label: localizations.type,               key: "+PrimaryTypeIdentifier", value: [{ attribute: "primaryTypeIdentifier", descending: false }, { attribute: "name", descending: false }]},
                { label: localizations.modifieddescending, key: "-Modified",              value: [{ attribute: "modified", descending: true }, { attribute: "name", descending: false }]},
                { label: localizations.modifiedascending,  key: "+Modified",              value: [{ attribute: "modified", descending: false }, { attribute: "name", descending: false }]}
            ];
        }
    });
});
