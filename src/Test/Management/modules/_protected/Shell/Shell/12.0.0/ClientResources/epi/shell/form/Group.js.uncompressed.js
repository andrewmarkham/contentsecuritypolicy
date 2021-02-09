require({cache:{
'url:epi/shell/form/templates/Group.html':"<li></li>"}});
define("epi/shell/form/Group", [
    "dojo/_base/declare",

    "dijit/_WidgetBase",
    "dijit/_Container",
    "dijit/_Contained",
    "dijit/_TemplatedMixin",

    "dojo/text!./templates/Group.html"
], function (
    declare,

    _WidgetBase,
    _Container,
    _Contained,
    _TemplatedMixin,

    template
) {

    return declare([_WidgetBase, _Container, _Contained, _TemplatedMixin], {
        // tags:
        //      internal

        templateString: template
    });
});
