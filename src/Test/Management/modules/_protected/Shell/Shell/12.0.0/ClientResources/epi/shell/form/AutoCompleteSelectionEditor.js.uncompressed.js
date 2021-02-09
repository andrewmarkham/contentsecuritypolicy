define("epi/shell/form/AutoCompleteSelectionEditor", [
    "dojo/_base/declare",
    "epi/shell/store/JsonRest",
    "dijit/form/FilteringSelect"],
function (
    declare,
    JsonRest,
    FilteringSelect) {
    return declare([FilteringSelect], {
        // tags:
        //      internal

        // required: [public] Boolean
        //      True if user is required to enter a value into this field. False by default.
        required: false,

        postMixInProperties: function () {
            var store = new JsonRest({
                target: this.storeurl
            });
            this.set("store", store);

            this.inherited(arguments);
        },

        destroy: function () {
            // Remove the validtion message in case it has been displayed.
            this.displayMessage();

            this.inherited(arguments);
        }
    });
});
