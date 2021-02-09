define("epi/shell/widget/_ValueRequiredMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dijit/_CssStateMixin",
    "dijit/Tooltip"],

function (declare, lang, _CssStateMixin, Tooltip) {
    return declare([_CssStateMixin], {
        // summary:
        //     Mixin to support value required widgets which don't inherit ValidationTextBox.
        // tags:
        //     public

        // required: Boolean
        //     User is required to enter data into this field.
        required: null,

        // missingMessage: [public] String
        //     Message which is displayed when required is true and value is empty.
        missingMessage: "",

        // _valueValidationTooltip: [private] Tooltip
        //     The validation tooltip.
        _valueValidationTooltip: null,

        buildRendering: function () {
            this.inherited(arguments);

            this.own(this._valueValidationTooltip = new Tooltip());
        },

        _onFocus: function () {
            // summary:
            //     This is where widgets do processing for when they start being active,
            //     such as changing CSS classes.  See onFocus() for more details.
            // tags:
            //     protected

            this.inherited(arguments);

            this.validate(true);
        },

        _onBlur: function () {
            // summary:
            //     This is where widgets do processing for when they stop being active,
            //     such as changing CSS classes.  See onBlur() for more details.
            // tags:
            //     protected

            this.inherited(arguments);

            this.validate();
        },

        validate: function (/*Boolean*/ isFocused) {
            // summary:
            //     Show missing or invalid messages if appropriate, and highlight textbox field.
            // tags:
            //     protected

            var isValid = this.isValid(isFocused);

            // Behave like dijit form widgets:
            // Only show error state when has been previously focused. I.e. a newly loaded form should not be full of errors.
            var state = isValid ? "" : this._hasBeenBlurred ? "Error" : "Incomplete";
            this.set("state", state);

            this.set("message", this.getErrorMessage(isFocused));

            this.displayMessage(isValid ? "" : this.getErrorMessage());

            return isValid;
        },

        isValid: function (/*Boolean*/ isFocused) {
            // summary:
            //     Check if widget's value is valid.
            // isFocused:
            //     Indicate that the widget is being focused.
            // tags:
            //     protected
            return (!this.required || this.value || this.value === 0 || (lang.isArray(this.value) && this.value.length === 0)); // Not required or have some value.
        },

        displayMessage: function (/*String*/message) {
            // summary:
            //     Overridable method to display validation errors/hints.
            //     By default uses a tooltip.
            // tags:
            //     extension

            var tooltipNode = this.tooltipNode || this.domNode;

            if (message && this.focused && !this.isShowingChildDialog) {
                this._valueValidationTooltip.set("label", message);
                this._valueValidationTooltip.open(tooltipNode);
            } else {
                this.hideMessage();
            }
        },

        hideMessage: function () {
            // summary:
            //     Hides a message
            // tags:
            //     public

            this._valueValidationTooltip.close(this.tooltipNode || this.domNode);
        },

        getErrorMessage: function (/*Boolean*/ isFocused) {
            // summary:
            //     Return an error message to show if appropriate
            // tags:
            //     public

            var isValid = this.get("state") !== "Error";
            return isValid ? "" : this.missingMessage;
        }
    });
});
