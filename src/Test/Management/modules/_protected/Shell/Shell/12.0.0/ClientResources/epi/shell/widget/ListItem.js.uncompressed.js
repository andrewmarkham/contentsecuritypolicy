require({cache:{
'url:epi/shell/widget/templates/ListItem.html':"﻿<li data-dojo-attach-point=\"containerNode\" tabindex=\"-1\"></li>"}});
﻿define("epi/shell/widget/ListItem", [
    "dojo/_base/declare",

    "dojo/text!./templates/ListItem.html",

    "dijit/_Contained",
    "dijit/_TemplatedMixin",
    "dijit/_Widget"
],

function (
    declare,

    template,

    _Contained,
    _TemplatedMixin,
    _Widget
) {

    return declare([_Widget, _TemplatedMixin, _Contained], {
        // summary:
        //    An list item widget that will be used to wrap an widget as an item of a list
        //
        // tags:
        //    internal

        templateString: template,

        childWidget: null,

        postCreate: function () {
            this.inherited(arguments);

            if (this.childWidget) {
                this.childWidget.placeAt(this.containerNode);
            }
        },

        isFocusable: function () {
            // summary:
            //      Return true if this widget can currently be focused
            //      and false if not
            // tags:
            //      protected, override

            return this.childWidget && this.childWidget.isFocusable && this.childWidget.isFocusable();
        },

        focus: function () {
            if (this.childWidget && this.childWidget.focus) {
                this.childWidget.focus();
            }
        }
    });
});
