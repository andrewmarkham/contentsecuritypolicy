define("epi/shell/command/_WidgetCommandProviderMixin", [
    "dojo/_base/declare",
    "epi/shell/command/_WidgetCommandBinderMixin",
    "epi/shell/command/_GlobalCommandProviderMixin"
], function (declare, _WidgetCommandBinderMixin, _GlobalCommandProviderMixin) {

    return declare([_GlobalCommandProviderMixin, _WidgetCommandBinderMixin], {
        // summary:
        //      A mixin for widgets that will automatically provide commands to the closest parent widget which is a consumer.
        //
        // tags:
        //      internal xproduct

        postMixInProperties: function () {
            this.inherited(arguments);

            this.commandProvider = this.commandProvider || this;
        }

    });
});
