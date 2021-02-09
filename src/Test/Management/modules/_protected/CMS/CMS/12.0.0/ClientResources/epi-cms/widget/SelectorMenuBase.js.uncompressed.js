require({cache:{
'url:epi-cms/widget/templates/SelectorMenuBase.html':"﻿<div class=\"epi-menu--inverted\">\r\n    <div class=\"epi-dijitTooltipContainer\">\r\n        <div class=\"epi-invertedTooltip\">\r\n            <div class=\"epi-tooltipDialogTop\">\r\n                <span>${headingText}</span>\r\n            </div>\r\n        </div>\r\n        <div class=\"epi-tooltipDialogContent--max-height\">\r\n            <table class=\"dijitReset dijitMenu epi-tooltipDialogMenu epi-menuInverted epi-mediumMenuItem\" style=\"width: 100%\" cellspacing=\"0\">\r\n\t            <tbody data-dojo-attach-point=\"containerNode\" ></tbody>\r\n            </table>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
define("epi-cms/widget/SelectorMenuBase", [
    "dojo/_base/declare",
    "dojo/keys",
    "dijit/_MenuBase",
    "dojo/text!./templates/SelectorMenuBase.html"
], function (
    declare,
    keys,
    _MenuBase,
    template) {

    return declare([_MenuBase], {
        // summary:
        //      Base widget for selector menus
        //
        // tags:
        //      internal xproduct

        // templateString: String
        //      The template string.
        templateString: template,

        // headingText: String
        //      The heading text.
        headingText: null,

        postCreate: function () {
            // summary:
            //      Connect key navigation handlers.

            this.inherited(arguments);

            this.connectKeyNavHandlers([keys.UP_ARROW], [keys.DOWN_ARROW]);
        }
    });
});
