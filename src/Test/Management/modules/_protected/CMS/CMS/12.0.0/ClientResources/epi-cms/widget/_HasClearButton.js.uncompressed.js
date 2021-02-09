define("epi-cms/widget/_HasClearButton", [
    "epi",
    "dojo",
    "dijit"
], function (epi, dojo, dijit) {
    return dojo.declare(null, {
        // summary:
        //    Mixin for widgets that need child dialog ability.
        // tags:
        //    internal

        postCreate: function () {
            // summary:
            //		Initialize child widgets
            // tags:
            //    protected

            this.inherited(arguments);

            var eventName = this.clearButton.onClick ? "onClick" : "onclick";

            dojo.connect(this.clearButton, eventName, dojo.hitch(this, this.clearValue));
        },

        clearValue: function () {
            // summary:
            //		Do clear value
            // tags:
            //    protected
            if (this.readOnly) {
                return;
            }
            this.focus();
            var value = this.getEmptyValue();
            this.set("value", value);
        },

        getEmptyValue: function () {
            // summary:
            //		Gets widget's empty value.
            // description:
            //      Returns null by default. Override this method to change widget's empty value.
            // tags:
            //    protected

            return null;
        }
    });
});
