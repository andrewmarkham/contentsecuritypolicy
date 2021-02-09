define("epi-cms/project/command/_ProjectCommand", [
    "dojo/_base/declare",
    // Parent class and mixins
    "epi/shell/command/_PropertyWatchCommand"
], function (
    declare,
    // Parent class and mixins
    _PropertyWatchCommand
) {

    return declare([_PropertyWatchCommand], {
        // summary:
        //      A base class for project commands which watches the selectedProject property and causes
        //      _onPropertyChanged to be called when it changes.
        // tags:
        //      internal xproduct

        // propertiesToWatch: [public] Array
        //      A list of properties to watch for changes.
        propertiesToWatch: ["selectedProject"],

        _onPropertyChanged: function () {
            // summary:
            //      The default for project commands is to not update canExecute
            //      so we override here and do nothing.
            // tags:
            //      protected override
        }
    });
});
