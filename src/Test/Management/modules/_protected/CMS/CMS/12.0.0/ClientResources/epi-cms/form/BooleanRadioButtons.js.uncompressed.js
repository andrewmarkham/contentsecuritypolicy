require({cache:{
'url:epi-cms/form/templates/BooleanRadioButtons.html':"﻿<div class=\"dijit dijitReset dijitInline\" waiRole=\"presentation\" id=\"widget_${id}\" >\r\n    <input type=\"radio\" data-dojo-type=\"dijit/form/RadioButton\" dojoAttachPoint=\"trueRadio\" id=\"trueRadio_${id}\" name=\"radio_${id}\" value=\"true\" /><label for=\"trueRadio_${id}\">${trueLabel}</label>\r\n    <input type=\"radio\" data-dojo-type=\"dijit/form/RadioButton\" dojoAttachPoint=\"falseRadio\" id=\"falseRadio_${id}\" name=\"radio_${id}\" value=\"false\" /><label for=\"falseRadio_${id}\">${falseLabel}</label>\r\n</div>\r\n"}});
﻿define("epi-cms/form/BooleanRadioButtons", [
    "dojo",
    "dijit",
    "epi/i18n!epi/cms/nls/episerver.cms.form",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/BooleanRadioButtons.html"],

function (dojo, dijit, resources, _Widget, _TemplatedMixin, _WidgetsInTemplateMixin, template) {

    return dojo.declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // tags:
        //      internal

        templateString: template,

        trueLabel: resources.truelabel,

        falseLabel: resources.falselabel,

        value: true,

        _setValueAttr: function (newValue) {
            this.value = newValue;
            if (newValue) {
                dijit.byId(this.trueRadio.id).set("checked", true);
                dijit.byId(this.falseRadio.id).set("checked", false);
            } else {
                dijit.byId(this.trueRadio.id).set("checked", false);
                dijit.byId(this.falseRadio.id).set("checked", true);
            }
        },

        _getValueAttr: function () {
            return dijit.byId(this.trueRadio.id).get("checked") === true;
        }
    });
});
