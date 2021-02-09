define("epi/i18n", ["dojo/_base/kernel", "dojo/_base/lang"], function (dojo, lang) {

    // regexp for reconstructing the master bundle name from parts of the regexp match
    // nlsRe.exec("foo/bar/baz/nls/en-ca/foo") gives:
    // ["foo/bar/baz/nls/en-ca/foo", "foo/bar/baz/nls/", "/", "/", "en-ca", "foo"]
    // nlsRe.exec("foo/bar/baz/nls/foo") gives:
    // ["foo/bar/baz/nls/foo", "foo/bar/baz/nls/", "/", "/", "foo", ""]
    // so, if match[5] is blank, it means this is the top bundle definition.
    // courtesy of http://requirejs.org
    var nlsRe = /(^.*(^|\/)nls)(\/|$)([^\/]*)\/?([^\/]*)/,

        // Object for caching localized resources
        cache = {},

        getObject = function (name, context) {
            // summary:
            //      Returns the sub-object in context corresponding to the dot separated path in the name parameter
            //      Any missing objects are created as: { __ partial:true }
            var parts = name.split("."), i = 0, p;
            while (p = parts[i++]) { // eslint-disable-line no-cond-assign
                context = (p in context ? context[p] : context[p] = { __partial: true });
            }
            return context;
        },


        setCache = function (bundleName, data) {
            // summary:
            //      Add data to the resource cache

            var resourceObject = getObject(bundleName, cache);

            // Add the loaded resources to the resourceObject
            lang.mixin(resourceObject, data);

            // Since we,re loading resources recursively from the server we now have
            // all resources for this node and its children so we can remove the partial flag.
            delete resourceObject.__partial;
        },

        getCache = function (bundleName) {
            // summary:
            //      Get a resource by its bundle path and name. Returns undefined if nothing is found
            var cached = lang.getObject(bundleName, false, cache);
            // Never return partially (incomplete) cached nodes.
            // The partial nodes are created client side.
            return cached && !cached.__partial ? cached : undefined;
        };

    return {
        // summary:
        //      This module implements an amd plug-in used for loading localizations from the episerver localization service
        // description:
        //      This module loads localization resources based on dot (.) separated keys corresponding to resource keys
        //      in the EPiServer LocalizationService implementation.
        //      This module handles client side caching of resources and resource structures. To minimize server
        //      side requests, you should always query for the top-most resource path first. Then all subsequesnt
        //      queries to more specific keys will be returned from client-side cache.
        // tags:
        //      public

        load: function (/*String*/id, /*function*/require, /*function*/load) {
            // summary:
            //      Loads the resource structure identified by the id
            // id:
            //      Localization resource identifier
            // require:
            //      reference to the AMD loader
            // load:
            //      The callback executed when the resource is ready

            id = id.toLowerCase();

            var match = nlsRe.exec(id),
                bundlePath = match[1] + "/",
                bundleName = match[5] || match[4],
                localeSpecified = (match[5] && match[4]),
                targetLocale = localeSpecified || dojo.locale,
                target = bundlePath + targetLocale + "/" + bundleName;

            var cached = getCache(bundleName);
            if (cached) {
                // Already in cache. Execute load callback with data.
                load(cached);
                return;
            }

            require([target], function (data) {
                // Add to cache and execute callback with the localization data
                setCache(bundleName, data);
                load(data);
            });
        },

        clearCache: function () {
            // summary:
            //      Clear the localization cache.
            //      Primarily intended for unit test purposes.
            cache = {};
        }
    };


});
