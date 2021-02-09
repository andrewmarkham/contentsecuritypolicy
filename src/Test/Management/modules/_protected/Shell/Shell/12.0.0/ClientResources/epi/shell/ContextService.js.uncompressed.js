define("epi/shell/ContextService", [
// Dojo
    "dojo",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/topic",
    "dojox/html/entities",
    "dijit/Destroyable",

    // EPi
    "epi",
    "epi/dependency",
    "epi/shell/DialogService",
    "epi/UriParser",

    // Resources
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.ContextService"
], function (
// Dojo
    dojo,
    array,
    declare,
    lang,
    Deferred,
    all,
    topic,
    entities,
    Destroyable,

    // EPi
    epi,
    dependency,
    dialogService,
    UriParser,

    // Resources
    res
) {

    return declare([Destroyable], {
        // tags:
        //      public

        currentContext: null,
        _contextStore: null,
        _profile: null,

        // _routes: dictionary
        //    Map of routes, which defines redirect action for types(block, page data context for instance) on context changed.
        _routes: {},

        res: res,

        _requestQueue: null,

        _requestInterceptors: null,

        _dialogService: null,

        constructor: function (contextStore, profile, dlgService) {
            this._contextStore = contextStore;

            if (profile === undefined) {
                this._profile = dependency.resolve("epi.shell.Profile");
            }

            this._requestInterceptors = [];
            this._requestQueue = [];
            this._dialogService = dlgService || dialogService;

            this._initialize();
        },

        _initialize: function () {
            this.own(
                topic.subscribe("/epi/shell/context/request", lang.hitch(this, this._handleContextChangeRequest)),
                topic.subscribe("/epi/shell/context/updateRequest", lang.hitch(this, this._handleContextUpdateRequest)),
                topic.subscribe("/epi/shell/context/requestcurrent", lang.hitch(this, this._handleRequestCurrentContext))
            );
        },

        registerRoute: function (identifier, callback) {
            // summary:
            //      Registers route, to process redirect action for a specific identifier(block or page context type) when context changed.
            //
            // identifier: Object
            //      A specific identifier(block or page context type)
            //
            // callback: callback function
            //      Function that would be invoked for identifier, to process redirect action.
            //
            // tags:
            //      Public

            this._routes[identifier] = callback;
        },

        registerRequestInterceptor: function (interceptor) {
            // adds an object that's dependent on blocking request context
            var index = array.indexOf(this._requestInterceptors, interceptor);

            if (index === -1) {
                this._requestInterceptors.push(interceptor);
            }

            // return object to that can be used to un-register the interceptor
            return {
                remove: lang.hitch(this, function () {
                    this.unregisterRequestInterceptor(interceptor);
                })
            };
        },

        unregisterRequestInterceptor: function (interceptor) {
            // removes an object that's dependent on blocking request context

            var index = array.indexOf(this._requestInterceptors, interceptor);
            if (index !== -1) {
                this._requestInterceptors.splice(index, 1);
                return interceptor;
            }
            return null;
        },

        query: function (query) {
            // summary:
            //      Query the context store with the given query
            //      All registered request interceptors will run before the query is sent to the server
            // query: Object
            //      The query to execute
            // tags:
            //      public

            return this._executeInterceptors(query, {})
                .then(lang.hitch(this, function () {
                    return this._getContextStore().query(query);
                }));
        },

        _handleContextChangeRequest: function (newContextParameters, callerData) {
            // Handles a context change request and publishes a contextChanged event if successful.

            if (newContextParameters === null) {
                //If we are trying to switch to a unknown context (null)
                //Set the current contex to an empty object and publish the context change anyway
                this.currentContext = {};
                this._publishContextChanged(this.currentContext);
                return;
            }

            //Execute the interceptors and then fire the callbacks
            this._executeInterceptors(newContextParameters, callerData).then(lang.hitch(this, function () {
                this._loadNewContext(newContextParameters, callerData, this._publishContextChanged);
            })).otherwise(lang.hitch(this, function () {
                this._publishRequestFailed(newContextParameters, callerData);
            }));
        },

        _executeInterceptors: function (context, callerData) {
            // summary:
            //      Execute all registered request interceptors
            // returns:
            //      Promise
            // tags:
            //      private

            var interceptors = array.map(this._requestInterceptors, function (item) {
                // call the interceptors with the params
                // must return a deferred
                return item(context, callerData);
            });

            return all(interceptors);
        },

        _handleContextUpdateRequest: function (newContextParameters, callerData) {
            // Handles a context update request and publishes a contextUpdated event if successful.

            if (newContextParameters === null) {
                return;
            }
            this._loadNewContext(newContextParameters, callerData, this._publishContextUpdated);
        },

        _handleRequestCurrentContext: function (callerData) {
            if (this.currentContext) {
                topic.publish("/epi/shell/context/current", this.currentContext, callerData);
            }
        },

        _loadNewContext: function (contextParameters, callerData, callback) {

            var item = {
                success: null,
                request: null,
                response: null,
                contextParameters: contextParameters,
                callerData: callerData,
                callback: callback
            };

            var onFailure = lang.hitch(this, function (response) {
                item.response = response;
                item.success = false;
                this._handleContextLoaded();
            });

            var onSuccess = lang.hitch(this, function (response) {
                if (response) {
                    // parse information available in uri for convenience

                    // put back into queue
                    item.response = response;

                    item.success = true;

                    // we're done, try to resolve
                    this._handleContextLoaded();

                } else {
                    // response was not so sweet, trigger failure
                    onFailure(response);
                }
            });


            // add item to request queue
            this._requestQueue.push(item);

            var contextStore = this._getContextStore();
            var rq = contextStore.query(contextParameters);

            rq.then(onSuccess, onFailure);

            // keep request in item
            item.request = rq;
        },

        _handleContextLoaded: function () {
            // summary:
            //      handle that a context load request was completed
            //

            // get first item
            var item = (this._requestQueue.length > 0) ? this._requestQueue[0] : null;

            // only process if success has been set
            while (item && item.success !== null) {

                // remove item
                this._requestQueue.shift();

                var callback = item.callback;
                var response = item.response;
                var contextParameters = item.contextParameters;
                var callerData = item.callerData;
                var success = item.success;
                var request = item.request;

                if (success) {
                    var uri = new UriParser(response.uri);
                    response.type = uri.getType();
                    response.id = uri.getId();

                    // cache current context
                    this.currentContext = item.response;

                    // looking for any route for response.type, to invoke redirect action
                    if (this._routes && this._routes[response.type]) {
                        this._routes[response.type](this.currentContext, callerData, uri);
                    }

                    // publish context event
                    if (callback) {
                        callback(response, callerData, request);
                    }

                } else if (callerData && !callerData.suppressFailure) {
                    this._contextLoadFailed(response, contextParameters, callerData);
                } else {
                    this._publishRequestFailed(contextParameters, callerData);
                }

                // get next item
                item = (this._requestQueue.length > 0) ? this._requestQueue[0] : null;
            }

        },

        _contextLoadFailed: function (response, contextParameters, callerData) {

            var errorDescription = this.res.errors.couldnotloadcontext.description,
                contentNotFoundMessage = this.res.errors.couldnotloadcontext["descriptioncontent" + response.status],
                uriNotFoundMessage = this.res.errors.couldnotloadcontext["description" + response.status];
            if (contentNotFoundMessage && callerData.sender && callerData.sender.requestedContent) {
                var requestedContent = callerData.sender.requestedContent;
                errorDescription = lang.replace(contentNotFoundMessage,
                    [entities.encode(requestedContent.typeName), entities.encode(requestedContent.name)]);
            } else if (uriNotFoundMessage) {
                errorDescription = lang.replace(uriNotFoundMessage,
                    [contextParameters.uri || contextParameters.url]);
            }

            this._dialogService.confirmation({
                title: this.res.errors.couldnotloadcontext.title,
                description: errorDescription,
                confirmActionText: this.res.errors.couldnotloadcontext.retry,
                cancelActionText: epi.resources.action.ignore
            }).then(function () {
                // Try again
                this._loadNewContext(contextParameters, callerData, this._publishContextChanged);
            }.bind(this)).otherwise(function () {
                // Trigger fail
                this._publishRequestFailed(contextParameters, callerData);
            }.bind(this));
        },

        _getContextStore: function () {
            if (!this._contextStore) {
                var registry = dependency.resolve("epi.storeregistry");
                this._contextStore = registry.get("epi.shell.context");
            }
            return this._contextStore;
        },

        _publishContextChanged: function (response, callerData, request) {
            topic.publish("/epi/shell/context/changed", response, callerData, request);
        },

        _publishContextUpdated: function (response, callerData, request) {
            topic.publish("/epi/shell/context/updated", response, callerData, request);
        },

        _publishRequestFailed: function (contextParameters, callerData) {
            // Trigger fail
            topic.publish("/epi/shell/context/requestfailed", this.currentContext, contextParameters, callerData);
        }
    });
});
