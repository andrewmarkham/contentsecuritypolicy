define([
    'dojo/_base/declare',
    "epi/dependency",
    "alloy/JhooseToolbarProvider",
    "alloy/command/JhooseCommand",
], function(declare, dependency, JhooseToolbarProvider, JhooseCommand) {
    return declare(null, {
        initialize: function() {
            var commandregistry = dependency.resolve("epi.globalcommandregistry");
            //The first parameter is the "area" that your provider should add commands to
            //For the global toolbar the area is "epi.cms.globalToolbar"

            //epi.cms.contentdetailsmenu 
            var jc = new JhooseCommand();
            commandregistry.registerProvider("epi.cms.publishmenu", new JhooseToolbarProvider(jc));
        }
    });
});
