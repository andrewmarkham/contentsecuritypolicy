define("epi-cms/form/UrlValidationTextBox", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/form/ValidationTextBox",
    "epi-cms/form/UrlValidationTextBoxModel",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.form.urlvalidation"
], function (
    declare,
    lang,
    ValidationTextBox,
    UrlValidationTextBoxModel,
    // Resources
    resources
) {

    return declare([ValidationTextBox], {
        // summary:
        //    Represents the hyper link input textbox.
        // tags:
        //    internal

        // addProtocol: Boolean
        //      If true, a protocol will be prepended the value if none exists.
        addProtocol: true,

        modelClassName: UrlValidationTextBoxModel,

        invalidMessage: resources.invalidmessage,

        // pattern: String
        //      The pattern used to verify if a value is valid
        pattern: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.model && this.modelClassName) {
                var modelClass = declare(this.modelClassName);
                this.model = new modelClass({ addProtocol: this.addProtocol, pattern: this.pattern });
            }
        },

        validator: function (value, flags) {
            // summary:
            //		Checks if a string could be a valid URL
            // value: String

            return this.model.validator(value, flags);
        },

        _getValueAttr: function () {
            return this.model.validateUrl(this.inherited(arguments));
        },

        _setPatternAttr: function (value) {
            this.inherited(arguments);
            this.model && (this.model.pattern = value);
        }
    });
});
