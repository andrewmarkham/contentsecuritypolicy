define("epi/shell/command/builder/MenuBuilder", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/Menu",
    "dijit/MenuItem",
    "dijit/CheckedMenuItem",
    "dijit/PopupMenuItem",
    "epi/shell/command/builder/_Builder",
    "epi/shell/command/builder/OptionsBuilderMixin",
    "epi/shell/command/_CommandModelBindingMixin"
], function (declare, lang, Menu, MenuItem, CheckedMenuItem, PopupMenuItem, _Builder, OptionsBuilderMixin, _CommandModelBindingMixin) {

    return declare([_Builder], {
        // summary:
        //      Builds a drop down button widget with commands as child menu items.
        // tags:
        //      internal xproduct

        // _menuItemClass: [private] class
        //      The class used for representing a menu item
        _menuItemClass: declare([MenuItem, _CommandModelBindingMixin]),

        // _checkedMenuItemClass: [private] class
        //      The class used for representing a checked menu item for a checked command
        _checkedMenuItemClass: declare([CheckedMenuItem, _CommandModelBindingMixin]),

        // _popupMenuItemClass: [private] class
        //      The class used for representing a popup menu item for a option command
        _popupMenuItemClass: declare([PopupMenuItem, _CommandModelBindingMixin]),

        _optionsMenuClass: declare([Menu, OptionsBuilderMixin]),

        _create: function (command) {
            // summary:
            //		Builds a menu item widget from the given command.
            // tags:
            //		public

            var isToggle = typeof command.active == "boolean",
                isOption = lang.isArray(command.options),
                isPopup = "popup" in command,
                cls = isToggle ? this._checkedMenuItemClass : ((isOption || isPopup) ? this._popupMenuItemClass : this._menuItemClass),
                options = lang.mixin({ model: command }, this.itemSettings);

            var widget = new cls(options);

            // If creating a command that already has a popup menu then associate it with the widget.
            if (isPopup) {
                if (command.popupClass) {
                    // Construct the popup class defined in the command.
                    command.set("popup", new command.popupClass({ category: command.popupCategory }));
                }
                widget.popup = command.popup;
            }

            // If creating a command that has options then create the options on the widget.
            if (isOption) {
                widget.popup = new this._optionsMenuClass({model: command});
            }

            return widget;
        }
    });
});
