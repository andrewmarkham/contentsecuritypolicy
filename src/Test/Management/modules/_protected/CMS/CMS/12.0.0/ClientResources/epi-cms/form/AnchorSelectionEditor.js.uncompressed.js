define("epi-cms/form/AnchorSelectionEditor", [
// Dojo
    "dojo/_base/declare",
    // EPi
    "epi-cms/contentediting/editors/SelectionEditor",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentselector"
],
function (
// Dojo
    declare,
    // EPi
    SelectionEditor,

    // Resources
    res
) {
    return declare([SelectionEditor], {
        // tags:
        //      internal

        // missingMessage: [public] String
        //    Message which is displayed when required is true and value is empty.
        missingMessage: res.requiredmessage,

        validator: function (/*Object*/value, /*Object?*/ flags) {
            // summary:
            //      Validate the value is match with anchor type.
            // tags:
            //      public override

            return !!value && value.indexOf("#") === 0;
        },

        isValid: function () {
            // summary:
            //      Overidden base class for validate function
            // tags:
            //      protected

            return !!this.value && this.value.indexOf("#") === 0;
        },

        _onFocus: function () {
            // summary:
            //		This is where widgets do processing for when they start being active,
            //		such as changing CSS classes.  See onFocus() for more details.
            // tags:
            //		protected

            if (this.get("disabled")) {
                return;
            }
            this.inherited(arguments);
            this.validate();
        },

        _onBlur: function () {
            // summary:
            //		This is where widgets do processing for when they stop being active,
            //		such as changing CSS classes.  See onBlur() for more details.
            // tags:
            //		protected

            if (this.get("disabled")) {
                return;
            }
            this.inherited(arguments);
            this.validate();
        }
    });
});
