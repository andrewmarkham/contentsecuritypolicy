define("epi/shell/form/CategoryMenuItem", [
    "dojo/_base/declare",
    "dojo/dom",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_Contained"
], function (declare, dom, _WidgetBase, _TemplatedMixin, _Contained) {

    return declare([_WidgetBase, _TemplatedMixin, _Contained], {
        // summary:
        //		A grouping element for menu items
        // tags:
        //      internal

        baseClass: "dijitMenuItemGroup",

        templateString: "<tr class=\"dijitMenuItemGroup\"><td colspan=\"4\" data-dojo-attach-point=\"containerNode\"></td></tr>",

        // label: String
        //     Group display text
        _setLabelAttr: { node: "containerNode", type: "innerHTML" },

        buildRendering: function () {
            this.inherited(arguments);
            dom.setSelectable(this.domNode, false);
        },

        isFocusable: function () {
            return false;
        }
    });
});
