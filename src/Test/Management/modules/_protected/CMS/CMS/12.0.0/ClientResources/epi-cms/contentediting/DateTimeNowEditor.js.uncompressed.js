require({cache:{
'url:epi-cms/contentediting/templates/DateTimeNowEditor.html':"﻿<div class=\"dijitInline dijitInputContainer\">\r\n    <div data-dojo-type=\"epi/shell/widget/DateTimeSelectorDropDown\" data-dojo-attach-point=\"dateTimeSelector\"></div>\r\n    <a class=\"epi-visibleLink\" style=\"padding-left:10px\" data-dojo-attach-point=\"expireNowNode\"\r\n       data-dojo-attach-event=\"onclick:_onExpireNowClick\">${resources.now}</a>\r\n</div>\r\n"}});
﻿define("epi-cms/contentediting/DateTimeNowEditor", [
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/text!./templates/DateTimeNowEditor.html",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "epi/shell/widget/_ValueRequiredMixin",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.datetimenow"
], function (connect, declare, lang, domStyle, domConstruct, templateString, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _ValueRequiredMixin, resources) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _ValueRequiredMixin], {
        // summary:
        //      Combining a DateTimeSelectorDropDown and a now button for setting current dateTime
        // tags:
        //      internal

        templateString: templateString,

        value: null,

        resources: resources,

        postCreate: function () {
            this.inherited(arguments);

            this.own(this.dateTimeSelector.watch("value", lang.hitch(this, function (value, oldValue, newValue) {
                this._set("value", newValue);
                this.onChange(newValue);
            })));
        },

        onChange: function (newValue) {
            // summary:
            //      Callback method for updating the editor wrapper.
            // tags:
            //      callback
            this.validate();
        },

        validate: function () {
            // summary:
            //      performs the base required validation of the current value
            //      and if minimumValue is set it validates that value is newer than minimumValue
            // tags:
            //      public

            var isValid = this.inherited(arguments);
            if (isValid) {
                var value = this.get("value");
                isValid = this.disabled || !value || !this.minimumValue || value > this.minimumValue;
                this._set("state", isValid ? "" : "Error");
                if (isValid) {
                    this.hideMessage();
                } else {
                    this.displayMessage(this.minimumValueMessage);
                }
            }
            return isValid;
        },

        _setValueAttr: function (value) {
            this.dateTimeSelector.set("value", value);
            this._set("value", value); //for the value required mixin
        },

        _getValueAttr: function () {
            return this.dateTimeSelector.get("value");
        },

        _onExpireNowClick: function () {
            this.set("value", new Date());
        },

        _setReadOnlyAttr: function (value) {
            this._set("readOnly", value);

            this.dateTimeSelector.set("readOnly", value);
            domStyle.set(this.expireNowNode, "display", value ? "none" : "");
        }
    });
});
