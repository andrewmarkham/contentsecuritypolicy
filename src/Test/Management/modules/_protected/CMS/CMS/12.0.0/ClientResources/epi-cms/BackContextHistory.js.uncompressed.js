define("epi-cms/BackContextHistory", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/store/Memory",

    "epi/shell/ContextHistory",
    "epi/shell/ViewSettings"
],
function (
    declare,
    lang,
    topic,

    Memory,

    ContextHistory,
    ViewSettings
) {

    return declare([ContextHistory], {
        // summary:
        //      Context history for back only action
        // tags:
        //      internal

        createStore: function () {
            // summary:
            //      Create new store
            // tags:
            //      override

            return new Memory({
                data: [],
                idProperty: "uri"
            });
        },

        onContextChanged: function (response, callerData, request) {
            // summary:
            // tags:
            //      override

            if (callerData && callerData.trigger === "back") {
                this._removeLastItem();
                return;
            }

            this.inherited(arguments);
        },

        closeAndNavigateBack: function (sender) {
            // summary:
            //      Removes the last context and all other same kind of context items from the history and issue change context request with the last item
            // tags:
            //      public

            var lastItem = this._getLastItem();

            // remove the item and same type of context from the history
            var historyToRemove = this.store.data.filter(function (item) {
                return lastItem.typeIdentifier && (lastItem.typeIdentifier === item.typeIdentifier);
            });

            historyToRemove.forEach(function (item) {
                var identity = this.store.getIdentity(item);
                this.store.remove(identity);
            }, this);

            var contextToNavigate = this._getLastItem();
            var uri = contextToNavigate && contextToNavigate.uri ? { uri: contextToNavigate.uri } : { uri: ViewSettings.settings.defaultContext };
            topic.publish("/epi/shell/context/request", uri, { sender: sender });
        },

        getPrevious: function () {
            // summary:
            //      Return previous content of currently loaded content.
            // tags:
            //      public

            var results = this.store.query({}, {
                count: 2, // Get current content and previous content
                sort: [{
                    attribute: "dateAdded",
                    descending: true
                }]
            });

            // Get previous content from sorted descending array.
            return (results && results.length > 1) ? results[1] : null;
        },

        _updateStore: function (response) {
            var lastItem = this._getLastItem();
            if (lastItem && lastItem.uri === response.versionAgnosticUri) {
                return;
            }

            this.inherited(arguments);
        },

        _getLastItem: function () {
            // summary:
            //     Returns the just previously added item from the store
            // tags:
            //      protected

            if (this.store && this.store.data && this.store.data.length > 0) {
                var sortedItemList = this.store.query({}, {sort: [{attribute: "dateAdded", descending: true}]});
                return sortedItemList[0];
            }

            return null;
        },

        _removeLastItem: function () {
            // summary:
            //     Removes the last added item from the store
            // tags:
            //      protected

            var lastItem = this._getLastItem();
            if (lastItem) {
                this.store.remove(this.store.getIdentity(lastItem));
            }
        }
    });
});
