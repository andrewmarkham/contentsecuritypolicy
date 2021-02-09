define("epi-cms/form/ValidationError", ["dojo"], function (dojo) {

    return dojo.declare(null, {
        // tags:
        //      internal

        constructor: function () {
            this._validationMessages = [];
            this._validationInputs = [];
        },
        Add: function (validationMessage, validationInput) {
            this._validationMessages.push(validationMessage);
            this._validationInputs.push(validationInput);
        },
        GetValidationMessages: function () {
            return this._validationMessages;
        },
        GetValidationInputs: function () {
            return this._validationInputs;
        },
        GetValidationMessage: function (i) {
            return this._validationMessages[i];
        },
        GetValidationInput: function (i) {
            return this._validationInputs[i];
        }
    });
});
