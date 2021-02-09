define("epi/shell/widget/ValidationTextarea", [
    "dojo/_base/declare",
    "dijit/form/Textarea",

    "epi/shell/widget/_ValueRequiredMixin"
],

function (declare, Textarea, _ValueRequiredMixin) {

    return declare([Textarea, _ValueRequiredMixin], {
        // summary:
        //    Textarea that supports required validation.
        //
        // description:
        //   Works with single boolean value instead of array like HTML or dijit Checkbox.
        //
        // tags:
        //    public

        _setPlaceHolderAttr: function (placeholder) {
            // summary:
            //      Sets the placeholder attribute on the textarea.
            // tags:
            //      protected

            this.inherited(arguments);
            this.set("placeholder", placeholder);
        },

        _setValueAttr: function (value) {
            //summary:
            //    Value's setter.
            //
            // value: String
            //    Value to be set.
            //
            // tags:
            //    protected

            this.inherited(arguments);

            this._started && this.validate();
        }
    });
});
