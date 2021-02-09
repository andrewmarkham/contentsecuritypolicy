require({cache:{
'url:epi-cms/form/templates/MonthYearPicker.html':"﻿<div class=\"dijit dijitReset dijitInline\" waiRole=\"presentation\" style=\"${styleString}\" dojoAttachPoint=\"container\" id=\"widget_${id}\" >\r\n    <select data-dojo-type=\"dijit/form/FilteringSelect\" dojoAttachPoint=\"yearDropDown\" id=\"yearDropDown_${id}\">\r\n        <option value=\"0000\">${yearLabel}</option>\r\n        ${yearOptions}\r\n    </select>\r\n    <select data-dojo-type=\"dijit/form/FilteringSelect\" dojoAttachPoint=\"monthDropDown\" id=\"monthDropDown_${id}\">\r\n        <option value=\"00\">${monthLabel}</option>    \r\n        <option value=\"01\">${janName}</option>\r\n        <option value=\"02\">${febName}</option>\r\n        <option value=\"03\">${marName}</option>\r\n        <option value=\"04\">${aprName}</option>\r\n        <option value=\"05\">${mayName}</option>\r\n        <option value=\"06\">${junName}</option>\r\n        <option value=\"07\">${julName}</option>\r\n        <option value=\"08\">${augName}</option>\r\n        <option value=\"09\">${sepName}</option>\r\n        <option value=\"10\">${octName}</option>\r\n        <option value=\"11\">${novName}</option>\r\n        <option value=\"12\">${decName}</option>\r\n    </select>    \r\n</div>"}});
﻿define("epi-cms/form/MonthYearPicker", [
    "epi",
    "dojo",
    "dijit",
    "dojo/i18n",
    "dojo/date/locale",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/MonthYearPicker.html",
    "epi/i18n!epi/cms/nls/episerver.cms.form"],

function (epi, dojo, dijit, i18n, locale, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, template, res) {

    return dojo.declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // tags:
        //      internal

        templateString: template,

        yearOptions: "",

        value: "0000-00",
        style: {},
        styleString: "",

        errorMessage: "",

        minYear: 1861,
        maxYear: 2100,

        yearLabel: res.yearLabel,
        monthLabel: res.monthLabel,

        janName: locale.getNames("months", "wide", "standAlone", this.lang)[0],
        febName: locale.getNames("months", "wide", "standAlone", this.lang)[1],
        marName: locale.getNames("months", "wide", "standAlone", this.lang)[2],
        aprName: locale.getNames("months", "wide", "standAlone", this.lang)[3],
        mayName: locale.getNames("months", "wide", "standAlone", this.lang)[4],
        junName: locale.getNames("months", "wide", "standAlone", this.lang)[5],
        julName: locale.getNames("months", "wide", "standAlone", this.lang)[6],
        augName: locale.getNames("months", "wide", "standAlone", this.lang)[7],
        sepName: locale.getNames("months", "wide", "standAlone", this.lang)[8],
        octName: locale.getNames("months", "wide", "standAlone", this.lang)[9],
        novName: locale.getNames("months", "wide", "standAlone", this.lang)[10],
        decName: locale.getNames("months", "wide", "standAlone", this.lang)[11],

        postMixInProperties: function () {
            //generate year options
            for (var i = this.minYear; i <= this.maxYear; i++) {
                this.yearOptions += "<option value=" + i + ">" + i + "</option>";
            }

            //font fix for IE.
            //Since dojo wrongly get the current style for the container, the browser return default font (Times New Roman), we have to adjust
            if (!this.style["font-family"]
                && this.srcNodeRef
                && this.srcNodeRef.parentNode
                && this.srcNodeRef.parentNode.currentStyle) {
                this.style["font-family"] = this.srcNodeRef.parentNode.currentStyle.fontFamily;
            }

            for (var j in this.style) {
                this.styleString += j + ": " + this.style[j] + ";";
            }
        },

        postCreate: function () {
            //disable default error message
            var yearWidget = dijit.byId(this.yearDropDown.id);
            var monthWidget = dijit.byId(this.monthDropDown.id);
            this._disableDojoValidation(yearWidget);
            this._disableDojoValidation(monthWidget);
        },

        _disableDojoValidation: function (widget) {
            if (widget.displayMessage) {
                widget.displayMessage = function () { }; //do nothing
            }

            if (widget._setStateClass) {
                var oldFnc = widget._setStateClass;
                widget._setStateClass = function () {
                    if ((!this.isValid) || (this.isValid && this.isValid())) {
                        oldFnc.apply(this, arguments);
                    }
                };
            }
        },

        isValid: function () {
            var yearWidget = dijit.byId(this.yearDropDown.id);
            var monthWidget = dijit.byId(this.monthDropDown.id);
            var year = yearWidget.get("value");
            var month = monthWidget.get("value");

            if (!yearWidget.isValid()) {
                this.errorMessage = yearWidget.getErrorMessage();
                return false;
            } else if (!monthWidget.isValid()) {
                this.errorMessage = yearWidget.getErrorMessage();
                return false;
            } else if (year === "0000" && month === "00") {
                this.errorMessage = i18n.getLocalization("dijit.form", "validate", this.lang).missingMessage;
                return false;
            } else {
                this.errorMessage = "";
                return true;
            }
        },

        getErrorMessage: function () {
            return this.errorMessage;
        },

        _setValueAttr: function (newValue) {
            if (newValue.length === 7) { //TODO: RegEx match
                this.value = newValue;
            }

            dijit.byId(this.yearDropDown.id).set("value", this.value.substr(0, 4));
            dijit.byId(this.monthDropDown.id).set("value", this.value.substr(5, 2));
        },

        _getValueAttr: function () {
            var year = dijit.byId(this.yearDropDown.id).get("value");
            var month = dijit.byId(this.monthDropDown.id).get("value");
            return year + "-" + month;
        }
    });
});
