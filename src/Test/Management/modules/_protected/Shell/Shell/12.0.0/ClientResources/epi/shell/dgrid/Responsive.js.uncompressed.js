define("epi/shell/dgrid/Responsive", [
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-geometry"
], function (declare, domClass, domGeometry) {

    return declare([], {
        // summary:
        //      Adds a class to the grid based on its width.
        // tags:
        //      internal

        // currentResponsiveClass: [readonly] String
        //      The CSS class that is current assigned to the grid from the responsive map.
        currentResponsiveClass: "",

        // responsiveMap: [public] Object
        //      A map of CSS class names to width thresholds.
        responsiveMap: null,

        resize: function () {
            // summary:
            //      Resizes the grid and adds responsive CSS classes based on the grids new size.
            // tags:
            //      public

            this.inherited(arguments);

            var currentRuleWidth = Infinity,
                gridWidth = domGeometry.getContentBox(this.domNode).w,
                responsiveClass = "",
                responsiveMap = this.responsiveMap;

            if (responsiveMap) {
                // Get the rule with the smallest break point which is also greater than or equal to
                // the grid's width.
                Object.keys(responsiveMap).forEach(function (key) {
                    var ruleWidth = responsiveMap[key];
                    if (gridWidth <= ruleWidth && ruleWidth < currentRuleWidth) {
                        currentRuleWidth = ruleWidth;
                        responsiveClass = key;
                    }
                });

                domClass.replace(this.domNode, responsiveClass, this.currentResponsiveClass);

                this.currentResponsiveClass = responsiveClass;
            }
        }
    });
});
