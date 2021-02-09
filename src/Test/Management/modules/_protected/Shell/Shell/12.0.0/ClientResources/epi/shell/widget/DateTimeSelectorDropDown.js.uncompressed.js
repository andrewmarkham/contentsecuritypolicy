define("epi/shell/widget/DateTimeSelectorDropDown", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/keys",
    "dijit/form/_DateTimeTextBox",
    "epi/shell/widget/DateTimeSelector"
],

function (declare, lang, keys, _DateTimeTextBox, DateTimeSelector) {

    return declare([_DateTimeTextBox], {
        // tags:
        //      public

        baseClass: "dijitTextBox dijitComboBox dijitDateTextBox",

        popupClass: DateTimeSelector,

        forceWidth: false,

        _isSelecting: false,
        _canceled: false,
        _isDropDownShowing: false,

        constructor: function () {
            this.constraints = {
                formatLength: "short",
                fullYear: "true"
            };
        },

        toggleDropDown: function () {
            // summary:
            //    Callback when the user presses the down arrow button or presses
            //    the down arrow key to open/close the drop down.
            //    Toggle the drop-down widget; if it is up, close it, if not, open it
            // tags:
            //      protected

            this._isSelecting = !this._isSelecting;

            this.inherited(arguments);
        },

        openDropDown: function () {
            // summary:
            //    Opens the dropdown for this widget.   To be called only when this.dropDown
            //    has been created and is ready to display (ie, it's data is loaded).
            // returns:
            //    return value of dijit.popup.open()
            // tags:
            //    protected

            this.inherited(arguments);

            //Remove on change handler
            this.dropDown.onChange = function () {
            };

            this.connect(this.dropDown.domNode, "onkeypress", lang.hitch(this, function (e) {
                this._canceled = e.keyCode === keys.ESCAPE;

                if (e.keyCode === keys.ESCAPE || e.keyCode === keys.ENTER) {
                    // We know that dropdown is opening, we also need to set focus on textbox after closing dropdown.
                    this._isSelecting = false;
                    this.closeDropDown(true);
                }
            }));


            // Set this flag so the dropdown won't close while selecting date and time.
            this._isSelecting = true;

            this._canceled = false;

            this._dropDownShowing = true;
        },

        closeDropDown: function (/*Boolean*/focus) {
            // summary:
            //    Closes the drop down on this widget
            // focus:
            //    If true, refocuses the button widget
            // tags:
            //    protected

            // It will only close the dropdown when clicked on the arrow button
            // or on onBlur event.
            if (!this._isSelecting && this._dropDownShowing) {
                if (!this._canceled && this.dropDown) {
                    this.set("value", this.dropDown.get("value"));
                }

                this.inherited(arguments);
                this._dropDownShowing = false;
            }
        },

        _onBlur: function () {
            // summary:
            //    Called magically when focus has shifted away from this widget and it's dropdown
            // tags:
            //    private

            // Set the isSelecting to False, so the
            // dropdown can be closed.
            this._isSelecting = false;

            //We need to close the dropdown before we do _onBlur
            //Needed since we have patched _HasDropDown._onBlur
            if (this._dropDownShowing) {
                this.closeDropDown();
            }

            this.inherited(arguments);
        }
    });
});
