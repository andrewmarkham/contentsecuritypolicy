define("epi/shell/store/Throttle", [
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/when",
    "epi/epi"
], function (array, lang, aspect, when, epi) {

    return function (throttledStore, method) {
        // summary:
        //	    The store throttling wrapper takes a store implementing the dojo/store/api/Store and
        //      adds request throttling functionality to the get and query methods as well as the
        //      epi refresh extension. Meaning that only the first call to any of these methods
        //      with the same arguments will be sent to the server, any subsequent calls done
        //      while a request is ongoing will be resolved when the first request is returned.
        //
        // throttledStore:
        //	    This is the backing store which sends requests to the server.
        // method:
        //      The method to throttle, e.g "get" or "query"
        //
        // tags:
        //      internal

        var activeRequests = [];
        var removeActiveRequest = function (deferred) {
            // summary:
            //  Removes an object from the _activeRequests array. The removed object is returned.

            for (var i = 0; i < activeRequests.length; i++) {
                if (activeRequests[i].deferred === deferred) {
                    return activeRequests.splice(i, 1);
                }
            }
            return null;
        };

        var getActiveRequestByArguments = function (method, args) {
            // summary:
            //  Find and return any active requests by request arguments and method

            for (var i = 0; i < activeRequests.length; i++) {
                var request = activeRequests[i];
                if (request.method === method && epi.areEqual(request.args, args)) {
                    return request;
                }
            }
            return null;
        };

        var execute = function (method, args) {
            // summary:
            //  Executes a method with the provided args on the backing store, or returns the promise
            //  if a request for the same data is pending.

            // Convert the arguments "array" to a real array to please phantomjs
            var argsArray = array.map(args, function (item) {
                return item;
            });

            // Try finding any ongoing requests by its serialized arguments, cloning the
            var activeRequest = getActiveRequestByArguments(method, argsArray);
            if (activeRequest) {
                // Found one, so let everyone get the same deferred.
                return activeRequest.deferred;
            }

            // No ongoing request.
            // Query the backing store and hold on to the promise so everyone wanting the same data
            // while the request is pending can "piggy-back" on the first request.
            var deferred = throttledStore[method].apply(throttledStore, argsArray);

            activeRequests.push({
                method: method,
                args: argsArray,
                deferred: deferred
            });

            // Have to remove it from the array when it's resolved
            when(deferred,
                function () {
                    removeActiveRequest(deferred);
                },
                function () {
                    removeActiveRequest(deferred);
                });

            return deferred;
        };

        var delegator = {};
        delegator[method] = function () {
            return execute(method, arguments);
        };

        return lang.delegate(throttledStore, delegator);
    };
});
