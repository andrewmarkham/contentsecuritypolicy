require({cache:{
'url:epi/shell/widget/templates/DropDownMenu.htm':"﻿<table class=\"dijit dijitMenu dijitMenuPassive dijitReset dijitMenuTable\" role=\"menu\" tabIndex=\"${tabIndex}\" data-dojo-attach-event=\"onkeypress:_onKeyPress\" cellspacing=\"0\">\r\n\t<tbody class=\"dijitReset\" data-dojo-attach-point=\"containerNode\">\r\n        <tr class=\"dijitReset dijitMenuItem\">\r\n            <td class=\"dijitReset dijitMenuItemLabel epi-menuHeader\" colspan=\"4\" data-dojo-attach-point=\"menuHeader\">${header}</td>\r\n        </tr>\r\n    </tbody>\r\n</table>"}});
﻿define("epi/shell/widget/DropDownMenu", [
    // Dojo
    "dojo/_base/declare",
    "epi/obsolete",

    // Dijit
    "dijit/DropDownMenu",

    // Templates
    "dojo/text!./templates/DropDownMenu.htm"
],

function (
// Dojo
    declare,
    obsolete,

    // Dijit
    DropDownMenu,

    // Templates
    template
) {

    return declare([DropDownMenu], {
        // summary:
        //    An extended Drop Down Menu, which support for having header.
        //
        // tags:
        //    public deprecated

        constructor: function () {
            obsolete("epi/shell/widget/DropDownMenu", "Use standard dijit/DropDownMenu with an explicit header separator instead", "10.0");
        },

        // templateString: [protected] String
        //    Widget's template string.
        templateString: template,

        // templateString: [public] String
        //    Menu's header.
        header: ""
    });
});
