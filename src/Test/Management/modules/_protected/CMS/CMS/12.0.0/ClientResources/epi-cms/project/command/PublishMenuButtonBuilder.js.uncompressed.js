define("epi-cms/project/command/PublishMenuButtonBuilder", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",

    "dijit/form/Button",

    "epi/shell/command/_CommandModelBindingMixin",
    "epi/shell/command/builder/ButtonBuilder"
], function (
    declare,
    lang,
    on,

    Button,

    _CommandModelBindingMixin,
    ButtonBuilder
) {

    return declare([ButtonBuilder], {
        // summary:
        //      Creates buttons for commands with an ability to emit a beforeFocusedButtonRemoved event on
        //      its domNode when made unavailable in a focused state.
        // tags:
        //      internal

        _buttonClass: declare([Button, _CommandModelBindingMixin], {
            _setSelected: function () {
                // summary:
                //      Needed for buttons to work inside a menu
            },

            _setIsAvailableAttr: function (available) {
                // summary:
                //      Overridden to emit a beforeFocusedButtonRemoved event when the command
                //      is made unavailable while the button has focus.

                if (!available && this.get("focused")) {
                    on.emit(this.domNode, "beforeFocusedButtonRemoved", { bubbles: true });
                }
                this.inherited(arguments);
            }
        })
    });
});
