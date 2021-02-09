define("epi-cms/contentediting/ContentHierarchyService", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "dojo/Deferred",
    "dojo/promise/all",

    // epi
    "epi/dependency",
    "epi/shell/DialogService",
    "epi-cms/core/ContentReference"
], function (
// dojo
    declare,
    lang,
    when,
    Deferred,
    all,

    // epi
    dependency,
    dialogService,
    ContentReference
) {

    return declare([], {
        // summary:
        //      A service for interacting with the content hierarchy
        // tags:
        //      internal

        // store: [readonly] Store
        //      A REST store for interacting with content items.
        store: null,

        constructor: function (params) {
            declare.safeMixin(this, params);

            this.store = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
        },

        move: function (sourceIds, targetId, createAsLocalAsset, sortIndex) {
            // summary:
            //		Move one or several content items from one parent to another.
            // sourceIds: ContentReference || ContentReference[]
            //      The items that should be copied or moved
            // targetId: ContentReference
            //      The target item for the operation
            // createAsLocalAsset: Boolean
            //      If set to true the items will be added to the targets asset folder
            // sortIndex: Number
            //      Optional sortIndex in the child collection of the new parent
            // returns: Response object
            //      An object indicating the result of the operation
            //
            // tags: public

            return this._execute("MoveMany", sourceIds, targetId, createAsLocalAsset, sortIndex);
        },

        copy: function (sourceIds, targetId, createAsLocalAsset, sortIndex) {
            // summary:
            //		Copies one or several  content items from one parent to another.
            // sourceIds: ContentReference || ContentReference[]
            //      The items that should be copied or moved
            // targetId: ContentReference
            //      The target item for the operation
            // createAsLocalAsset: Boolean
            //      If set to true the items will be added to the targets asset folder
            // sortIndex: Number
            //      Optional sortIndex in the child collection of the new parent
            // returns: Response object
            //      An object indicating the result of the operation
            //
            // tags: public

            return this._execute("CopyMany", sourceIds, targetId, createAsLocalAsset, sortIndex);
        },

        _execute: function (method, sourceIds, targetId, createAsLocalAsset, sortIndex) {
            // summary:
            //		Calls the store to execute the defined method.
            //
            // tags: private

            var params = {
                ids: sourceIds instanceof Array ? sourceIds : [sourceIds],
                targetId: targetId + "",
                createAsLocalAsset: createAsLocalAsset,
                sortIndex: sortIndex
            };

            return this.store.executeMethod(method, null, params)
                .then(this._checkForErrors.bind(this))
                .then(this._handleUpdates.bind(this));
        },

        _checkForErrors: function (response) {
            // summary:
            //		Extracts failed operations from the response and id any shows
            //      an error dialog.
            //
            // tags: private

            var deferred = new Deferred(),
                errors = this.store.getAllResponsesWithError(response).map(function (error) {
                    return error.message;
                });

            if (errors.length > 0) {
                dialogService.alertWithErrors({}, errors).then(function () {
                    deferred.resolve(response);
                });
            } else {
                deferred.resolve(response);
            }

            return deferred.promise;
        },

        _handleUpdates: function (response) {
            // summary:
            //		Uses the response items to refresh items in the store
            //      and notify listeners of the changes.
            //
            // tags: private

            var store = this.store,
                itemsToNotify = this._getUpdatesFromResponse(response);

            return all(itemsToNotify.map(function (item) {
                var id = ContentReference.toContentReference(item.extraInformation).createVersionUnspecificReference().toString();
                return store.refresh(id, true);
            })).then(function (items) {
                items.forEach(function (item) {
                    store.notify(item, store.getIdentity(item));
                });

                return response;
            });
        },

        _getUpdatesFromResponse: function (response) {
            // summary:
            //		Extracts all successful changes from the response.
            //
            // tags: private

            var items = response.extraInformation,
                itemsToNotify = [];

            Object.keys(items).forEach(function (id) {
                var item = items[id];
                if (item.statusCode === 200) {
                    itemsToNotify.push(item);
                }
            });

            return itemsToNotify;
        }
    });
});
