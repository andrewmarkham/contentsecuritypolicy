define("epi/shell/widget/NullableDateTimeSelectorDropDown", [
    // dojo
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/on",

    // dijit
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",

    // epi
    "epi/shell/widget/DateTimeSelectorDropDown",
    "epi/datetime"
],
function (
    // dojo
    declare,
    domClass,
    domStyle,
    on,

    //dijit
    _WidgetBase,
    _TemplatedMixin,

    // epi
    DateTimeSelectorDropDown,
    datetime
) {
    var clearButton = declare([_WidgetBase, _TemplatedMixin], { templateString: "<div data-dojo-attach-point='clearButton' class='epi-clearButtonSlimInput'></div>" });

    return declare (DateTimeSelectorDropDown, {
        // summary:
        //    A modified DateTimeSelectorDropDown which includes a button to
        //    clear the date
        //
        // tags:
        //    public

        postCreate: function () {
            this.inherited(arguments);
            domClass.add(this.domNode, "epi-resourceInputContainer");
            this.clearButtonWidget = new clearButton().placeAt(this.focusNode, "after");
            this._toggleClearButton();

            this.own(on(this.clearButtonWidget, "click", this.clear.bind(this)));
            this.own(this.watch("value", this._toggleClearButton.bind(this)));
        },

        clear: function () {
            this.set("value", null);
            this._toggleClearButton();
        },

        _toggleClearButton: function () {
            // summary:
            //      Set visibility for clear button
            // tags:
            //      private

            // Show clear button only if a date value is present and field is editable
            domStyle.set(this.clearButtonWidget.domNode, "visibility", datetime.isDateValid(this.value) && !this.readOnly ? "visible" : "hidden");
        }
    });
});
