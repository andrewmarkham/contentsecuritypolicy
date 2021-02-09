define("epi/shell/layout/ToolbarContainer", [
    "dojo/_base/declare",
    "dojo/dom-style",
    "dijit/_Container",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetBase"],

function (declare, domStyle, _Container, _TemplatedMixin, _WidgetBase) {

    return declare([_WidgetBase, _TemplatedMixin, _Container], {
        // summary:
        //     Container widget for arranging toolbars in groups.
        //
        // tags:
        //      internal

        cssClasses: {
            container: "epi-toolbarGroupContainer",
            leading: "epi-toolbarGroup epi-toolbarLeading",
            center: "epi-toolbarGroup epi-toolbarCenter",
            trailing: "epi-toolbarGroup epi-toolbarTrailing"
        },

        templateString: "<div class='${cssClasses.container}'>\
                            <div data-dojo-attach-point='leadingNode' class='${cssClasses.leading}'></div>\
                            <div data-dojo-attach-point='centerNode' class='${cssClasses.center}'></div>\
                            <div data-dojo-attach-point='trailingNode' class='${cssClasses.trailing}'></div>\
                        </div>",

        addChild: function (child) {
            // summary: Add a child to the container
            // description: The child should has expected region set, otherwise the container will put it into center region.

            child.region = child.region || "center";

            var nodeToPlace;
            switch (child.region) {
                case "leading":
                    nodeToPlace = this.leadingNode;
                    break;
                case "center":
                    nodeToPlace = this.centerNode;
                    break;
                case "trailing":
                    nodeToPlace = this.trailingNode;
                    break;
            }

            child.placeAt(nodeToPlace);
        }
    });
});
