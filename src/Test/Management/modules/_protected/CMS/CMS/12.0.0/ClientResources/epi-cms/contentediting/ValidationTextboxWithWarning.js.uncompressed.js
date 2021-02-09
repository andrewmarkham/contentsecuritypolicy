define("epi-cms/contentediting/ValidationTextboxWithWarning", [
    "dojo/_base/declare",
    "dojox/validate/regexp",

    "dijit/form/ValidationTextBox"

], function (declare, regexp, ValidationTextBox) {

    return declare([ValidationTextBox], {
        // tags:
        //      public

        // regExpForWarning: [extension protected] String
        //		regular expression string used to validate the input when typing
        regExpForWarning: null,

        // acceptUrl: boolean
        //      If this is true, user can input an url to the textbox e.g. http://, https://, ftp://
        acceptUrl: false,

        // acceptMailAddress: boolean
        //      If this is true, user can input an email address like mailto:username@mail.com
        acceptMailAddress: false,

        _refreshState: function () {
            // summary:
            //      Overrides ValidationTextbox._refreshState()
            // tags:
            //      private
            if (!this._created) {
                return;
            }
            this.focused ? this._validateWhenTyping() : this.validate(false);
        },

        _isValidWhenTyping: function () {
            // summary:
            //      Validate the value when typing
            // tags:
            //      private

            var value = this.textbox.value;
            return (this.acceptUrl && (new RegExp(regexp.url({ scheme: true }))).test(value))
                        || (this.acceptMailAddress && (new RegExp("mailto\\:" + regexp.emailAddress())).test(value))
                        || (this.regExpForWarning && (new RegExp("^(?:" + this.regExpForWarning + ")" + (this.required ? "" : "?") + "$")).test(value));
        },

        _validateWhenTyping: function () {
            // summary:
            //		Validate the value when typing and show hint(promptMessage) for user if neccessary
            // tags:
            //		private

            var message = "";
            var isValid = this.disabled || this.isValid(true);
            if (isValid) {
                this._maskValidSubsetError = true;
            }
            var isEmpty = this._isEmpty(this.textbox.value);
            var isValidSubset = !isValid && this._isValidSubset();
            this._set("state", isValid ? (this._isValidWhenTyping() ? "" : "Incomplete") :
                (((isEmpty || isValidSubset) && this._maskValidSubsetError) ? "Incomplete" : "Error"));
            this.focusNode.setAttribute("aria-invalid", isValid ? "false" : "true");

            if (this.state === "Error") {
                this._maskValidSubsetError = isValidSubset; // we want the error to show up after a blur and refocus
                message = this.getErrorMessage(true);
            } else if (this.state === "Incomplete") {
                message = this.getPromptMessage(true); // show the prompt whenever the value is not yet complete
                this._maskValidSubsetError = !this._hasBeenBlurred; // no Incomplete warnings while focused
            } else if (isEmpty) {
                message = this.getPromptMessage(true); // show the prompt whenever there's no error and no text
            }
            this.set("message", message);

            return isValid;
        }
    });
});
