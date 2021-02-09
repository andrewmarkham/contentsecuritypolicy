define("epi/shell/form/SuggestionSelectionEditor", [
    "dojo/_base/declare",
    "epi/shell/store/JsonRest",
    "dijit/form/ComboBox"],
function (
    declare,
    JsonRest,
    ComboBox) {
    return declare([ComboBox], {
        // tags:
        //      internal

        postMixInProperties: function () {
            var store = new JsonRest({
                target: this.storeurl
            });
            this.set("store", store);

            this.inherited(arguments);
        }
    });
});
