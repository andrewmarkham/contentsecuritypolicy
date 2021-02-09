define("epi-cms/form/UrlValidationTextBoxModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/Url"
], function (
    declare,
    lang,
    Url
) {

    var module = declare([], {
        // summary:
        //    Represents model for Url validation textbox.
        // tags:
        //    internal

        // pattern: String
        //      Regular expression to test if a value is valid.
        pattern: null,

        // addProtocol: Boolean
        //      If true,  a protocol will be prepended the value
        addProtocol: true,

        validator: function (value, flags) {
            // summary:
            //		Checks if a string could be a valid URL
            // value: String

            var re = this.pattern ? new RegExp(this.pattern, "i") : module.validationRegex;

            return re.test(value);
        },

        validateUrl: function (value) {

            // trim the spaces
            value = value ? lang.trim(value) : "";

            if (!this.addProtocol || value === "") {
                return value;
            }

            if (this.validator(value)) {
                return value; // we have a start of the string that should not be modified
            } else {
                if (value.indexOf("\\\\") === 0) {
                    value = "file://" + value.substr(2);
                } else {
                    // in case no schema is given, default to http
                    value = "http://" + value;
                }

                return value;
            }
        }
    });

    module.validationRegex = /^([a-z]+:|\/|\.).+/i; // match "somechars:anychars"

    return module;
});
