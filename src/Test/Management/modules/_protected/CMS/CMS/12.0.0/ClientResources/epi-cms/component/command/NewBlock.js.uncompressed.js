define("epi-cms/component/command/NewBlock", [
// dojo
    "dojo/_base/declare",
    // epi
    "epi/shell/DestroyableByKey",

    // command
    "epi-cms/command/NewContent",

    // resource
    "epi/i18n!epi/cms/nls/episerver.cms.components.createblock"
],

function (
// dojo
    declare,
    // epi
    DestroyableByKey,

    // command
    NewContentCommand,

    // resource
    resCreateBlock
) {

    return declare([NewContentCommand, DestroyableByKey], {
        // summary:
        //      New block command specially brewed for the SharedBlocksViewModel it will be disabled if the user is searching for content
        // tags:
        //      internal

        contentType: "episerver.core.blockdata",
        iconClass: "epi-iconPlus",
        label: resCreateBlock.command.label,
        resources: resCreateBlock,

        viewModel: null,

        _onModelChange: function () {

            // Listen to changes to the isSearching property on the view model and re-execute the onModelChange method to trigger
            // the canExecute methods to be re-evaluated
            this.destroyByKey("isSearchingWatch");
            this.ownByKey("isSearchingWatch", this.viewModel.watch("isSearching", this._onModelChange.bind(this)));

            this.inherited(arguments);
        },

        _canExecute: function () {
            // summary:
            //      Determines if the command can be executed and taking isSearching into calculations
            // tags:
            //      protected overridden

            var canExecute = this.inherited(arguments);

            // If the user is searching for content can execute should be false
            return canExecute && !this.viewModel.get("isSearching");
        }
    });
});
