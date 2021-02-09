define("epi/patch/dijit/form/_Spinner", [
    "dojo/_base/lang",
    "dijit/form/_Spinner",
    "dijit/form/_TextBoxMixin"
], function (lang, _Spinner, _TextBoxMixin) {
    // summary:
    //      Monkey patch mouse wheel scrolling so it doesn't grab focus when scrolling over the input field,
    //      otherwise the spinner value starts scrolling instead of the document.
    //
    //      https://bugs.dojotoolkit.org/ticket/18300

    var base = _Spinner.prototype._mouseWheeled;

    lang.mixin(_Spinner.prototype, {

        _arrowPressed: function (/*Node*/ nodePressed, /*Number*/ direction, /*Number*/ increment) {
            // summary:
            //		Handler for arrow button or arrow key being pressed
            if (this.disabled || this.readOnly) {
                return;
            }
            /*------PATCH START------*/
            !this.focused && this.focus();
            /*------PATCH END--------*/
            this._setValueAttr(this.adjust(this.get('value'), direction * increment), false);
            _TextBoxMixin.selectInputText(this.textbox, this.textbox.value.length);
        },

        _mouseWheeled: function (/*Event*/ evt) {
            // summary:
            //      Do an early exit if spinner is not focused, otherwise call the base implementation.

            if (!this.get("focused")) {
                return;
            }

            return base.apply(this, arguments);
        }

    });

    _Spinner.prototype._arrowPressed.nom = "_arrowPressed";
    _Spinner.prototype._mouseWheeled.nom = "_mouseWheeled";
});
