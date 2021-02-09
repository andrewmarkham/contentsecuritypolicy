define("epi-cms/contentediting/ContentEditingValidator", [
    "dojo",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/store/Memory",

    "dojo/Stateful",

    "epi/dependency"
],
function (
    dojo,
    array,
    declare,
    Deferred,
    lang,
    connect,
    Memory,

    Stateful,

    dependency
) {

    return declare([Stateful], {
        // tags:
        //      internal

        // contextTypeName: String
        //      Name of context type used to partitioning messages in message service
        contextTypeName: "",

        // contextId: Object
        //      Id of context used to partitioning messages in message service
        contextId: null,

        messageService: null,
        _isBlocking: false,

        // isValid: Boolean
        //      Indicates if this validator is valid without any validation errors (no error or warn messages)
        isValid: true,

        // hasErrors: Boolean
        //      Indicates if there are any errors (only errors, warn not included)
        hasErrors: false,

        _storeId: 0,
        _store: null,

        // NOTE: this maps to server side enum
        severity: {
            none: 0,
            info: 1,
            warn: 2,
            error: 3
        },

        validationSource: {
            server: 1,
            client: 2
        },

        // hash map for levels
        _errorLevels: {},

        constructor: function (params) {
            declare.safeMixin(this, params);
        },

        postscript: function () {
            this.inherited(arguments);

            // map error types to hash map for levels
            for (var p in this.severity) {
                var enumValue = this.severity[p];
                this._errorLevels[enumValue] = p;
            }

            this.messageService = this.messageService || dependency.resolve("epi.shell.MessageService");

            // create new store
            this._store = new Memory({
                idAttribute: "id",
                data: []
            });
        },

        setContextId: function (contextId) {

            var oldContextId = this.contextId;
            this.contextId = contextId;

            // update new context to items in messageservice
            var items = this.messageService.query({ contextTypeName: this.contextTypeName, contextId: oldContextId });
            items.forEach(lang.hitch(this, function (item) {
                item.contextId = this.contextId;
                this.messageService.put(item);
            }));
        },

        clearPropertyErrors: function (propertyName, source) {

            // must have a property name
            if (!propertyName) {
                return;
            }

            // removes all error for a specific property
            this._clearErrors(propertyName, source);
        },

        setPropertyErrors: function (propertyName, errorMessages, source) {

            // must have a property name
            if (!propertyName) {
                return;
            }

            // sets property errors for a specific property
            this._setErrors(errorMessages, propertyName, source);
        },

        clearGlobalErrors: function (source) {
            // removes all global errors
            this._clearErrors(null, source);
        },

        clearErrorsBySource: function (source) {
            // removes all errors for a source type
            this._clearErrors(undefined, source);
        },

        setGlobalErrors: function (errorMessages, source) {
            // sets property errors for a specific property
            this._setErrors(errorMessages, null, source);
        },

        _clearErrors: function (propertyName, source) {
            var query;

            if (propertyName) {
                query = { propertyName: propertyName };
            } else if (propertyName === null) {
                query = { global: true };
            } else {
                query = {};
            }

            // if source is given then use it
            if (source) {
                query.source = source;
            }

            var items = this._store.query(query);
            items.forEach(lang.hitch(this, function (item) {
                this.messageService.remove({ id: item.messageId });
                this._store.remove(item.id);
            }));

            this._updateFlags();
        },

        _setErrors: function (errorMessages, propertyName, source) {
            this._clearErrors(propertyName, source);
            array.forEach(errorMessages, function (item) {
                this._putStoreItem(item, propertyName, source);
            }, this);

            this._updateFlags();
        },

        _putStoreItem: function (item, propertyName, source) {
            // puts an item in validation store

            var severityName = "";

            // get type name
            if (this._errorLevels[item.severity]) {
                severityName = this._errorLevels[item.severity];
            }

            var messageId = this.messageService.put(severityName, item.errorMessage, this.contextTypeName, this.contextId);

            var storeItem = {
                id: this._storeId++,
                item: item,
                severity: item.severity,
                messageId: messageId
            };

            // property or global?
            if (propertyName) {
                storeItem.propertyName = propertyName;
            } else {
                storeItem.global = true;
            }

            if (source !== undefined) {
                storeItem.source = source;
            }

            return this._store.put(storeItem);
        },

        _updateFlags: function () {
            // update isValid property
            var errorItems = this._store.query({ severity: this.severity.error });
            var warnItems = this._store.query({ severity: this.severity.warn });
            var isValid = errorItems.length === 0 && warnItems.length === 0;
            var hasErrors = errorItems.length > 0;
            this.set("isValid", isValid);
            this.set("hasErrors", hasErrors);
        },

        validate: function () {
            // summary:
            //      Queries message service by error type and warning type to indicates content is valid or not
            // tags:
            //      public

            var error = this.severity.error,
                deferred = new Deferred();

            Deferred.when(
                this._validate(error),
                function (hasServerSideErrors) {
                    if (hasServerSideErrors) {
                        // defaults behaviour: show notification tooltipdialog when has any error(s)
                        connect.publish("/epi/cms/action/showerror");
                    }
                    deferred.resolve(hasServerSideErrors);
                },
                function () {
                    // defaults behaviour: show notification tooltipdialog when has any error(s)
                    connect.publish("/epi/cms/action/showerror");
                    deferred.reject();
                }
            );

            return deferred;
        },

        _validate: function (severity) {
            // summary:
            //      Queries message service by error type to indicates content is valid or not
            // severity: Enum
            //      Type of error
            // tags:
            //      Private

            var deferred = new Deferred();

            if (!this._isBlocking) {
                Deferred.when(this._store.query({ severity: severity }), lang.hitch(this, function (errorMessages) {

                    var clientSideErrors = array.filter(errorMessages, function (item) {
                        return item.source === this.validationSource.client;
                    }, this);

                    var hasClientSideErrors = clientSideErrors.length > 0;
                    var hasServerSideErrors = errorMessages.length > clientSideErrors.length;

                    if (hasClientSideErrors) {
                        deferred.reject();
                    } else {
                        deferred.resolve(hasServerSideErrors);
                    }
                }));
            }

            return deferred;
        }
    });
});
