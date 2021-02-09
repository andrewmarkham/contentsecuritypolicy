define("epi-cms/conversion/ContentLightUriConverter", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "epi/dependency",
    "epi/UriParser",
    "epi-cms/core/ContentReference"
], function (declare, lang, when, dependency, UriParser, ContentReference) {

    return declare(null, {
        // summary:
        //    Converts data between light weight content types containing an URI as a specifier and other types.
        //
        // tags:
        //    internal

        _contentStore: null,

        constructor: function (params) {
            // summary:
            //    The constructor function
            //
            // params: Object
            //    The parameters that define the object.
            // tags:
            //    public

            lang.mixin(this, params);

            this._contentStore = this._contentStore || dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
        },

        registerDefaultConverters: function (/*Object*/registry) {
            // summary:
            //    Registers the type conversions that this class supports to the given registry.
            //
            // registry: Object
            //    The converter registry to add mappings to.
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
            // data: Object
            //    The data to convert.
            // tags:
            //    public

            if (!data || (!data.contentLink && !data.uri)) {
                return null;
            }

            var contentLink = data.contentLink || new UriParser(data.uri).getId();

            if (!contentLink) {
                return null;
            }

            contentLink = new ContentReference(contentLink).createVersionUnspecificReference().toString();

            return when(this._contentStore.get(contentLink), function (content) {
                return {
                    url: content.publicUrl,
                    previewUrl: content.previewUrl,
                    permanentUrl: content.permanentLink,
                    text: content.name,
                    typeIdentifier: content.typeIdentifier
                };
            });
        }
    });
});
