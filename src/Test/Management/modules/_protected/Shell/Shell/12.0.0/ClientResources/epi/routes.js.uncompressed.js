(function () {
    var routes = {
        // tags:
        //      public


        // registeredRoutes: [public] Object
        //      All registered routes in the system
        registeredRoutes: {},

        defaultModuleArea: null,

        init: function (defaultModuleArea) {
            // summary:
            //     Sets up default module area for route resolving
            // defaultModuleArea:
            //     The default moduleArea routed to when moduleArea isn't specified
            this.defaultModuleArea = defaultModuleArea;
        },

        registerRoute: function (routeFormat, parameters) {
            // summary:
            //     Register a route and default parameters
            // routeFormat:
            //     A name/value collection of route parameters
            // parameters:
            //     Default paramters when resolving the route
            this.registeredRoutes[parameters.moduleArea.toLowerCase()] = { url: routeFormat, defaults: parameters };
        },

        getActionPath: function (parameters, customPath) {
            // summary:
            //     Generates a route path for shell controller actions
            // parameters:
            //     A name/value collection of route parameters
            // customPath:
            //     A custom path to use when resolving the route

            var routeInfo = null;
            if (typeof customPath == "string") {
                routeInfo = { url: customPath, defaults: {} };
            } else if (parameters == null || typeof parameters["moduleArea"] != "string") {
                routeInfo = this.registeredRoutes[this.defaultModuleArea.toLowerCase()];
            } else {
                routeInfo = this.registeredRoutes[parameters["moduleArea"].toLowerCase()];
            }

            if (!routeInfo) {
                throw new Error("Failed to resolve a route from parameters or default settings");
            }

            var replace = function (url, key, value) {
                var formatKey = "{" + key + "}";
                var keyIndex = url.indexOf(formatKey, 0);
                if (keyIndex >= 0) {
                    return url.substring(0, keyIndex) + value + url.substring(keyIndex + formatKey.length);
                }

                var queryIndex = url.indexOf("?");
                return url + (queryIndex >= 0 ? "&" : "?") + key + "=" + value;
            };

            // Merge default context parameters and and the route parameters into the mergeParameter object
            // route parameters will override context parameters
            var merge = (typeof dojo === "object" ? dojo.mixin : $.extend);
            var mergedParameters = merge({}, routeInfo.defaults, parameters);
            var path = routeInfo.url;

            for (var key in mergedParameters) {
                path = replace(path, key, mergedParameters[key]);
            }
            var removeExtraSlashRegex = /\/+[?]/;
            //Remove any '/' characters located before the query part (?)
            path = path.replace(removeExtraSlashRegex, '?');
            return path;
        },

        getRestPath: function (/*Object*/parameters, /*String*/customPath) {
            // summary:
            //      Generates a path to the rest store.
            // tags:
            //      public

            var storeName = parameters.storeName;
            delete parameters.storeName;
            return this.getActionPath(dojo.mixin(parameters, { action: storeName, controller: "Stores" }), customPath);
        },

        getRouteParams: function (routeUrl, url) {
            // summary:
            //     Parses an url to extract route parameters from it. Returns a named collection of the parameters found
            // routeUrl:
            //     The route template to containing parameters to find. "/routes/{moduleArea}/{controller}/{action}/{id}"
            // url:
            //     The url containing the route parameters to extract.

            var splitRegEx = /[\/|?]/g;
            // Create url object from string
            var urlParts = this.parseUrl(url);
            // Split path on / and ?
            var pathSections = urlParts.path.split(splitRegEx);
            // Split route-url on / and ?
            var routeSections = routeUrl.split(splitRegEx);
            var routeParams = {};

            // Loop over the route url sections and match with the corrensponding section on the path
            for (var i = 0; i < routeSections.length; i++) {
                // Check if the section is supposed to be replaceble
                if (routeSections[i].charAt(0) === '{') {
                    // Cut off { and } from the name
                    var name = routeSections[i].substring(1, routeSections[i].length - 1);
                    // Set the value to the section of the url or an empty string of not existing (probably default action)
                    var value = pathSections.length > i ? pathSections[i] : "";
                    routeParams[name] = value;
                }
            }

            // Add the parameters from the query string collection
            return $.extend(routeParams, urlParts.queryParams);
        },

        parseUrl: function (urlToParse) {
            // summary:
            //     Creates an object with named properties of url parts
            //     Based on parseUri by Steven Levithan http://blog.stevenlevithan.com/archives/parseuri
            // urlToParse:
            //     a url to parse into parts
            var url = {};
            var matches = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(urlToParse);
            var keys = ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"];
            var i = keys.length;

            while (i--) {
                url[keys[i]] = matches[i] || "";
            }

            url.queryParams = {};
            url.query.replace(/(?:^|&)([^&=]*)=?([^&]*)/g, function ($0, $1, $2) {
                if ($1) {
                    url.queryParams[$1] = $2;
                }
            });

            return url;
        }
    };

    if (typeof define != "undefined") {
        define("epi/routes", ["epi"], function (epi) {
            return epi.routes = routes;
        });
    } else {
        // When not using define, i.e. not in dojo-land, epi is globally available.
        // But if it hasn't been defined yet, we have to define it.
        var e = window.epi || {};
        e.routes = routes;
    }
})();
