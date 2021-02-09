define("epi-cms/component/SiteTreeModel", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojo/Deferred",
    "dojo/when",
    "dojo/_base/lang",
    "dojo/_base/connect",
    "dojo/cookie",
    "dijit/Destroyable",
    "epi/dependency"
],
function (array, declare, Stateful, Deferred, when, lang, connect, cookie, Destroyable, dependency) {

    return declare([Stateful, Destroyable], {
        // summary:
        //      Represents the site tree in a specified language.
        // tags:
        //      internal

        query: null,

        // name: [public] Boolean
        //		A flag indicating whether all languages should be shown in the site tree.
        showAllLanguages: true,

        location: document.location,

        profile: null,

        store: null,

        constructor: function () {
            this.query = { allLanguages: this.showAllLanguages };
        },

        postscript: function () {
            this.inherited(arguments);

            this.profile = this.profile || dependency.resolve("epi.shell.Profile");

            this.own(
                connect.subscribe("/epi/cms/contentdata/updated", lang.hitch(this, function () {
                    //when the language settings dialog is closed, get the current site
                    when(this.getCurrentSite(), lang.hitch(this, function (config) {
                        //reload the children for the current site
                        this.onItemChildrenReload({ siteUrl: config.currentSite });
                    }));
                }))
            );
        },

        // Methods for traversing hierarchy
        getRoot: function (onItem, onError) {
            // summary:
            //		Calls onItem with the root item for the tree, possibly a fabricated item.

            // Do dummy call to onItem. We won't actually show the root, we just want to call getchildren with an empty object.
            onItem({});
        },

        getIdentity: function (item) {
            // summary:
            //		Gets the identity for the specified item

            var id = this.store.getIdentity(item);

            // We need to have an id for our dummy root node
            if (!id && !item.isLanguageNode) {
                id = "root";
            }

            return id;
        },

        onItemChildrenReload: function (/*Object*/parent) {
            // summary:
            //  Raised when the children of an item must be reloaded.
            //  The subscriber needs to call getChildren to get the updated children collection
        },

        mayHaveChildren: function (item) {
            // summary:
            //		Tells if an item has or may have children.  Implementing logic here
            //		avoids showing +/- expando icon for nodes that we know don't have children.
            //		(For efficiency reasons we may not want to check if an element actually
            //		has children until user clicks the expando node)

            if (!item.isLanguageNode) {
                return true;
            }

            return false;
        },

        getLabel: function (item) {
            // summary:
            //		Gets the label for the specified item.
            //      This is the text that will be visible in the tree.

            return item.name;
        },

        getChildren: function (parentItem, onComplete) {
            // summary:
            //		Gets the children for the specified item.
            //      The children of a site, identified by the url, is the enabled languages for that site.

            when(this.store.query(lang.mixin({ siteUrl: parentItem.url }, this.query)), onComplete);
        },

        _setQuery: function (q) {
            // summary:
            //  Updates the query of the model and raises the onItemChildrenReload event.

            this.query = q;
            this.onItemChildrenReload({});
        },

        _showAllLanguagesSetter: function (value) {
            this.showAllLanguages = value;
            this._setQuery({ allLanguages: value });
        },

        getCurrentSite: function () {

            var def = new Deferred();

            when(this.profile.getContentLanguage(), lang.hitch(this, function (languageBranch) {
                if (languageBranch) {
                    when(this.store.get(), lang.hitch(this, function (sites) {
                        var returnValue = null;
                        var wildcardSite = null;

                        // Find the site with the wildcard mapping
                        array.some(sites, function (site) {
                            return array.some(site.hosts, function (host) {
                                if (host === "*") {
                                    wildcardSite = site;
                                    return true;
                                }
                            });
                        });

                        var currentHost = this.location.host.toLowerCase();
                        var wasSiteFound = array.some(sites, function (site) {
                            return array.some(site.hosts, function (host) {
                                //Check if the HostUrl is a part of the documentHref
                                if (currentHost === host.toLowerCase()) {
                                    returnValue = {
                                        currentSite: site.url,
                                        currentEditLanguageId: site.url + languageBranch
                                    };
                                    return true;
                                }
                            });
                        });

                        // if the site wasn't found and we have a wildcard site return that one
                        if (!wasSiteFound && wildcardSite) {
                            returnValue = {
                                currentSite: wildcardSite.url,
                                currentEditLanguageId: wildcardSite.url + languageBranch
                            };
                        }

                        if (returnValue) {
                            // Success, found the site
                            def.resolve(returnValue);
                        } else {
                            // No matching found
                            def.cancel();
                        }
                    }),

                    function () {
                        // Error while getting
                        def.reject(null);
                    });

                } else {
                    // No cookie
                    def.reject(null);
                }
            }));

            return def;
        },

        getAllLanguagesForSite: function (siteUrl) {

            var def = new Deferred();

            when(this.store.query({ siteUrl: siteUrl, allLanguages: true }), function (items) {
                def.resolve(items);
            });

            return def;
        },

        getAllLanguagesForCurrentSite: function () {

            var def = new Deferred();

            when(
                this.getCurrentSite(),

                lang.hitch(this, function (config) {

                    this.getAllLanguagesForSite(config.currentSite).then(function (items) {
                        def.resolve(items);
                    });

                }),

                function (result) {
                    def.reject(result);
                }
            );

            return def;
        }
    });
});
