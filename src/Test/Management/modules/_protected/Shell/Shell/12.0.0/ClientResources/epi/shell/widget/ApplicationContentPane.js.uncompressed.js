define("epi/shell/widget/ApplicationContentPane", [
    "dojo/_base/declare",
    "dijit/layout/ContentPane",
    "./Application"],

function (declare, ContentPane, Application) {

    return declare([ContentPane, Application], {
        // summary:
        //      Application ContentPane for when application is placed in a border container
        //
        // tags:
        //    internal

    });
});

