define("epi/ModuleManager", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/when",

    "epi/clientResourcesLoader",
    "epi/routes"
], function (
    array,
    declare,
    lang,
    Deferred,
    promiseAll,
    when,

    clientResourceLoader,
    routes
) {

    // Module dependency type enum
    var moduleDependencyType = {
        // summary:
        //      Module dependency type enum
        // tags:
        //      internal
        require: 1,
        runAfter: 2
    };

    var ModuleManager = declare(null, {
        // summary:
        //      Manager for modules
        //
        // tags:
        //      internal
        // example:
        //      Pass the module settings in the constructor
        //  |   var modules = [
        //  |       {
        //  |           name: "Shell",
        //  |           initializer: "epi/shell/ShellModule",
        //  |           moduleDependencies: [],
        //  |           cssResources: [],
        //  |           scriptResources: [],
        //  |           routeBasePath: "/EPiServer/{moduleArea}/{controller}/{action}/{id}",
        //  |           routeDefaults: {
        //  |               moduleArea: "Shell",
        //  |               controller: "Dashboard",
        //  |               action: "Index",
        //  |               id: ""
        //  |           }
        //  |       },
        //  |       {
        //  |           name: "CMS",
        //  |           initializer: "epi-cms/CMSModule",
        //  |           moduleDependencies: [{
        //  |               moduleName: "Shell",
        //  |               dependencyType: "require"
        //  |           }],
        //  |           cssResources: [],
        //  |           scriptResources: [],
        //  |           routeBasePath: "/EPiServer/{moduleArea}/{controller}/{action}/{id}",
        //  |           routeDefaults: {
        //  |               id: "",
        //  |               moduleArea: "CMS"
        //  |           }
        //  |       }
        //  |   ]
        //  |   var moduleManager = new ModuleManager(modules);
        //

        // _allModules: [private] Object
        //      Module settings
        _allModules: null,

        // _moduleInstances: [private] Object
        //      Dictionary of modules by name
        _moduleInstances: null,

        // _modulesConfigured: [private] Boolean
        //      A flag indicating if module configuration has been added to the application
        _modulesConfigured: false,

        constructor: function (modules) {
            // modules: Array
            //      An array with module settings.
            // tags:
            //      public
            this._allModules = {};
            this._moduleInstances = {};

            array.forEach(modules, function (module) {
                this._allModules[module.name] = module;
            }, this);
        },

        getModule: function (moduleName) {
            // summary:
            //      Get a module by name
            // tags:
            //      public
            return this._allModules[moduleName];
        },

        configureModules: function () {
            // summary:
            //      Adds module configuration to the application for all modules
            //
            // tags:
            //      public

            if (this._modulesConfigured) {
                return;
            }

            this._modulesConfigured = true;
            for (var moduleName in this._allModules) {
                this._configureModule(this._allModules[moduleName]);
            }
        },

        startModules: function (/*String*/moduleName) {
            // summary:
            //  Start the modules required for the application to run.
            //
            // modulesName:
            //  Name of a module to start. If undefined; all modules are started.
            //
            // returns:
            //  A promise resolved when required modules have been started.

            // Make sure modules settings have been added
            this.configureModules();

            if (moduleName) {
                return this._startModule(this._allModules[moduleName]);
            } else {
                var deferreds = [];
                for (var name in this._allModules) {
                    deferreds.push(this._startModule(this._allModules[name]));
                }
                return promiseAll(deferreds);
            }
        },

        _startModule: function (/*Object*/module) {
            // summary:
            //      Starts a module and all its dependencies
            // module:
            //      The module to start
            // returns:
            //      A promise resolved when the module has been started.

            if (module._started) {
                // The module has started or is starting so return the _started deferred.
                return module._started.promise;
            }

            // Assign a deferred to _started so that we only start this module once.
            module._started = new Deferred();

            var self = this,
                runAfter = [],
                checkDependencies = function (dependency) {
                    return dependency.moduleName === module.name && (dependency.dependencyType & moduleDependencyType.runAfter);
                };

            for (var m in this._allModules) {
                var dependant = this._allModules[m],
                    hasDependency = array.some(dependant.moduleDependencies, checkDependencies);

                if (hasDependency) {
                    runAfter.push(dependant);
                }
            }

            // Start dependant modules that are marked as runAfter when this module is started.
            module._started.then(function () {
                array.forEach(runAfter, function (dependantModule) {
                    self._startModule(dependantModule);
                });
            });

            console.info("Starting module: ", module.name);

            when(this._startRequiredModules(module), function () {
                var resourcesLoaded = clientResourceLoader.loadResources(module.cssResources, module.scriptResources);

                // When our scripts are loaded and the modules we depend on have been started the module initializer can be run.
                when(resourcesLoaded, function () {
                    self._runModuleInitializer(module).then(module._started.resolve, module._started.reject);
                });
            });

            return module._started.promise; // Promise
        },

        _startRequiredModules: function (module) {
            // summary:
            //      Start all "require" and "requireAndRunAfter" dependencies for a module.
            // tags:
            //      private
            var dependencies = array.filter(module.moduleDependencies, function (dependency) {
                return dependency.dependencyType & moduleDependencyType.require;
            });

            console.debug(module.name, dependencies);

            var deferreds = array.map(dependencies, function (dependency) {
                var requiredModule = this._allModules[dependency.moduleName];
                if (!requiredModule) {
                    throw new Error("Module '" + module.name + "' has a dependency named '" + dependency.moduleName + "' which doesn't exist.");
                }
                return this._startModule(requiredModule);
            }, this);

            return promiseAll(deferreds); // Promise
        },

        _configureModule: function (/* Object */moduleSettings) {
            // summary:
            //      Add module configuration settings to the application
            // moduleSettings:
            //      The module settings
            // tags:
            //      private

            // register routes
            if (moduleSettings.routes) {
                array.forEach(moduleSettings.routes, function (route) {
                    routes.registerRoute(route.routeBasePath, route.routeDefaults);
                });
            }
        },

        _runModuleInitializer: function (/*Object*/moduleSettings) {
            // summary:
            //  Runs the module initializer, if one exists, for a module.
            //
            // moduleSettings:
            //
            // returns:
            //  A promise resolved when the module initaliser has been executed.

            var dfd = new Deferred();
            if (moduleSettings.initializer) {
                var initializer = moduleSettings.initializer.replace(/\./g, "/");
                require([initializer], lang.hitch(this, function (moduleClass) {
                    try {
                        // Instatiate the initializer associated with the module.
                        console.debug("Running: ", initializer);

                        var instance = new moduleClass(moduleSettings);
                        when(instance.initialize(), lang.hitch(this, function () {
                            this._moduleInstances[moduleSettings.name] = instance;
                            dfd.resolve();
                        }), dfd.reject);

                    } catch (e) {
                        console.error(e.stack || e);
                        dfd.reject(e);
                    }
                }));
            } else {
                dfd.resolve();
            }
            return dfd.promise;
        },

        uninitializeModule: function (moduleName) {
            // summary:
            //      Uninitializes the module with the given name.
            // moduleName: String
            //      The name of the module to uninitialize
            // tags:
            //      public
            var modules = this._moduleInstances;
            if (modules[moduleName]) {
                modules[moduleName].uninitialize();
                delete modules[moduleName];
            }
        }
    });

    // moduleDependencyType: [public] Object
    //      Static module dependency type enum.
    ModuleManager.moduleDependencyType = moduleDependencyType;

    return ModuleManager;
});
