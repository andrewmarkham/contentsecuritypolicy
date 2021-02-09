define("epi-cms/conversion/ContentReferenceConverter", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "epi/dependency",
    "epi/UriParser",
    "epi-cms/core/ContentReference"
], function (declare, lang, when, dependency, UriParser, ContentReference) {

    return declare(null, {
        // summary:
        //    Converts data between default content containing an URI as a specifyer and a version unspecific content reference.
        //
        // tags:
        //    internal

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

            if (!data || (!data.uri && !data.contentLink)) {
                return null;
            }

            var contentLink;
            if (data.uri) {
                var uri = new UriParser(data.uri);
                contentLink = uri.getId();
            } else {
                contentLink = data.contentLink;
            }

            return new ContentReference(contentLink).createVersionUnspecificReference().toString();
        }
    });
});
