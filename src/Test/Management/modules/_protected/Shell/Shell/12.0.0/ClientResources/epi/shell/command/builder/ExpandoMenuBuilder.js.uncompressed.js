define("epi/shell/command/builder/ExpandoMenuBuilder", [
    "dojo/_base/declare",
    "dojo/_base/lang",

    "../_CommandModelBindingMixin",
    "./ButtonBuilder",

    "epi/shell/widget/ExpandoMenuButton"
],

function (
    declare,
    lang,

    _CommandModelBindingMixin,
    ButtonBuilder,

    ExpandoMenuButton
) {

    return declare([ButtonBuilder], {
        // summary:
        //      Used to assemble an expando menu where all toggle commands is represented by expando buttons
        //      and the subsequent commands will be added as sub commands to the previous expando button
        // tags:
        //      internal

        _expandoClass: declare([ExpandoMenuButton, _CommandModelBindingMixin]),

        _expandoMenu: null,

        _create: function (/*epi/shell/command/_Command*/command) {
            // tags:
            //      protected override

            var hasOptions, isToggle;

            // If the command specifies a widget, just return it (not that beautiful)
            // used by the project selector in the eye expando-button.
            if (command.widget) {
                return command.widget;
            }

            hasOptions = command.get("options") instanceof Array;
            isToggle = typeof command.active === "boolean";

            if (!hasOptions && isToggle) {
                return this._expandoMenu = new this._expandoClass(this._createOptions(command));
            }

            return this.inherited(arguments);
        },

        _createOptions: function (/*epi/shell/command/_Command*/command) {
            // tags:
            //      protected

            return lang.mixin({
                innerText: command.innerText,
                showLabel: !!command.showLabel
            }, this.inherited(arguments));
        },

        _addToContainer: function (/*Object*/widget, /*Object*/container) {
            // summary:
            //      If the widget
            // tags:
            //      protected override

            // Any command other than expando menu buttons will be added as children to previously created expando menu button
            if (!(widget instanceof ExpandoMenuButton) && this._expandoMenu) {
                container = this._expandoMenu;
            }

            this.inherited(arguments, [widget, container]);
        }
    });
});
