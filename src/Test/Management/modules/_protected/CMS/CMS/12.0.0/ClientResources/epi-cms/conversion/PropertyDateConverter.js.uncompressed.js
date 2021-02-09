define("epi-cms/conversion/PropertyDateConverter", [
    "dojo/_base/declare"
],
function (
    declare
) {

    return declare(null, {
        // summary:
        //    Converts PropertyDate value to runtime Date according to epi/datetime rules
        //
        // tags:
        //    internal

        sourceDataType: "epi.cms.propertydate",
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

            if (data && sourceDataType === this.sourceDataType && targetDataType === this.targetDataType) {
                return new Date(data);
            }

            return null;
        }
    });
}
);
