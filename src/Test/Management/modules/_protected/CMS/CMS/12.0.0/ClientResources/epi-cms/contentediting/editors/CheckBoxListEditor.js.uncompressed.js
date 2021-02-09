define("epi-cms/contentediting/editors/CheckBoxListEditor", [

// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/on",
    "dojox/html/entities",

    // Dijit
    "dijit/focus",
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/form/CheckBox",

    // EPi
    "epi/shell/widget/_ValueRequiredMixin"
], function (

// Dojo
    array,
    declare,
    lang,
    domConstruct,
    on,
    entities,

    // Dijit
    focusUtil,
    _TemplatedMixin,
    _Widget,
    CheckBox,

    // EPi
    _ValueRequiredMixin

) {

    return declare([_Widget, _TemplatedMixin, _ValueRequiredMixin], {
        // tags:
        //      internal

        templateString: "<div class=\"dijit dijitReset dijitInline\"></div>",

        baseClass: "epi-checkBoxList",

        valueIsCsv: true,

        valueIsInclusive: true,

        value: null,

        constructor: function () {
            this._checkboxes = [];
            this._labelClickHandles = [];
        },

        buildRendering: function () {
            this.inherited(arguments);

            array.forEach(this.selections, this._addCheckBoxForItem, this);
        },

        destroy: function () {
            var checkbox;
            while ((checkbox = this._checkboxes.pop())) {
                checkbox.destroyRecursive();
            }

            var labelClickHandle;
            while ((labelClickHandle = this._labelClickHandles.pop())) {
                labelClickHandle.remove();
            }

            this.inherited(arguments);
        },

        focus: function () {
            // summary:
            //		Focus the widget.

            try {
                if (this._checkboxes.length > 0) {
                    focusUtil.focus(this._checkboxes[0].domNode);
                }
            } catch (e) {
                /*quiet*/
            }
        },

        onChange: function (/*===== newValue =====*/) {
            // summary:
            //		Callback when this widget's value is changed.
            // tags:
            //		callback
        },

        onBlur: function () {
            // summary:
            //		Callback when this widget loses focus.
            // tags:
            //		callback
        },

        onFocus: function () {
            // summary:
            //		Callback when this widget gains focus.
            // tags:
            //		callback
        },

        _calculateValue: function () {
            var values = [];
            var storeChecked = this.valueIsInclusive;
            array.forEach(this._checkboxes, function (checkbox) {
                if (storeChecked === checkbox.checked) {
                    values.push(checkbox.value);
                }
            });

            this._set("value", this.valueIsCsv ? values.join(",") : values);
        },

        _setValueAttr: function (value) {
            this._set("value", value);

            var values = [];
            if (value) {
                values = this.valueIsCsv ? value.split(",") : value;
            }

            var checkValues = this.valueIsInclusive;
            var compareCheckboxValue = this._compareCheckboxValue;

            array.forEach(this._checkboxes, function (checkbox) {
                checkbox.set("checked", checkValues === array.some(values, function (v) {
                    return compareCheckboxValue(checkbox, v);
                }));
            });
        },

        _compareCheckboxValue: function (checkbox, value) {
            // 'value' can be a different type from 'checkbox.value' so we stringify them before comparing.

            var checkboxValue = checkbox.value;

            if (checkboxValue === undefined || checkboxValue === null) {
                return false;
            }

            return checkboxValue.toString() === value.toString();
        },

        _onBlur: function () {
            this.inherited(arguments);
            this.onBlur();
        },

        _addCheckBoxForItem: function (item) {
            // Create a container for the label and checkbox.
            var container = domConstruct.create("div", { "class": "epi-checkboxContainer" }, this.domNode);

            // Add the checkbox to the container.
            var checkbox = new CheckBox({ value: item.value });
            checkbox.placeAt(container);

            this.own(
                on(checkbox, "change", lang.hitch(this, function () {
                    this._calculateValue();
                    this.onChange(this.value);
                }))
            );

            checkbox.set("readOnly", !!this.readOnly);

            this._checkboxes.push(checkbox);

            // Add a label for the checkbox
            var label = domConstruct.create("label", { "for": checkbox.id }, container);
            label.textContent = item.text;
            this._labelClickHandles.push(on(label, "click", lang.hitch(this, function () {
                focusUtil.focus(checkbox.domNode);
            })));
        }
    });
});
