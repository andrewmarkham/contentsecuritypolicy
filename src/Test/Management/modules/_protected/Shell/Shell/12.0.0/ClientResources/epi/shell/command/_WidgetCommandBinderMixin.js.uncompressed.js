define("epi/shell/command/_WidgetCommandBinderMixin", [
    "dojo/_base/declare",
    "epi/shell/command/_CommandConsumerMixin"
], function (declare, _CommandConsumerMixin) {

    return declare(null, {
        // summary:
        //      A mixin for widgets that will automatically push commands from a provider(view model)
        //      to the closest parent widget which is a consumer.
        // tags:
        //      internal

        commandProvider: null,

        _consumerHandle: null,

        startup: function () {
            // summary:
            //		Adds this provider to the closest parent widget which is a consumer.
            // tags:
            //		protected

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            var consumer = this.getConsumer();
            if (!consumer) {
                return;
            }

            this._consumerHandle = consumer.addProvider(this.commandProvider || this);

            this.commandProvider.initializeCommandProviders && this.commandProvider.initializeCommandProviders();
        },

        getConsumer: function () {
            // summary:
            //		Gets the closest command consumer in the hierarchy.
            // tags:
            //		protected

            if (this.isInstanceOf(_CommandConsumerMixin)) {
                return this;
            }

            var parent = this.getParent();
            while (parent) {
                if (parent.isInstanceOf(_CommandConsumerMixin)) {
                    return parent;
                }
                parent = parent.getParent();
            }
        },

        destroy: function () {
            // summary:
            //		Remove the provider from any consumers.
            // tags:
            //		public

            this._consumerHandle && this._consumerHandle.removeProvider();

            this.inherited(arguments);
        }
    });
});
