define("epi-cms/widget/EmptyTrashMenu", [
    // Dojo
    "dojo/_base/declare",

    // Dijit
    "dijit/layout/_LayoutWidget",

    // EPi Framework
    "epi/shell/command/builder/ButtonBuilder",
    "epi/shell/command/builder/DropDownButtonBuilder",
    "epi/shell/command/builder/MenuAssembler",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.trash"
],

function (
// Dojo
    declare,

    // Dijit
    _LayoutWidget,

    // EPi Framework
    ButtonBuilder,
    DropDownButtonBuilder,
    MenuAssembler,

    // Resources
    resources
) {

    return declare([_LayoutWidget], {
        // summary:
        //      A widget to display empty trash button.
        //
        // tags:
        //      internal

        resources: resources,

        _setCommandsAttr: function (commands) {
            // summary:
            //      Set empty trash commands.
            // tags:
            //      private

            this._set("commands", commands);
            this._bindEmptyTrashMenu(commands);
        },

        _bindEmptyTrashMenu: function (commands) {
            // summary:
            //      Bind empty button by empty provider commands with confirmation dialog.
            // tags:
            //      private

            // destroy all old button or menu commands
            this.destroyDescendants();

            if (!commands || commands.length < 1) {
                return;
            }

            var isDropDownButton = commands.length > 1;

            var emptyButton = null;
            //Assemble the menu or button for the available commands
            if (isDropDownButton) {
                emptyButton = new DropDownButtonBuilder({
                    settings: {
                        label: resources.emptytrash.title,
                        dropDownPosition: ["below-alt"] // align dropdown menu open on the left of the button
                    }
                });
            } else {
                emptyButton = new ButtonBuilder({
                    settings: {
                        label: resources.emptytrash.title
                    }
                });

                this.commands[0].label = resources.emptytrash.title;
            }

            new MenuAssembler({ configuration: [{ builder: emptyButton, target: this}], commandSource: this }).build();
        },

        getCommands: function () {
            // summary:
            //      Get commands with confirmation.
            // tags:
            //      public

            return this.get("commands");
        }
    });
});
