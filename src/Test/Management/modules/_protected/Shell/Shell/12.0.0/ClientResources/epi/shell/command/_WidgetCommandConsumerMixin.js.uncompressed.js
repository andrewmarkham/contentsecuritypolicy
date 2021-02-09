define("epi/shell/command/_WidgetCommandConsumerMixin", [
    "dojo/_base/declare",

    "epi/shell/command/_CommandConsumerMixin",
    "epi/shell/command/_WidgetCommandProviderMixin"
], function (declare, _CommandConsumerMixin, _WidgetCommandProviderMixin) {

    return declare([_CommandConsumerMixin, _WidgetCommandProviderMixin], {
        // summary:
        //		A mixin for objects that will consume and provide commands from widgets and the global command provider
        // tags:
        //		internal

    });
});
