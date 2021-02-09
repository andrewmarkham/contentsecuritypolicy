define("epi-cms/compare/command/CompareViewSelection", [
    "dojo/_base/declare",
    // Parent class
    "epi/shell/command/OptionCommand"
], function (
    declare,
    // Parent class
    OptionCommand
) {

    return declare([OptionCommand], {
        // summary:
        //      A command for selecting the current compare view
        // tags:
        //      internal

        _selectedSetter: function (selected) {
            // summary:
            //      Overridden to set iconClass and tooltip based on the currently selected option
            this.inherited(arguments);
            this.get("options").some(function (option) {
                if (option.value === selected) {
                    this.set("iconClass", option.iconClass);
                    return true;
                }
            }, this);
        }

    });
});
