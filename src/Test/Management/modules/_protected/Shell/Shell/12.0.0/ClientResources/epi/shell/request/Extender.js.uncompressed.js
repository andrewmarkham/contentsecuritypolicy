define("epi/shell/request/Extender", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred"
], function (declare, lang, Deferred) {

    return declare([], {
        // summary:
        //      Xhr request wrapper calling a chain of optional request mutators before sending the request to a
        //      backing request handler.
        // tags: internal

        _mutators: null,
        _request: null,

        constructor: function (request, mutators) {
            // summary:
            //
            // request: dojo/_base/xhr
            //      The backing request handler.
            // mutators: function
            //      A function returning a list of request mutators

            this._request = request;
            this._mutators = mutators;
        },

        xhr: function (url, options, returnDeferred) {
            // summary:
            //		Sends a request using XMLHttpRequest with the given URL and options.
            // url: String
            //		URL to request
            // options: dojo/request/xhr.__Options?
            //		Options for the request.
            // returnDeferred: Boolean
            //      When true; the inner deferred with the original response property is returned.
            // returns: dojo/promise/Promise

            var completed = new Deferred(),
                mutators = this._mutators;

            options = options || {};
            options.headers = options.headers || {};

            mutators.execute("beforeSend", { url: url, options: options })
                .then(lang.hitch(this, function (params) {

                    // The dojo request sets a response property containing headers
                    // and the xhr object on the deferred. We forward it.
                    var deferred = this._sendRequest(params);
                    completed.response = deferred.response || this._response(deferred.ioArgs);
                    completed.ioArgs = deferred.ioArgs;
                    return deferred.promise;
                }))
                .then(function (data) {
                    return mutators.execute("afterReceive", {response: completed.response, data: data});
                })
                .then(function (result) {
                    completed.resolve(result.data);
                })
                .otherwise(completed.reject);

            return returnDeferred ? completed : completed.promise;
        },

        _sendRequest: function (params) {
            // summary:
            //      Send the request to the backing xhr handler
            // tags: private

            var options = params.options;
            options.url = params.url;
            return this._request(options.method, options);
        },

        _response: function (ioArgs) {
            // summary:
            //      Wraps the ioArgs returned from dojo/_base/xhr to a response object matching the one returned
            //      from returned from dojo/request/xhr
            // tags: private

            return {
                getHeader: function getHeader(name) {
                    return this.xhr.getResponseHeader(name);
                },
                options: ioArgs.args,
                url: ioArgs.url,
                xhr: ioArgs.xhr
            };
        }

    });
});
