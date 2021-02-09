define("epi/dependency", ["dojo/_base/declare", "epi"], function (declare, epi) {

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
