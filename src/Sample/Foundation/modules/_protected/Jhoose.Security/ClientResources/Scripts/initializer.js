define([
    'dojo/_base/declare',
    "epi/dependency",
    "epi/_Module",
    "jhoosesecurity/JhooseToolbarProvider",
    "jhoosesecurity/command/JhooseCommand",
    "jhoosesecurity/command/JhoosePermissionsCommand",
], function(declare, dependency, _Module, JhooseToolbarProvider, JhooseCommand, JhoosePermissionsCommand) {
    console.log("[Jhoose] initializer.js module loaded (jhoosesecurity/initializer resolved and required)");
    return declare([_Module], {
        initialize: function() {
            console.log("[Jhoose] initializer.initialize() called");
            var commandregistry = dependency.resolve("epi.globalcommandregistry");
            console.log("[Jhoose] epi.globalcommandregistry resolved:", commandregistry);
            //The first parameter is the "area" that your provider should add commands to
            //For the global toolbar the area is "epi.cms.globalToolbar"

            //epi.cms.contentdetailsmenu
            var jc = new JhooseCommand();
            console.log("[Jhoose] JhooseCommand instantiated:", jc);
            commandregistry.registerProvider("epi.cms.publishmenu", new JhooseToolbarProvider(jc));
            console.log("[Jhoose] registerProvider('epi.cms.publishmenu', ...) called for JhooseCommand");

            var jpc = new JhoosePermissionsCommand();
            console.log("[Jhoose] JhoosePermissionsCommand instantiated:", jpc);
            commandregistry.registerProvider("epi.cms.publishmenu", new JhooseToolbarProvider(jpc));
            console.log("[Jhoose] registerProvider('epi.cms.publishmenu', ...) called for JhoosePermissionsCommand");
        }
    });
});
