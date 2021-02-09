define("epi/shell/dgrid/WidgetRow", [
    "dojo/_base/declare",
    "dijit/registry"
], function (declare, registry) {

    return declare(null, {
        // summary:
        //      A dgrid mixin which implements the insert row and remove row methods to ensure that
        //      the startup and destroy methods are run on the row when the row is a widget.
        //      Widgets using this mixin should override the render row method so that it returns
        //      the DOM node of a widget.
        // tags:
        //      public

        insertRow: function () {
            // summary:
            //      Ensures the widget is started after it has been inserted into the document.

            var row = this.inherited(arguments),
                widget = registry.byNode(row);

            widget.startup();

            return row;
        },

        removeRow: function (rowElement, justCleanup) {
            // summary:
            //      Destroys the widget associated with the row as well as removing the row from
            //      the list.
            // rowElement: Object|DOMNode
            //      Object or element representing the row to be removed.
            // justCleanup: Boolean
            //      If true, the row element will not be removed from the DOM.

            this.inherited(arguments);

            var element = rowElement.element || rowElement,
                widget = registry.byNode(element);

            if (widget) {
                widget.destroyRecursive(justCleanup);
            }
        }
    });
});
