define("epi/shell/PropertyMetadata", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "epi/shell/TypeDescriptorManager"
], function (declare, lang, array, TypeDescriptorManager) {

    var PropertyMetadata = declare([], {
        // summary:
        //      A class encapsulating metadata information for editable properties.
        //      This class also handles property name aliasing where one property is mapped
        //      to another using the mappedProperties collection
        //
        // tags:
        //      public

        // A hashmap between property name and the corresponding metadata
        _propertyMap: null,

        constructor: function (metadata, /* Object? */ parent) {
            // summary:
            //      Returns a hierachical structure based on the supplied metadata.

            declare.safeMixin(this, metadata);

            if (parent) {

                // Get the hierarchical name for the property
                // e.g. ImageBlock.ImageUrl
                if (parent.getName()) {
                    this._fullName = parent.getName() + "." + this.name;
                } else {
                    this._fullName = this.name;
                }

                // Set localized displayName
                if (this.name) {
                    var propertyName = "properties." + this.name.toLowerCase();
                    var modelTypeIdentifier = lang.getObject("additionalValues.modelTypeIdentifier", false, parent);
                    if (modelTypeIdentifier) {
                        var localization = TypeDescriptorManager.getResourceValue(modelTypeIdentifier, propertyName);
                        if (localization && localization.caption) {
                            this.displayName = localization.caption;
                        }
                    }
                }
            }

            // Wrap each sub property in its own class recursively
            this._propertyMap = {};
            array.forEach(this.properties, function (prop) {
                var child = new PropertyMetadata(prop, this);
                this._propertyMap[child.name.toLowerCase()] = child;
            }, this);
        },

        hasSubProperties: function () {
            // summary:
            //      Returns true if this property has child properties

            return (this.properties && this.properties.length);
        },

        getPropertyMetadata: function (/*String*/ propertyName) {
            // summary:
            //      Gets the the metadata for a named property.
            //      If propertyName contains dots the metadata is searched hierarchically with the . as level separator.
            //
            // propertyName:
            //      Possibly dot separated name of property to get metadata information for

            var names = propertyName.toLowerCase().split(".");
            return this._getPropertyMetaData(names);
        },

        getName: function () {
            // summary:
            //      Gets the full hierarchical name of the property. E.g BlockContent.MainBody
            // tags:
            //      public

            return this._fullName;
        },

        _getPropertyMetaData: function (/*String[]*/names) {
            // summary:
            //      Takes an array of property names and searches hierarchically for matching metadata.
            //      This method modifies the input array.
            // tags:
            //      private

            var name = names.shift();

            // Try to find a user defined property first, then a mapped metadata property.
            var propertyMetadata = this._propertyMap[name] || this._propertyMap[this._getMappedName(name)];
            if (propertyMetadata && names.length) {
                return propertyMetadata._getPropertyMetaData(names);
            }
            return propertyMetadata;
        },

        _getMappedName: function (name) {
            // summary:
            //      Checks the mappedProperties configuration for a match. If a match is found
            //      The name of the aliased property is returned; otherwise the original name is returned.
            //
            // tags: private

            var match;
            array.some(this.mappedProperties || [], function (mapping) {
                return mapping.from.toLowerCase() === name && (match = mapping);
            });
            return match ? match.to.toLowerCase() : name;
        }
    });

    return PropertyMetadata;
});
