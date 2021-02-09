define("epi/shell/widget/PopupMenuItem", ["dojo/_base/declare", "dijit/_Container", "dijit/Menu", "dijit/PopupMenuItem"], function (declare, _Container, Menu, PopupMenuItem) {

    return declare([PopupMenuItem, _Container], {
        // summary:
        //  A custom popup menu implementation made to behave like a proper container
        //
        // tags:
        //      internal

        constructor: function () {
            // Create the popup sub menu which encapsulates the actual menu items
            this.popup = new Menu();
        },

        addChild: function (/*dijit/_Widget*/widget, /*int?*/insertIndex) {
            // summary:
            //  Adds a widget to the encapsulated menu

            return this.popup.addChild(widget, insertIndex);
        },

        getChildren: function () {
            // summary:
            //  return the children of this menu.

            return this.popup.getChildren();
        },

        removeChild: function (/*Widget|int*/ widget) {
            // summary:
            //		Removes the passed widget instance from this widget but does
            //		not destroy it.  You can also pass in an integer indicating
            //		the index within the container to remove

            return this.popup.removeChild(widget);
        }
    });
});
