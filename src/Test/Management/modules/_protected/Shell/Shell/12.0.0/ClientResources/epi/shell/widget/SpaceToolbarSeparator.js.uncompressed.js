define("epi/shell/widget/SpaceToolbarSeparator", [
    "epi",
    "dojo",
    "dijit",
    "dijit/ToolbarSeparator"],

function (epi, dojo, dijit, ToolbarSeparator) {

    return dojo.declare([ToolbarSeparator], {
        // summary:
        //    A separator between two toolbar items that renders as white space.
        //
        // tags:
        //		internal

        templateString: "<div class=\"epi-spaceToolbarSeparator dijitInline\" role=\"presentation\"></div>"
    });
});
