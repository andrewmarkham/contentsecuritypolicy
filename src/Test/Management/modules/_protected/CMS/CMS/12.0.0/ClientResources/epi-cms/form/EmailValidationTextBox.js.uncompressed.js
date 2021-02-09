define("epi-cms/form/EmailValidationTextBox", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/form/ValidationTextBox",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.form.emailvalidation"
],
function (
    declare,
    lang,
    ValidationTextBox,

    // Resources
    res
) {

    var module = declare([ValidationTextBox], {
        // summary:
        //    Represents the email input textbox.
        // tags:
        //    internal

        invalidMessage: res.invalidmessage,

        // addMailTo: Boolean
        //      If true the value will always be prepended
        //      with the mailto protocol
        addMailTo: false,

        validator: function (value, constraints) {
            // summary:
            //		Validate the text input with email address validation.
            // tags:
            //		override

            value = value || "";

            if (!this.required && this._isEmpty(value)) {
                return true;
            }

            // replace escaped sequences to enable/simplify regexp validation (\@ or "everythingInHereIsEsc@ped"
            value = value.replace(/\\.{1}/g, "replaced").replace(/".*?"/g, "replaced");

            return module.validationRegex.test(value);
        },

        _getValueAttr: function () {

            var value = this.inherited(arguments);

            if (this.addMailTo) {
                // make sure the hyper link has mailto: prefix
                value = value ? lang.trim(value) : "";
                if (value && value.indexOf("mailto:") !== 0) {
                    value = "mailto:" + value;
                }
            }

            return value;
        },

        _setValueAttr: function (value) {
            value = value ? value.replace("mailto:", "") : "";

            this.inherited(arguments, [value]);
        }
    });

    // Simple and incomplete test for email-likeness: somechars@somechars.somechars
    // only trying to stop the most common mistakes
    module.validationRegex = /.+@.+\..+/i;

    return module;

});
