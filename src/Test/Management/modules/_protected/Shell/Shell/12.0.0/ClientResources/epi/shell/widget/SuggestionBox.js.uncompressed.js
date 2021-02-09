define("epi/shell/widget/SuggestionBox", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-attr",

    // Dijit
    "dijit/_HasDropDown",
    "dijit/form/_ComboBoxMenu",
    "dijit/form/_AutoCompleterMixin",

    // EPi Framework
    "epi/shell/widget/SearchBox"
],

function (
// Dojo
    declare,
    lang,

    domAttr,

    // Dijit
    _HasDropDown,
    _ComboBoxMenu,
    _AutoCompleterMixin,

    // EPi Framework
    SearchBox
) {

    return declare([SearchBox, _HasDropDown, _AutoCompleterMixin], {
        // summary:
        //    A suggestion box, which will drop a list down when user input a string to a textbox to filter item in a pre-defined list.
        //
        // tags:
        //    public

        // dropDownClass: [protected extension] Function String
        //      Dropdown widget class, which would be used to create a widget, to show the search result.
        //      Subclasses should specify this.
        dropDownClass: _ComboBoxMenu,

        buildRendering: function () {
            this.inherited(arguments);

            domAttr.set(this.textbox, "autocomplete", "off");
            domAttr.set(this.textbox, "aria-haspopup", "true");
        },

        postCreate: function () {
            // summary:
            //      Post widget creation. Initialize event for buttons
            // tags:
            //      Protected

            this.inherited(arguments);

            // clear textbox value when clicking on clear button
            this.connect(this.clearButton, "onclick", lang.hitch(this, function () {
                this.closeDropDown();
            }));
        }
    });
});
