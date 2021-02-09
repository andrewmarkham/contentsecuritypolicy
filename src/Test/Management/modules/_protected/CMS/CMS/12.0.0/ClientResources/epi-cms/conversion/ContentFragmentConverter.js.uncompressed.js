define("epi-cms/conversion/ContentFragmentConverter", ["dojo/_base/declare"], function (declare) {

    return declare([], {
        // summary:
        //      Converts data from a content data object to an object that
        //      contains only those properties required by content fragments.
        // tags:
        //      internal

        convert: function (sourceType, targetType, data) {
            // summary:
            //      Converts data to a content fragment object.
            // data: Object
            //      The object to be converted to a content fragment.
            // tags:
            //      public

            if (!data) {
                return null;
            }

            return {
                contentLink: data.contentLink,
                name: data.name,
                typeIdentifier: data.typeIdentifier,
                id: data.id
            };
        }
    });
});
