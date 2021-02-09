require({cache:{
'url:epi/shell/widget/templates/MenuGroup.htm':"﻿<li class=\"epi-menugGoup\">\r\n    <span data-dojo-attach-point=\"containerNode\"></span>\r\n</li>"}});
﻿define("epi/shell/widget/MenuGroup", [
    "dojo",
    "dijit/MenuSeparator",
    "dojo/text!./templates/MenuGroup.htm"
],
function (dojo, _MenuSeparator, template) {

    return dojo.declare([_MenuSeparator], {
        // summary:
        //		A line item in a VerticalMenu Widget
        //
        // tags:
        //      internal

        templateString: template,

        // label: String
        //		Menu text
        label: "",
        _setLabelAttr: { node: "containerNode", type: "innerHTML" }

    });
});
