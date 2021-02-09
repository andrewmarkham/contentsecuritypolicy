require({cache:{
'url:epi/shell/widget/templates/ListContainer.html':"﻿<ul class=\"dijitReset dijitInline\" data-dojo-attach-point=\"containerNode\" tabindex=\"-1\"></ul>"}});
﻿define("epi/shell/widget/ListContainer", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-attr",
    "dojo/dom-style",

    "dojo/text!./templates/ListContainer.html",

    "dijit/_Container",
    "dijit/_KeyNavContainer",
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/_WidgetsInTemplateMixin",

    "epi/shell/widget/ListItem"
],

function (
    array,
    declare,
    lang,

    domAttr,
    domStyle,

    template,

    _Container,
    _KeyNavContainer,
    _TemplatedMixin,
    _Widget,
    _WidgetsInTemplateMixin,

    ListItem
) {

    return declare([_Widget, _WidgetsInTemplateMixin, _TemplatedMixin, _Container, _KeyNavContainer], {
        // tags:
        //    internal

        templateString: template,

        updateVisibility: function () {
            // tags:
            //      public

            var available = array.some(this.getChildren(), function (itemWrapper) {
                return itemWrapper.childWidget && domStyle.get(itemWrapper.childWidget.domNode, "display") !== "none";
            }, this);

            domStyle.set(this.domNode, "display", available ? "" : "none");
        },

        addChild: function (/*dijit/_Widget*/widget, /*int?*/insertIndex) {
            // tags:
            //      protected, override

            widget = new ListItem({ childWidget: widget });

            this.inherited(arguments);
        }
    });
});
