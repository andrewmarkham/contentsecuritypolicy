require({cache:{
'epi/main':function(){
﻿// Currently only a place holder for the core epi namespace
// Needed to get the amd loading properly defined, but should contain core epi parts

define(["dojo", "epi/i18n!epi/shell/ui/nls/episerver.shared"], function (dojo, sharedResources) {

    var epi = dojo.getObject("epi", true);

    /*=====
    var epi = {
        // summary:
        //      The main module.
        // tags:
        //      public
    };
    =====*/

    epi.resources = dojo.mixin({}, sharedResources);
    return epi;
});

},
'epi/i18n':function(){
﻿define(["dojo/_base/kernel", "dojo/_base/lang"], function (dojo, lang) {

    // regexp for reconstructing the master bundle name from parts of the regexp match
    // nlsRe.exec("foo/bar/baz/nls/en-ca/foo") gives:
    // ["foo/bar/baz/nls/en-ca/foo", "foo/bar/baz/nls/", "/", "/", "en-ca", "foo"]
    // nlsRe.exec("foo/bar/baz/nls/foo") gives:
    // ["foo/bar/baz/nls/foo", "foo/bar/baz/nls/", "/", "/", "foo", ""]
    // so, if match[5] is blank, it means this is the top bundle definition.
    // courtesy of http://requirejs.org
    var nlsRe = /(^.*(^|\/)nls)(\/|$)([^\/]*)\/?([^\/]*)/,

        // Object for caching localized resources
        cache = {},

        getObject = function (name, context) {
            // summary:
            //      Returns the sub-object in context corresponding to the dot separated path in the name parameter
            //      Any missing objects are created as: { __ partial:true }
            var parts = name.split("."), i = 0, p;
            while (p = parts[i++]) { // eslint-disable-line no-cond-assign
                context = (p in context ? context[p] : context[p] = { __partial: true });
            }
            return context;
        },


        setCache = function (bundleName, data) {
            // summary:
            //      Add data to the resource cache

            var resourceObject = getObject(bundleName, cache);

            // Add the loaded resources to the resourceObject
            lang.mixin(resourceObject, data);

            // Since we,re loading resources recursively from the server we now have
            // all resources for this node and its children so we can remove the partial flag.
            delete resourceObject.__partial;
        },

        getCache = function (bundleName) {
            // summary:
            //      Get a resource by its bundle path and name. Returns undefined if nothing is found
            var cached = lang.getObject(bundleName, false, cache);
            // Never return partially (incomplete) cached nodes.
            // The partial nodes are created client side.
            return cached && !cached.__partial ? cached : undefined;
        };

    return {
        // summary:
        //      This module implements an amd plug-in used for loading localizations from the episerver localization service
        // description:
        //      This module loads localization resources based on dot (.) separated keys corresponding to resource keys
        //      in the EPiServer LocalizationService implementation.
        //      This module handles client side caching of resources and resource structures. To minimize server
        //      side requests, you should always query for the top-most resource path first. Then all subsequesnt
        //      queries to more specific keys will be returned from client-side cache.
        // tags:
        //      public

        load: function (/*String*/id, /*function*/require, /*function*/load) {
            // summary:
            //      Loads the resource structure identified by the id
            // id:
            //      Localization resource identifier
            // require:
            //      reference to the AMD loader
            // load:
            //      The callback executed when the resource is ready

            id = id.toLowerCase();

            var match = nlsRe.exec(id),
                bundlePath = match[1] + "/",
                bundleName = match[5] || match[4],
                localeSpecified = (match[5] && match[4]),
                targetLocale = localeSpecified || dojo.locale,
                target = bundlePath + targetLocale + "/" + bundleName;

            var cached = getCache(bundleName);
            if (cached) {
                // Already in cache. Execute load callback with data.
                load(cached);
                return;
            }

            require([target], function (data) {
                // Add to cache and execute callback with the localization data
                setCache(bundleName, data);
                load(data);
            });
        },

        clearCache: function () {
            // summary:
            //      Clear the localization cache.
            //      Primarily intended for unit test purposes.
            cache = {};
        }
    };


});

},
'epi/dependency':function(){
﻿define("epi/dependency", ["dojo/_base/declare", "epi"], function (declare, epi) {

    var Dependency = declare([], {
        // tags:
        //      public

        _dependencies: null,

        constructor: function () {
            this._dependencies = {};
        },

        register: function (/*String*/identifier, /*Object|Function*/value, /*Function?*/unregisterFunction) {
            // summary:
            //      Register a dependency
            //
            // description:
            //		Register an object
            //
            // identifier:
            //      The name for the registered dependency
            //
            // value:
            //		The value to store.
            //		If the value is an object, the value will be returned on resolve.
            //		If value is a class constructor, a new instance will be created and returned on first resolve
            //      If value is a function, the result of that function will be returned on first resolve
            //
            // unregisterFunction:
            //		Function to run when dependency is unregistered
            //
            // example:
            //		Register dependency with an object instance
            //	|	require(["epi/dependency", "MyClass"], function (dependency, MyClass) {
            //	|	    dependency.register("MyClass", new MyClass());
            //	|	});
            //
            // example:
            //		Register dependency with a class constructor. An instance of epi/shell/widget/SuperWidgetFactory will be
            //		created upon first resolve and that instance will be returned for all resolves thereafter
            //	|	require(["epi/dependency", "epi/SuperWidgetFactory"], function (dependency, SuperWidgetFactory) {
            //	|	    dependency.register("epi.shell.widget.WidgetFactory", SuperWidgetFactory);
            //	|	});
            //
            // example:
            //		Register dependency with a function.
            //		The function will be called on each resolve.
            //		In this case a new Date object will be returned.
            //	|	dependency.register("epi.shell.widget.WidgetFactory", function() {
            //	|		return new Date();
            //	|	});
            //
            // example:
            //		Register dependency with an unregisterFunction. The function will be called when dependency is unregistered.
            //	|	dependency.register("ComponentController", new ComponentController(), function(controller, initValue) {
            //	|		// do any clean up here
            //	|		controller.destroy();
            //	|	});
            //
            // tags:
            //		public
            //

            var valueIsFunction = (typeof value == "function");
            var valueIsConstructor = (valueIsFunction && "superclass" in value);
            var initialized = (!valueIsFunction && !valueIsConstructor);
            var initFunction;

            if (valueIsConstructor) {
                // create a lazy initFunction when value is a constructor
                var cls = value;
                initFunction = function () {
                    return new cls();
                };
            } else if (valueIsFunction) {
                initFunction = value;
            }

            // unregister any previous value
            this.unregister(identifier);

            // bind value to identifier
            this._dependencies[identifier] = {
                value: initialized ? value : undefined,
                initFunction: initFunction,
                initialized: initialized,
                unregisterFunction: unregisterFunction
            };
        },

        unregister: function (/*String*/identifier) {
            // summary:
            //      Removes a registered dependency. Calls the unregister function if one was register for this value
            //
            // identifier: String
            //      The name for the registered dependency
            //
            // tags:
            //		public
            //

            if (!(identifier in this._dependencies)) {
                return;
            }

            var dep = this._dependencies[identifier];
            if (dep.initialized && typeof dep.unregisterFunction == "function") {
                dep.unregisterFunction(dep.value);
            }

            delete this._dependencies[identifier];
        },

        resolve: function (/*String*/identifier) {
            // summary:
            //      Resolves a dependency
            //
            // identifier: String
            //      The name for the registered dependency
            //
            // example:
            //		Resolve a dependency
            //	|	dojo.require("MyClass");
            //  |   var x = new MyClass();
            //	|	dependency.register("MyClass", x);
            //  |   dependency.resolve("MyClass") == x // => true
            //
            // tags:
            //		public
            //
            // returns:
            //		The registered value. Throws an error if no value is registered for this identifier
            //

            if (!(identifier in this._dependencies)) {
                throw new Error("Could not resolve dependency \"" + identifier + "\" (epi.dependency)");
            }

            var dep = this._dependencies[identifier];

            // resolve any lazy dependency
            if (!dep.initialized) {
                // set value to result of value;
                dep.value = dep.initFunction();
                dep.initialized = true;
            }

            return dep.value; // Object
        },

        exists: function (identifier) {
            // summary:
            //      Checks if an identifier exists in the dependency registry
            // identifier: String
            //      The name for the registered dependency
            return (identifier in this._dependencies);
        },

        list: function () {
            // summary:
            //      List registered dependencies.
            //
            // tags:
            //		public
            //
            // returns:
            //		An array with the registered identifiers
            //

            var identifiers = [];
            for (var identifier in this._dependencies) {
                identifiers.push(identifier);
            }
            return identifiers; // String[]
        },

        clear: function () {
            // summary:
            //      Reset dependency.
            //
            // description:
            //      For tests purpose only.
            //
            // tags:
            //		internal
            //

            for (var identifier in this._dependencies) {
                this.unregister(identifier);
            }

            this._dependencies = {};
        }
    });

    return epi.dependency = new Dependency();
});

},
'epi/routes':function(){
﻿(function () {
    var routes = {
        // tags:
        //      public


        // registeredRoutes: [public] Object
        //      All registered routes in the system
        registeredRoutes: {},

        defaultModuleArea: null,

        init: function (defaultModuleArea) {
            // summary:
            //     Sets up default module area for route resolving
            // defaultModuleArea:
            //     The default moduleArea routed to when moduleArea isn't specified
            this.defaultModuleArea = defaultModuleArea;
        },

        registerRoute: function (routeFormat, parameters) {
            // summary:
            //     Register a route and default parameters
            // routeFormat:
            //     A name/value collection of route parameters
            // parameters:
            //     Default paramters when resolving the route
            this.registeredRoutes[parameters.moduleArea.toLowerCase()] = { url: routeFormat, defaults: parameters };
        },

        getActionPath: function (parameters, customPath) {
            // summary:
            //     Generates a route path for shell controller actions
            // parameters:
            //     A name/value collection of route parameters
            // customPath:
            //     A custom path to use when resolving the route

            var routeInfo = null;
            if (typeof customPath == "string") {
                routeInfo = { url: customPath, defaults: {} };
            } else if (parameters == null || typeof parameters["moduleArea"] != "string") {
                routeInfo = this.registeredRoutes[this.defaultModuleArea.toLowerCase()];
            } else {
                routeInfo = this.registeredRoutes[parameters["moduleArea"].toLowerCase()];
            }

            if (!routeInfo) {
                throw new Error("Failed to resolve a route from parameters or default settings");
            }

            var replace = function (url, key, value) {
                var formatKey = "{" + key + "}";
                var keyIndex = url.indexOf(formatKey, 0);
                if (keyIndex >= 0) {
                    return url.substring(0, keyIndex) + value + url.substring(keyIndex + formatKey.length);
                }

                var queryIndex = url.indexOf("?");
                return url + (queryIndex >= 0 ? "&" : "?") + key + "=" + value;
            };

            // Merge default context parameters and and the route parameters into the mergeParameter object
            // route parameters will override context parameters
            var merge = (typeof dojo === "object" ? dojo.mixin : $.extend);
            var mergedParameters = merge({}, routeInfo.defaults, parameters);
            var path = routeInfo.url;

            for (var key in mergedParameters) {
                path = replace(path, key, mergedParameters[key]);
            }
            var removeExtraSlashRegex = /\/+[?]/;
            //Remove any '/' characters located before the query part (?)
            path = path.replace(removeExtraSlashRegex, '?');
            return path;
        },

        getRestPath: function (/*Object*/parameters, /*String*/customPath) {
            // summary:
            //      Generates a path to the rest store.
            // tags:
            //      public

            var storeName = parameters.storeName;
            delete parameters.storeName;
            return this.getActionPath(dojo.mixin(parameters, { action: storeName, controller: "Stores" }), customPath);
        },

        getRouteParams: function (routeUrl, url) {
            // summary:
            //     Parses an url to extract route parameters from it. Returns a named collection of the parameters found
            // routeUrl:
            //     The route template to containing parameters to find. "/routes/{moduleArea}/{controller}/{action}/{id}"
            // url:
            //     The url containing the route parameters to extract.

            var splitRegEx = /[\/|?]/g;
            // Create url object from string
            var urlParts = this.parseUrl(url);
            // Split path on / and ?
            var pathSections = urlParts.path.split(splitRegEx);
            // Split route-url on / and ?
            var routeSections = routeUrl.split(splitRegEx);
            var routeParams = {};

            // Loop over the route url sections and match with the corrensponding section on the path
            for (var i = 0; i < routeSections.length; i++) {
                // Check if the section is supposed to be replaceble
                if (routeSections[i].charAt(0) === '{') {
                    // Cut off { and } from the name
                    var name = routeSections[i].substring(1, routeSections[i].length - 1);
                    // Set the value to the section of the url or an empty string of not existing (probably default action)
                    var value = pathSections.length > i ? pathSections[i] : "";
                    routeParams[name] = value;
                }
            }

            // Add the parameters from the query string collection
            return $.extend(routeParams, urlParts.queryParams);
        },

        parseUrl: function (urlToParse) {
            // summary:
            //     Creates an object with named properties of url parts
            //     Based on parseUri by Steven Levithan http://blog.stevenlevithan.com/archives/parseuri
            // urlToParse:
            //     a url to parse into parts
            var url = {};
            var matches = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(urlToParse);
            var keys = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
            var i = keys.length;

            while (i--) {
                url[keys[i]] = matches[i] || "";
            }

            url.queryParams = {};
            url.query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
                if ($1) {
                    url.queryParams[$1] = $2;
                }
            });

            return url;
        }
    };

    if (typeof define != "undefined") {
        define("epi/routes", ["epi"], function (epi) {
            return epi.routes = routes;
        });
    } else {
        // When not using define, i.e. not in dojo-land, epi is globally available.
        // But if it hasn't been defined yet, we have to define it.
        var e = window.epi || {};
        e.routes = routes;
    }
})();

},
'epi/clientResourcesLoader':function(){
﻿define("epi/clientResourcesLoader", [
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/dom-construct",
    "dojo/Deferred",
    "dojo/query",
    "epi"
], function (array, lang, win, dom, Deferred, query, epi) {
    "use strict";
    var loadedStyles = {},
        loadedScripts = {};

    return epi.clientResourcesLoader = {
        // tags:
        //      internal

        _loadStyles: function (stylePaths) {
            if (!lang.isArray(stylePaths)) {
                return;
            }

            array.forEach(stylePaths, function (stylePath) {

                // use lower case path as key
                var stylePathLower = stylePath.toLowerCase();

                if (!(stylePathLower in loadedStyles)) {
                    var head = query("head")[0];
                    dom.create("link", { rel: "stylesheet", type: "text/css", href: stylePath }, head);
                    loadedStyles[stylePathLower] = 1;
                } else {
                    // increase count
                    loadedStyles[stylePathLower] += 1;
                }
            });
        },

        _loadScripts: function (scriptPaths) {
            var deferred = new Deferred();

            var loadedInDOM = function (scriptPath) {
                var scriptNodeId = scriptPath.toLowerCase().replace(/[^A-z0-9$_]/g, "_");
                return !!win.doc.getElementById(scriptNodeId);
            };

            var getScriptDependencies = function (scriptsToLoad) {
                // Called recursively to load the scripts in fake sync mode, resolving the deferred when done.

                // No more scripts to load; resolve and return
                if (scriptsToLoad.length === 0) {
                    deferred.resolve();
                    return;
                }

                // Shift out the first element from the array.
                var scriptPath = scriptsToLoad.shift();

                // Add it to the dictionary of scripts that has been loaded
                require([scriptPath], function () {
                    loadedScripts[scriptPath] = true;
                    // Call recursively for the remaining scripts in the array
                    getScriptDependencies(scriptsToLoad);
                });
            };

            // Add all scripts that aren't already loaded to an array
            var scriptsToLoad = [];
            if (lang.isArray(scriptPaths)) {
                scriptsToLoad = array.filter(scriptPaths, function (scriptPath) {
                    return !((scriptPath in loadedScripts) || loadedInDOM(scriptPath));
                });
            }

            getScriptDependencies(scriptsToLoad);

            return deferred;
        },

        loadResources: function (/* String[]? */stylePaths, /* String[]? */scriptPaths) {
            // summary:
            //      Loads style and script resources
            //
            // stylePaths: String[]?
            //      Paths to stylesheet files
            //
            // scriptPaths: String[]?
            //      Paths to script files
            //
            // returns:
            //  A promise which is resolved when all scripts has been loaded
            //
            // example:
            //      Load a style file
            //  |   clientResourcesLoader.loadResources(["/css/styles.css"]);
            //
            // example:
            //      Load a script file
            //  |   clientResourcesLoader.loadResources(undefined, ["/scripts/script.js"]);
            //
            // example:
            //      Load a multiple files
            //  |   clientResourcesLoader.loadResources(["/css/styles.css", "/css/form.css"], ["/scripts/script.js"]);
            //
            // tags:
            //		public

            // Start with styles, they can be loaded in parallel
            this._loadStyles(stylePaths);

            // Return the deferred from script loading, since we need to know when all scripts has been loaded
            return this._loadScripts(scriptPaths);
        },

        reset: function () {
            // summary:
            //      Reset the loaded script information to its initial state.
            //      Primarily for unit test purposes.
            // tags:
            //      public

            loadedScripts = {};
            loadedStyles = {};
        }
    };
});

},
'epi/_Module':function(){
﻿define([
    "dojo/_base/declare",
    "epi/dependency"
], function (
    declare,
    dependency
) {

    return declare(null, {
        // summary:
        //		Base class for Modules.
        // tags:
        //      public

        //  _initialized: [protected] Boolean
        //      initialize() has been completed
        _initialized: false,

        //  _settings: [protected] Object
        //      Settings object
        _settings: null,

        //  _registeredDependencies: [private] String[]
        //      Array of registered dependencies for a module instance
        _registeredDependencies: null,

        constructor: function (settings) {
            this._settings = settings;
            this._registeredDependencies = [];
            this._initialized = false;
        },

        initialize: function () {
            // summary:
            //		Initialize module
            //
            this._initialized = true;
        },

        uninitialize: function () {
            // summary:
            //		Uninitalize module
            //
            this.unregisterDependencies();
        },

        registerDependency: function (/*String*/name, /*Object|Function*/value, /*Function?*/initFunction, /*Function?*/unregisterFunction) {
            // summary:
            //      Register a dependency
            //
            // identifier:
            //      The name for the registered dependency
            //
            // value:
            //		The value to store.
            //		If the value is an object, the value will be returned on resolve.
            //		If value is a string and initFunction is not defined, value is assumed to be the name of a class and will be registered as a lazy dependency which
            //		will be resolved first time.
            //		If the value is a function it will be called on each resolve
            //
            // initFunction:
            //		Function to run first time dependency is resolved.
            //
            // unregisterFunction:
            //		Function to run when dependency is unregistered
            //
            // example:
            //		Register dependency with an object instance
            //	|	var module = new MyModule(); // must be sub class of epi._Module
            //	|	require(["MyClass"], function (MyClass) {
            //	|	    module.registerDependency("MyClass", new MyClass());
            //	|	});
            //
            // example:
            //		Register dependency with a class name. An instance of epi/shell/widget/SuperWidgetFactory will be required
            //		and created upon first resolve.
            //	|	var module = new MyModule(); // must be sub class of epi._Module
            //	|	module.registerDependency("epi.shell.widget.WidgetFactory", "epi/shell/widget/SuperWidgetFactory");
            //
            // example:
            //		Register dependency with a function.
            //		The function will be called on each resolve.
            //		In this case a new Date object will be returned.
            //	|	var module = new MyModule(); // must be sub class of epi._Module
            //	|	module.registerDependency("epi.shell.widget.WidgetFactory", function() {
            //	|		return new Date();
            //	|	});
            //
            // example:
            //		Register dependency with an initFunction. The function will only run once
            //	|	var module = new MyModule(); // must be sub class of epi._Module
            //	|	module.registerDependency("MyClass", "a string", function(initValue) {
            //	|		// do any require
            //	|		dojo.require("MyClass");
            //	|		// return an instance, initValue will be "a string" in this example
            //	|		return new MyClass(initValue);
            //	|	});
            //
            // example:
            //		Register dependency with an unregisterFunction. The function will be called when dependency is unregistered.
            //	|	var module = new MyModule(); // must be sub class of epi._Module
            //	|	module.registerDependency("ComponentController", new ComponentController(), undefined, function(value, initValue) {
            //	|		// do any clean up here
            //	|		value.destroy();
            //	|	});
            //
            // tags:
            //		public
            //

            // add to list of my dependencies
            this._registeredDependencies.push(name);
            dependency.register(name, value, initFunction, unregisterFunction);
        },

        unregisterDependencies: function () {
            // summary:
            //		Unregisters all dependencies for this module
            //
            this._registeredDependencies.forEach(function (entry, index) {
                dependency.unregister(entry);
            }, this);
            this._registeredDependencies = [];
            this._initialized = false;
        },

        resolveDependency: function (identifier) {
            // summary:
            //  Get a dependency by its identifier
            //
            // identifier: String
            //  The unique name of the dependency to get.

            return dependency.resolve(identifier);
        },

        unregisterDependency: function (identifier) {
            // summary:
            //		Unregisters a specific dependency
            //
            // identifier: String
            //  The unique name of the dependency to get.

            dependency.unregister(identifier);
            this._registeredDependencies = this._registeredDependencies.filter(function (item) {
                return item !== identifier;
            });
        }
    });
});

},
'epi/ModuleManager':function(){
﻿define([
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

},
'dojo/promise/all':function(){
define("dojo/promise/all", [
	"../_base/array",
	"../Deferred",
	"../when"
], function(array, Deferred, when){
	"use strict";

	// module:
	//		dojo/promise/all

	var some = array.some;

	return function all(objectOrArray){
		// summary:
		//		Takes multiple promises and returns a new promise that is fulfilled
		//		when all promises have been fulfilled.
		// description:
		//		Takes multiple promises and returns a new promise that is fulfilled
		//		when all promises have been fulfilled. If one of the promises is rejected,
		//		the returned promise is also rejected. Canceling the returned promise will
		//		*not* cancel any passed promises.
		// objectOrArray: Object|Array?
		//		The promise will be fulfilled with a list of results if invoked with an
		//		array, or an object of results when passed an object (using the same
		//		keys). If passed neither an object or array it is resolved with an
		//		undefined value.
		// returns: dojo/promise/Promise

		var object, array;
		if(objectOrArray instanceof Array){
			array = objectOrArray;
		}else if(objectOrArray && typeof objectOrArray === "object"){
			object = objectOrArray;
		}

		var results;
		var keyLookup = [];
		if(object){
			array = [];
			for(var key in object){
				if(Object.hasOwnProperty.call(object, key)){
					keyLookup.push(key);
					array.push(object[key]);
				}
			}
			results = {};
		}else if(array){
			results = [];
		}

		if(!array || !array.length){
			return new Deferred().resolve(results);
		}

		var deferred = new Deferred();
		deferred.promise.always(function(){
			results = keyLookup = null;
		});
		var waiting = array.length;
		some(array, function(valueOrPromise, index){
			if(!object){
				keyLookup.push(index);
			}
			when(valueOrPromise, function(value){
				if(!deferred.isFulfilled()){
					results[keyLookup[index]] = value;
					if(--waiting === 0){
						deferred.resolve(results);
					}
				}
			}, deferred.reject);
			return deferred.isFulfilled();
		});
		return deferred.promise;	// dojo/promise/Promise
	};
});

},
'epi/shell/Bootstrapper':function(){
define([
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

},
'epi/datetime':function(){
﻿define("epi/datetime", [
    "epi",
    "dojo/date",
    "dojo/date/stamp",
    "dojo/date/locale",
    "dojo/_base/lang",
    "dojo/i18n"],

function (epi, dojoDate, dateStamp, locale, lang, i18n) {

    function _friendlyTimeDiff(fromDate, toDate) {
        var dayStr = epi.resources.text.day;
        var daysStr = epi.resources.text.days;

        var hourStr = epi.resources.text.hour;
        var hoursStr = epi.resources.text.hours;

        var minuteStr = epi.resources.text.minute;
        var minutesStr = epi.resources.text.minutes;

        var secondStr = epi.resources.text.second;
        var secondsStr = epi.resources.text.seconds;

        var result = "";

        var totalDiff = toDate - fromDate;

        // If the date is in the future the totalDiff will be negative, return 1 second if that is the case
        if (totalDiff < 0) {
            return " 1 " + secondStr;
        }

        var days = Math.floor(totalDiff / 1000 / 60 / 60 / 24);
        var dateDiff = new Date(totalDiff);
        var hours = dateDiff.getUTCHours();
        var minutes = dateDiff.getMinutes();
        var seconds = dateDiff.getSeconds();

        if (days !== 0) {
            result = result + " " + days + " " + (days > 1 ? daysStr : dayStr);
        }

        if (hours !== 0) {
            result = result + " " + hours + " " + (hours > 1 ? hoursStr : hourStr);
        }

        if (minutes !== 0) {
            result = result + " " + minutes + " " + (minutes > 1 ? minutesStr : minuteStr);
        }

        if (result.length > 0) {
            return result;
        }

        return " " + seconds + " " + (seconds > 1 ? secondsStr : secondStr);
    }

    function _hasProperties(/*Object*/obj) {
        // summary:
        //    Helper function that determine if the object is a simple or complex object
        //
        // obj:
        //    Object to be tested.
        //
        // tags:
        //    internal
        if (lang.isObject(obj)) {
            for (var item in obj) {
                return true;
            }
        }
        return false;
    }

    function _transformDate(/*Object*/obj, /*boolean*/forceSimpleProperty) {
        // summary:
        //    Search property that are instance of Date
        //    in a object recursively.
        //
        // obj:
        //    The object the contain the data to be
        //    transformed.
        //
        // tags:
        //    internal
        if (forceSimpleProperty) {
            if (obj instanceof Date) {
                return dateStamp.toISOString(obj, { zulu: true });
            } else {
                return obj;
            }
        }

        var newObject = lang.clone(obj);

        for (var item in obj) {
            if (obj[item] instanceof Date) {
                newObject[item] = dateStamp.toISOString(obj[item], { zulu: true });
            } else {
                if (_hasProperties(obj[item])) {
                    newObject[item] = _transformDate(obj[item]);
                }
            }
        }
        return newObject;
    }

    function escapeFormat(format) {
        // summary:
        //      Escapes the given string so that it will be ignored by the date formatter.
        // tags:
        //      private

        return "'" + format + "'";
    }

    return epi.datetime = {
        // tags:
        //      public

        // serverTimeDelta: Integer
        //      Difference time between client and server
        serverTimeDelta: 0,

        transformDate: function (/*Object*/value) {
            // summary:
            //    Remove the padding server offset from the date and
            //    convert it to ISO String.
            //
            // value:
            //    The object to be converted.
            //
            // tags:
            //    public
            var isSimpleProperty = (_hasProperties(value) && !(value instanceof Date));
            var transformedValue = (isSimpleProperty ? _transformDate(value) : _transformDate(value, true));
            return transformedValue;
        },

        isDateValid: function (/*Object*/obj) {
            // summary:
            //    Check if the date object is valid.
            //
            // obj:
            //    Object to the tested.
            //
            // tags:
            //    private
            return ((obj && obj instanceof Date) && (!isNaN(obj.getTime())));
        },

        toUserFriendlyString: function (date, localeName, hideToday, excludeTime) {
            // summary:
            //      Converts a date object or a date formatted string to a user friendly string.
            // date: Date|String
            //      The date to convert.
            // localeName: String?
            //      The locale in which the date will be formatted.
            // hideToday: Boolean?
            //      Excludes the date portion from the returned date string when true and the given
            //      date is today.
            // excludeTime: Boolean?
            //      Excludes the time portion from the returned date string when true. This option
            //      is ignored in the case hideToday is true and the given date is today.
            // tags:
            //      public

            if (!date) {
                return "";
            }

            // "date" can be passed as a string, but needed as a Date object.
            if (!(date instanceof Date)) {
                date = new Date(date);

                // TODO: Throw exception instead once we release CMS UI 12.0.
            }

            //Get the gregorian settings for the current locale that specifies some specific locale formats.
            var bundle = i18n.getLocalization("dojo.cldr", "gregorian", localeName);

            var today = new Date(),
                comparisonDate = new Date(date),
                selector = excludeTime ? "date" : "",
                datePattern = "";

            today.setHours(0, 0, 0, 0);
            comparisonDate.setHours(0, 0, 0, 0);

            if (dojoDate.difference(today, date, "year") === 0) {
                // If the date is this year format the date with only month and day.
                datePattern = bundle["dateFormatItem-MMMd"];

                // Store the comparison date in a new variable since we need the original and
                // compare the difference in days.
                var difference = dojoDate.difference(today, comparisonDate, "day");

                switch (difference) {
                    case 0:
                        // Do an early exit with only the formatted time if hideToday is true.
                        if (hideToday) {
                            return locale.format(date, { selector: "time", locale: localeName });
                        }
                        datePattern = escapeFormat(bundle["field-day-relative+0"]);
                        break;
                    case 1:
                        datePattern = escapeFormat(bundle["field-day-relative+1"]);
                        break;
                    case -1:
                        datePattern = escapeFormat(bundle["field-day-relative+-1"]);
                        break;
                }
            }

            // Format the date based on the selector, date pattern and given locale.
            return locale.format(date, { selector: selector, datePattern: datePattern, locale: localeName });
        },

        toUserFriendlyHtml: function (date, localeName, hideToday, excludeTime) {
            // summary:
            //      Converts a date object or a date formatted string to a user friendly string
            //      contained within HTML, e.g. <span class="epi-timestamp">Today, 7:30 AM</span>.
            // date: Date|String
            //      The date to convert.
            // localeName: String?
            //      The locale in which the date will be formatted.
            // hideToday: Boolean?
            //      Excludes the date portion from the returned date string when true and the given
            //      date is today.
            // excludeTime: Boolean?
            //      Excludes the time portion from the returned date string when true. This option
            //      is ignored in the case hideToday is true and the given date is today.
            // tags:
            //      public

            var formattedDate = this.toUserFriendlyString(date, localeName, hideToday, excludeTime);
            if (formattedDate === "") {
                return formattedDate;
            }
            return "<span class='epi-timestamp'>" + formattedDate + "</span>";
        },

        timePassed: function (from, to) {
            // summary:
            //      Get the time passed between two dates
            //
            // from: Date
            //      Start date
            // to: Null|Date
            //      End date
            // tags:
            //      public

            to = to || new Date();
            return _friendlyTimeDiff(from, to);
        },

        timeToGo: function (/*Date*/date) {
            // summary:
            //      Get the time to go to the given time
            //
            // tags:
            //      public

            return _friendlyTimeDiff(this.serverTime(), date);
        },

        serverTime: function () {
            // summary:
            //      Get the current datetime from server
            //
            // tags:
            //      public

            return new Date(new Date().getTime() + this.serverTimeDelta);
        }
    };
});

},
'dojo/date':function(){
define("dojo/date", ["./has", "./_base/lang"], function(has, lang){
// module:
//		dojo/date

var date = {
	// summary:
	//		Date manipulation utilities
};

date.getDaysInMonth = function(/*Date*/dateObject){
	// summary:
	//		Returns the number of days in the month used by dateObject
	var month = dateObject.getMonth();
	var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	if(month == 1 && date.isLeapYear(dateObject)){ return 29; } // Number
	return days[month]; // Number
};

date.isLeapYear = function(/*Date*/dateObject){
	// summary:
	//		Determines if the year of the dateObject is a leap year
	// description:
	//		Leap years are years with an additional day YYYY-02-29, where the
	//		year number is a multiple of four with the following exception: If
	//		a year is a multiple of 100, then it is only a leap year if it is
	//		also a multiple of 400. For example, 1900 was not a leap year, but
	//		2000 is one.

	var year = dateObject.getFullYear();
	return !(year%400) || (!(year%4) && !!(year%100)); // Boolean
};

// FIXME: This is not localized
date.getTimezoneName = function(/*Date*/dateObject){
	// summary:
	//		Get the user's time zone as provided by the browser
	// dateObject:
	//		Needed because the timezone may vary with time (daylight savings)
	// description:
	//		Try to get time zone info from toString or toLocaleString method of
	//		the Date object -- UTC offset is not a time zone.  See
	//		http://www.twinsun.com/tz/tz-link.htm Note: results may be
	//		inconsistent across browsers.

	var str = dateObject.toString(); // Start looking in toString
	var tz = ''; // The result -- return empty string if nothing found
	var match;

	// First look for something in parentheses -- fast lookup, no regex
	var pos = str.indexOf('(');
	if(pos > -1){
		tz = str.substring(++pos, str.indexOf(')'));
	}else{
		// If at first you don't succeed ...
		// If IE knows about the TZ, it appears before the year
		// Capital letters or slash before a 4-digit year
		// at the end of string
		var pat = /([A-Z\/]+) \d{4}$/;
		if((match = str.match(pat))){
			tz = match[1];
		}else{
		// Some browsers (e.g. Safari) glue the TZ on the end
		// of toLocaleString instead of putting it in toString
			str = dateObject.toLocaleString();
			// Capital letters or slash -- end of string,
			// after space
			pat = / ([A-Z\/]+)$/;
			if((match = str.match(pat))){
				tz = match[1];
			}
		}
	}

	// Make sure it doesn't somehow end up return AM or PM
	return (tz == 'AM' || tz == 'PM') ? '' : tz; // String
};

// Utility methods to do arithmetic calculations with Dates

date.compare = function(/*Date*/date1, /*Date?*/date2, /*String?*/portion){
	// summary:
	//		Compare two date objects by date, time, or both.
	// description:
	//		Returns 0 if equal, positive if a > b, else negative.
	// date1:
	//		Date object
	// date2:
	//		Date object.  If not specified, the current Date is used.
	// portion:
	//		A string indicating the "date" or "time" portion of a Date object.
	//		Compares both "date" and "time" by default.  One of the following:
	//		"date", "time", "datetime"

	// Extra step required in copy for IE - see #3112
	date1 = new Date(+date1);
	date2 = new Date(+(date2 || new Date()));

	if(portion == "date"){
		// Ignore times and compare dates.
		date1.setHours(0, 0, 0, 0);
		date2.setHours(0, 0, 0, 0);
	}else if(portion == "time"){
		// Ignore dates and compare times.
		date1.setFullYear(0, 0, 0);
		date2.setFullYear(0, 0, 0);
	}

	if(date1 > date2){ return 1; } // int
	if(date1 < date2){ return -1; } // int
	return 0; // int
};

date.add = function(/*Date*/date, /*String*/interval, /*int*/amount){
	// summary:
	//		Add to a Date in intervals of different size, from milliseconds to years
	// date: Date
	//		Date object to start with
	// interval:
	//		A string representing the interval.  One of the following:
	//		"year", "month", "day", "hour", "minute", "second",
	//		"millisecond", "quarter", "week", "weekday"
	// amount:
	//		How much to add to the date.

	var sum = new Date(+date); // convert to Number before copying to accomodate IE (#3112)
	var fixOvershoot = false;
	var property = "Date";

	switch(interval){
		case "day":
			break;
		case "weekday":
			//i18n FIXME: assumes Saturday/Sunday weekend, but this is not always true.  see dojo/cldr/supplemental

			// Divide the increment time span into weekspans plus leftover days
			// e.g., 8 days is one 5-day weekspan / and two leftover days
			// Can't have zero leftover days, so numbers divisible by 5 get
			// a days value of 5, and the remaining days make up the number of weeks
			var days, weeks;
			var mod = amount % 5;
			if(!mod){
				days = (amount > 0) ? 5 : -5;
				weeks = (amount > 0) ? ((amount-5)/5) : ((amount+5)/5);
			}else{
				days = mod;
				weeks = parseInt(amount/5);
			}
			// Get weekday value for orig date param
			var strt = date.getDay();
			// Orig date is Sat / positive incrementer
			// Jump over Sun
			var adj = 0;
			if(strt == 6 && amount > 0){
				adj = 1;
			}else if(strt == 0 && amount < 0){
			// Orig date is Sun / negative incrementer
			// Jump back over Sat
				adj = -1;
			}
			// Get weekday val for the new date
			var trgt = strt + days;
			// New date is on Sat or Sun
			if(trgt == 0 || trgt == 6){
				adj = (amount > 0) ? 2 : -2;
			}
			// Increment by number of weeks plus leftover days plus
			// weekend adjustments
			amount = (7 * weeks) + days + adj;
			break;
		case "year":
			property = "FullYear";
			// Keep increment/decrement from 2/29 out of March
			fixOvershoot = true;
			break;
		case "week":
			amount *= 7;
			break;
		case "quarter":
			// Naive quarter is just three months
			amount *= 3;
			// fallthrough...
		case "month":
			// Reset to last day of month if you overshoot
			fixOvershoot = true;
			property = "Month";
			break;
//		case "hour":
//		case "minute":
//		case "second":
//		case "millisecond":
		default:
			property = "UTC"+interval.charAt(0).toUpperCase() + interval.substring(1) + "s";
	}

	if(property){
		sum["set"+property](sum["get"+property]()+amount);
	}

	if(fixOvershoot && (sum.getDate() < date.getDate())){
		sum.setDate(0);
	}

	return sum; // Date
};

date.difference = function(/*Date*/date1, /*Date?*/date2, /*String?*/interval){
	// summary:
	//		Get the difference in a specific unit of time (e.g., number of
	//		months, weeks, days, etc.) between two dates, rounded to the
	//		nearest integer.
	// date1:
	//		Date object
	// date2:
	//		Date object.  If not specified, the current Date is used.
	// interval:
	//		A string representing the interval.  One of the following:
	//		"year", "month", "day", "hour", "minute", "second",
	//		"millisecond", "quarter", "week", "weekday"
	//
	//		Defaults to "day".

	date2 = date2 || new Date();
	interval = interval || "day";
	var yearDiff = date2.getFullYear() - date1.getFullYear();
	var delta = 1; // Integer return value

	switch(interval){
		case "quarter":
			var m1 = date1.getMonth();
			var m2 = date2.getMonth();
			// Figure out which quarter the months are in
			var q1 = Math.floor(m1/3) + 1;
			var q2 = Math.floor(m2/3) + 1;
			// Add quarters for any year difference between the dates
			q2 += (yearDiff * 4);
			delta = q2 - q1;
			break;
		case "weekday":
			var days = Math.round(date.difference(date1, date2, "day"));
			var weeks = parseInt(date.difference(date1, date2, "week"));
			var mod = days % 7;

			// Even number of weeks
			if(mod == 0){
				days = weeks*5;
			}else{
				// Weeks plus spare change (< 7 days)
				var adj = 0;
				var aDay = date1.getDay();
				var bDay = date2.getDay();

				weeks = parseInt(days/7);
				mod = days % 7;
				// Mark the date advanced by the number of
				// round weeks (may be zero)
				var dtMark = new Date(date1);
				dtMark.setDate(dtMark.getDate()+(weeks*7));
				var dayMark = dtMark.getDay();

				// Spare change days -- 6 or less
				if(days > 0){
					switch(true){
						// Range starts on Sat
						case aDay == 6:
							adj = -1;
							break;
						// Range starts on Sun
						case aDay == 0:
							adj = 0;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = -1;
							break;
						// Range ends on Sun
						case bDay == 0:
							adj = -2;
							break;
						// Range contains weekend
						case (dayMark + mod) > 5:
							adj = -2;
					}
				}else if(days < 0){
					switch(true){
						// Range starts on Sat
						case aDay == 6:
							adj = 0;
							break;
						// Range starts on Sun
						case aDay == 0:
							adj = 1;
							break;
						// Range ends on Sat
						case bDay == 6:
							adj = 2;
							break;
						// Range ends on Sun
						case bDay == 0:
							adj = 1;
							break;
						// Range contains weekend
						case (dayMark + mod) < 0:
							adj = 2;
					}
				}
				days += adj;
				days -= (weeks*2);
			}
			delta = days;
			break;
		case "year":
			delta = yearDiff;
			break;
		case "month":
			delta = (date2.getMonth() - date1.getMonth()) + (yearDiff * 12);
			break;
		case "week":
			// Truncate instead of rounding
			// Don't use Math.floor -- value may be negative
			delta = parseInt(date.difference(date1, date2, "day")/7);
			break;
		case "day":
			delta /= 24;
			// fallthrough
		case "hour":
			delta /= 60;
			// fallthrough
		case "minute":
			delta /= 60;
			// fallthrough
		case "second":
			delta /= 1000;
			// fallthrough
		case "millisecond":
			delta *= date2.getTime() - date1.getTime();
	}

	// Round for fractional values and DST leaps
	return Math.round(delta); // Number (integer)
};

// Don't use setObject() because it may overwrite dojo/date/stamp (if that has already been loaded)
 1  && lang.mixin(lang.getObject("dojo.date", true), date);

return date;
});

},
'dojo/date/stamp':function(){
define("dojo/date/stamp", ["../_base/lang", "../_base/array"], function(lang, array){

// module:
//		dojo/date/stamp

var stamp = {
	// summary:
	//		TODOC
};
lang.setObject("dojo.date.stamp", stamp);

// Methods to convert dates to or from a wire (string) format using well-known conventions

stamp.fromISOString = function(/*String*/ formattedString, /*Number?*/ defaultTime){
	// summary:
	//		Returns a Date object given a string formatted according to a subset of the ISO-8601 standard.
	//
	// description:
	//		Accepts a string formatted according to a profile of ISO8601 as defined by
	//		[RFC3339](http://www.ietf.org/rfc/rfc3339.txt), except that partial input is allowed.
	//		Can also process dates as specified [by the W3C](http://www.w3.org/TR/NOTE-datetime)
	//		The following combinations are valid:
	//
	//		- dates only
	//			- yyyy
	//			- yyyy-MM
	//			- yyyy-MM-dd
	//		- times only, with an optional time zone appended
	//			- THH:mm
	//			- THH:mm:ss
	//			- THH:mm:ss.SSS
	//		- and "datetimes" which could be any combination of the above
	//
	//		timezones may be specified as Z (for UTC) or +/- followed by a time expression HH:mm
	//		Assumes the local time zone if not specified.  Does not validate.  Improperly formatted
	//		input may return null.  Arguments which are out of bounds will be handled
	//		by the Date constructor (e.g. January 32nd typically gets resolved to February 1st)
	//		Only years between 100 and 9999 are supported.
  	// formattedString:
	//		A string such as 2005-06-30T08:05:00-07:00 or 2005-06-30 or T08:05:00
	// defaultTime:
	//		Used for defaults for fields omitted in the formattedString.
	//		Uses 1970-01-01T00:00:00.0Z by default.

	if(!stamp._isoRegExp){
		stamp._isoRegExp =
//TODO: could be more restrictive and check for 00-59, etc.
			/^(?:(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?)?(?:T(\d{2}):(\d{2})(?::(\d{2})(.\d+)?)?((?:[+-](\d{2}):(\d{2}))|Z)?)?$/;
	}

	var match = stamp._isoRegExp.exec(formattedString),
		result = null;

	if(match){
		match.shift();
		if(match[1]){match[1]--;} // Javascript Date months are 0-based
		if(match[6]){match[6] *= 1000;} // Javascript Date expects fractional seconds as milliseconds

		if(defaultTime){
			// mix in defaultTime.  Relatively expensive, so use || operators for the fast path of defaultTime === 0
			defaultTime = new Date(defaultTime);
			array.forEach(array.map(["FullYear", "Month", "Date", "Hours", "Minutes", "Seconds", "Milliseconds"], function(prop){
				return defaultTime["get" + prop]();
			}), function(value, index){
				match[index] = match[index] || value;
			});
		}
		result = new Date(match[0]||1970, match[1]||0, match[2]||1, match[3]||0, match[4]||0, match[5]||0, match[6]||0); //TODO: UTC defaults
		if(match[0] < 100){
			result.setFullYear(match[0] || 1970);
		}

		var offset = 0,
			zoneSign = match[7] && match[7].charAt(0);
		if(zoneSign != 'Z'){
			offset = ((match[8] || 0) * 60) + (Number(match[9]) || 0);
			if(zoneSign != '-'){ offset *= -1; }
		}
		if(zoneSign){
			offset -= result.getTimezoneOffset();
		}
		if(offset){
			result.setTime(result.getTime() + offset * 60000);
		}
	}

	return result; // Date or null
};

/*=====
var __Options = {
	// selector: String
	//		"date" or "time" for partial formatting of the Date object.
	//		Both date and time will be formatted by default.
	// zulu: Boolean
	//		if true, UTC/GMT is used for a timezone
	// milliseconds: Boolean
	//		if true, output milliseconds
};
=====*/

stamp.toISOString = function(/*Date*/ dateObject, /*__Options?*/ options){
	// summary:
	//		Format a Date object as a string according a subset of the ISO-8601 standard
	//
	// description:
	//		When options.selector is omitted, output follows [RFC3339](http://www.ietf.org/rfc/rfc3339.txt)
	//		The local time zone is included as an offset from GMT, except when selector=='time' (time without a date)
	//		Does not check bounds.  Only years between 100 and 9999 are supported.
	//
	// dateObject:
	//		A Date object

	var _ = function(n){ return (n < 10) ? "0" + n : n; };
	options = options || {};
	var formattedDate = [],
		getter = options.zulu ? "getUTC" : "get",
		date = "";
	if(options.selector != "time"){
		var year = dateObject[getter+"FullYear"]();
		date = ["0000".substr((year+"").length)+year, _(dateObject[getter+"Month"]()+1), _(dateObject[getter+"Date"]())].join('-');
	}
	formattedDate.push(date);
	if(options.selector != "date"){
		var time = [_(dateObject[getter+"Hours"]()), _(dateObject[getter+"Minutes"]()), _(dateObject[getter+"Seconds"]())].join(':');
		var millis = dateObject[getter+"Milliseconds"]();
		if(options.milliseconds){
			time += "."+ (millis < 100 ? "0" : "") + _(millis);
		}
		if(options.zulu){
			time += "Z";
		}else if(options.selector != "time"){
			var timezoneOffset = dateObject.getTimezoneOffset();
			var absOffset = Math.abs(timezoneOffset);
			time += (timezoneOffset > 0 ? "-" : "+") +
				_(Math.floor(absOffset/60)) + ":" + _(absOffset%60);
		}
		formattedDate.push(time);
	}
	return formattedDate.join('T'); // String
};

return stamp;
});

},
'dojo/date/locale':function(){
define("dojo/date/locale", [
	"../_base/lang",
	"../_base/array",
	"../date",
	/*===== "../_base/declare", =====*/
	"../cldr/supplemental",
	"../i18n",
	"../regexp",
	"../string",
	"../i18n!../cldr/nls/gregorian",
	"module"
], function(lang, array, date, /*===== declare, =====*/ supplemental, i18n, regexp, string, gregorian, module){

// module:
//		dojo/date/locale

var exports = {
	// summary:
	//		This modules defines dojo/date/locale, localization methods for Date.
};
lang.setObject(module.id.replace(/\//g, "."), exports);

// Localization methods for Date.   Honor local customs using locale-dependent dojo.cldr data.

// Load the bundles containing localization information for
// names and formats

//NOTE: Everything in this module assumes Gregorian calendars.
// Other calendars will be implemented in separate modules.

	// Format a pattern without literals
	function formatPattern(dateObject, bundle, options, pattern){
		return pattern.replace(/([a-z])\1*/ig, function(match){
			var s, pad,
				c = match.charAt(0),
				l = match.length,
				widthList = ["abbr", "wide", "narrow"];
			switch(c){
				case 'G':
					s = bundle[(l < 4) ? "eraAbbr" : "eraNames"][dateObject.getFullYear() < 0 ? 0 : 1];
					break;
				case 'y':
					s = dateObject.getFullYear();
					switch(l){
						case 1:
							break;
						case 2:
							if(!options.fullYear){
								s = String(s); s = s.substr(s.length - 2);
								break;
							}
							// fallthrough
						default:
							pad = true;
					}
					break;
				case 'Q':
				case 'q':
					s = Math.ceil((dateObject.getMonth()+1)/3);
//					switch(l){
//						case 1: case 2:
							pad = true;
//							break;
//						case 3: case 4: // unimplemented
//					}
					break;
				case 'M':
				case 'L':
					var m = dateObject.getMonth();
					if(l<3){
						s = m+1; pad = true;
					}else{
						var propM = [
							"months",
							c == 'L' ? "standAlone" : "format",
							widthList[l-3]
						].join("-");
						s = bundle[propM][m];
					}
					break;
				case 'w':
					var firstDay = 0;
					s = exports._getWeekOfYear(dateObject, firstDay); pad = true;
					break;
				case 'd':
					s = dateObject.getDate(); pad = true;
					break;
				case 'D':
					s = exports._getDayOfYear(dateObject); pad = true;
					break;
				case 'e':
				case 'c':
					var d = dateObject.getDay();
					if(l<2){
						s = (d - supplemental.getFirstDayOfWeek(options.locale) + 8) % 7
						break;
					}
					// fallthrough
				case 'E':
					d = dateObject.getDay();
					if(l<3){
						s = d+1; pad = true;
					}else{
						var propD = [
							"days",
							c == 'c' ? "standAlone" : "format",
							widthList[l-3]
						].join("-");
						s = bundle[propD][d];
					}
					break;
				case 'a':
					var timePeriod = dateObject.getHours() < 12 ? 'am' : 'pm';
					s = options[timePeriod] || bundle['dayPeriods-format-wide-' + timePeriod];
					break;
				case 'h':
				case 'H':
				case 'K':
				case 'k':
					var h = dateObject.getHours();
					// strange choices in the date format make it impossible to write this succinctly
					switch (c){
						case 'h': // 1-12
							s = (h % 12) || 12;
							break;
						case 'H': // 0-23
							s = h;
							break;
						case 'K': // 0-11
							s = (h % 12);
							break;
						case 'k': // 1-24
							s = h || 24;
							break;
					}
					pad = true;
					break;
				case 'm':
					s = dateObject.getMinutes(); pad = true;
					break;
				case 's':
					s = dateObject.getSeconds(); pad = true;
					break;
				case 'S':
					s = Math.round(dateObject.getMilliseconds() * Math.pow(10, l-3)); pad = true;
					break;
				case 'v': // FIXME: don't know what this is. seems to be same as z?
				case 'z':
					// We only have one timezone to offer; the one from the browser
					s = exports._getZone(dateObject, true, options);
					if(s){break;}
					l=4;
					// fallthrough... use GMT if tz not available
				case 'Z':
					var offset = exports._getZone(dateObject, false, options);
					var tz = [
						(offset<=0 ? "+" : "-"),
						string.pad(Math.floor(Math.abs(offset)/60), 2),
						string.pad(Math.abs(offset)% 60, 2)
					];
					if(l==4){
						tz.splice(0, 0, "GMT");
						tz.splice(3, 0, ":");
					}
					s = tz.join("");
					break;
//				case 'Y': case 'u': case 'W': case 'F': case 'g': case 'A':
//					console.log(match+" modifier unimplemented");
				default:
					throw new Error("dojo.date.locale.format: invalid pattern char: "+pattern);
			}
			if(pad){ s = string.pad(s, l); }
			return s;
		});
	}

/*=====
var __FormatOptions = exports.__FormatOptions = declare(null, {
	// selector: String
	//		choice of 'time','date' (default: date and time)
	// formatLength: String
	//		choice of long, short, medium or full (plus any custom additions).  Defaults to 'short'
	// datePattern:String
	//		override pattern with this string
	// timePattern:String
	//		override pattern with this string
	// am: String
	//		override strings for am in times
	// pm: String
	//		override strings for pm in times
	// locale: String
	//		override the locale used to determine formatting rules
	// fullYear: Boolean
	//		(format only) use 4 digit years whenever 2 digit years are called for
	// strict: Boolean
	//		(parse only) strict parsing, off by default
});
=====*/

exports._getZone = function(/*Date*/ dateObject, /*boolean*/ getName, /*__FormatOptions?*/ options){
	// summary:
	//		Returns the zone (or offset) for the given date and options.  This
	//		is broken out into a separate function so that it can be overridden
	//		by timezone-aware code.
	//
	// dateObject:
	//		the date and/or time being formatted.
	//
	// getName:
	//		Whether to return the timezone string (if true), or the offset (if false)
	//
	// options:
	//		The options being used for formatting
	if(getName){
		return date.getTimezoneName(dateObject);
	}else{
		return dateObject.getTimezoneOffset();
	}
};


exports.format = function(/*Date*/ dateObject, /*__FormatOptions?*/ options){
	// summary:
	//		Format a Date object as a String, using locale-specific settings.
	//
	// description:
	//		Create a string from a Date object using a known localized pattern.
	//		By default, this method formats both date and time from dateObject.
	//		Formatting patterns are chosen appropriate to the locale.  Different
	//		formatting lengths may be chosen, with "full" used by default.
	//		Custom patterns may be used or registered with translations using
	//		the dojo/date/locale.addCustomFormats() method.
	//		Formatting patterns are implemented using [the syntax described at
	//		unicode.org](http://www.unicode.org/reports/tr35/tr35-4.html#Date_Format_Patterns)
	//
	// dateObject:
	//		the date and/or time to be formatted.  If a time only is formatted,
	//		the values in the year, month, and day fields are irrelevant.  The
	//		opposite is true when formatting only dates.

	options = options || {};

	var locale = i18n.normalizeLocale(options.locale),
		formatLength = options.formatLength || 'short',
		bundle = exports._getGregorianBundle(locale),
		str = [],
		sauce = lang.hitch(this, formatPattern, dateObject, bundle, options);
	if(options.selector == "year"){
		return _processPattern(bundle["dateFormatItem-yyyy"] || "yyyy", sauce);
	}
	var pattern;
	if(options.selector != "date"){
		pattern = options.timePattern || bundle["timeFormat-"+formatLength];
		if(pattern){str.push(_processPattern(pattern, sauce));}
	}
	if(options.selector != "time"){
		pattern = options.datePattern || bundle["dateFormat-"+formatLength];
		if(pattern){str.push(_processPattern(pattern, sauce));}
	}

	return str.length == 1 ? str[0] : bundle["dateTimeFormat-"+formatLength].replace(/\'/g,'').replace(/\{(\d+)\}/g,
		function(match, key){ return str[key]; }); // String
};

exports.regexp = function(/*__FormatOptions?*/ options){
	// summary:
	//		Builds the regular needed to parse a localized date

	return exports._parseInfo(options).regexp; // String
};

exports._parseInfo = function(/*__FormatOptions?*/ options){
	options = options || {};
	var locale = i18n.normalizeLocale(options.locale),
		bundle = exports._getGregorianBundle(locale),
		formatLength = options.formatLength || 'short',
		datePattern = options.datePattern || bundle["dateFormat-" + formatLength],
		timePattern = options.timePattern || bundle["timeFormat-" + formatLength],
		pattern;
	if(options.selector == 'date'){
		pattern = datePattern;
	}else if(options.selector == 'time'){
		pattern = timePattern;
	}else{
		pattern = bundle["dateTimeFormat-"+formatLength].replace(/\{(\d+)\}/g,
			function(match, key){ return [timePattern, datePattern][key]; });
	}

	var tokens = [],
		re = _processPattern(pattern, lang.hitch(this, _buildDateTimeRE, tokens, bundle, options));
	return {regexp: re, tokens: tokens, bundle: bundle};
};

exports.parse = function(/*String*/ value, /*__FormatOptions?*/ options){
	// summary:
	//		Convert a properly formatted string to a primitive Date object,
	//		using locale-specific settings.
	//
	// description:
	//		Create a Date object from a string using a known localized pattern.
	//		By default, this method parses looking for both date and time in the string.
	//		Formatting patterns are chosen appropriate to the locale.  Different
	//		formatting lengths may be chosen, with "full" used by default.
	//		Custom patterns may be used or registered with translations using
	//		the dojo/date/locale.addCustomFormats() method.
	//
	//		Formatting patterns are implemented using [the syntax described at
	//		unicode.org](http://www.unicode.org/reports/tr35/tr35-4.html#Date_Format_Patterns)
	//		When two digit years are used, a century is chosen according to a sliding
	//		window of 80 years before and 20 years after present year, for both `yy` and `yyyy` patterns.
	//		year < 100CE requires strict mode.
	//
	// value:
	//		A string representation of a date

	// remove non-printing bidi control chars from input and pattern
	var controlChars = /[\u200E\u200F\u202A\u202E]/g,
		info = exports._parseInfo(options),
		tokens = info.tokens, bundle = info.bundle,
		re = new RegExp("^" + info.regexp.replace(controlChars, "") + "$",
			info.strict ? "" : "i"),
		match = re.exec(value && value.replace(controlChars, ""));

	if(!match){ return null; } // null

	var widthList = ['abbr', 'wide', 'narrow'],
		result = [1970,0,1,0,0,0,0], // will get converted to a Date at the end
		amPm = "",
		valid = array.every(match, function(v, i){
		if(!i){return true;}
		var token = tokens[i-1],
			l = token.length,
			c = token.charAt(0);
		switch(c){
			case 'y':
				if(l != 2 && options.strict){
					//interpret year literally, so '5' would be 5 A.D.
					result[0] = v;
				}else{
					if(v<100){
						v = Number(v);
						//choose century to apply, according to a sliding window
						//of 80 years before and 20 years after present year
						var year = '' + new Date().getFullYear(),
							century = year.substring(0, 2) * 100,
							cutoff = Math.min(Number(year.substring(2, 4)) + 20, 99);
						result[0] = (v < cutoff) ? century + v : century - 100 + v;
					}else{
						//we expected 2 digits and got more...
						if(options.strict){
							return false;
						}
						//interpret literally, so '150' would be 150 A.D.
						//also tolerate '1950', if 'yyyy' input passed to 'yy' format
						result[0] = v;
					}
				}
				break;
			case 'M':
			case 'L':
				if(l>2){
					var months = bundle['months-' +
							    (c == 'L' ? 'standAlone' : 'format') +
							    '-' + widthList[l-3]].concat();
					if(!options.strict){
						//Tolerate abbreviating period in month part
						//Case-insensitive comparison
						v = v.replace(".","").toLowerCase();
						months = array.map(months, function(s){ return s.replace(".","").toLowerCase(); } );
					}
					v = array.indexOf(months, v);
					if(v == -1){
//						console.log("dojo/date/locale.parse: Could not parse month name: '" + v + "'.");
						return false;
					}
				}else{
					v--;
				}
				result[1] = v;
				break;
			case 'E':
			case 'e':
			case 'c':
				var days = bundle['days-' +
						  (c == 'c' ? 'standAlone' : 'format') +
						  '-' + widthList[l-3]].concat();
				if(!options.strict){
					//Case-insensitive comparison
					v = v.toLowerCase();
					days = array.map(days, function(d){return d.toLowerCase();});
				}
				v = array.indexOf(days, v);
				if(v == -1){
//					console.log("dojo/date/locale.parse: Could not parse weekday name: '" + v + "'.");
					return false;
				}

				//TODO: not sure what to actually do with this input,
				//in terms of setting something on the Date obj...?
				//without more context, can't affect the actual date
				//TODO: just validate?
				break;
			case 'D':
				result[1] = 0;
				// fallthrough...
			case 'd':
				result[2] = v;
				break;
			case 'a': //am/pm
				var am = options.am || bundle['dayPeriods-format-wide-am'],
					pm = options.pm || bundle['dayPeriods-format-wide-pm'];
				if(!options.strict){
					var period = /\./g;
					v = v.replace(period,'').toLowerCase();
					am = am.replace(period,'').toLowerCase();
					pm = pm.replace(period,'').toLowerCase();
				}
				if(options.strict && v != am && v != pm){
//					console.log("dojo/date/locale.parse: Could not parse am/pm part.");
					return false;
				}

				// we might not have seen the hours field yet, so store the state and apply hour change later
				amPm = (v == pm) ? 'p' : (v == am) ? 'a' : '';
				break;
			case 'K': //hour (1-24)
				if(v == 24){ v = 0; }
				// fallthrough...
			case 'h': //hour (1-12)
			case 'H': //hour (0-23)
			case 'k': //hour (0-11)
				//TODO: strict bounds checking, padding
				if(v > 23){
//					console.log("dojo/date/locale.parse: Illegal hours value");
					return false;
				}

				//in the 12-hour case, adjusting for am/pm requires the 'a' part
				//which could come before or after the hour, so we will adjust later
				result[3] = v;
				break;
			case 'm': //minutes
				result[4] = v;
				break;
			case 's': //seconds
				result[5] = v;
				break;
			case 'S': //milliseconds
				result[6] = v;
//				break;
//			case 'w':
//TODO				var firstDay = 0;
//			default:
//TODO: throw?
//				console.log("dojo/date/locale.parse: unsupported pattern char=" + token.charAt(0));
		}
		return true;
	});

	var hours = +result[3];
	if(amPm === 'p' && hours < 12){
		result[3] = hours + 12; //e.g., 3pm -> 15
	}else if(amPm === 'a' && hours == 12){
		result[3] = 0; //12am -> 0
	}

	//TODO: implement a getWeekday() method in order to test
	//validity of input strings containing 'EEE' or 'EEEE'...

	var dateObject = new Date(result[0], result[1], result[2], result[3], result[4], result[5], result[6]); // Date
	if(options.strict){
		dateObject.setFullYear(result[0]);
	}

	// Check for overflow.  The Date() constructor normalizes things like April 32nd...
	//TODO: why isn't this done for times as well?
	var allTokens = tokens.join(""),
		dateToken = allTokens.indexOf('d') != -1,
		monthToken = allTokens.indexOf('M') != -1;

	if(!valid ||
		(monthToken && dateObject.getMonth() > result[1]) ||
		(dateToken && dateObject.getDate() > result[2])){
		return null;
	}

	// Check for underflow, due to DST shifts.  See #9366
	// This assumes a 1 hour dst shift correction at midnight
	// We could compare the timezone offset after the shift and add the difference instead.
	if((monthToken && dateObject.getMonth() < result[1]) ||
		(dateToken && dateObject.getDate() < result[2])){
		dateObject = date.add(dateObject, "hour", 1);
	}

	return dateObject; // Date
};

function _processPattern(pattern, applyPattern, applyLiteral, applyAll){
	//summary: Process a pattern with literals in it

	// Break up on single quotes, treat every other one as a literal, except '' which becomes '
	var identity = function(x){return x;};
	applyPattern = applyPattern || identity;
	applyLiteral = applyLiteral || identity;
	applyAll = applyAll || identity;

	//split on single quotes (which escape literals in date format strings)
	//but preserve escaped single quotes (e.g., o''clock)
	var chunks = pattern.match(/(''|[^'])+/g),
		literal = pattern.charAt(0) == "'";

	array.forEach(chunks, function(chunk, i){
		if(!chunk){
			chunks[i]='';
		}else{
			chunks[i]=(literal ? applyLiteral : applyPattern)(chunk.replace(/''/g, "'"));
			literal = !literal;
		}
	});
	return applyAll(chunks.join(''));
}

function _buildDateTimeRE(tokens, bundle, options, pattern){
	pattern = regexp.escapeString(pattern);
	if(!options.strict){ pattern = pattern.replace(" a", " ?a"); } // kludge to tolerate no space before am/pm
	return pattern.replace(/([a-z])\1*/ig, function(match){
		// Build a simple regexp.  Avoid captures, which would ruin the tokens list
		var s,
			c = match.charAt(0),
			l = match.length,
			p2 = '', p3 = '';
		if(options.strict){
			if(l > 1){ p2 = '0' + '{'+(l-1)+'}'; }
			if(l > 2){ p3 = '0' + '{'+(l-2)+'}'; }
		}else{
			p2 = '0?'; p3 = '0{0,2}';
		}
		switch(c){
			case 'y':
				s = '\\d{2,4}';
				break;
			case 'M':
			case 'L':
				s = (l>2) ? '\\S+?' : '1[0-2]|'+p2+'[1-9]';
				break;
			case 'D':
				s = '[12][0-9][0-9]|3[0-5][0-9]|36[0-6]|'+p2+'[1-9][0-9]|'+p3+'[1-9]';
				break;
			case 'd':
				s = '3[01]|[12]\\d|'+p2+'[1-9]';
				break;
			case 'w':
				s = '[1-4][0-9]|5[0-3]|'+p2+'[1-9]';
				break;
			case 'E':
			case 'e':
			case 'c':
				s = '\\S+';
				break;
			case 'h': //hour (1-12)
				s = '1[0-2]|'+p2+'[1-9]';
				break;
			case 'k': //hour (0-11)
				s = '1[01]|'+p2+'\\d';
				break;
			case 'H': //hour (0-23)
				s = '1\\d|2[0-3]|'+p2+'\\d';
				break;
			case 'K': //hour (1-24)
				s = '1\\d|2[0-4]|'+p2+'[1-9]';
				break;
			case 'm':
			case 's':
				s = '[0-5]\\d';
				break;
			case 'S':
				s = '\\d{'+l+'}';
				break;
			case 'a':
				var am = options.am || bundle['dayPeriods-format-wide-am'],
					pm = options.pm || bundle['dayPeriods-format-wide-pm'];
					s = am + '|' + pm;
				if(!options.strict){
					if(am != am.toLowerCase()){ s += '|' + am.toLowerCase(); }
					if(pm != pm.toLowerCase()){ s += '|' + pm.toLowerCase(); }
					if(s.indexOf('.') != -1){ s += '|' + s.replace(/\./g, ""); }
				}
				s = s.replace(/\./g, "\\.");
				break;
			default:
			// case 'v':
			// case 'z':
			// case 'Z':
				s = ".*";
//				console.log("parse of date format, pattern=" + pattern);
		}

		if(tokens){ tokens.push(match); }

		return "(" + s + ")"; // add capture
	}).replace(/[\xa0 ]/g, "[\\s\\xa0]"); // normalize whitespace.  Need explicit handling of \xa0 for IE.
}

var _customFormats = [];
exports.addCustomFormats = function(/*String*/ packageName, /*String*/ bundleName){
	// summary:
	//		Add a reference to a bundle containing localized custom formats to be
	//		used by date/time formatting and parsing routines.
	//
	// description:
	//		The user may add custom localized formats where the bundle has properties following the
	//		same naming convention used by dojo.cldr: `dateFormat-xxxx` / `timeFormat-xxxx`
	//		The pattern string should match the format used by the CLDR.
	//		See dojo/date/locale.format() for details.
	//		The resources must be loaded by dojo.requireLocalization() prior to use

	_customFormats.push({pkg:packageName,name:bundleName});
};

exports._getGregorianBundle = function(/*String*/ locale){
	var gregorian = {};
	array.forEach(_customFormats, function(desc){
		var bundle = i18n.getLocalization(desc.pkg, desc.name, locale);
		gregorian = lang.mixin(gregorian, bundle);
	}, this);
	return gregorian; /*Object*/
};

exports.addCustomFormats(module.id.replace(/\/date\/locale$/, ".cldr"),"gregorian");

exports.getNames = function(/*String*/ item, /*String*/ type, /*String?*/ context, /*String?*/ locale){
	// summary:
	//		Used to get localized strings from dojo.cldr for day or month names.
	//
	// item:
	//	'months' || 'days'
	// type:
	//	'wide' || 'abbr' || 'narrow' (e.g. "Monday", "Mon", or "M" respectively, in English)
	// context:
	//	'standAlone' || 'format' (default)
	// locale:
	//	override locale used to find the names

	var label,
		lookup = exports._getGregorianBundle(locale),
		props = [item, context, type];
	if(context == 'standAlone'){
		var key = props.join('-');
		label = lookup[key];
		// Fall back to 'format' flavor of name
		if(label[0] == 1){ label = undefined; } // kludge, in the absence of real aliasing support in dojo.cldr
	}
	props[1] = 'format';

	// return by copy so changes won't be made accidentally to the in-memory model
	return (label || lookup[props.join('-')]).concat(); /*Array*/
};

exports.isWeekend = function(/*Date?*/ dateObject, /*String?*/ locale){
	// summary:
	//	Determines if the date falls on a weekend, according to local custom.

	var weekend = supplemental.getWeekend(locale),
		day = (dateObject || new Date()).getDay();
	if(weekend.end < weekend.start){
		weekend.end += 7;
		if(day < weekend.start){ day += 7; }
	}
	return day >= weekend.start && day <= weekend.end; // Boolean
};

// These are used only by format and strftime.  Do they need to be public?  Which module should they go in?

exports._getDayOfYear = function(/*Date*/ dateObject){
	// summary:
	//		gets the day of the year as represented by dateObject
	return date.difference(new Date(dateObject.getFullYear(), 0, 1, dateObject.getHours()), dateObject) + 1; // Number
};

exports._getWeekOfYear = function(/*Date*/ dateObject, /*Number*/ firstDayOfWeek){
	if(arguments.length == 1){ firstDayOfWeek = 0; } // Sunday

	var firstDayOfYear = new Date(dateObject.getFullYear(), 0, 1).getDay(),
		adj = (firstDayOfYear - firstDayOfWeek + 7) % 7,
		week = Math.floor((exports._getDayOfYear(dateObject) + adj - 1) / 7);

	// if year starts on the specified day, start counting weeks at 1
	if(firstDayOfYear == firstDayOfWeek){ week++; }

	return week; // Number
};

return exports;
});

},
'dojo/cldr/supplemental':function(){
define("dojo/cldr/supplemental", ["../_base/lang", "../i18n"], function(lang, i18n){

// module:
//		dojo/cldr/supplemental


var supplemental = {
	// summary:
	//		TODOC
};
lang.setObject("dojo.cldr.supplemental", supplemental);

supplemental.getFirstDayOfWeek = function(/*String?*/locale){
	// summary:
	//		Returns a zero-based index for first day of the week
	// description:
	//		Returns a zero-based index for first day of the week, as used by the local (Gregorian) calendar.
	//		e.g. Sunday (returns 0), or Monday (returns 1)

	// from http://www.unicode.org/cldr/data/common/supplemental/supplementalData.xml:supplementalData/weekData/firstDay
	var firstDay = {/*default is 1=Monday*/
		bd:5,mv:5,
		ae:6,af:6,bh:6,dj:6,dz:6,eg:6,iq:6,ir:6,jo:6,kw:6,
		ly:6,ma:6,om:6,qa:6,sa:6,sd:6,sy:6,ye:6,
		ag:0,ar:0,as:0,au:0,br:0,bs:0,bt:0,bw:0,by:0,bz:0,ca:0,cn:0,
		co:0,dm:0,'do':0,et:0,gt:0,gu:0,hk:0,hn:0,id:0,ie:0,il:0,'in':0,
		jm:0,jp:0,ke:0,kh:0,kr:0,la:0,mh:0,mm:0,mo:0,mt:0,mx:0,mz:0,
		ni:0,np:0,nz:0,pa:0,pe:0,ph:0,pk:0,pr:0,py:0,sg:0,sv:0,th:0,
		tn:0,tt:0,tw:0,um:0,us:0,ve:0,vi:0,ws:0,za:0,zw:0
	};

	var country = supplemental._region(locale);
	var dow = firstDay[country];
	return (dow === undefined) ? 1 : dow; /*Number*/
};

supplemental._region = function(/*String?*/locale){
	locale = i18n.normalizeLocale(locale);
	var tags = locale.split('-');
	var region = tags[1];
	if(!region){
		// IE often gives language only (#2269)
		// Arbitrary mappings of language-only locales to a country:
		region = {
			aa:"et", ab:"ge", af:"za", ak:"gh", am:"et", ar:"eg", as:"in", av:"ru", ay:"bo", az:"az", ba:"ru",
			be:"by", bg:"bg", bi:"vu", bm:"ml", bn:"bd", bo:"cn", br:"fr", bs:"ba", ca:"es", ce:"ru", ch:"gu",
			co:"fr", cr:"ca", cs:"cz", cv:"ru", cy:"gb", da:"dk", de:"de", dv:"mv", dz:"bt", ee:"gh", el:"gr",
			en:"us", es:"es", et:"ee", eu:"es", fa:"ir", ff:"sn", fi:"fi", fj:"fj", fo:"fo", fr:"fr", fy:"nl",
			ga:"ie", gd:"gb", gl:"es", gn:"py", gu:"in", gv:"gb", ha:"ng", he:"il", hi:"in", ho:"pg", hr:"hr",
			ht:"ht", hu:"hu", hy:"am", ia:"fr", id:"id", ig:"ng", ii:"cn", ik:"us", "in":"id", is:"is", it:"it",
			iu:"ca", iw:"il", ja:"jp", ji:"ua", jv:"id", jw:"id", ka:"ge", kg:"cd", ki:"ke", kj:"na", kk:"kz",
			kl:"gl", km:"kh", kn:"in", ko:"kr", ks:"in", ku:"tr", kv:"ru", kw:"gb", ky:"kg", la:"va", lb:"lu",
			lg:"ug", li:"nl", ln:"cd", lo:"la", lt:"lt", lu:"cd", lv:"lv", mg:"mg", mh:"mh", mi:"nz", mk:"mk",
			ml:"in", mn:"mn", mo:"ro", mr:"in", ms:"my", mt:"mt", my:"mm", na:"nr", nb:"no", nd:"zw", ne:"np",
			ng:"na", nl:"nl", nn:"no", no:"no", nr:"za", nv:"us", ny:"mw", oc:"fr", om:"et", or:"in", os:"ge",
			pa:"in", pl:"pl", ps:"af", pt:"br", qu:"pe", rm:"ch", rn:"bi", ro:"ro", ru:"ru", rw:"rw", sa:"in",
			sd:"in", se:"no", sg:"cf", si:"lk", sk:"sk", sl:"si", sm:"ws", sn:"zw", so:"so", sq:"al", sr:"rs",
			ss:"za", st:"za", su:"id", sv:"se", sw:"tz", ta:"in", te:"in", tg:"tj", th:"th", ti:"et", tk:"tm",
			tl:"ph", tn:"za", to:"to", tr:"tr", ts:"za", tt:"ru", ty:"pf", ug:"cn", uk:"ua", ur:"pk", uz:"uz",
			ve:"za", vi:"vn", wa:"be", wo:"sn", xh:"za", yi:"il", yo:"ng", za:"cn", zh:"cn", zu:"za",
			ace:"id", ady:"ru", agq:"cm", alt:"ru", amo:"ng", asa:"tz", ast:"es", awa:"in", bal:"pk",
			ban:"id", bas:"cm", bax:"cm", bbc:"id", bem:"zm", bez:"tz", bfq:"in", bft:"pk", bfy:"in",
			bhb:"in", bho:"in", bik:"ph", bin:"ng", bjj:"in", bku:"ph", bqv:"ci", bra:"in", brx:"in",
			bss:"cm", btv:"pk", bua:"ru", buc:"yt", bug:"id", bya:"id", byn:"er", cch:"ng", ccp:"in",
			ceb:"ph", cgg:"ug", chk:"fm", chm:"ru", chp:"ca", chr:"us", cja:"kh", cjm:"vn", ckb:"iq",
			crk:"ca", csb:"pl", dar:"ru", dav:"ke", den:"ca", dgr:"ca", dje:"ne", doi:"in", dsb:"de",
			dua:"cm", dyo:"sn", dyu:"bf", ebu:"ke", efi:"ng", ewo:"cm", fan:"gq", fil:"ph", fon:"bj",
			fur:"it", gaa:"gh", gag:"md", gbm:"in", gcr:"gf", gez:"et", gil:"ki", gon:"in", gor:"id",
			grt:"in", gsw:"ch", guz:"ke", gwi:"ca", haw:"us", hil:"ph", hne:"in", hnn:"ph", hoc:"in",
			hoj:"in", ibb:"ng", ilo:"ph", inh:"ru", jgo:"cm", jmc:"tz", kaa:"uz", kab:"dz", kaj:"ng",
			kam:"ke", kbd:"ru", kcg:"ng", kde:"tz", kdt:"th", kea:"cv", ken:"cm", kfo:"ci", kfr:"in",
			kha:"in", khb:"cn", khq:"ml", kht:"in", kkj:"cm", kln:"ke", kmb:"ao", koi:"ru", kok:"in",
			kos:"fm", kpe:"lr", krc:"ru", kri:"sl", krl:"ru", kru:"in", ksb:"tz", ksf:"cm", ksh:"de",
			kum:"ru", lag:"tz", lah:"pk", lbe:"ru", lcp:"cn", lep:"in", lez:"ru", lif:"np", lis:"cn",
			lki:"ir", lmn:"in", lol:"cd", lua:"cd", luo:"ke", luy:"ke", lwl:"th", mad:"id", mag:"in",
			mai:"in", mak:"id", man:"gn", mas:"ke", mdf:"ru", mdh:"ph", mdr:"id", men:"sl", mer:"ke",
			mfe:"mu", mgh:"mz", mgo:"cm", min:"id", mni:"in", mnk:"gm", mnw:"mm", mos:"bf", mua:"cm",
			mwr:"in", myv:"ru", nap:"it", naq:"na", nds:"de", "new":"np", niu:"nu", nmg:"cm", nnh:"cm",
			nod:"th", nso:"za", nus:"sd", nym:"tz", nyn:"ug", pag:"ph", pam:"ph", pap:"bq", pau:"pw",
			pon:"fm", prd:"ir", raj:"in", rcf:"re", rej:"id", rjs:"np", rkt:"in", rof:"tz", rwk:"tz",
			saf:"gh", sah:"ru", saq:"ke", sas:"id", sat:"in", saz:"in", sbp:"tz", scn:"it", sco:"gb",
			sdh:"ir", seh:"mz", ses:"ml", shi:"ma", shn:"mm", sid:"et", sma:"se", smj:"se", smn:"fi",
			sms:"fi", snk:"ml", srn:"sr", srr:"sn", ssy:"er", suk:"tz", sus:"gn", swb:"yt", swc:"cd",
			syl:"bd", syr:"sy", tbw:"ph", tcy:"in", tdd:"cn", tem:"sl", teo:"ug", tet:"tl", tig:"er",
			tiv:"ng", tkl:"tk", tmh:"ne", tpi:"pg", trv:"tw", tsg:"ph", tts:"th", tum:"mw", tvl:"tv",
			twq:"ne", tyv:"ru", tzm:"ma", udm:"ru", uli:"fm", umb:"ao", unr:"in", unx:"in", vai:"lr",
			vun:"tz", wae:"ch", wal:"et", war:"ph", xog:"ug", xsr:"np", yao:"mz", yap:"fm", yav:"cm", zza:"tr"
		}[tags[0]];
	}else if(region.length == 4){
		// The ISO 3166 country code is usually in the second position, unless a
		// 4-letter script is given. See http://www.ietf.org/rfc/rfc4646.txt
		region = tags[2];
	}
	return region;
};

supplemental.getWeekend = function(/*String?*/locale){
	// summary:
	//		Returns a hash containing the start and end days of the weekend
	// description:
	//		Returns a hash containing the start and end days of the weekend according to local custom using locale,
	//		or by default in the user's locale.
	//		e.g. {start:6, end:0}

	// from http://www.unicode.org/cldr/data/common/supplemental/supplementalData.xml:supplementalData/weekData/weekend{Start,End}
	var weekendStart = {/*default is 6=Saturday*/
			'in':0,
			af:4,dz:4,ir:4,om:4,sa:4,ye:4,
			ae:5,bh:5,eg:5,il:5,iq:5,jo:5,kw:5,ly:5,ma:5,qa:5,sd:5,sy:5,tn:5
		},

		weekendEnd = {/*default is 0=Sunday*/
			af:5,dz:5,ir:5,om:5,sa:5,ye:5,
			ae:6,bh:5,eg:6,il:6,iq:6,jo:6,kw:6,ly:6,ma:6,qa:6,sd:6,sy:6,tn:6
		},

		country = supplemental._region(locale),
		start = weekendStart[country],
		end = weekendEnd[country];

	if(start === undefined){start=6;}
	if(end === undefined){end=0;}
	return {start:start, end:end}; /*Object {start,end}*/
};

return supplemental;
});

},
'dojo/i18n':function(){
define("dojo/i18n", ["./_base/kernel", "require", "./has", "./_base/array", "./_base/config", "./_base/lang", "./_base/xhr", "./json", "module"],
	function(dojo, require, has, array, config, lang, xhr, json, module){

	// module:
	//		dojo/i18n

	has.add("dojo-preload-i18n-Api",
		// if true, define the preload localizations machinery
		1
	);

	 1 || has.add("dojo-v1x-i18n-Api",
		// if true, define the v1.x i18n functions
		1
	);

	var
		thisModule = dojo.i18n =
			{
				// summary:
				//		This module implements the dojo/i18n! plugin and the v1.6- i18n API
				// description:
				//		We choose to include our own plugin to leverage functionality already contained in dojo
				//		and thereby reduce the size of the plugin compared to various loader implementations. Also, this
				//		allows foreign AMD loaders to be used without their plugins.
			},

		nlsRe =
			// regexp for reconstructing the master bundle name from parts of the regexp match
			// nlsRe.exec("foo/bar/baz/nls/en-ca/foo") gives:
			// ["foo/bar/baz/nls/en-ca/foo", "foo/bar/baz/nls/", "/", "/", "en-ca", "foo"]
			// nlsRe.exec("foo/bar/baz/nls/foo") gives:
			// ["foo/bar/baz/nls/foo", "foo/bar/baz/nls/", "/", "/", "foo", ""]
			// so, if match[5] is blank, it means this is the top bundle definition.
			// courtesy of http://requirejs.org
			/(^.*(^|\/)nls)(\/|$)([^\/]*)\/?([^\/]*)/,

		getAvailableLocales = function(
			root,
			locale,
			bundlePath,
			bundleName
		){
			// summary:
			//		return a vector of module ids containing all available locales with respect to the target locale
			//		For example, assuming:
			//
			//		- the root bundle indicates specific bundles for "fr" and "fr-ca",
			//		-  bundlePath is "myPackage/nls"
			//		- bundleName is "myBundle"
			//
			//		Then a locale argument of "fr-ca" would return
			//
			//			["myPackage/nls/myBundle", "myPackage/nls/fr/myBundle", "myPackage/nls/fr-ca/myBundle"]
			//
			//		Notice that bundles are returned least-specific to most-specific, starting with the root.
			//
			//		If root===false indicates we're working with a pre-AMD i18n bundle that doesn't tell about the available locales;
			//		therefore, assume everything is available and get 404 errors that indicate a particular localization is not available

			for(var result = [bundlePath + bundleName], localeParts = locale.split("-"), current = "", i = 0; i<localeParts.length; i++){
				current += (current ? "-" : "") + localeParts[i];
				if(!root || root[current]){
					result.push(bundlePath + current + "/" + bundleName);
				}
			}
			return result;
		},

		cache = {},

		getBundleName = function(moduleName, bundleName, locale){
			locale = locale ? locale.toLowerCase() : dojo.locale;
			moduleName = moduleName.replace(/\./g, "/");
			bundleName = bundleName.replace(/\./g, "/");
			return (/root/i.test(locale)) ?
				(moduleName + "/nls/" + bundleName) :
				(moduleName + "/nls/" + locale + "/" + bundleName);
		},

		getL10nName = dojo.getL10nName = function(moduleName, bundleName, locale){
			return moduleName = module.id + "!" + getBundleName(moduleName, bundleName, locale);
		},

		doLoad = function(require, bundlePathAndName, bundlePath, bundleName, locale, load){
			// summary:
			//		get the root bundle which instructs which other bundles are required to construct the localized bundle
			require([bundlePathAndName], function(root){
				var current = lang.clone(root.root || root.ROOT),// 1.6 built bundle defined ROOT
					availableLocales = getAvailableLocales(!root._v1x && root, locale, bundlePath, bundleName);
				require(availableLocales, function(){
					for (var i = 1; i<availableLocales.length; i++){
						current = lang.mixin(lang.clone(current), arguments[i]);
					}
					// target may not have been resolve (e.g., maybe only "fr" exists when "fr-ca" was requested)
					var target = bundlePathAndName + "/" + locale;
					cache[target] = current;
					load();
				});
			});
		},

		normalize = function(id, toAbsMid){
			// summary:
			//		id may be relative.
			//		preload has form `*preload*<path>/nls/<module>*<flattened locales>` and
			//		therefore never looks like a relative
			return /^\./.test(id) ? toAbsMid(id) : id;
		},

		getLocalesToLoad = function(targetLocale){
			var list = config.extraLocale || [];
			list = lang.isArray(list) ? list : [list];
			list.push(targetLocale);
			return list;
		},

		load = function(id, require, load){
			// summary:
			//		id is in one of the following formats
			//
			//		1. <path>/nls/<bundle>
			//			=> load the bundle, localized to config.locale; load all bundles localized to
			//			config.extraLocale (if any); return the loaded bundle localized to config.locale.
			//
			//		2. <path>/nls/<locale>/<bundle>
			//			=> load then return the bundle localized to <locale>
			//
			//		3. *preload*<path>/nls/<module>*<JSON array of available locales>
			//			=> for config.locale and all config.extraLocale, load all bundles found
			//			in the best-matching bundle rollup. A value of 1 is returned, which
			//			is meaningless other than to say the plugin is executing the requested
			//			preloads
			//
			//		In cases 1 and 2, <path> is always normalized to an absolute module id upon entry; see
			//		normalize. In case 3, it <path> is assumed to be absolute; this is arranged by the builder.
			//
			//		To load a bundle means to insert the bundle into the plugin's cache and publish the bundle
			//		value to the loader. Given <path>, <bundle>, and a particular <locale>, the cache key
			//
			//			<path>/nls/<bundle>/<locale>
			//
			//		will hold the value. Similarly, then plugin will publish this value to the loader by
			//
			//			define("<path>/nls/<bundle>/<locale>", <bundle-value>);
			//
			//		Given this algorithm, other machinery can provide fast load paths be preplacing
			//		values in the plugin's cache, which is public. When a load is demanded the
			//		cache is inspected before starting any loading. Explicitly placing values in the plugin
			//		cache is an advanced/experimental feature that should not be needed; use at your own risk.
			//
			//		For the normal AMD algorithm, the root bundle is loaded first, which instructs the
			//		plugin what additional localized bundles are required for a particular locale. These
			//		additional locales are loaded and a mix of the root and each progressively-specific
			//		locale is returned. For example:
			//
			//		1. The client demands "dojo/i18n!some/path/nls/someBundle
			//
			//		2. The loader demands load(some/path/nls/someBundle)
			//
			//		3. This plugin require's "some/path/nls/someBundle", which is the root bundle.
			//
			//		4. Assuming config.locale is "ab-cd-ef" and the root bundle indicates that localizations
			//		are available for "ab" and "ab-cd-ef" (note the missing "ab-cd", then the plugin
			//		requires "some/path/nls/ab/someBundle" and "some/path/nls/ab-cd-ef/someBundle"
			//
			//		5. Upon receiving all required bundles, the plugin constructs the value of the bundle
			//		ab-cd-ef as...
			//
			//				mixin(mixin(mixin({}, require("some/path/nls/someBundle"),
			//		  			require("some/path/nls/ab/someBundle")),
			//					require("some/path/nls/ab-cd-ef/someBundle"));
			//
			//		This value is inserted into the cache and published to the loader at the
			//		key/module-id some/path/nls/someBundle/ab-cd-ef.
			//
			//		The special preload signature (case 3) instructs the plugin to stop servicing all normal requests
			//		(further preload requests will be serviced) until all ongoing preloading has completed.
			//
			//		The preload signature instructs the plugin that a special rollup module is available that contains
			//		one or more flattened, localized bundles. The JSON array of available locales indicates which locales
			//		are available. Here is an example:
			//
			//			*preload*some/path/nls/someModule*["root", "ab", "ab-cd-ef"]
			//
			//		This indicates the following rollup modules are available:
			//
			//			some/path/nls/someModule_ROOT
			//			some/path/nls/someModule_ab
			//			some/path/nls/someModule_ab-cd-ef
			//
			//		Each of these modules is a normal AMD module that contains one or more flattened bundles in a hash.
			//		For example, assume someModule contained the bundles some/bundle/path/someBundle and
			//		some/bundle/path/someOtherBundle, then some/path/nls/someModule_ab would be expressed as follows:
			//
			//			define({
			//				some/bundle/path/someBundle:<value of someBundle, flattened with respect to locale ab>,
			//				some/bundle/path/someOtherBundle:<value of someOtherBundle, flattened with respect to locale ab>,
			//			});
			//
			//		E.g., given this design, preloading for locale=="ab" can execute the following algorithm:
			//
			//			require(["some/path/nls/someModule_ab"], function(rollup){
			//				for(var p in rollup){
			//					var id = p + "/ab",
			//					cache[id] = rollup[p];
			//					define(id, rollup[p]);
			//				}
			//			});
			//
			//		Similarly, if "ab-cd" is requested, the algorithm can determine that "ab" is the best available and
			//		load accordingly.
			//
			//		The builder will write such rollups for every layer if a non-empty localeList  profile property is
			//		provided. Further, the builder will include the following cache entry in the cache associated with
			//		any layer.
			//
			//			"*now":function(r){r(['dojo/i18n!*preload*<path>/nls/<module>*<JSON array of available locales>']);}
			//
			//		The *now special cache module instructs the loader to apply the provided function to context-require
			//		with respect to the particular layer being defined. This causes the plugin to hold all normal service
			//		requests until all preloading is complete.
			//
			//		Notice that this algorithm is rarely better than the standard AMD load algorithm. Consider the normal case
			//		where the target locale has a single segment and a layer depends on a single bundle:
			//
			//		Without Preloads:
			//
			//		1. Layer loads root bundle.
			//		2. bundle is demanded; plugin loads single localized bundle.
			//
			//		With Preloads:
			//
			//		1. Layer causes preloading of target bundle.
			//		2. bundle is demanded; service is delayed until preloading complete; bundle is returned.
			//
			//		In each case a single transaction is required to load the target bundle. In cases where multiple bundles
			//		are required and/or the locale has multiple segments, preloads still requires a single transaction whereas
			//		the normal path requires an additional transaction for each additional bundle/locale-segment. However all
			//		of these additional transactions can be done concurrently. Owing to this analysis, the entire preloading
			//		algorithm can be discard during a build by setting the has feature dojo-preload-i18n-Api to false.

			if(has("dojo-preload-i18n-Api")){
				var split = id.split("*"),
					preloadDemand = split[1] == "preload";
				if(preloadDemand){
					if(!cache[id]){
						// use cache[id] to prevent multiple preloads of the same preload; this shouldn't happen, but
						// who knows what over-aggressive human optimizers may attempt
						cache[id] = 1;
						preloadL10n(split[2], json.parse(split[3]), 1, require);
					}
					// don't stall the loader!
					load(1);
				}
				if(preloadDemand || waitForPreloads(id, require, load)){
					return;
				}
			}

			var match = nlsRe.exec(id),
				bundlePath = match[1] + "/",
				bundleName = match[5] || match[4],
				bundlePathAndName = bundlePath + bundleName,
				localeSpecified = (match[5] && match[4]),
				targetLocale =	localeSpecified || dojo.locale,
				loadTarget = bundlePathAndName + "/" + targetLocale,
				loadList = localeSpecified ? [targetLocale] : getLocalesToLoad(targetLocale),
				remaining = loadList.length,
				finish = function(){
					if(!--remaining){
						load(lang.delegate(cache[loadTarget]));
					}
				};
			array.forEach(loadList, function(locale){
				var target = bundlePathAndName + "/" + locale;
				if(has("dojo-preload-i18n-Api")){
					checkForLegacyModules(target);
				}
				if(!cache[target]){
					doLoad(require, bundlePathAndName, bundlePath, bundleName, locale, finish);
				}else{
					finish();
				}
			});
		};

	if(has("dojo-unit-tests")){
		var unitTests = thisModule.unitTests = [];
	}

	if(has("dojo-preload-i18n-Api") ||  1 ){
		var normalizeLocale = thisModule.normalizeLocale = function(locale){
				var result = locale ? locale.toLowerCase() : dojo.locale;
				return result == "root" ? "ROOT" : result;
			},

			isXd = function(mid, contextRequire){
				return ( 1  &&  1 ) ?
					contextRequire.isXdUrl(require.toUrl(mid + ".js")) :
					true;
			},

			preloading = 0,

			preloadWaitQueue = [],

			preloadL10n = thisModule._preloadLocalizations = function(/*String*/bundlePrefix, /*Array*/localesGenerated, /*boolean?*/ guaranteedAmdFormat, /*function?*/ contextRequire){
				// summary:
				//		Load available flattened resource bundles associated with a particular module for dojo/locale and all dojo/config.extraLocale (if any)
				// description:
				//		Only called by built layer files. The entire locale hierarchy is loaded. For example,
				//		if locale=="ab-cd", then ROOT, "ab", and "ab-cd" are loaded. This is different than v1.6-
				//		in that the v1.6- would only load ab-cd...which was *always* flattened.
				//
				//		If guaranteedAmdFormat is true, then the module can be loaded with require thereby circumventing the detection algorithm
				//		and the extra possible extra transaction.

				// If this function is called from legacy code, then guaranteedAmdFormat and contextRequire will be undefined. Since the function
				// needs a require in order to resolve module ids, fall back to the context-require associated with this dojo/i18n module, which
				// itself may have been mapped.
				contextRequire = contextRequire || require;

				function doRequire(mid, callback){
					if(isXd(mid, contextRequire) || guaranteedAmdFormat){
						contextRequire([mid], callback);
					}else{
						syncRequire([mid], callback, contextRequire);
					}
				}

				function forEachLocale(locale, func){
					// given locale= "ab-cd-ef", calls func on "ab-cd-ef", "ab-cd", "ab", "ROOT"; stops calling the first time func returns truthy
					var parts = locale.split("-");
					while(parts.length){
						if(func(parts.join("-"))){
							return;
						}
						parts.pop();
					}
					func("ROOT");
				}

					function preloadingAddLock(){
						preloading++;
					}

					function preloadingRelLock(){
						--preloading;
						while(!preloading && preloadWaitQueue.length){
							load.apply(null, preloadWaitQueue.shift());
						}
					}

					function cacheId(path, name, loc, require){
						// path is assumed to have a trailing "/"
						return require.toAbsMid(path + name + "/" + loc)
					}

					function preload(locale){
						locale = normalizeLocale(locale);
						forEachLocale(locale, function(loc){
							if(array.indexOf(localesGenerated, loc) >= 0){
								var mid = bundlePrefix.replace(/\./g, "/") + "_" + loc;
								preloadingAddLock();
								doRequire(mid, function(rollup){
									for(var p in rollup){
										var bundle = rollup[p],
											match = p.match(/(.+)\/([^\/]+)$/),
											bundleName, bundlePath;
											
											// If there is no match, the bundle is not a regular bundle from an AMD layer.
											if (!match){continue;}

											bundleName = match[2];
											bundlePath = match[1] + "/";

										// backcompat
										bundle._localized = bundle._localized || {};

										var localized;
										if(loc === "ROOT"){
											var root = localized = bundle._localized;
											delete bundle._localized;
											root.root = bundle;
											cache[require.toAbsMid(p)] = root;
										}else{
											localized = bundle._localized;
											cache[cacheId(bundlePath, bundleName, loc, require)] = bundle;
										}

										if(loc !== locale){
											// capture some locale variables
											function improveBundle(bundlePath, bundleName, bundle, localized){
												// locale was not flattened and we've fallen back to a less-specific locale that was flattened
												// for example, we had a flattened 'fr', a 'fr-ca' is available for at least this bundle, and
												// locale==='fr-ca'; therefore, we must improve the bundle as retrieved from the rollup by
												// manually loading the fr-ca version of the bundle and mixing this into the already-retrieved 'fr'
												// version of the bundle.
												//
												// Remember, different bundles may have different sets of locales available.
												//
												// we are really falling back on the regular algorithm here, but--hopefully--starting with most
												// of the required bundles already on board as given by the rollup and we need to "manually" load
												// only one locale from a few bundles...or even better...we won't find anything better to load.
												// This algorithm ensures there is nothing better to load even when we can only load a less-specific rollup.
												//
												// note: this feature is only available in async mode

												// inspect the loaded bundle that came from the rollup to see if something better is available
												// for any bundle in a rollup, more-specific available locales are given at localized.
												var requiredBundles = [],
													cacheIds = [];
												forEachLocale(locale, function(loc){
													if(localized[loc]){
														requiredBundles.push(require.toAbsMid(bundlePath + loc + "/" + bundleName));
														cacheIds.push(cacheId(bundlePath, bundleName, loc, require));
													}
												});

												if(requiredBundles.length){
													preloadingAddLock();
													contextRequire(requiredBundles, function(){
														for(var i = 0; i < requiredBundles.length; i++){
															bundle = lang.mixin(lang.clone(bundle), arguments[i]);
															cache[cacheIds[i]] = bundle;
														}
														// this is the best possible (maybe a perfect match, maybe not), accept it
														cache[cacheId(bundlePath, bundleName, locale, require)] = lang.clone(bundle);
														preloadingRelLock();
													});
												}else{
													// this is the best possible (definitely not a perfect match), accept it
													cache[cacheId(bundlePath, bundleName, locale, require)] = bundle;
												}
											}
											improveBundle(bundlePath, bundleName, bundle, localized);
										}
									}
									preloadingRelLock();
								});
								return true;
							}
							return false;
						});
					}

				preload();
				array.forEach(dojo.config.extraLocale, preload);
			},

			waitForPreloads = function(id, require, load){
				if(preloading){
					preloadWaitQueue.push([id, require, load]);
				}
				return preloading;
			},

			checkForLegacyModules = function()
				{};
	}

	if( 1 ){
		// this code path assumes the dojo loader and won't work with a standard AMD loader
		var amdValue = {},
			evalBundle =
				// use the function ctor to keep the minifiers away (also come close to global scope, but this is secondary)
				new Function(
					"__bundle",				   // the bundle to evalutate
					"__checkForLegacyModules", // a function that checks if __bundle defined __mid in the global space
					"__mid",				   // the mid that __bundle is intended to define
					"__amdValue",

					// returns one of:
					//		1 => the bundle was an AMD bundle
					//		a legacy bundle object that is the value of __mid
					//		instance of Error => could not figure out how to evaluate bundle

					  // used to detect when __bundle calls define
					  "var define = function(mid, factory){define.called = 1; __amdValue.result = factory || mid;},"
					+ "	   require = function(){define.called = 1;};"

					+ "try{"
					+		"define.called = 0;"
					+		"eval(__bundle);"
					+		"if(define.called==1)"
								// bundle called define; therefore signal it's an AMD bundle
					+			"return __amdValue;"

					+		"if((__checkForLegacyModules = __checkForLegacyModules(__mid)))"
								// bundle was probably a v1.6- built NLS flattened NLS bundle that defined __mid in the global space
					+			"return __checkForLegacyModules;"

					+ "}catch(e){}"
					// evaulating the bundle was *neither* an AMD *nor* a legacy flattened bundle
					// either way, re-eval *after* surrounding with parentheses

					+ "try{"
					+		"return eval('('+__bundle+')');"
					+ "}catch(e){"
					+		"return e;"
					+ "}"
				),

			syncRequire = function(deps, callback, require){
				var results = [];
				array.forEach(deps, function(mid){
					var url = require.toUrl(mid + ".js");

					function load(text){
						var result = evalBundle(text, checkForLegacyModules, mid, amdValue);
						if(result===amdValue){
							// the bundle was an AMD module; re-inject it through the normal AMD path
							// we gotta do this since it could be an anonymous module and simply evaluating
							// the text here won't provide the loader with the context to know what
							// module is being defined()'d. With browser caching, this should be free; further
							// this entire code path can be circumvented by using the AMD format to begin with
							results.push(cache[url] = amdValue.result);
						}else{
							if(result instanceof Error){
								console.error("failed to evaluate i18n bundle; url=" + url, result);
								result = {};
							}
							// nls/<locale>/<bundle-name> indicates not the root.
							results.push(cache[url] = (/nls\/[^\/]+\/[^\/]+$/.test(url) ? result : {root:result, _v1x:1}));
						}
					}

					if(cache[url]){
						results.push(cache[url]);
					}else{
						var bundle = require.syncLoadNls(mid);
						// don't need to check for legacy since syncLoadNls returns a module if the module
						// (1) was already loaded, or (2) was in the cache. In case 1, if syncRequire is called
						// from getLocalization --> load, then load will have called checkForLegacyModules() before
						// calling syncRequire; if syncRequire is called from preloadLocalizations, then we
						// don't care about checkForLegacyModules() because that will be done when a particular
						// bundle is actually demanded. In case 2, checkForLegacyModules() is never relevant
						// because cached modules are always v1.7+ built modules.
						if(bundle){
							results.push(bundle);
						}else{
							if(!xhr){
								try{
									require.getText(url, true, load);
								}catch(e){
									results.push(cache[url] = {});
								}
							}else{
								xhr.get({
									url:url,
									sync:true,
									load:load,
									error:function(){
										results.push(cache[url] = {});
									}
								});
							}
						}
					}
				});
				callback && callback.apply(null, results);
			};

		checkForLegacyModules = function(target){
			// legacy code may have already loaded [e.g] the raw bundle x/y/z at x.y.z; when true, push into the cache
			for(var result, names = target.split("/"), object = dojo.global[names[0]], i = 1; object && i<names.length-1; object = object[names[i++]]){}
			if(object){
				result = object[names[i]];
				if(!result){
					// fallback for incorrect bundle build of 1.6
					result = object[names[i].replace(/-/g,"_")];
				}
				if(result){
					cache[target] = result;
				}
			}
			return result;
		};

		thisModule.getLocalization = function(moduleName, bundleName, locale){
			var result,
				l10nName = getBundleName(moduleName, bundleName, locale);
			load(
				l10nName,

				// isXd() and syncRequire() need a context-require in order to resolve the mid with respect to a reference module.
				// Since this legacy function does not have the concept of a reference module, resolve with respect to this
				// dojo/i18n module, which, itself may have been mapped.
				(!isXd(l10nName, require) ? function(deps, callback){ syncRequire(deps, callback, require); } : require),

				function(result_){ result = result_; }
			);
			return result;
		};

		if(has("dojo-unit-tests")){
			unitTests.push(function(doh){
				doh.register("tests.i18n.unit", function(t){
					var check;

					check = evalBundle("{prop:1}", checkForLegacyModules, "nonsense", amdValue);
					t.is({prop:1}, check); t.is(undefined, check[1]);

					check = evalBundle("({prop:1})", checkForLegacyModules, "nonsense", amdValue);
					t.is({prop:1}, check); t.is(undefined, check[1]);

					check = evalBundle("{'prop-x':1}", checkForLegacyModules, "nonsense", amdValue);
					t.is({'prop-x':1}, check); t.is(undefined, check[1]);

					check = evalBundle("({'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
					t.is({'prop-x':1}, check); t.is(undefined, check[1]);

					check = evalBundle("define({'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
					t.is(amdValue, check); t.is({'prop-x':1}, amdValue.result);

					check = evalBundle("define('some/module', {'prop-x':1})", checkForLegacyModules, "nonsense", amdValue);
					t.is(amdValue, check); t.is({'prop-x':1}, amdValue.result);

					check = evalBundle("this is total nonsense and should throw an error", checkForLegacyModules, "nonsense", amdValue);
					t.is(check instanceof Error, true);
				});
			});
		}
	}

	return lang.mixin(thisModule, {
		dynamic:true,
		normalize:normalize,
		load:load,
		cache:cache
	});
});

},
'dojo/regexp':function(){
define("dojo/regexp", ["./_base/kernel", "./_base/lang"], function(dojo, lang){

// module:
//		dojo/regexp

var regexp = {
	// summary:
	//		Regular expressions and Builder resources
};
lang.setObject("dojo.regexp", regexp);

regexp.escapeString = function(/*String*/str, /*String?*/except){
	// summary:
	//		Adds escape sequences for special characters in regular expressions
	// except:
	//		a String with special characters to be left unescaped

	return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function(ch){
		if(except && except.indexOf(ch) != -1){
			return ch;
		}
		return "\\" + ch;
	}); // String
};

regexp.buildGroupRE = function(/*Object|Array*/arr, /*Function*/re, /*Boolean?*/nonCapture){
	// summary:
	//		Builds a regular expression that groups subexpressions
	// description:
	//		A utility function used by some of the RE generators. The
	//		subexpressions are constructed by the function, re, in the second
	//		parameter.  re builds one subexpression for each elem in the array
	//		a, in the first parameter. Returns a string for a regular
	//		expression that groups all the subexpressions.
	// arr:
	//		A single value or an array of values.
	// re:
	//		A function. Takes one parameter and converts it to a regular
	//		expression.
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression. Defaults to false

	// case 1: a is a single value.
	if(!(arr instanceof Array)){
		return re(arr); // String
	}

	// case 2: a is an array
	var b = [];
	for(var i = 0; i < arr.length; i++){
		// convert each elem to a RE
		b.push(re(arr[i]));
	}

	 // join the REs as alternatives in a RE group.
	return regexp.group(b.join("|"), nonCapture); // String
};

regexp.group = function(/*String*/expression, /*Boolean?*/nonCapture){
	// summary:
	//		adds group match to expression
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression.
	return "(" + (nonCapture ? "?:":"") + expression + ")"; // String
};

return regexp;
});

},
'dojo/string':function(){
define("dojo/string", [
	"./_base/kernel",	// kernel.global
	"./_base/lang"
], function(kernel, lang){

// module:
//		dojo/string

var string = {
	// summary:
	//		String utilities for Dojo
};
lang.setObject("dojo.string", string);

string.rep = function(/*String*/str, /*Integer*/num){
	// summary:
	//		Efficiently replicate a string `n` times.
	// str:
	//		the string to replicate
	// num:
	//		number of times to replicate the string

	if(num <= 0 || !str){ return ""; }

	var buf = [];
	for(;;){
		if(num & 1){
			buf.push(str);
		}
		if(!(num >>= 1)){ break; }
		str += str;
	}
	return buf.join("");	// String
};

string.pad = function(/*String*/text, /*Integer*/size, /*String?*/ch, /*Boolean?*/end){
	// summary:
	//		Pad a string to guarantee that it is at least `size` length by
	//		filling with the character `ch` at either the start or end of the
	//		string. Pads at the start, by default.
	// text:
	//		the string to pad
	// size:
	//		length to provide padding
	// ch:
	//		character to pad, defaults to '0'
	// end:
	//		adds padding at the end if true, otherwise pads at start
	// example:
	//	|	// Fill the string to length 10 with "+" characters on the right.  Yields "Dojo++++++".
	//	|	string.pad("Dojo", 10, "+", true);

	if(!ch){
		ch = '0';
	}
	var out = String(text),
		pad = string.rep(ch, Math.ceil((size - out.length) / ch.length));
	return end ? out + pad : pad + out;	// String
};

string.substitute = function(	/*String*/		template,
									/*Object|Array*/map,
									/*Function?*/	transform,
									/*Object?*/		thisObject){
	// summary:
	//		Performs parameterized substitutions on a string. Throws an
	//		exception if any parameter is unmatched.
	// template:
	//		a string with expressions in the form `${key}` to be replaced or
	//		`${key:format}` which specifies a format function. keys are case-sensitive.
	// map:
	//		hash to search for substitutions
	// transform:
	//		a function to process all parameters before substitution takes
	//		place, e.g. mylib.encodeXML
	// thisObject:
	//		where to look for optional format function; default to the global
	//		namespace
	// example:
	//		Substitutes two expressions in a string from an Array or Object
	//	|	// returns "File 'foo.html' is not found in directory '/temp'."
	//	|	// by providing substitution data in an Array
	//	|	string.substitute(
	//	|		"File '${0}' is not found in directory '${1}'.",
	//	|		["foo.html","/temp"]
	//	|	);
	//	|
	//	|	// also returns "File 'foo.html' is not found in directory '/temp'."
	//	|	// but provides substitution data in an Object structure.  Dotted
	//	|	// notation may be used to traverse the structure.
	//	|	string.substitute(
	//	|		"File '${name}' is not found in directory '${info.dir}'.",
	//	|		{ name: "foo.html", info: { dir: "/temp" } }
	//	|	);
	// example:
	//		Use a transform function to modify the values:
	//	|	// returns "file 'foo.html' is not found in directory '/temp'."
	//	|	string.substitute(
	//	|		"${0} is not found in ${1}.",
	//	|		["foo.html","/temp"],
	//	|		function(str){
	//	|			// try to figure out the type
	//	|			var prefix = (str.charAt(0) == "/") ? "directory": "file";
	//	|			return prefix + " '" + str + "'";
	//	|		}
	//	|	);
	// example:
	//		Use a formatter
	//	|	// returns "thinger -- howdy"
	//	|	string.substitute(
	//	|		"${0:postfix}", ["thinger"], null, {
	//	|			postfix: function(value, key){
	//	|				return value + " -- howdy";
	//	|			}
	//	|		}
	//	|	);

	thisObject = thisObject || kernel.global;
	transform = transform ?
		lang.hitch(thisObject, transform) : function(v){ return v; };

	return template.replace(/\$\{([^\s\:\}]+)(?:\:([^\s\:\}]+))?\}/g,
		function(match, key, format){
			var value = lang.getObject(key, false, map);
			if(format){
				value = lang.getObject(format, false, thisObject).call(thisObject, value, key);
			}
			return transform(value, key).toString();
		}); // String
};

string.trim = String.prototype.trim ?
	lang.trim : // aliasing to the native function
	function(str){
		str = str.replace(/^\s+/, '');
		for(var i = str.length - 1; i >= 0; i--){
			if(/\S/.test(str.charAt(i))){
				str = str.substring(0, i + 1);
				break;
			}
		}
		return str;
	};

/*=====
 string.trim = function(str){
	 // summary:
	 //		Trims whitespace from both sides of the string
	 // str: String
	 //		String to be trimmed
	 // returns: String
	 //		Returns the trimmed string
	 // description:
	 //		This version of trim() was taken from [Steven Levithan's blog](http://blog.stevenlevithan.com/archives/faster-trim-javascript).
	 //		The short yet performant version of this function is dojo.trim(),
	 //		which is part of Dojo base.  Uses String.prototype.trim instead, if available.
	 return "";	// String
 };
 =====*/

	return string;
});

},
'dojo/cldr/nls/gregorian':function(){
define("dojo/cldr/nls/gregorian", { root:

//begin v1.x content
{
	"days-standAlone-short": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7"
	],
	"months-format-narrow": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12"
	],
	"quarters-standAlone-narrow": [
		"1",
		"2",
		"3",
		"4"
	],
	"field-weekday": "Day of the Week",
	"dateFormatItem-yQQQ": "y QQQ",
	"dateFormatItem-yMEd": "E, y-M-d",
	"dateFormatItem-MMMEd": "E MMM d",
	"eraNarrow": [
		"BCE",
		"CE"
	],
	"days-format-short": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7"
	],
	"dateTimeFormats-appendItem-Day-Of-Week": "{0} {1}",
	"dateFormat-long": "y MMMM d",
	"months-format-wide": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12"
	],
	"dateTimeFormat-medium": "{1} {0}",
	"dayPeriods-format-wide-pm": "PM",
	"dateFormat-full": "EEEE, y MMMM dd",
	"dateFormatItem-Md": "M-d",
	"dayPeriods-format-abbr-am": "AM",
	"dateTimeFormats-appendItem-Second": "{0} ({2}: {1})",
	"dateFormatItem-yMd": "y-M-d",
	"field-era": "Era",
	"dateFormatItem-yM": "y-M",
	"months-standAlone-wide": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12"
	],
	"timeFormat-short": "HH:mm",
	"quarters-format-wide": [
		"Q1",
		"Q2",
		"Q3",
		"Q4"
	],
	"timeFormat-long": "HH:mm:ss z",
	"field-year": "Year",
	"dateFormatItem-yMMM": "y MMM",
	"dateFormatItem-yQ": "y Q",
	"dateTimeFormats-appendItem-Era": "{0} {1}",
	"field-hour": "Hour",
	"months-format-abbr": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12"
	],
	"timeFormat-full": "HH:mm:ss zzzz",
	"dateTimeFormats-appendItem-Week": "{0} ({2}: {1})",
	"field-day-relative+0": "Today",
	"field-day-relative+1": "Tomorrow",
	"dateFormatItem-H": "HH",
	"months-standAlone-abbr": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12"
	],
	"quarters-format-abbr": [
		"Q1",
		"Q2",
		"Q3",
		"Q4"
	],
	"quarters-standAlone-wide": [
		"Q1",
		"Q2",
		"Q3",
		"Q4"
	],
	"dateFormatItem-M": "L",
	"days-standAlone-wide": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7"
	],
	"timeFormat-medium": "HH:mm:ss",
	"dateFormatItem-Hm": "HH:mm",
	"quarters-standAlone-abbr": [
		"Q1",
		"Q2",
		"Q3",
		"Q4"
	],
	"eraAbbr": [
		"BCE",
		"CE"
	],
	"field-minute": "Minute",
	"field-dayperiod": "Dayperiod",
	"days-standAlone-abbr": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7"
	],
	"dateFormatItem-d": "d",
	"dateFormatItem-ms": "mm:ss",
	"quarters-format-narrow": [
		"1",
		"2",
		"3",
		"4"
	],
	"field-day-relative+-1": "Yesterday",
	"dateFormatItem-h": "h a",
	"dateTimeFormat-long": "{1} {0}",
	"dayPeriods-format-narrow-am": "AM",
	"dateFormatItem-MMMd": "MMM d",
	"dateFormatItem-MEd": "E, M-d",
	"dateTimeFormat-full": "{1} {0}",
	"field-day": "Day",
	"days-format-wide": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7"
	],
	"field-zone": "Zone",
	"dateTimeFormats-appendItem-Day": "{0} ({2}: {1})",
	"dateFormatItem-y": "y",
	"months-standAlone-narrow": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7",
		"8",
		"9",
		"10",
		"11",
		"12"
	],
	"dateFormatItem-hm": "h:mm a",
	"dateTimeFormats-appendItem-Year": "{0} {1}",
	"dateTimeFormats-appendItem-Hour": "{0} ({2}: {1})",
	"dayPeriods-format-abbr-pm": "PM",
	"days-format-abbr": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7"
	],
	"dateFormatItem-yMMMd": "y MMM d",
	"eraNames": [
		"BCE",
		"CE"
	],
	"days-format-narrow": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7"
	],
	"days-standAlone-narrow": [
		"1",
		"2",
		"3",
		"4",
		"5",
		"6",
		"7"
	],
	"dateFormatItem-MMM": "LLL",
	"field-month": "Month",
	"dateTimeFormats-appendItem-Quarter": "{0} ({2}: {1})",
	"dayPeriods-format-wide-am": "AM",
	"dateTimeFormats-appendItem-Month": "{0} ({2}: {1})",
	"dateTimeFormats-appendItem-Minute": "{0} ({2}: {1})",
	"dateFormat-short": "yyyy-MM-dd",
	"field-second": "Second",
	"dateFormatItem-yMMMEd": "E, y MMM d",
	"dateFormatItem-Ed": "d E",
	"dateTimeFormats-appendItem-Timezone": "{0} {1}",
	"field-week": "Week",
	"dateFormat-medium": "y MMM d",
	"dayPeriods-format-narrow-pm": "PM",
	"dateTimeFormat-short": "{1} {0}",
	"dateFormatItem-Hms": "HH:mm:ss",
	"dateFormatItem-hms": "h:mm:ss a"
}
//end v1.x content
,
	"ar": true,
	"ca": true,
	"cs": true,
	"da": true,
	"de": true,
	"el": true,
	"en": true,
	"en-au": true,
	"en-ca": true,
	"en-gb": true,
	"es": true,
	"fi": true,
	"fr": true,
	"fr-ch": true,
	"he": true,
	"hu": true,
	"it": true,
	"ja": true,
	"ko": true,
	"nb": true,
	"nl": true,
	"pl": true,
	"pt": true,
	"pt-pt": true,
	"ro": true,
	"ru": true,
	"sk": true,
	"sl": true,
	"sv": true,
	"th": true,
	"tr": true,
	"zh": true,
	"zh-hant": true,
	"zh-hk": true,
	"zh-tw": true
});
},
'epi/shell/ViewSettings':function(){
﻿define([],

    function () {

        return {
            // summary:
            //      Contains settings for the current view.
            //
            // tags:
            //      public

            // viewName: String
            //      Name of current view
            viewName: null,

            // settings: Object
            //      Contains settings for the current view.
            settings: null
        };
    });


},
'epi/shell/Stateful':function(){
﻿define([
    "dojo",
    "epi",
    "dojo/Stateful"],

function (dojo, epi, Stateful) {

    return dojo.declare(Stateful, {
        // summary:
        //		Base class for objects that provide named properties with optional getter/setter
        //		control and the ability to watch for property changes
        // example:
        //	|	var obj = new dojo/Stateful();
        //	|	obj.watch("foo", function(){
        //	|		console.log("foo changed to " + this.get("foo"));
        //	|	});
        //	|	obj.set("foo","bar");
        //
        // tags:
        //      public

        //        _prefix: "epi-",
        _prefix: "epi-",

        postscript: function () {
            if (arguments.length > 0) {
                throw new Error("Stateful should not be instantiated with initial params. Use set method to set values.");
            }

            this.inherited(arguments);
        },

        get: function (/*String*/name) {
            // summary:
            //		Get a property on a Stateful instance.
            // name:
            //		The property to get.
            // description:
            //		Get a named property on a Stateful object. The property may
            //		potentially be retrieved from a child object if a dot-delimited
            //		string is passed through, such as "A.B.C".
            return dojo.getObject(this._prefix + name, false, this);
        },

        set: function (/*String*/name, /*Object*/value) {
            // summary:
            //		Set a property on a Stateful instance
            // name:
            //		The property to set.
            // value:
            //		The value to set in the property.
            // description:
            //		Sets named properties on a stateful object and notifies any watchers of
            //		the property. The property may potentially be set on a child object if
            //		a dot-delimited string is passed through, such as "A.B.C".
            //		For example:
            //	|	stateful = new dojo/Stateful();
            //	|	stateful.watch(function(name, oldValue, value){
            //	|		// this will be called on the set below
            //	|	}
            //	|	stateful.set(foo, 5);
            //
            //		set() may also be called with a hash of name/value pairs, ex:
            //	|	myObj.set({
            //	|		foo: "Howdy",
            //	|		bar: 3
            //	|	})
            //		This is equivalent to calling set(foo, "Howdy") and set(bar, 3)

            if (typeof name === "object") {
                for (var x in name) {
                    this.set(x, name[x]);
                }
                return this;
            }
            var oldValue = dojo.getObject(this._prefix + name, false, this);

            var newValue = value;

            dojo.setObject(this._prefix + name, newValue, this);
            if (this._watchCallbacks) {
                this._watchCallbacks(name, oldValue, newValue);
                this._callbackParentObjects(name, oldValue, newValue);
                this._callbackChildObjects(name, oldValue, newValue);
            }
            return this;
        },

        watch: function (/*String?*/name, /*Function*/callback) {
            // summary:
            //		Watches a property for changes
            //	name:
            //		Indicates the property to watch. This is optional (the callback may be the
            //		only parameter), and if omitted, all the properties will be watched
            // returns:
            //		An object handle for the watch. The unwatch method of this object
            //		can be used to discontinue watching this property:
            //		|	var watchHandle = obj.watch("foo", callback);
            //		|	watchHandle.unwatch(); // callback won't be called now
            //	callback:
            //		The function to execute when the property changes. This will be called after
            //		the property has been changed. The callback will be called with the |this|
            //		set to the instance, the first argument as the name of the property, the
            //		second argument as the old value and the third argument as the new value.
            var callbacks = this._watchCallbacks;

            if (!callbacks) {
                var self = this;
                callbacks = this._watchCallbacks = function (name, oldValue, value, ignoreCatchall) {
                    var notify = function (propertyCallbacks) {
                        if (propertyCallbacks) {
                            propertyCallbacks = propertyCallbacks.slice();
                            for (var i = 0, l = propertyCallbacks.length; i < l; i++) {
                                try {
                                    propertyCallbacks[i].call(self, name, oldValue, value);
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        }
                    };
                    notify(callbacks["_" + name]);
                    if (!ignoreCatchall) {
                        notify(callbacks["*"]); // the catch-all
                    }
                }; // we use a function instead of an object so it will be ignored by JSON conversion
            }
            if (!callback && typeof name === "function") {
                callback = name;
                name = "*";
            } else {
                // prepend with dash to prevent name conflicts with function (like "name" property)
                name = "_" + name;
            }
            var propertyCallbacks = callbacks[name];
            if (typeof propertyCallbacks !== "object") {
                propertyCallbacks = callbacks[name] = [];
            }
            propertyCallbacks.push(callback);

            var handle = {

            };
            handle.unwatch = handle.remove = function () {
                propertyCallbacks.splice(dojo.indexOf(propertyCallbacks, callback), 1);
            };
            return handle;
        },

        _callbackChildObjects: function (/*String*/name, /*Object*/oldValue, /*Object*/value) {
            // summary:
            //		Will recursively call any watch callbacks on the child properties of value; if value is an object.
            // name:
            //		The name of the property associated with value.
            // oldValue:
            //		The old value of the property.
            // value:
            //		The value of the property.
            // tags:
            //		private

            var item;

            if (dojo.isObject(value)) {
                for (item in value) {
                    if (!dojo.isFunction(value[item])) { //prevent infinite loop on function's prototype
                        this._watchCallbacks(name + "." + item, oldValue ? oldValue[item] : null, value[item]);
                        this._callbackChildObjects(name + "." + item, oldValue ? oldValue[item] : null, value[item]);
                    }
                }
            }
        },

        _callbackParentObjects: function (/*String*/name, /*Object*/oldValue, /*Object*/value) {
            // summary:
            //		Will recursively call any watch callbacks on the parent properties of value; if name is a dot-delimited string.
            // name:
            //		The name of the property associated with value.
            // oldValue:
            //		The old value of the property.
            // value:
            //		The value of the property.
            // tags:
            //		private

            var fragments = name.split(".");
            if (fragments.length === 1) {
                return;
            }

            // Get the last item from the fragments as the key for the new object.
            var key = fragments.pop();

            // Join the remaining fragments to create the new property name.
            name = fragments.join(".");

            var parent = this.get(name);
            oldValue = this._getUpdatedObject(parent, key, oldValue);
            value = parent;

            this._watchCallbacks(name, oldValue, value);
            this._callbackParentObjects(name, oldValue, value);
        },

        _getUpdatedObject: function (/*Object*/parent, /*String*/key, /*Object*/value) {
            // summary:
            //		Will create a new object and add the key value pair.
            // parent:
            //		The value of parent property
            // key:
            //		The key of the property associated with value.
            // value:
            //		The value of the property.
            // tags:
            //		private

            var newObject = dojo.clone(parent);
            newObject[key] = value;
            return newObject;
        }
    });
});

},
'dojo/Stateful':function(){
define("dojo/Stateful", ["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/when"], function (declare, lang, array, when) {
    // module:
    //		dojo/Stateful

    return declare("dojo.Stateful", null, {
        // summary:
        //		Base class for objects that provide named properties with optional getter/setter
        //		control and the ability to watch for property changes
        //
        //		The class also provides the functionality to auto-magically manage getters
        //		and setters for object attributes/properties.
        //
        //		Getters and Setters should follow the format of _xxxGetter or _xxxSetter where
        //		the xxx is a name of the attribute to handle.  So an attribute of "foo"
        //		would have a custom getter of _fooGetter and a custom setter of _fooSetter.
        //
        // example:
        //	|	var obj = new dojo.Stateful();
        //	|	obj.watch("foo", function(){
        //	|		console.log("foo changed to " + this.get("foo"));
        //	|	});
        //	|	obj.set("foo","bar");

        // _attrPairNames: Hash
        //		Used across all instances a hash to cache attribute names and their getter
        //		and setter names.
        _attrPairNames: {},

        _getAttrNames: function (name) {
            // summary:
            //		Helper function for get() and set().
            //		Caches attribute name values so we don't do the string ops every time.
            // tags:
            //		private

            var apn = this._attrPairNames;
            if (apn[name]) {
                return apn[name];
            }
            return (apn[name] = {
                s: "_" + name + "Setter",
                g: "_" + name + "Getter"
            });
        },

        postscript: function (/*Object?*/ params) {
            // Automatic setting of params during construction
            if (params) {
                this.set(params);
            }
        },

        _get: function (name, names) {
            // summary:
            //		Private function that does a get based off a hash of names
            // names:
            //		Hash of names of custom attributes
            return typeof this[names.g] === "function" ? this[names.g]() : this[name];
        },
        get: function (/*String*/name) {
            // summary:
            //		Get a property on a Stateful instance.
            // name:
            //		The property to get.
            // returns:
            //		The property value on this Stateful instance.
            // description:
            //		Get a named property on a Stateful object. The property may
            //		potentially be retrieved via a getter method in subclasses. In the base class
            //		this just retrieves the object's property.
            //		For example:
            //	|	stateful = new dojo.Stateful({foo: 3});
            //	|	stateful.get("foo") // returns 3
            //	|	stateful.foo // returns 3

            return this._get(name, this._getAttrNames(name)); //Any
        },
        set: function (/*String*/name, /*Object*/value) {
            // summary:
            //		Set a property on a Stateful instance
            // name:
            //		The property to set.
            // value:
            //		The value to set in the property.
            // returns:
            //		The function returns this dojo.Stateful instance.
            // description:
            //		Sets named properties on a stateful object and notifies any watchers of
            //		the property. A programmatic setter may be defined in subclasses.
            //		For example:
            //	|	stateful = new dojo.Stateful();
            //	|	stateful.watch(function(name, oldValue, value){
            //	|		// this will be called on the set below
            //	|	}
            //	|	stateful.set(foo, 5);
            //
            //	set() may also be called with a hash of name/value pairs, ex:
            //	|	myObj.set({
            //	|		foo: "Howdy",
            //	|		bar: 3
            //	|	})
            //	This is equivalent to calling set(foo, "Howdy") and set(bar, 3)

            // If an object is used, iterate through object
            if (typeof name === "object") {
                for (var x in name) {
                    if (name.hasOwnProperty(x) && x != "_watchCallbacks") {
                        this.set(x, name[x]);
                    }
                }
                return this;
            }

            var names = this._getAttrNames(name),
                oldValue = this._get(name, names),
                setter = this[names.s],
                result;
            if (typeof setter === "function") {
                // use the explicit setter
                result = setter.apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                // no setter so set attribute directly
                this[name] = value;
            }
            if (this._watchCallbacks) {
                var self = this;
                // If setter returned a promise, wait for it to complete, otherwise call watches immediatly
                when(result, function () {
                    self._watchCallbacks(name, oldValue, value);
                });
            }
            return this; // dojo/Stateful
        },
        _changeAttrValue: function (name, value) {
            // summary:
            //		Internal helper for directly changing an attribute value.
            //
            // name: String
            //		The property to set.
            // value: Mixed
            //		The value to set in the property.
            //
            // description:
            //		Directly change the value of an attribute on an object, bypassing any
            //		accessor setter.  Also handles the calling of watch and emitting events.
            //		It is designed to be used by descendent class when there are two values
            //		of attributes that are linked, but calling .set() is not appropriate.

            var oldValue = this.get(name);
            this[name] = value;
            if (this._watchCallbacks) {
                this._watchCallbacks(name, oldValue, value);
            }
            return this; // dojo/Stateful
        },
        watch: function (/*String?*/name, /*Function*/callback) {
            // summary:
            //		Watches a property for changes
            // name:
            //		Indicates the property to watch. This is optional (the callback may be the
            //		only parameter), and if omitted, all the properties will be watched
            // returns:
            //		An object handle for the watch. The unwatch method of this object
            //		can be used to discontinue watching this property:
            //		|	var watchHandle = obj.watch("foo", callback);
            //		|	watchHandle.unwatch(); // callback won't be called now
            // callback:
            //		The function to execute when the property changes. This will be called after
            //		the property has been changed. The callback will be called with the |this|
            //		set to the instance, the first argument as the name of the property, the
            //		second argument as the old value and the third argument as the new value.

            var callbacks = this._watchCallbacks;
            if (!callbacks) {
                var self = this;
                callbacks = this._watchCallbacks = function (name, oldValue, value, ignoreCatchall) {
                    var notify = function (propertyCallbacks) {
                        if (propertyCallbacks) {
                            propertyCallbacks = propertyCallbacks.slice();
                            for (var i = 0, l = propertyCallbacks.length; i < l; i++) {
                                propertyCallbacks[i].call(self, name, oldValue, value);
                            }
                        }
                    };
                    notify(callbacks['_' + name]);
                    if (!ignoreCatchall) {
                        notify(callbacks["*"]); // the catch-all
                    }
                }; // we use a function instead of an object so it will be ignored by JSON conversion
            }
            if (!callback && typeof name === "function") {
                callback = name;
                name = "*";
            } else {
                // prepend with dash to prevent name conflicts with function (like "name" property)
                name = '_' + name;
            }
            var propertyCallbacks = callbacks[name];
            if (typeof propertyCallbacks !== "object") {
                propertyCallbacks = callbacks[name] = [];
            }
            propertyCallbacks.push(callback);

            // TODO: Remove unwatch in 2.0
            var handle = {};
            handle.unwatch = handle.remove = function () {
                var index = array.indexOf(propertyCallbacks, callback);
                if (index > -1) {
                    propertyCallbacks.splice(index, 1);
                }
                propertyCallbacks = callback = null;
            };
            return handle; //Object
        }

    });

});

},
'epi/shell/messaging':function(){
﻿define(["dojo/_base/lang", "dojo/topic", "epi"], function (lang, topic, epi) {

    //Object that holds the registered libraries to pass messages to
    var libraries = {};

    var messaging = {
        // summary:
        //      Responsible for connecting dojo publish/subscribe with messaging capabilities of external libraries, such as jQuery.
        //      Automatically connects to dojo/topic messaging as well as jQuery.trigger if the global epiJQuery object is available.
        // tags:
        //      internal

        subscribe: function (subject, context, method) {
            // summary:
            //      Sets up a subscription
            // subject: String
            //      The signature to listen for
            // context: Object
            //      Scope in which method will be invoked, or null for default scope
            // method: String|Function
            //      The name of a function in context, or a function reference. This is the function that is invoked when topic is published

            return topic.subscribe(topic, lang.hitch(context, method));
        },

        unsubscribe: function (handle) {
            // summary:
            //      Remove a subscription
            // handle: Handle
            //      The handle returned from a call to subscribe.

            if (handle) {
                handle.remove();
            }
        },

        publish: function (topic, args /*, string libName */) {
            // summary:
            //      Invoke all listener method subscribed to the topic.
            // topic: String
            //      The name of the topic to publish.
            // args: Array
            //      An array of arguments. The arguments will be applied to each topic subscriber.

            var libName = arguments[2] || null;
            for (var i in libraries) {
                var lib = libraries[i];
                if (lib.name !== libName) {
                    lib.context[lib.publishMethod]({ data: topic, __epiPublished: true }, args);
                }
            }
        },

        registerLibrary: function (name, context, publishMethod, publishFilter) {
            // summary:
            //      Registers JavaScript library to enable sharing of messages.
            // name: String
            //      Name of the library
            // context: Object
            //      Namespace object for the publish method in the library (dojo, jQuery.event etc)
            // publishMethod: String
            //      Name of the publishing method on the context object (publish, trigger etc)
            // publishFilter: function
            //      Function that enables of filtering of which messages to pass on from the library.
            //      Can be good to use if the message bus is chatty.

            libraries[name] = { name: name, publishMethod: publishMethod };
            libraries[name].context = context;
            libraries[name].originalPublish = context[publishMethod];

            context[publishMethod] = function (topic, args) {
                var newArguments = Array.prototype.slice.call(arguments);

                if (!topic.__epiPublished) {
                    if (!publishFilter || (publishFilter.apply(this, arguments))) {
                        messaging.publish(topic, args, name);
                    }
                } else {
                    newArguments[0] = topic.data;
                }
                libraries[name].originalPublish.apply(this, newArguments);
            };
        },

        unRegisterLibrary: function (name) {
            // summary:
            //      Removes the JavaScript library from message sharing.
            // name: String
            //      Name of the library

            var lib = libraries[name];
            lib.context[lib.publishMethod] = lib.originalPublish;
            delete libraries[name];
        }

    };

    //Registers dojo for message sharing
    messaging.registerLibrary("dojo", topic, "publish");

    lang.setObject("epi.shell.messaging", messaging);

    return messaging;
});

}}});
﻿define("epi/epi", [
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/aspect",
    ".",
    "./dependency",
    "./routes",
    "./clientResourcesLoader",
    "./_Module",
    "./ModuleManager",
    "./shell/Bootstrapper",
    "./shell/Stateful",
    "./shell/messaging" // Used for event forwarding between dojo and jQuery. Required for dashboard/mvc gadget compatibility
], function (lang, array, aspect, epi) {

    /*=====
    var epi = {
        // summary:
        //      Initializes the global epi object.
        // tags:
        //      public
    };
    =====*/

    epi.compareOptions = {
        // tags:
        //      internal
        treatFalsyAsEquals: 1,
        skipEmptyProperties: 2
    };

    /* global CSSImportRule */

    epi.areEqual = function (first, second, compareOptions) {
        // summary:
        //		Determines whether the first and second arguments are deeply equal.
        // tags:
        //      public

        // Compare undefined always with three equal signs, because undefined==null
        // is true, but undefined===null is false.
        if ((first === undefined) && (second === undefined)) {
            return true;
        }

        if (first === null && second === null) {
            return true;
        }

        if (compareOptions && (compareOptions & epi.compareOptions.treatFalsyAsEquals)) {
            if (!first && !second) {
                return true;
            }
        }

        // If only one is null, they aren't equal.
        if (first === null || second === null) {
            return false;
        }

        //Are they of the same type?
        if (typeof first !== typeof second) {
            return false;
        }

        if ((first === second) || (first == second) || (typeof first == "number" && typeof second == "number" && isNaN(first) && isNaN(second))) { // eslint-disable-line eqeqeq
            return true;
        }

        //is it an array
        if (lang.isArray(first) && lang.isArray(second)) {
            //Return fals if the length are different
            if (first.length !== second.length) {
                return false;
            }

            //Check each value in the array
            for (var x = 0; x < first.length; x++) {
                if (!epi.areEqual(first[x], second[x], compareOptions)) {
                    return false;
                }
            }

            return true;
        }

        //Is it a date
        if ((first instanceof Date) && (second instanceof Date)) {
            //compare number of milliseconds since 1970.
            return first.getTime() === second.getTime();
        }

        //Is it a function
        if ((typeof first  === "function") && (typeof second  === "function")) {
            return first.toString() === second.toString();
        }

        //Is it an object
        if (((typeof first == "object") && ((typeof second == "object")))) {
            var prop;
            // Make sure ALL THE SAME properties are in both objects!
            for (prop in second) {
                if (!(prop in first)) {
                    if (compareOptions && (compareOptions & epi.compareOptions.skipEmptyProperties)) {
                        //second object has empty property and first object hasn't this property at all
                        if (!second[prop]) {
                            continue;
                        }
                    }

                    return false;
                }
            }

            //Check that the values of the properties are equal
            for (prop in first) {
                if (compareOptions && (compareOptions & epi.compareOptions.skipEmptyProperties)) {
                    // first object has empty property and second object hasn't this property at all
                    if (!first[prop] && !second.hasOwnProperty(prop)) {
                        continue;
                    }
                }

                if (!epi.areEqual(first[prop], second[prop], compareOptions)) {
                    return false;
                }
            }

            return true;
        }

        return false;
    };

    epi.isEmpty = function (obj) {
        // summary:
        //      Utilities function to check whether an object is empty or not
        //
        // obj: Object
        //
        // tags:
        //      public

        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    };

    epi.delegate = function (obj, props, aspectedMethods) {
        // summary:
        //      Create a delegate from the given object and make sure all the "after" aspect advices still work.
        //
        // description:
        //      This function does not ensure the aspect call order between the original object's advices and the delegate object's advice.
        //      Note that all the aspect advices will receive original arguments and will not be able to change the method result.
        //
        // obj: Object
        //      The original object.
        //
        // props: Object
        //      The override properties
        //
        // aspectedMethods: Array
        //      The methods that might have aspect connect that we want to keep.
        //
        // tags:
        //      public

        // Use dojo delagate to create a delegate object
        var delegate = lang.delegate(obj, props);

        // Flag indicate that the aspect chain is triggered by the aspectBridge advice we added to the delegate object
        var triggerFromDelegate = false;

        // Aspect chain execution helper
        var executeAfterAspect = function (dispatcher) {
            var after = dispatcher.after;
            while (after) {
                after.advice.apply(this, arguments);
                after = after.next;
            }
        };

        // Create aspect bridge handles array, to be able to remove later on.
        delegate._aspectBridges = [];

        // Loop through all the methods
        array.forEach(aspectedMethods, function (propName) {
            if (!obj.hasOwnProperty(propName) || typeof obj[propName] !== "function") {
                return;
            }

            // Add an after advice to the delegate object to trigger the after advices on the original object when the method is called on the delegate object
            delegate._aspectBridges.push(aspect.after(delegate, propName, function () {
                if (triggerFromDelegate) {
                    return;
                }

                var dispatcher = obj[propName];
                executeAfterAspect(dispatcher);
            }, true));

            // Add an after advice to the original object to trigger the after advices on the delegate object when the method is called on the delegate object
            delegate._aspectBridges.push(aspect.after(obj, propName, function () {
                triggerFromDelegate = true;

                var dispatcher = delegate[propName];
                executeAfterAspect(dispatcher);

                triggerFromDelegate = false;
            }, true));
        });

        return delegate;
    };

    epi.removeDelegateAspects = function (delegate) {
        // summary:
        //      Remove the aspect bridges between the delegate object and the original object created when using epi.delegate.
        // delegate: Object
        //      The delegate object.

        delegate._aspectBridges && delegate._aspectBridges.forEach(function (handle) {
            handle.remove();
        });
    };

    epi._countCSSRules = function (asString) {
        // summary:
        //     Counts selectors and rules in all included stylesheets
        // asString:
        //     Boolean
        // tags:
        //     private

        var results = [];

        function countSheet(sheet) {
            var count = 0,
                rule;

            if (sheet && sheet.cssRules) {
                for (var j = 0, l = sheet.cssRules.length; j < l; j++) {
                    rule = sheet.cssRules[j];

                    if (rule instanceof CSSImportRule) {
                        countSheet(rule.styleSheet);
                        continue;
                    }

                    if (rule.selectorText) {
                        count += rule.selectorText.split(",").length;
                    } else if (rule.cssRules) {
                        for (var m = 0, n = rule.cssRules.length; m < n; m++) {
                            if (rule.cssRules[m].selectorText) {
                                count += rule.cssRules[m].selectorText.split(",").length;
                            }
                        }
                    }
                }

                results.push({
                    file: sheet.href ? sheet.href : "inline",
                    rules: sheet.cssRules.length,
                    selectors: count
                });
            }
        }

        if (!document.styleSheets) {
            return;
        }
        for (var i = 0; i < document.styleSheets.length; i++) {
            countSheet(document.styleSheets[i]);
        }

        return asString ? JSON.stringify(results, null, "    ") : results;
    };

    return epi;
});
