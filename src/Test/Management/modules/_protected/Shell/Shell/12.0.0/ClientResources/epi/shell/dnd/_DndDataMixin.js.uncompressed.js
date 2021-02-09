define("epi/shell/dnd/_DndDataMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",

    //EPi Framework
    "epi/dependency",
    "epi/shell/conversion/ObjectConverterRegistry"

],
function (
    array,
    declare,

    dependency,
    ObjectConverterRegistry) {

    return declare(null, {
        // summary:
        //      Mixin used to extract dnd data from the dnd sources
        // tags:
        //      internal

        // _converterRegistry: Object
        //      Registry of all available dnd converters
        // tags:
        //      protected

        _checkAcceptanceForItems: function (items, acceptedTypes) {
            // summary:
            //		Checks if the target can accept the items.
            // items: Array
            //		The list of items to check for acceptance.
            // acceptedTypes: object
            //		An object that contains properties matching the accepted types.

            return array.every(items, function (item) {
                return this._acceptsTypeWithoutConversion(item.type, acceptedTypes) ||
                    this._converterExistsForAnyType(item.type, acceptedTypes);
            }, this);
        },

        _acceptsTypeWithoutConversion: function (/*array*/types, acceptedTypes) {
            var flag = false;
            for (var j = 0; j < types.length; ++j) {
                if (types[j] in acceptedTypes) {
                    flag = !!acceptedTypes[types[j]];
                    break;
                }
            }
            return flag;
        },

        _converterExistsForAnyType: function (types, acceptedTypes) {
            for (var j = 0; j < types.length; ++j) {
                for (var type in acceptedTypes) {
                    if (ObjectConverterRegistry.getConverter(types[j], type)) {
                        return !!acceptedTypes[type];
                    }
                }
            }
            return false;
        },

        _getDndData: function (item, acceptedTypes, internalDrop) {
            // summary:
            //      Get the Dnd data for the node from the source
            // item: object
            //      The node to get the dnd data for
            // acceptedTypes: object
            //		An object that contains properties matching the accepted types.
            // internalDrop: boolean
            //      If this is an internal drop within the same widget or not.
            // tags:
            //      protected

            if (!item || !item.data) {
                return null;
            }

            var dndData = null;

            //If the data has a dndData property this is considered to be the data object since
            //the data object itself might be a draggable widget.
            var data = item.data.dndData || item.data;

            var normalizedData = null;

            if (this._acceptsTypeWithoutConversion(item.type, acceptedTypes)) {
                normalizedData = { type: item.type, data: data, options: item.options };
                dndData = normalizedData;
            } else {
                for (var type in acceptedTypes) {
                    var converter = ObjectConverterRegistry.getConverter(item.type, type);
                    if (converter) {
                        normalizedData = { type: [type] };
                        normalizedData.data = converter.convert(item.type, type, data);
                        normalizedData.options = item.options;
                        dndData = normalizedData;

                        break;
                    }
                }
            }

            // Don't assign converted data on internal move or copy
            if (!internalDrop) {
                //We assign the object containing the converted type and the converted data
                //to the original object since we need to access this in the original onDrop
                //and creator methods. We do not have access to the converted data there otherwise.
                //This might remove the need for a onDropData method.
                item.data.getNormalizedData = function () {
                    return normalizedData;
                };
            }
            return dndData;
        }
    });
});
