define("epi-cms/contentediting/command/LanguageSelection", [
    "dojo/_base/declare",
    // Parent class
    "epi/shell/command/OptionCommand",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting"
], function (
    declare,
    // Parent class
    OptionCommand,
    // Resources
    resources
) {

    return declare([OptionCommand], {
        // summary:
        //      A command for selecting the current compare view
        // tags:
        //      internal

        optionsLabel: resources.contentdetails.existinglanguages,

        active: false,

        // selected: [readonly] String
        //		The value of the selected item from the options array. Defaults to an empty string
        //		so that it matches the model's default value.
        selected: "",

        _selectedSetter: function (selected) {
            // summary:
            //      Overridden to set label based on the currently selected option
            this.inherited(arguments);

            if (typeof (selected) ==  "string" && selected !== "") {
                this.set("label", selected.toUpperCase());
                if (selected !== this.model.get("documentLanguage")) {
                    this.set("active", true);
                } else {
                    this.set("active", false);
                }
            }

        }

    });
});
