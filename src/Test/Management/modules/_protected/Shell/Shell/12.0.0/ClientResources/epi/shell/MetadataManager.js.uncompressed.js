define("epi/shell/MetadataManager", [
    "dojo/_base/declare",
    "dojo/_base/json",
    "dojo/Deferred",
    "dojo/when",
    "epi/dependency",
    "./PropertyMetadata"
], function (declare, json, Deferred, when, dependency, PropertyMetadata) {

    return declare(null, {
        // summary:
        //     Manage metadata that build a form
        //
        // tags:
        //      public

        store: null,

        _setTypeMetadataStore: function () {
            // summary:
            //     Sets up the default store used to communicate with the server.

            var registry = dependency.resolve("epi.storeregistry");
            this.store = registry.get("epi.shell.metadata");
        },

        getMetadataForType: function (type /*string*/, params /*object*/) {
            // summary:
            //     Returns a <see cref="dojo/Deferred" /> promise, which in turn returns a metadata object
            //     that can be used to create a UI to edit the object type.
            //
            // type: String
            //     The object type to return metadata for. For example:
            //     EPiServer.Shell.ViewComposition.Containers.BorderContainer
            //
            // params: Object
            //     Additional parameters to create metadata. For example:
            //     PageMetadataProvider needs a PageData instance when creating its metadata, then we provide pageGuid and pageLang here.

            function onItem(metaData) {
                return metaData ? new PropertyMetadata(metaData) : metaData;
            }

            if (this.store === null) {
                this._setTypeMetadataStore();
            }

            if (params) {
                var def = new Deferred();
                when(this.store.query({ id: type, modelAccessor: json.toJson(params) }), function (metadata) {
                    if (metadata && metadata.length) {
                        def.resolve(onItem(metadata[0]));
                    } else {
                        def.reject();
                    }
                }, function (error) {
                    def.reject(error);
                });
                return def.promise;
            } else {
                return when(this.store.get(type), onItem);
            }
        },

        _clear: function () {
            this.store = null;
        }

    });
});
