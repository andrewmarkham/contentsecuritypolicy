define([
    "dojo/_base/declare",

    //"epi-cms/component/command/_GlobalToolbarCommandProvider",
    "epi/shell/command/_CommandProviderMixin",
    "alloy/command/JhooseCommand"
], function (declare, _CommandProviderMixin) {
    return declare([_CommandProviderMixin], {
        constructor: function (command) {
            this.inherited(arguments);

            this.add("commands", command);
        }
    });
});