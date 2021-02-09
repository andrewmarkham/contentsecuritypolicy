define("epi-cms/widget/CreateCommandsMixin", [
    //dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    //epi
    "epi/dependency",
    //epi-cms
    "../command/PopupCommand",
    "../command/NewContent",
    //resources
    "epi/i18n!epi/nls/episerver.shared"
],

function (
    //dojo
    array,
    declare,
    lang,
    //epi
    dependency,
    //epi-cms
    PopupCommand,
    NewContent,
    //resources
    sharedResources
) {
    return declare([], {
        // tags:
        //      internal xproduct

        contentRepositoryDescriptors: null,

        typeDescriptorManager: null,

        createCommandClass: NewContent,

        repositoryKey: null,

        category: null,

        isAvailableFlags: null,

        postscript: function () {
            this.inherited(arguments);
            if (!this.repositoryKey) {
                throw "You need to specify the repositoryKey field";
            }

            this.contentRepositoryDescriptors = this.contentRepositoryDescriptors || dependency.resolve("epi.cms.contentRepositoryDescriptors");
            declare.safeMixin(this, this.contentRepositoryDescriptors.get(this.repositoryKey));

            this.commandCategory = this.commandCategory || "context";

            //TODO: This should be specified elsewhere, its now duplicated from hierarchicallistviewmodel
            var menuType = { ROOT: 1, TREE: 2, LIST: 4 };

            this.isAvailableFlags = this.isAvailableFlags || menuType.ROOT | menuType.TREE;
        },

        getCreateCommands: function (index) {
            var createCommands = {};
            var commandIndex = index || 1;
            if (!this.creatableTypes) {
                return createCommands;
            }
            // Create commands for the types to create.
            array.forEach(this.creatableTypes, function (type) {
                createCommands[type] = {
                    command: this._createCommand(type),
                    isAvailable: this.isAvailableFlags,
                    order: commandIndex
                };
                commandIndex = commandIndex + 1;
            }, this);

            if (this.creatableTypes.length < 2) {
                return createCommands;
            }

            var popupCommand = new PopupCommand({
                label: sharedResources.action["new"],
                commands: createCommands
            });

            return {
                popupCommand: {
                    command: popupCommand,
                    order: index
                }
            };
        },

        _createCommand: function (type) {
            return new this.createCommandClass({
                contentType: type,
                category: this.commandCategory
            });
        }

    });
});
