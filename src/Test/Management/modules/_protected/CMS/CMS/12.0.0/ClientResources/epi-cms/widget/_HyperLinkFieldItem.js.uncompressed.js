require({cache:{
'url:epi-cms/widget/templates/_HyperLinkFieldItem.html':"﻿<div class=\"epi-form-container__section__row epi-form-container__section__row--field epi-hyperLink\">\r\n    <label for=\"${id}_${name}\">\r\n        <input type=\"radio\" name=\"${groupname}\" id=\"${id}_${name}\" value=\"${name}\" data-dojo-type=\"dijit/form/RadioButton\" data-dojo-attach-event=\"onchange:_onRadioButtonChange\" data-dojo-attach-point=\"radioNode\" />\r\n        ${displayName}\r\n    </label>\r\n</div>"}});
﻿define("epi-cms/widget/_HyperLinkFieldItem", [
//dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    //dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_Contained",
    //epi
    "epi/string",
    //resources
    "dojo/text!./templates/_HyperLinkFieldItem.html"
],
function (
//dojo
    declare,
    lang,
    //dijit
    _Widget,
    _TemplatedMixin,
    _Contained,
    //epi
    epiString,
    //resources
    template
) {
    return declare([_Widget, _Contained, _TemplatedMixin], {
        // tags:
        //      internal

        templateString: template,

        // Represents widget to input link value
        inputWidget: null,

        inputWidgetCtor: null,

        // Settings for child widget
        settings: null,

        // Set by form _FormMixin and used by validation to determine whether the error state should be shown
        _hasBeenBlurred: false,

        buildRendering: function () {
            this.inherited(arguments);

            var settings = lang.mixin({value: this.get("value") || null}, this.settings);

            this.own(this.inputWidget = new this.inputWidgetCtor(settings).placeAt(this.domNode));
        },

        _onRadioButtonChange: function (evt) {
            this.onRadioButtonChange(this, evt);
        },

        onRadioButtonChange: function (target, evt) {
            // trigger radio button change value event
        },

        validate: function () {
            if (this.inputWidget) {
                // Set by form _FormMixin and used by validation to determine whether the error state should be shown
                this.inputWidget._hasBeenBlurred = this._hasBeenBlurred;
                return this.inputWidget.validate();
            }
            return true;
        },

        _setValueAttr: function (value) {
            this._set("value", value);
            if (this.inputWidget) {
                this.inputWidget.set("value", value);
            }
        },

        _getValueAttr: function () {
            if (this._started && this.inputWidget) {
                return this.inputWidget.get("value");
            }

            return this.value;
        },

        _setRequiredAttr: function (val) {
            this._set("required", val);
            if (this.inputWidget) {
                this.inputWidget.set("required", val);
            }
        },

        _setSelectedAttr: function (value) {
            this._set("selected", value);
            if (this.inputWidget) {
                this.inputWidget.set("disabled", !value);

                if (!value) {
                    this.inputWidget.set("state", "");
                }
            }

            this.radioNode.checked =  value;
        },

        _getSelectedAttr: function () {
            return this.radioNode.checked;
        },

        _setShowAllLanguagesAttr: function (val) {
            this._set("showAllLanguages", val);
            if (this.inputWidget) {
                this.inputWidget.set("showAllLanguages", val);
            }
        },

        focus: function () {
            if (this.inputWidget) {
                this.inputWidget.focus();
            }
        }
    });
});
