define("epi/shell/Bootstrapper", [
    "dojo/_base/config",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/topic",
    "dojo/when",
    "epi",
    "epi/datetime",
    "epi/dependency",
    "epi/ModuleManager",
    "epi/shell/ViewSettings"],

function (
    config,
    declare,
    Deferred,
    topic,
    when,
    epi,
    epiDate,
    dependency,
    epiModuleManager,
    viewSettings
) {

    return declare(null, {
        // summary:
        //		Shell bootstrapper.
        //
        // tags:
        //      internal xproduct

        _moduleManager: null,

        constructor: function (/* Object */settings) {
            // summary:
            //      Creates and configures epi.ModuleManager
            //
            // settings:
            //      Module settings, see `epi.ModuleManager`
            //

            this._moduleManager = new epiModuleManager(settings);
            dependency.register("epi.ModuleManager", this._moduleManager);
            this._setServerTimeDelta();
            this._moduleManager.configureModules();
        },

        initializeApplication: function (/* String */viewName,  /*String*/startupModule, /*Object*/settings) {
            // summary:
            //      Starts modules and loads the view
            //
            // viewName:
            //      Name of the view to load
            // applicationDomNodes:
            //      Array of dom nodes or ids of dom nodes to inject view into
            //
            // startupModule:
            //      Name of the module to start
            //
            // settings:
            //      A dictionary with settings for the current view.

            viewSettings.viewName = viewName;
            viewSettings.settings = settings;

            var started = this._moduleManager.startModules(startupModule);

            when(started, function () {
                topic.publish("/epi/shell/application/initialized");
            });

            return started;
        },

        _setServerTimeDelta: function () {
            // summary:
            //      Calculate difference time between client and server at initialization time
            // tags:
            //      Private

            var clientTime = new Date();
            var serverTime = new Date(config.serverTime);
            epiDate.serverTimeDelta = serverTime.getTime() - clientTime.getTime();
        }
    });
});
