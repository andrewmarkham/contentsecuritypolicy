define("epi/shell/MessageService", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/store/Memory",
    "dojo/store/Observable"
], function (
    declare,
    lang,
    Memory,
    Observable
) {

    return declare(null, {
        // summary:
        //     Manage messages
        //
        // tags:
        //      public

        _store: null,
        _idIndex: 0,

        constructor: function (params) {
            lang.mixin(this, params);

            // create new store
            var _memoryStore = new Memory({
                idAttribute: "id",
                data: []
            });
            this._store = new Observable(_memoryStore);
        },

        put: function (/*String*/typeName, /*String*/message, /*String*/contextTypeName, /*Object*/contextId, /*Object*/externalItemId, /*Object*/externalItemData) {
            //  summary:
            //      Create a new message
            //
            //  typeName:
            //      Types of message, ie "error", "warn"
            //
            //  message:
            //      The message content
            //
            //  contextTypeName:
            //      Types of context that message belong to, ie "Page" or "Block"
            //
            //  contextId:
            //      The identity of "Page" or "Block" that message belong to
            //
            //  externalItemId:
            //      Reference id to reference the item with
            //
            //  externalItemData:
            //      Reference data

            return this._store.put({
                id: ++this._idIndex,
                typeName: typeName,
                message: message,
                contextTypeName: contextTypeName,
                contextId: contextId,
                externalItemId: externalItemId,
                externalItemData: externalItemData
            });
        },

        query: function (/*Object?*/query) {
            //  summary:
            //      Query for messages
            //
            //  query:
            //      An object which can include parameters: messageType, contextTypeName, contextId, externalItemId or externalItemData
            //
            //  returns:
            //      The query result
            //
            return this._store.query(query);
        },

        observe: function (/*Object?*/query, callback) {
            //  summary:
            //      Add observer for a query
            //
            //  query:
            //      An object which can include parameters: messageType, contextTypeName, contextId, externalItemId or externalItemData
            //
            //  returns:
            //      An observe handle
            //
            return this.query(query).observe(callback);
        },

        remove: function (/*Object?*/query) {
            //  summary:
            //      Removes all items that matches the query
            //
            //  query:
            //      An object which can include parameters: messageType, contextTypeName, contextId, externalItemId or externalItemData
            //
            //  returns:
            //      The list of removed items
            //
            var items = this.query(query);

            items.forEach(function (item) {
                this._store.remove(item.id);
            }, this);

            return items;
        }
    });
}
);
