define("epi-cms/contentediting/editors/SelectionEditor", [

// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/on",

    "dojox/html/entities",

    // Dijit
    "dijit/form/Select",
    "dijit/MenuItem",
    "dijit/MenuSeparator",

    // EPi
    "epi/shell/layout/_LayoutWidget",
    "epi/shell/widget/_ValueRequiredMixin"
],
function (

// Dojo
    array,
    declare,
    lang,
    domClass,
    on,

    entities,
    // Dijit
    Select,
    MenuItem,
    MenuSeparator,

    // EPi
    _LayoutWidget,
    _ValueRequiredMixin
) {

    return declare([_LayoutWidget, Select, _ValueRequiredMixin], {
        // tags:
        //      public

        actualValue: null,

        value: null,

        // To limit height to available space in viewport
        maxHeight: -1,

        postMixInProperties: function () {
            // summary:
            //		Set options based on the selections passed through.

            this.inherited(arguments);

            this.set("selections", this.selections);

            this.actualValue = this.value;
        },

        _setSelectionsAttr: function (newSelections) {
            this.set("options", array.map(newSelections, function (item) {
                return {
                    label: entities.encode(item.text),
                    value: item.value,
                    selected: (item.value === this.value) || (!item.value && !this.value)
                };
            }, this));
        },

        postCreate: function () {
            this.inherited(arguments);

            this.own(on(this, "change", lang.hitch(this, function () {
                if (!this.disabled) {
                    this.validate();
                }
                this.onLayoutChanged();
            })));
        },

        _getMenuItemForOption: function (option) {
            // summary:
            //		For the given option, return the menu item that should be used to display it.

            var item = null;
            if (option.type === "separator") {
                item = new MenuSeparator();
            } else {
                var click = lang.hitch(this, "_setValueAttr", option);
                item = new MenuItem({
                    option: option,
                    label: option.label || this.emptyLabel,
                    onClick: click,
                    disabled: option.disabled || false
                });
                item.focusNode.setAttribute("role", "listitem");
            }

            this.own(item);
            return item;
        },

        _getValueFromOpts: function () {
            // summary:
            //		Returns the value of the widget by reading the options for the selected flag.

            var options = this.getOptions() || [];

            if (!this.multiple && options.length) {
                // Mirror what a select does - choose the first one
                var option = array.filter(options, function (i) {
                    return i.selected;
                })[0];
                if (option && option.value !== undefined) {
                    return option.value;
                } else {
                    return null;
                }
            } else if (this.multiple) {
                // Set value to be the sum of all selected
                return array.map(array.filter(options, function (i) {
                    return i.selected;
                }), function (i) {
                    return i.value;
                }) || [];
            }
            return "";
        },

        _setValueAttr: function (value, priorityChange) {
            // summary:
            //		Set the value of the widget.
            //		If a non-object is passed, then we set our value from looking it up.

            var options = this.getOptions() || [];

            if (value === null || typeof value != "object") {
                value = array.filter(options, function (i) {
                    return (i.value === value) || (!i.value && !value);
                });
            }

            // Convert item to an array if needed.
            if (!lang.isArray(value)) {
                value = [value];
            }

            if (this._onChangeActive) {
                var actual = value[0] ? value[0].value : null;

                this._pendingOnChange = this.actualValue !== actual;
                this.actualValue = actual;
            }

            array.forEach(options, function (i) {
                i.selected = array.some(value, function (v) {
                    return v.value === i.value;
                });
            });

            var val = array.map(value, function (i) {
                    return i.value;
                }),
                disp = array.map(value, function (i) {
                    return i.label;
                });

            this._set("value", this.multiple ? val : val[0]);
            this._setDisplay(this.multiple ? disp : disp[0]);
            this._updateSelection();
            this._handleOnChange(this.value, priorityChange);
        },

        _updateSelection: function () {
            // summary:
            //		Sets the "selected" class on the item for styling purposes.

            this._set("value", this._getValueFromOpts());
            var value = this.value;

            if (value !== undefined) {
                if (!lang.isArray(value)) {
                    value = [value];
                }
                array.forEach(this._getChildren(), function (child) {
                    var isSelected = array.some(value, function (v) {
                        return child.option && (v === child.option.value);
                    });
                    child.domNode.setAttribute("aria-selected", isSelected);
                }, this);
            }
        },

        validator: function (/*Object*/value, /*Object?*/ flags) {
            // summary:
            //      Validate the value is match with this selection value type.
            // tags:
            //      public abtract
        }
    });
});
