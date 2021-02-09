define("epi/shell/request/xhr", [
    "dojo/_base/xhr",
    "dojo/request/util",
    "./Extender",
    "./mutators"
], function (request, util, Extender, mutators) {
    // TODO: Change to use dojo/request as backing request handler and make it public

    var extender = new Extender(request, mutators);

    var xhr = function (url, options) {
        // summary:
        //		Sends a request using XMLHttpRequest with the given URL and options.
        //     Before the request is sent all registered mutators in epi/shell/request/mutators
        // url: String
        //		URL to request
        // options: dojo/request/xhr.__Options?
        //		Options for the request.
        // returns: dojo/promise/Promise
        // tags: internal

        return extender.xhr.apply(extender, arguments);
    };

    util.addCommonMethods(xhr);

    return xhr;
});
