define("epi/shell/form/CategorizedSelect", [
    "dojo/_base/declare",
    "./CategoryMenuItem",
    "dijit/form/Select"
], function (declare, CategoryMenuItem, Select) {

    return declare([Select], {
        // summary:
        //      Extended Select widget that allows to group menu items.
        //
        // tags:
        //     internal

        baseClass: "epi-categorized-select- dijitSelect dijitValidationTextBox",

        _getMenuItemForOption: function (/*_FormSelectWidget.__SelectOption*/ option) {
            // summary:
            //     For the given option, return the menu item that should be used to display it.
            //     If the option is an items group, the MenuItemGroup is created
            // tags:
            //     protected

            if (option.category) {
                return new CategoryMenuItem({ ownerDocument: this.ownerDocument, label: option.label });
            }

            return this.inherited(arguments);
        }
    });
});
