define("epi-cms/widget/ContentTypeService", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/when",
    "dojo/promise/all",

    // epi
    "epi/dependency",
    "epi/shell/TypeDescriptorManager"
],

function (
// dojo
    declare,
    array,
    lang,
    when,
    all,

    // epi
    dependency,
    TypeDescriptorManager
) {

    return declare(null, {
        // summary:
        //      A service for getting content types through content type store
        // tags:
        //      internal

        // contentTypeStore: [readonly] Store
        //      A REST store for interacting with ContentTypes.
        contentTypeStore: null,

        // _getavailabletypesQuery
        //     query to get all the requested types
        _getavailabletypesQuery: "getavailablecontenttypes",

        constructor: function () {
            this.contentTypeStore = this.contentTypeStore || dependency.resolve("epi.storeregistry").get("epi.cms.contenttype");
        },

        getAcceptedChildTypes: function (parentContentLink, isLocalAsset, requestedTypes, allowedTypes, restrictedTypes) {
            // summary:
            //      Returns the list of accepted child types for given contentLink. The list will be  filtered on based on requestedtypes and allowed/restricted types.
            //
            // parentContentLink: String
            //      The parent contentLink
            // isLocalAsset: Boolean
            //      Represents whether the child types will be local asset or not.
            // requestedTypes: Array
            //      The expected types (i.e epi.core.blockdata for all blocks)
            // allowedTypes: array
            //      The list of allowed types (retrieved from AllowedTypesAttribute.AllowedTypes metadata)
            // restrictedTypes: array
            //      The list of restricted types (retrieved from AllowedTypesAttribute.restrictedTypes metadata)
            // tags:
            //      internal

            var result = this.contentTypeStore.query({
                query: this._getavailabletypesQuery,
                localAsset: isLocalAsset,
                parentReference: parentContentLink,
                requestedTypes: requestedTypes
            });

            return this.filterQueryResult(result, allowedTypes, restrictedTypes);
        },

        filterQueryResult: function (result, allowedTypes, restrictedTypes) {
            // summary:
            //      Returns the filtered list result where filter is based on given allowed/restricted types.
            //
            // query: Object
            //      The returned array of models or promises from ContentTypeStore
            // allowedTypes: array
            //      The list of allowed types (retrieved from AllowedTypesAttribute.AllowedTypes metadata)
            // restrictedTypes: array
            //      The list of restricted types (retrieved from AllowedTypesAttribute.restrictedTypes metadata)
            // tags:
            //      internal

            return when(result).then(function (types) {
                // get the typeIdentifiers
                var availableTypeIdentifiers = array.map(types, function (type) {
                    return type.typeIdentifier;
                });

                // filter typeIdentifiers based on allowed/restricted types
                availableTypeIdentifiers = TypeDescriptorManager.getValidAcceptedTypes(availableTypeIdentifiers, allowedTypes, restrictedTypes);

                types = array.filter(types, function (type) {
                    return array.some(availableTypeIdentifiers, function (typeIdentifier) {
                        return type.typeIdentifier === typeIdentifier;
                    });
                });

                return types;
            });
        }
    });
});
