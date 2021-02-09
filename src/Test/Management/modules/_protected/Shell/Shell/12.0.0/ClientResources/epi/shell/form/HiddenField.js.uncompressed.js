require({cache:{
'url:epi/shell/form/templates/HiddenField.html':"<li class=\"epi-form-container__section__row dijitHidden\">\r\n</li>"}});
define("epi/shell/form/HiddenField", [
    "dojo/_base/declare",

    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_Contained",
    "dijit/_TemplatedMixin",

    "./formFieldRegistry",

    "dojo/text!./templates/HiddenField.html"
], function (
    declare,

    _WidgetBase,
    _Container,
    _Contained,
    _TemplatedMixin,

    formFieldRegistry,

    template
) {

    var module = declare([_WidgetBase, _Container, _Contained, _TemplatedMixin], {
        // tags:
        //      internal

        templateString: template
    });

    formFieldRegistry.add({
        type: formFieldRegistry.type.hiddenField,
        hint: "",
        factory: function (widget, parent) {
            return new parent._HiddenFieldItem();
        }
    });

    return module;
});
