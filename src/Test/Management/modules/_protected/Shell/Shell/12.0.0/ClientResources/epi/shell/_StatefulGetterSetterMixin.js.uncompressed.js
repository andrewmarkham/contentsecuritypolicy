define("epi/shell/_StatefulGetterSetterMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/obsolete"
],

function (
    declare,
    lang,
    obsolete
) {
    return declare(null, {
        // summary:
        //		A mixin for Stateful object with getters and setters like the dijit Widget implementation.
        //		Each property can be accessed or set with a function like:
        //
        //		`myObject.get("propertyName")` will be handled by `myObject._getPropertyNameAttr()` if it exists
        //		and `myObject.set("propertyName", value)` will be handled by
        //		`myObject._setPropertyNameAttr(value)` if it exists
        //
        // tags:
        //    internal xproduct deprecated

        // _disableObsoleteWarnings: [protected] Boolean
        //      Gets or sets if we should we skip the obsolete warnings.
        _disableObsoleteWarnings: false,

        postscript: function () {
            if (!this._disableObsoleteWarnings) {
                obsolete("epi/shell/_StatefulGetterSetterMixin", "Use dojo/Stateful custom setters/getters instead");
            }
        },

        get: function (name) {
            // summary:
            //		Get a property.
            //	name:
            //		The property to get.
            // description:
            //		Get a named property. The property may
            //		potentially be retrieved via a getter method. If no getter is defined, this
            //		just retrieves the object's property.

            var names = this._getAttrNames(name);
            return this[names.g] ? this[names.g]() : this[name];
        },

        set: function (name, value) {
            // summary:
            //		Set a property
            //	name:
            //		The property to set.
            //	value:
            //		The value to set in the property.
            // description:
            //		Sets named properties on this object which may potentially be handled by a
            //		setter.
            //
            //		set() may also be called with a hash of name/value pairs, ex:
            //
            //	|	myWidget.set({
            //	|		foo: "Howdy",
            //	|		bar: 3
            //	|	});

            if (typeof name === "object") {
                for (var x in name) {
                    this.set(x, name[x]);
                }
                return this;
            }

            var names = this._getAttrNames(name);
            var setter = this[names.s];

            if (lang.isFunction(setter)) {
                // use the explicit setter
                setter.apply(this, Array.prototype.slice.call(arguments, 1));
            } else {
                this._set(name, value);
            }

            return this;
        },

        _attrPairNames: {},  // shared between all widgets

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
            var uc = name.replace(/^[a-z]|-[a-zA-Z]/g, function (c) {
                return c.charAt(c.length - 1).toUpperCase();
            });
            return (apn[name] = {
                s: "_set" + uc + "Attr", // converts dashes to camel case, ex: accept-charset --> _setAcceptCharsetAttr
                g: "_get" + uc + "Attr",
                l: uc.toLowerCase()		// lowercase name w/out dashes, ex: acceptcharset
            });
        },

        _set: function (/*String*/name, /*anything*/value) {
            // summary:
            //		Helper function to set new value for specified attribute, and call handlers
            //		registered with watch() if the value has changed.
            // tags:
            //		private

            var oldValue = this[name];
            this[name] = value;
            if (this._watchCallbacks) {
                this._watchCallbacks(name, oldValue, value);
            }
            return this;
        }
    });
});
