define("epi/shell/store/JsonRest", [
    "dojo/_base/declare",
    "dojo/_base/json",
    "dojo/_base/lang",
    "dojo/io-query",
    "dojo/store/JsonRest",
    "dojo/store/util/QueryResults",
    "epi/shell/XhrWrapper"
],

function (
    declare,
    json,
    lang,
    ioQuery,
    JsonRest,
    QueryResults,
    XhrWrapper
) {

    return declare([JsonRest], {
        // summary:
        //      Base implementation of a custom rest store with support for XSRF validation.
        //
        // tags:
        //      public

        // xhrHandler: [public] Object
        //      The xhr implementation to use when requesting data. Defaults to epi/shell/XhrWrapper
        xhrHandler: null,

        // idAttribute: [public] String
        //      Default value is set to "id".
        idAttribute: "id",

        // preventCache: [protected] boolean
        //      Default value is set to false
        preventCache: false,

        // defaultRequestParams: [public] Object
        //      Default options added to the xhr request parameters
        defaultRequestParams: null,

        constructor: function (options) {
            // summary:
            //      Creates a new Json Rest Store.
            // options: Object?
            //      Configuration options that will be mixed into the store.

            this.defaultRequestParams = options && options.defaultRequestParams;

            // The xhr wrapper sets store specific information, e.g. CSRF tokens, so it must be instantiated for each store.
            if (!this.xhrHandler) {
                this.xhrHandler = new XhrWrapper({ preventLocalizationHeader: options && options.preventLocalizationHeader });
            }
        },

        get: function (id, options) {
            // summary:
            //      Retrieves an object by its identity. This will trigger a GET request to the server using
            //      the url `this.target + id`.
            // id: Number
            //      The identity to use to lookup the object.
            // options: Object?
            //      The optional options for the request header.
            // returns:
            //      The object in the store that matches the given id.
            // tags:
            //      public

            var headers = options || {};
            headers.Accept = "application/javascript, application/json";

            var hasId = typeof id != "undefined";

            var params = {
                url: hasId ? this.target + id : this.target,
                handleAs: "json",
                headers: headers,
                preventCache: this.preventCache
            };

            return this.xhrHandler.xhrGet(this._mixinDefaultParams(params));
        },

        put: function (object, options) {
            // summary:
            //      Stores an object. This will trigger a PUT request to the server
            //      if the object has an id, otherwise it will trigger a POST request.
            // object: Object
            //      The object to store.
            // options: dojo/store/api/Store/PutDirectives?
            //      Additional metadata for storing the data. Includes an "id"
            //      property if a specific id is to be used.
            // returns: dojo/store/util/QueryResults
            //      The results of the query, extended with iterative methods.
            // tags:
            //      public

            options = options || {};

            var paramHeaders = {
                "Content-Type": "application/json",
                "If-Match": options.overwrite === true ? "*" : null,
                "If-None-Match": options.overwrite === false ? "*" : null,
                Accept: "application/javascript, application/json"
            };

            var id = ("id" in options) ? options.id : this.getIdentity(object);
            var hasId = typeof id != "undefined";

            if (hasId && !options.incremental) {
                paramHeaders["X-Http-Method-Override"] = "PUT";
            }

            var params = {
                url: hasId ? this.target + id : this.target,
                postData: json.toJson(object),
                handleAs: "json",
                headers: paramHeaders
            };

            return this.xhrHandler.xhr("POST", this._mixinDefaultParams(params));
        },

        patch: function (object, options) {
            // summary:
            //      Updates an object.
            // object: Object
            //      The object to update.
            // options: Object?
            //      The optional options for the request header.
            // returns: dojo/store/util/QueryResults
            //      The results of the query, extended with iterative methods.
            // tags:
            //      public

            var headers = options || {};
            headers.Accept = "application/javascript, application/json";
            headers["X-Http-Method-Override"] = "PATCH";
            headers["Content-Type"] = "application/json";

            var id = ("id" in options) ? options.id : this.getIdentity(object);
            var hasId = typeof id != "undefined";

            var params = {
                url: hasId ? this.target + id : this.target,
                postData: json.toJson(object),
                handleAs: "json",
                headers: headers
            };

            return this.xhrHandler.xhr("POST", this._mixinDefaultParams(params));
        },

        remove: function (id, options) {
            // summary:
            //      Deletes an object by its identity. This will trigger a DELETE request to the server.
            // id: Number
            //      The identity to use to delete the object.
            // options: Object
            //      The optional postData options.
            // returns: dojo/store/util/QueryResults
            //      The results of the query, extended with iterative methods.
            // tags:
            //      public

            var headers = {};
            headers.Accept = "application/javascript, application/json";
            headers["Content-Type"] = "application/json";
            headers["X-Http-Method-Override"] = "DELETE";

            options = options || {};

            return this.xhrHandler.xhr("POST", this._mixinDefaultParams({
                url: this.target + id,
                headers: headers,
                postData: json.toJson(options),
                handleAs: "json"
            }));
        },

        query: function (query, options) {
            // summary:
            //      Queries the store for objects. This will trigger a GET request to the server, with the
            //      query added as a query string.
            // query: Object
            //      The query to use for retrieving objects from the store.
            // options: dojo/store/api/Store/QueryOptions?
            //      The optional arguments to apply to the resultset.
            // returns: dojo/store/util/QueryResults
            //      The results of the query, extended with iterative methods.
            // tags:
            //      public

            var headers = { Accept: "application/javascript, application/json" };
            var idUrlPart;
            options = options || {};

            if (options.start >= 0 || options.count >= 0) {
                headers.Range = "items=" + (options.start || "0") + "-" +
                            (("count" in options && options.count !== Infinity) ?
                                (options.count + (options.start || 0) - 1) : "");
            }
            if (lang.isObject(query)) {
                query = lang.mixin({}, query); // This is a shallow copy. Needed since clone breaks RegExp.
                if (query[this.idAttribute]) {
                    idUrlPart = query[this.idAttribute];
                    query[this.idAttribute] = null;
                }
                query = ioQuery.objectToQuery(query);
                query = query ? "?" + query : "";
            }
            if (options && options.sort) {
                query += (query ? "&" : "?") + "sort(";
                for (var i = 0; i < options.sort.length; i++) {
                    var sort = options.sort[i];
                    query += (i > 0 ? "," : "") + (sort.descending ? "-" : "+") + encodeURIComponent(sort.attribute);
                }
                query += ")";
            }
            var results = this.xhrHandler.xhrGet(this._mixinDefaultParams({
                url: this.target + (idUrlPart || "") + (query || ""),
                handleAs: "json",
                headers: headers,
                preventCache: this.preventCache
            }));

            results.total = results.then(function () {
                var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
                return range && (range = range.match(/\/(.*)/)) && +range[1];
            });
            return QueryResults(results);
        },

        move: function (id, params, options) {
            // summary:
            //      Move an object to a specified target.
            // id: Number
            //      The id of the object that is moving.
            // params: Object|Number
            //      The additional params to send in the post data. Can be the id of the target that
            //      the object will be moved to.
            // options: Object?
            //      The optional headers object.
            // returns: dojo/store/util/QueryResults
            //      The results of the query, extended with iterative methods.
            // tags:
            //      public

            return this._send("MOVE", id, params, options);
        },

        copy: function (id, params, options) {
            // summary:
            //      Copy an object to a specified target.
            // id: Number
            //      The id of the object that is copying.
            // params: Object|Number
            //      The additional params to send in the post data. Can be the id of the target that
            //      the object will be copied to.
            // options: Object?
            //      The optional headers object.
            // returns: dojo/store/util/QueryResults
            //      The results of the query, extended with iterative methods.
            // tags:
            //      public

            return this._send("COPY", id, params, options);
        },

        executeMethod: function (method, id, data, options) {
            // summary:
            //      Post a request to the server with X-Http-Method-Override equals method input.
            // method: String
            //      The method name.
            // id: Number
            //      The id of the object which is operated.
            // data: Object?
            //      The data to post
            // options: Object?
            //      The optional headers object.
            // returns: dojo/store/util/QueryResults
            //      The results of the query, extended with iterative methods.
            // tags:
            //      internal

            var hasId = id !== null && typeof id !== "undefined",
                url = this.target + (hasId ? id : ""),
                headers = options || {};

            headers.Accept = "application/javascript, application/json";
            headers["Content-Type"] = "application/json";
            headers["X-Http-Method-Override"] = method;

            data = data || { };

            return this.xhrHandler.xhr("POST", this._mixinDefaultParams({
                url: url,
                headers: headers,
                postData: json.toJson(data),
                handleAs: "json"
            }));
        },

        getAllResponsesWithError: function (response) {
            // summary:
            //      Get the errors from a call that handled multiple operations. I.e. multiple
            //      selection actions on blocks or media, where one item was successfully moved but
            //      the others failed for different reasons.
            // response: Object
            //      The response object to parse.
            // returns: Array
            //      The errors for any failed operations.
            // tags:
            //      private

            var results = [];
            if (response.statusCode !== 200 && !(response.extraInformation instanceof Array)) {
                results.push(response);
            }

            if (response.extraInformation && typeof response.extraInformation !== "string") {
                Object.keys(response.extraInformation).forEach(function (prop) {
                    this.getAllResponsesWithError(response.extraInformation[prop]).forEach(function (res) {
                        results.push(res);
                    });
                }, this);
            }

            return results;
        },

        _send: function (method, id, params, options) {
            // summary:
            //      Post a request to the server with X-Http-Method-Override equals method input.
            // method: String
            //      The method name.
            // id: Number
            //      The id of the object which is operated.
            // params: Object|Number
            //      The additional params to send in the post data.
            // options: Object?
            //      The optional headers object.
            // returns: dojo/store/util/QueryResults
            //      The results of the query, extended with iterative methods.
            // tags:
            //      private

            var headers = options || {};
            headers.Accept = "application/javascript, application/json";
            headers["X-Http-Method-Override"] = method;

            var postContent = lang.isObject(params) ? params : { targetId: params };

            return this.xhrHandler.xhr("POST", this._mixinDefaultParams({
                url: this.target + id,
                headers: headers,
                content: postContent,
                handleAs: "json"
            }));
        },

        _mixinDefaultParams: function (params) {
            // summary:
            //      Mix the params and the defaultRequestParams into a new object.
            // params: Object
            //      The params to mix with defaultRequestParams.
            // returns: Object
            //      The new combined params.
            // tags:
            //      private

            return lang.mixin({}, this.defaultRequestParams, params);
        }
    });
});
