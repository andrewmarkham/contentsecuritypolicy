define("epi/shell/command/builder/_Builder", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/registry"
], function (array, declare, lang, registry) {

    return declare(null, {
        // summary:
        //      Builds a widget and connects events based on a command object.
        //
        // tags:
        //      internal xproduct

        // settings: [public] Object
        //		An optional settings object that will be applied to all widgets created.
        settings: null,

        postscript: function (mixin) {
            // summary:
            //		Mix constructor arguments into the object after construction.
            // tags:
            //		protected

            if (mixin) {
                lang.mixin(this, mixin);
            }
        },

        create: function (command, container) {
            // summary:
            //		Creates a widget from the given command and adds it to the given container.
            // tags:
            //		public

            var widget = this._create(command);

            // Create back-reference to command so that we can identify this widget.
            widget._command = command.settings && command.settings.model ? command.settings.model : command;
            widget._commandCategory = command.category;
            this._addToContainer(widget, container);
        },


        remove: function (command, container) {
            // summary:
            //      Remove the ui representation of a specific command from a container
            // command: epi/shell/command/_Command
            //      The command to remove
            // container: dijit/_Widget
            //      The container displaying the command
            // tags:
            //      public

            var children = this._getChildren(container),
                len = children.length,
                i = 0;

            for (; i < len; i++) {
                var child = children[i];
                if (child._command === command) {
                    this._onBeforeChildDestroy(container, i);

                    // remove child should be called only when container is a widget
                    if (container && container.declaredClass) {
                        container.removeChild(child);
                    }
                    child.destroy();
                    return true;
                }
            }
            return false;
        },

        _create: function (/*===== command =====*/) {
            // summary:
            //		Builds a widget from the given command. Subclasses should override this method.
            // tags:
            //		protected
        },

        _onBeforeChildDestroy: function (/*===== container, index =====*/) {
            // summary:
            //      Called before child widget is removed from container
            // container: DomNode|Widget
            //      The container to get the children for
            // index: int
            //      index of deleting item
            // tags:
            //      protected
        },

        _addToContainer: function (widget, container) {
            // summary:
            //		Adds the widget to the container.
            // tags:
            //		protected
            var insertIndex = null;

            // If the command has specified a order try to find the insert index
            if (widget._command) {
                var order = this._getSortOrder(widget);
                this._getChildren(container).some(function (child, index) {
                    var childOrder = this._getSortOrder(child);
                    if (childOrder > order) {
                        insertIndex = index;
                        // Break out of some
                        return true;
                    }
                }, this);
            }

            widget.placeAt(container, insertIndex);
        },

        _getSortOrder: function (widget) {
            // summary:
            //      Get the sort order for the widget
            //      If the command and/or the order of the command is undefined
            //      the order will be 0
            // widget: Widget
            //      The widget to get the sort order for
            //
            // tags:
            //      protected

            return (widget._command && widget._command.order) ? widget._command.order : 0;
        },

        _getChildren: function (container) {
            // summary:
            //      Gets the child widgets
            //
            // container: DomNode|Widget
            //      The container to get the children for
            // tags:
            //      protected

            // If the container is a container widget, get the children using getChildren
            // otherwise try to get the child widgets using the dijit registry
            if (typeof (container.getChildren) === "function") {
                return container.getChildren();
            } else {
                return registry.findWidgets(container);
            }
        }
    });
});
