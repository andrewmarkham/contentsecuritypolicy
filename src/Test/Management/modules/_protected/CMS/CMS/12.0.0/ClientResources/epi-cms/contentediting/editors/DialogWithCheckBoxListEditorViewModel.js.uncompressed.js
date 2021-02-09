define("epi-cms/contentediting/editors/DialogWithCheckBoxListEditorViewModel", [
// Dojo
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojo/string",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.dialogwithcheckboxlisteditor"
], function (
// Dojo
    declare,
    Stateful,
    string,

    // Resources
    resources
) {

    return declare([Stateful], {
        // tags:
        //      internal

        value: "",
        selections: null,
        label: "",
        valueIsCsv: true,
        valueIsInclusive: true,

        constructor: function () {
            this.selections = [];
        },

        _valueSetter: function (value) {
            this.value = value;
            this._updateLabelText();
        },

        _selectionsSetter: function (value) {
            this.selections = value;
            this._updateLabelText();
        },

        _updateLabelText: function () {

            var labelText = "";
            var totalNumberOfItems = this.selections.length;
            var itemsInValue = 0;

            if (this.value) {
                itemsInValue = this.valueIsCsv ? this.value.split(",").length : this.value.length;
            }

            var numberOfSelectedItems = this.valueIsInclusive ? itemsInValue : totalNumberOfItems - itemsInValue;

            if (totalNumberOfItems === numberOfSelectedItems) {
                labelText = resources.all;
            } else if (numberOfSelectedItems === 0) {
                labelText = resources.none;
            } else {
                labelText = string.substitute(resources.of, { selected: numberOfSelectedItems, total: totalNumberOfItems });
            }

            this.set("label", labelText);
        }
    });
});
