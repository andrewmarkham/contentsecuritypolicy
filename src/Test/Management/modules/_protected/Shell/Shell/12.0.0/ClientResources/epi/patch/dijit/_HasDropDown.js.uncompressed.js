// Currently only a place holder for the core epi namespace
// Needed to get the amd loading properly defined, but should contain core epi parts

define("epi/patch/dijit/_HasDropDown", [
    "dojo/_base/array",
    "dojo/_base/lang",
    "dijit/_HasDropDown"
], function (array, lang, _HasDropDown) {
    // module:
    //      dijit/patch/form/_FormMixin
    // summary:
    //      Fix issue with null array when setting value to form

    lang.mixin(_HasDropDown.prototype, {
        _onBlur: function () {
            // summary:
            //      Called magically when focus has shifted away from this widget and it's dropdown

            /* THE FIX GOES HERE */
            /* --------------------------------------------------------------------------------------------- */

            // Close dropdown but don't focus my <input>.  User may have focused somewhere else (ex: clicked another
            // input), and even if they just clicked a blank area of the screen, focusing my <input> will unwantedly
            // popup the keyboard on mobile.
            this.closeDropDown(false);

            this.inherited(arguments);

            /* --------------------------------------------------------------------------------------------- */
            /* END FIX */
        },

        destroy: function () {
            /* THE FIX GOES HERE */
            /* --------------------------------------------------------------------------------------------- */

            // Apply dojo bug fix https://bugs.dojotoolkit.org/ticket/17275

            // If dropdown is open, close it, to avoid leaving dijit/focus in a strange state.
            // Put focus back on me to avoid the focused node getting destroyed, which flummoxes IE.
            if (this._opened) {
                this.closeDropDown(true);
            }

            /* --------------------------------------------------------------------------------------------- */
            /* END FIX */

            if (this.dropDown) {
                // Destroy the drop down, unless it's already been destroyed.  This can happen because
                // the drop down is a direct child of <body> even though it's logically my child.
                if (!this.dropDown._destroyed) {
                    this.dropDown.destroyRecursive();
                }
                delete this.dropDown;
            }
            this.inherited(arguments);
        }
    });

    _HasDropDown.prototype._onBlur.nom = "_onBlur";
    _HasDropDown.prototype.destroy.nom = "destroy";
});
