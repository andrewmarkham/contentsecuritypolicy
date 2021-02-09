define("epi/shell/ContextHistory", [
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/store/Memory",
    "dojo/store/Observable",

    "dojo/topic"
],
function (
    declare,
    lang,

    Memory,
    Observable,

    topic
) {
    return declare(null, {
        // summary:
        //      Manages the context history.
        //
        // tags:
        //      internal

        store: null,

        constructor: function (params) {
            lang.mixin(this, params);

            this.store = Observable(this.createStore());
        },

        postscript: function () {
            topic.subscribe("/epi/shell/context/changed", lang.hitch(this, this.onContextChanged));
        },

        onContextChanged: function (response, callerData, request) {
            if (this._canExecute(callerData)) {
                this._updateStore(response);
            }
        },

        createStoreItem: function (/*Object*/response) {
            // summary:
            //      Create new object that will be put to store
            // tags:
            //      protected

            return {
                publicUrl: response.publicUrl,
                id: response.versionAgnosticUri,
                uri: response.versionAgnosticUri,
                name: response.name,
                typeIdentifier: response.dataType,
                dateAdded: new Date()
            };
        },

        createStore: function () {
            // summary:
            //      Create new store
            // tags:
            //      protected

            return new Memory({
                data: [],
                idProperty: "uri"
            });
        },

        _canExecute: function (/*Object*/callerData) {
            // summary:
            //      Valid conditions to update store
            // tags:
            //      protected

            return callerData && callerData.trigger !== "internal";
        },

        _updateStore: function (/*Object*/response) {
            // summary:
            //      Add data to context store
            //      Keep total items in store always 100
            // tags:
            //      private

            var newItem = this.createStoreItem(response);

            this.store.put(newItem, { overwrite: true });

            // If the store contains more than 100 items, remove the oldest one
            if (this.store.data.length > 100) {
                this.store.data.shift();
            }
        }
    });
});
