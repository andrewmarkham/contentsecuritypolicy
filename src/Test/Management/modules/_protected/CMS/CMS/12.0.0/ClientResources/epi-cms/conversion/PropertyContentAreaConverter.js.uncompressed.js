define("epi-cms/conversion/PropertyContentAreaConverter", [
    "dojo/_base/declare"
],
function (declare) {

    return declare(null, {
        // summary:
        //    Converts propertyContentArea. Checks if the data is located in the _unparsedString
        //
        // tags:
        //    internal

        sourceDataType: "epi.cms.propertycontentarea",
        targetDataType: "runtimeType",

        registerDefaultConverters: function (/*Object*/registry) {
            // summary:
            //    Registers the type conversions that this class supports to the given registry.
            //
            // registry: Object
            //    The converter registry to add mappings to.
            registry.registerConverter(this.sourceDataType, this.targetDataType, this);
        },

        convert: function (/*String*/sourceDataType, /*String*/targetDataType, /*Object*/data) {
            // summary:
            //    Converts data between two types.
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

            if (sourceDataType === this.sourceDataType && targetDataType === this.targetDataType) {
                return data ? data._unparsedString : data;
            }

            return null;
        }
    });
}
);
