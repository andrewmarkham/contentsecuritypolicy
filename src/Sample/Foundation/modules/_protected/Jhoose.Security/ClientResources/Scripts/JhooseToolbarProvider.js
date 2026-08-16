define([
    "dojo/_base/declare",

    //"epi-cms/component/command/_GlobalToolbarCommandProvider",
    "epi/shell/command/_CommandProviderMixin",
    "jhoosesecurity/command/JhooseCommand"
], function (declare, _CommandProviderMixin) {
    console.log("[Jhoose] JhooseToolbarProvider.js module loaded");
    return declare([_CommandProviderMixin], {
        constructor: function (command) {
            this.inherited(arguments);
            console.log("[Jhoose] JhooseToolbarProvider constructor called with command:", command);
            this.add("commands", command);
        }
    });
});