define(
    "epi/shell/conversion/ObjectConverterRegistry", [
        "dojo/_base/array",
        "dojo/_base/lang"
    ],
    function (
        array,
        lang
    ) {

        return {
        // summary:
        //    A registry that keeps a list of converters that can convert data between different data types.
        // tags:
        //    public

        // _converterMappings: [private] Array
        //    They array with the registered converter mappings.
            _converterMappings: {},

            clear: function () {
            // summary:
            //    Clears the list of registered converters.
                this._converterMappings = {};
            },

            /*
        Custom functions
        */
            registerConverter: function (/*String*/sourceDataType, /*String*/targetDataType, converter) {
            // summary:
            //    Registers a converter between two given data types.
            //
            // sourceDataType: String
            //    The source data type.
            //
            // targetDataType: String
            //    The target data type.
            //
            // converter: Object
            //    The class that performs the actual conversion.
            // tags:
            //    public
                var existingConverterMappings = this._converterMappings[sourceDataType];
                if (!existingConverterMappings) {
                //First registration of the sourceType, register a mapping object
                    existingConverterMappings = {};
                    this._converterMappings[sourceDataType] = existingConverterMappings;
                }
                //Add the specific target type to the mapping
                existingConverterMappings[targetDataType] = converter;
            },

            getConverters: function (/*String*/sourceDataType) {
            // summary:
            //    Gets an object with properties for the different registered converters for the given type.
            //
            // sourceDataType: String | Array of strings
            //    The source data type.

                var converters;

                if (lang.isArray(sourceDataType)) {

                    converters = array.map(sourceDataType, function (name) {

                        if (name in this._converterMappings) {
                            return this._converterMappings[name];
                        }
                    }, this);

                    converters = array.filter(converters, function (item) {
                        return item !== undefined;
                    }, this);

                    return converters;
                } else {
                // only one, but return as array
                    if (this._converterMappings[sourceDataType] === undefined) {
                        return undefined;
                    }
                    return [this._converterMappings[sourceDataType]];
                }


            },

            getConverter: function (/*String*/sourceDataType, /*String*/targetDataType) {
            // summary:
            //    Gets an a converter for the given types or null if no converter exists.
            //
            // sourceDataType: String
            //    String | Array of strings.
            //
            // targetDataType: String
            //    The target data type.

                var converters = this.getConverters(sourceDataType);
                var converter;

                if (converters === undefined) {
                    return null;
                }

                array.some(converters, function (item, i) {
                    if ((item[targetDataType])) {
                        converter = item[targetDataType];
                        return true;
                    }
                });
                return converter;
            }
        };
    });
