define("epi/shell/Stateful", [
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
