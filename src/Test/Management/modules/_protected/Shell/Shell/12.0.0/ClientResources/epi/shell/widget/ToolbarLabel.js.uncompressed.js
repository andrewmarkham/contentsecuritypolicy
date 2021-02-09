define("epi/shell/widget/ToolbarLabel", [
    "dojo",
    "dojo/dom-construct",
    "dijit/_WidgetBase"
], function (dojo, construct, _WidgetBase) {

    return dojo.declare([_WidgetBase], {
        // summary:
        //      A label widget inteaded for display in the toolbar.
        //
        // tags:
        //      internal xproduct

        // baseClass: [protected] String
        //		Root CSS class of the widget.
        baseClass: "epi-breadCrumbsCurrentItem dijitInline",

        // label: [public] String
        //		Value to be displayed in the label.
        label: null,

        buildRendering: function () {
            // summary:
            //		Construct the UI for this widget, setting this.domNode.
            // tags:
            //		protected

            if (!this.domNode) {
                this.domNode = this.srcNodeRef || construct.create("h1");
            }

            this.inherited(arguments);
        },

        _setLabelAttr: { node: "domNode", type: "innerText" }
    });
});
