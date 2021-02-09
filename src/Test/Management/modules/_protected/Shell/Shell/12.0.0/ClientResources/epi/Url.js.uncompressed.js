define("epi/Url", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/io-query"
],
function (
    declare,
    lang,
    ioQuery
) {

    var module,
        parseMode = {
            // tags:
            //      internal
            strict: 1,
            loose: 2
        },
        ore = new RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$");

    module = declare(null, {
        // summary:
        //		Provides an object representation of a uniform resource locator and easy access to the parts of the URL.
        //
        // example:
        //      Create a url object (http://www.episerver.com/test/?param1=value1) that is based on the url and optional parameters.
        //
        //  |   var url = epi.Url("http://www.episerver.com",
        //  |       {
        //  |           path: "/test/",
        //  |           query: { param1: "value1" }
        //  |       });
        //
        // tags:
        //      public

        // scheme: [public] String
        scheme: null,

        // authority: [public] String
        authority: null,

        // path: [public] String
        path: null,

        // query: [public] Object
        query: null,

        // fragment: [public] String
        fragment: null,

        // queryParseMode: [public] Url.parseMode
        queryParseMode: parseMode.loose,

        // _undecodeable: [private] String[]
        _undecodeable: null,

        constructor: function (/*String*/url, /*Object?*/parameters, /*Boolean?*/mixinQuery, /*Url.parseMode?*/queryParseMode) {
            // summary:
            //    Construct a url object from the url and parameters.
            // url: String?
            //		The base url.
            // parameters: Object?
            //		Optional parameters that overwrites the parameters extracted from the url.
            //      The parameters can be scheme, authority, path, query and fragment.
            //      The parameters will overwrite the url parameters, except for query if you set mixinQuery to true.
            // mixinQuery: Boolean?
            //		Should be set to true if the query parameter should mixin with the url query.
            //      If false it will overwrite the url query with the query in parameters.
            // queryParseMode: Url.parseMode?
            //		Controls if badly encoded querystring parameters should be handled or cause exceptions.
            //      Defaults to Url.parseMode.loose meaning that when an invalid parameter is detected it is kept in
            //      it's original form.

            var urlParams;

            this._undecodeable = [];
            this.queryParseMode = queryParseMode || this.queryParseMode;

            urlParams = this._extractParameters(url);

            if (mixinQuery && parameters && parameters.query) {
                parameters.query = lang.mixin(urlParams.query, parameters.query);
            }

            declare.safeMixin(this, lang.mixin(urlParams, parameters));

        },

        _extractParameters: function (/*String*/url) {
            // summary:
            //    Extract the parameters from the url.
            // tags:
            //    private

            var r,
                queryString,
                query;

            if (!url) {
                return {};
            }

            r = url.match(ore);
            queryString = r[7] || (r[6] ? "" : null);
            query = this._withQueryParseMode(function () {
                return queryString ? ioQuery.queryToObject(queryString) : {};
            });

            return {
                scheme: r[2] || (r[1] ? "" : null),
                authority: r[4] || (r[3] ? "" : null),
                path: r[5], // can never be undefined
                query: query,
                fragment: r[9] || (r[8] ? "" : null)
            };
        },

        getQueryParameterValue: function (/*String*/parameter) {
            // summary:
            //    Return a query parameter value from the url object.
            // tags:
            //    public

            return this.query ? this.query[parameter] : undefined;
        },

        toString: function () {
            // summary:
            //    Return a string representation of the url.
            // tags:
            //    public

            var url = [],
                query = this.query,
                queryString;

            if (this.scheme) {
                url.push(this.scheme);

                // Only push ":" if url scheme does not contains it.
                // For example: window.location.protocol already contains ":".
                if (this.scheme.lastIndexOf(":") !== this.scheme.length - 1) {
                    url.push(":");
                }
            }
            if (this.authority) {
                url.push("//", this.authority);
            }
            url.push(this.path);
            if (query) {

                queryString = this._withQueryParseMode(function () {
                    return ioQuery.objectToQuery(query);
                });

                if (queryString !== "") {
                    url.push("?", queryString);
                }
            }
            if (this.fragment) {
                url.push("#", this.fragment);
            }
            return url.join("");
        },

        _withQueryParseMode: function (func) {
            // summary:
            //    Executes a function with the strictness defined by this.queryParseMode.
            //    If set to loose the method will try to handle badly encoded queries by
            //    leaving them undecoded, but noting the values so that they later
            //    don't get encoded, since that could cause: new Url(originalUrl).toString() !== originalUrl
            // tags:
            //    private

            var result,
                undecodable = this._undecodeable,
                loose = this.queryParseMode === module.parseMode.loose,
                originalEncode = encodeURIComponent,
                originalDecode = decodeURIComponent;

            function encode(value) {
                // Check if the value has been found as undecodable
                if (undecodable.indexOf(value) !== -1) {
                    // In that case just return it.
                    return value;
                } else {
                    return originalEncode(value);
                }
            }

            function decode(value) {
                try {
                    value = originalDecode(value);
                } catch (ex) {
                    // bad encoding, store the value for later use
                    undecodable.push(value);
                }

                return value;
            }

            // If loose, switch to our safety padded encode/decode functions
            if (loose) {
                window["encodeURIComponent"] = encode;
                window["decodeURIComponent"] = decode;
                try {
                    result = func();
                } finally {
                    window["encodeURIComponent"] = originalEncode;
                    window["decodeURIComponent"] = originalDecode;
                }
            } else {
                result = func();
            }

            return result;
        }
    });

    module.parseMode = parseMode;

    return module;
});
