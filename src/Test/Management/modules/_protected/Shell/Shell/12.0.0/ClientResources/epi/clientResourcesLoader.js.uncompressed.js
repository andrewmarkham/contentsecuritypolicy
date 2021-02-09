define("epi/clientResourcesLoader", [
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/dom-construct",
    "dojo/Deferred",
    "dojo/query",
    "epi"
], function (array, lang, win, dom, Deferred, query, epi) {
    "use strict";
    var loadedStyles = {},
        loadedScripts = {};

    return epi.clientResourcesLoader = {
        // tags:
        //      internal

        _loadStyles: function (stylePaths) {
            if (!lang.isArray(stylePaths)) {
                return;
            }

            array.forEach(stylePaths, function (stylePath) {

                // use lower case path as key
                var stylePathLower = stylePath.toLowerCase();

                if (!(stylePathLower in loadedStyles)) {
                    var head = query("head")[0];
                    dom.create("link", { rel: "stylesheet", type: "text/css", href: stylePath }, head);
                    loadedStyles[stylePathLower] = 1;
                } else {
                    // increase count
                    loadedStyles[stylePathLower] += 1;
                }
            });
        },

        _loadScripts: function (scriptPaths) {
            var deferred = new Deferred();

            var loadedInDOM = function (scriptPath) {
                var scriptNodeId = scriptPath.toLowerCase().replace(/[^A-z0-9$_]/g, "_");
                return !!win.doc.getElementById(scriptNodeId);
            };

            var getScriptDependencies = function (scriptsToLoad) {
                // Called recursively to load the scripts in fake sync mode, resolving the deferred when done.

                // No more scripts to load; resolve and return
                if (scriptsToLoad.length === 0) {
                    deferred.resolve();
                    return;
                }

                // Shift out the first element from the array.
                var scriptPath = scriptsToLoad.shift();

                // Add it to the dictionary of scripts that has been loaded
                require([scriptPath], function () {
                    loadedScripts[scriptPath] = true;
                    // Call recursively for the remaining scripts in the array
                    getScriptDependencies(scriptsToLoad);
                });
            };

            // Add all scripts that aren't already loaded to an array
            var scriptsToLoad = [];
            if (lang.isArray(scriptPaths)) {
                scriptsToLoad = array.filter(scriptPaths, function (scriptPath) {
                    return !((scriptPath in loadedScripts) || loadedInDOM(scriptPath));
                });
            }

            getScriptDependencies(scriptsToLoad);

            return deferred;
        },

        loadResources: function (/* String[]? */stylePaths, /* String[]? */scriptPaths) {
            // summary:
            //      Loads style and script resources
            //
            // stylePaths: String[]?
            //      Paths to stylesheet files
            //
            // scriptPaths: String[]?
            //      Paths to script files
            //
            // returns:
            //  A promise which is resolved when all scripts has been loaded
            //
            // example:
            //      Load a style file
            //  |   clientResourcesLoader.loadResources(["/css/styles.css"]);
            //
            // example:
            //      Load a script file
            //  |   clientResourcesLoader.loadResources(undefined, ["/scripts/script.js"]);
            //
            // example:
            //      Load a multiple files
            //  |   clientResourcesLoader.loadResources(["/css/styles.css", "/css/form.css"], ["/scripts/script.js"]);
            //
            // tags:
            //		public

            // Start with styles, they can be loaded in parallel
            this._loadStyles(stylePaths);

            // Return the deferred from script loading, since we need to know when all scripts has been loaded
            return this._loadScripts(scriptPaths);
        },

        reset: function () {
            // summary:
            //      Reset the loaded script information to its initial state.
            //      Primarily for unit test purposes.
            // tags:
            //      public

            loadedScripts = {};
            loadedStyles = {};
        }
    };
});
