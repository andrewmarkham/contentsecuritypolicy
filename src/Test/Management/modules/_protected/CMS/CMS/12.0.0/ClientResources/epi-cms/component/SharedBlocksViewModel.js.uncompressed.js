define("epi-cms/component/SharedBlocksViewModel", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    // epi
    "../asset/view-model/HierarchicalListViewModel",
    "epi-cms/component/_ShowAllLanguagesMixin",

    // command
    "./command/NewBlock",
    "epi-cms/command/ShowAllLanguages"
],

function (
// dojo
    declare,
    lang,
    when,
    // epi
    HierarchicalListViewModel,
    _ShowAllLanguagesMixin,

    // command
    NewBlockCommand,
    ShowAllLanguagesCommand
) {

    return declare([HierarchicalListViewModel, _ShowAllLanguagesMixin], {
        // summary:
        //      Handles search and tree to list browsing widgets.
        // tags:
        //      internal

        _selectedTreeItemsSetter: function (selectedItems) {
            // summary:
            //      Update model of commands in case selected content is folder
            // tags:
            //      private

            //The default upload command should only update when the list is updated.
            //It needs to be updated before the pseudocommanddecorator is applied.
            this._commandRegistry.newBlockDefault.command.set("model", selectedItems);

            this.inherited(arguments);
        },

        _setupCommands: function () {
            // summary:
            //      Creates and registers the commands used.
            // tags:
            //      protected

            this.inherited(arguments);

            this.showAllLanguagesCommand = new ShowAllLanguagesCommand({ model: this });
            this._setupShowAllLanguages();

            var customCommands = {
                newBlockDefault: {
                    command: new NewBlockCommand({
                        viewModel: this
                    })
                },
                allLanguages: {
                    command: this.showAllLanguagesCommand,
                    order: 55
                }
            };

            this._commandRegistry = lang.mixin(this._commandRegistry, customCommands);

            this.pseudoContextualCommands.push(this._commandRegistry.newBlockDefault.command);
        },

        _setupShowAllLanguages: function () {
            when(this._isSiteMultilingual()).then(function (isSiteMultilingual) {
                if (!isSiteMultilingual) {
                    return;
                }
                this.loadShowAllLanguages().then(function (value) {
                    this.set("showAllLanguages", value);
                    this.showAllLanguagesCommand.set("active", !value);
                }.bind(this));
            }.bind(this));
        },

        _showAllLanguagesSetter: function (value) {
            var oldValue = this.showAllLanguages;
            this.inherited(arguments);
            if (oldValue !== value) {
                this.saveShowAllLanguages(value);
                this.showAllLanguagesCommand.set("active", !value);
            }
        }
    });
});
