define("epi/_Module", [
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
