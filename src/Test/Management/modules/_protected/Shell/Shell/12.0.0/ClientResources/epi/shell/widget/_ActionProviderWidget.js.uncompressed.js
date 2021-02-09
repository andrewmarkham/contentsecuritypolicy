define("epi/shell/widget/_ActionProviderWidget", [
    "epi",
    "dojo",
    "dijit",
    "epi/shell/widget/_ActionConsumer",
    "epi/shell/widget/_ActionProvider"
],

function (epi, dojo, dijit, _ActionConsumer, _ActionProvider) {

    return dojo.declare([_ActionProvider], {
        // summary:
        //    Mixin for widgets that can provide the list of action and handlers to execute.
        //    Registers this provider widget in the closest enclosing action consumer widget on startup.
        //
        // tags:
        //    public deprecated

        // _actions: [private] Object
        //    The enclosing action conumer widget for this provider.
        _enclosingConsumer: null,

        startup: function () {
            // summary:
            //    Widget startup method, executes self registration of this provider.
            //
            // tags:
            //      public
            this.inherited(arguments);
            this._registerSelf();
        },

        destroy: function () {
            // summary:
            //    Tear-down method.
            //
            // tags:
            //    public
            this._unregisterSelf();
            this.inherited(arguments);
        },

        _registerSelf: function () {
            // summary:
            //    Registers this provider in closest found action consumer.
            //
            // tags:
            //    private
            this._enclosingConsumer = this._getEnclosingActionConsumer();
            if (this._enclosingConsumer !== null) {
                this._enclosingConsumer.addProvider(this);
            }
        },

        _unregisterSelf: function () {
            // summary:
            //    Unregisters this provider in closest found action consumer provider list.
            //
            // tags:
            //    private
            if (this._enclosingConsumer !== null) {
                this._enclosingConsumer.removeProvider(this);
            }
        },

        _getEnclosingActionConsumer: function () {
            // summary:
            //    Gets the closest parent widget that is action aonsumer. Returns null if enclosing action consumer widget is not found.
            //
            // tags:
            //    private
            var node = this.domNode.parentNode;
            while (node !== null) {
                var parentWidget = dijit.getEnclosingWidget(node);

                if (!parentWidget) {
                    return null;
                }

                if (parentWidget.isInstanceOf(_ActionConsumer)) {
                    return parentWidget;
                }
                node = parentWidget.domNode.parentNode;
            }
            return null;
        }

    });
});
