define("epi-cms/contentediting/ContentModelServerSync", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/when",
    "dojo/_base/json",
    "dojo/Stateful",

    "epi/assign",
    "epi/datetime",
    "epi/string",
    "epi/shell/postMessage",

    "./ContentActionSupport"
],

function (
    array,
    declare,
    Deferred,
    when,
    json,
    Stateful,

    assign,
    epiDateTime,
    epiString,
    postMessage,

    ContentActionSupport) {

    return declare([Stateful], {
        // tags:
        //    internal

        // _queue: [private] Array
        //      The queue of updates to send
        _queue: null,

        // _isSynchronizing: [private] Boolean
        //      Set to true while we're synchronizing
        _isSynchronizing: false,

        // hasPendingChanges: Boolean
        hasPendingChanges: false,

        // contentLink: String
        //      Reference to the content this sync service instance is saving changes to
        contentLink: null,

        // _oldContentLink: [private] String
        //      Old reference to the content this sync service instance is saving changes to
        _oldContentLink: null,

        // contentDataStore: RestStore
        //      Reference to the content data store
        contentDataStore: null,

        // processInterval: Number
        //      How often (in milliseconds) should we check the queue to see if there's any items to be synced
        processInterval: 200,

        // _processIntervalId: [private] Number
        //      Id of the interval to check queue, will only be set when save() has been called
        _processIntervalId: 0,

        _saveDeferred: null,

        _postMessage: null,

        constructor: function (params) {
            // summary:
            //      init array
            // tags:
            //      private

            declare.safeMixin(this, params);

            // init queue
            this._queue = [];

            this._postMessage = this._postMessage || postMessage;
        },

        _contentLinkSetter: function (newContentLink) {
            // summary:
            //      Sets the content link property and saves the previous value to be used when saving
            // newContentLink:
            //      The value of the new content link
            // tags:
            //      public

            this._oldContentLink = this.contentLink;
            this.contentLink = newContentLink;
        },

        scheduleForSync: function (/*String*/propertyName, /*String|Object*/value) {
            // summary:
            //      Put property update in queue
            // propertyName:
            //      Name of the property
            // value:
            //      The value of the property
            // tags:
            //      public

            if (value === undefined) {
                return;
            }

            this.set("hasPendingChanges", true);
            value = epiDateTime.transformDate(value);

            var index = this._propertyIndexInQueue(propertyName);

            if (index < 0) {
                // add item to queue
                this._queue.push({
                    name: propertyName,
                    value: value
                });
            } else {
                // update item value
                this._queue[index].value = value;
            }
        },

        saveProperty: function (propertyName, value, saveAction) {
            // summary:
            //      Save a property value to the current version with a given saveAction
            // propertyName: String
            //      The property name.
            // value: Object
            //      The updated value.
            // saveAction: SaveAction
            //      The action to trigger.

            this.scheduleForSync(propertyName, value);
            return this._startSynchronizeInterval({ delay: 0,  action: saveAction });
        },

        _propertyIndexInQueue: function (/*String*/propertyName) {

            var index = -1;

            // find item in queue
            array.some(this._queue, function (item, i) {
                if (item.name === propertyName) {
                    index = i;
                    return true;
                }
            });

            return index;
        },

        save: function () {
            // summary:
            //      Save updates to server
            // tags:
            //      public

            return this._startSynchronizeInterval();
        },

        _startSynchronizeInterval: function (settings) {

            var delay;

            if (!this._saveDeferred) {
                this._saveDeferred = new Deferred();
                delay = settings && settings.delay || this.processInterval;
                setTimeout(this._synchronizeItem.bind(this, settings), delay);
            }

            return this._saveDeferred.promise;
        },

        _synchronizeItem: function (settings) {
            // summary:
            //      Save updates to server
            // tags:
            //      private

            var items = this._queue,
                syncContentLink = this.contentLink,
                saveDeferred = this._saveDeferred;

            // Reset the queue and promise
            this._queue = [];
            this._saveDeferred = null;

            // Set hasPendingChanges to false since we have emptied the queue.
            this.set("hasPendingChanges", false);

            // Success callback
            var onSuccess = function (result) {

                var defResult = {},
                    savedLink;

                if (result) {
                    //Convert the property names to camel case
                    array.forEach(result.properties, function (property) {
                        property.name = epiString.pascalToCamel(property.name);
                    }, this);

                    savedLink = result.savedContentLink;

                    //Create def result object
                    defResult = assign({
                        successful: false,
                        contentLink: result.savedContentLink,
                        hasContentLinkChanged: this._hasContentLinkChanged(result)
                    }, result);

                    if (savedLink && savedLink !== this.contentLink) {
                        // If the server saved to another version than we anticipated
                        this.set("contentLink", savedLink);
                    }

                    defResult.oldContentLink = this._oldContentLink;
                    this._oldContentLink = null;

                    this._publishContentSavedMessage(defResult);

                    saveDeferred.resolve(defResult);
                } else {
                    saveDeferred.reject({
                        contentLink: syncContentLink,
                        properties: items,
                        error: "Unexpected result returned from the server."
                    });
                }
            }.bind(this);

            // Failure callback
            var onError = function (error) {

                var defResult = {
                    contentLink: syncContentLink,
                    properties: items,
                    error: error
                };

                saveDeferred.reject(defResult);
            }.bind(this);

            if (items.length === 0) {
                saveDeferred.resolve();
                return;
            }

            when(this._saveProperties(items, settings))
                .then(onSuccess)
                .otherwise(onError);
        },

        _hasContentLinkChanged: function (result) {
            // additional check to see if someone updated contentlink on the sync service before saving pending changes.
            var hasChanged = this._oldContentLink && this._oldContentLink !== this.contentLink;
            return result.savedContentLink && result.savedContentLink !== this.contentLink || hasChanged;
        },

        _publishContentSavedMessage: function (result) {
            // Publish one global event for this contentLink
            this._postMessage.publish("contentSaved", { contentLink: result.contentLink});
            // Keep publishing with the beta name until the next major.
            this._postMessage.publish("beta/contentSaved", result);
        },

        pendingSync: function (propertyName) {
            // summary:
            //      Check if there is any pending synchronization for the property with propertyName
            //
            // propertyName: String
            //      The name of the property to check for
            //
            // returns:
            //      True if there are pending synchronizations, otherwise False
            // tags:
            //      public
            return this._propertyIndexInQueue(propertyName) !== -1;
        },

        _saveProperties: function (items, settings) {
            // summary:
            //    Validate property value with server.
            //
            // propertyName: String
            //    The updated property name.
            //
            // propertyValue: String
            //    The property value.
            //
            // timestamp: String
            //    The client timestamp.
            //
            // returns:
            //	  A deferred
            //
            // tags:
            //    public

            var contentLink = this.contentLink,
                properties = {};

            array.forEach(items, function (item) {
                properties[item.name] = json.toJson(item.value);
            });

            var patchData = {
                id: contentLink,
                properties: properties,
                action: settings ? settings.action : ContentActionSupport.saveAction.Save | ContentActionSupport.saveAction.SkipValidation
            };

            return this.contentDataStore.patch(patchData, { id: patchData.id });
        }
    });
});
