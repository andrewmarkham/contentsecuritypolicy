define("epi/shell/command/builder/DropDownButtonBuilder", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dijit/Menu",
    "dijit/form/DropDownButton",
    "epi/shell/command/builder/MenuBuilder",
    "epi/shell/DestroyableByKey"
], function (
    declare,
    lang,
    domClass,
    Menu,
    DropDownButton,
    MenuBuilder,
    DestroyableByKey
) {

    return declare([MenuBuilder, DestroyableByKey], {
        // summary:
        //      Builds a drop down button widget with commands as child menu items.
        // tags:
        //      internal

        //Hides empty button instead of disable it
        hideEmptyButton: false,

        _button: null,

        remove: function (command, container) {
            // summary:
            //      Remove the ui representation of a specific command from a container
            // command: epi/shell/command/_Command
            //      The command to remove
            // container: dijit/_Widget
            //      The container displaying the command
            // tags:
            //      public

            var button = this._button,
                children = button.dropDown ? button.dropDown.getChildren() : [];

            children.forEach(function (child) {
                if (child._command === command) {
                    this.destroyByKey(command);
                    button.removeChild(child);
                    child.destroy();
                    return true;
                }
            }, this);
            return false;
        },


        _addToContainer: function (widget, container) {
            // summary:
            //		Adds a drop down button to the container if not added already, and
            //		adds the widget to the drop down button.
            // tags:
            //		protected
            if (!this._button) {
                this._button = new DropDownButton(lang.mixin({ dropDown: new Menu() }, this.settings));
                this._button._commandCategory = widget._commandCategory;
            }

            if (container.addChild) {
                container.addChild(this._button);
            } else {
                this._button.placeAt(container);
                this._button.startup();
            }

            this.inherited(arguments, [widget, this._button.dropDown]);

            this._toggleButton();
            this.ownByKey(widget._command, widget._command.watch("isAvailable", lang.hitch(this, this._toggleButton)));
        },

        _toggleButton: function () {
            // summary:
            //      Toggles or hides widget when all command in the group has set isAvailable to false.
            // tags:
            //      private
            var children = this._button.dropDown.getChildren(),
                len = children.length,
                i = 0,
                hideButton = true, child;

            for (i; i < len; i++) {
                child = children[i];
                //If one command has available set to true break and show the button
                if (child._command.isAvailable) {
                    hideButton = false;
                    break;
                }
            }
            if (this.hideEmptyButton) {
                domClass.toggle(this._button.domNode, "dijitHidden", hideButton);
            } else {
                this._button.set("disabled", hideButton);
            }
        }

    });
});
