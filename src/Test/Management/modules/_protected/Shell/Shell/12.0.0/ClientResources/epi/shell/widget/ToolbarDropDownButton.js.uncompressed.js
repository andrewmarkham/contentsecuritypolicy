define("epi/shell/widget/ToolbarDropDownButton", [
    "dojo",
    "dojo/dom-style",
    "dijit/form/DropDownButton",
    "dijit/Menu"
],
function (dojo, domStyle, DropDownButton, Menu) {
    return dojo.declare([DropDownButton], {
        // tags:
        //      internal

        constructor: function () {
            // Create the sub menu which encapsulates the actual menu items
            this.dropDown = new Menu();
        },

        buildRendering: function () {
            this.inherited(arguments);
            this._setVisibility();
        },

        addChild: function (/*dijit/_Widget*/widget, /*int?*/insertIndex) {
            // summary:
            //  Adds a widget to the encapsulated menu

            if (!widget.separator) {
                widget.set("separator", "dijit/MenuSeparator");
            }

            var value = this.dropDown.addChild(widget, insertIndex);
            this._setVisibility();
            return value;
        },

        getChildren: function () {
            // summary:
            //  return the children of this button.

            return this.dropDown.getChildren();
        },

        removeChild: function (/*Widget|int*/widget) {
            // summary:
            //		Removes the passed widget instance from this widget but does
            //		not destroy it.  You can also pass in an integer indicating
            //		the index within the container to remove

            var value = this.dropDown.removeChild(widget);
            this._setVisibility();
            return value;
        },

        _setVisibility: function () {
            if (this.hasChildren()) {
                domStyle.set(this.domNode, "display", "");
            } else {
                domStyle.set(this.domNode, "display", "none");
            }
        }
    });
});
