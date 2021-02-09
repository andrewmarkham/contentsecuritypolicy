define("epi-cms/_ContentContextMixin", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",

    "dojo/Deferred",
    "dojo/when",

    // epi
    "epi/dependency",
    "epi/UriParser",

    "epi/shell/_ContextMixin",

    "epi-cms/core/ContentReference"
],

function (
// dojo
    declare,
    lang,
    aspect,

    Deferred,
    when,

    // epi
    dependency,
    UriParser,

    _ContextMixin,

    ContentReference
) {

    return declare([_ContextMixin], {
        // summary:
        //      Helps keeping up to date with the current context. Mixing this into a class gives access to current context and other useful features.
        // tags:
        //      public abstract

        ignoreVersionWhenComparingLinks: false,

        contentDataStore: null,

        _currentContentContext: null,

        postscript: function () {
            this.inherited(arguments);

            this.own(aspect.after(this.getContentDataStore(), "notify", function (item, id) {
                this.itemChanged(id, item);
            }.bind(this), true));
        },

        getContentDataStore: function () {
            // summary:
            //      Gets the content data store from store registry if it's not already cached

            if (!this.contentDataStore) {
                var registry = dependency.resolve("epi.storeregistry");
                this.contentDataStore = registry.get("epi.cms.contentdata");
            }
            return this.contentDataStore;
        },

        getCurrentContent: function () {
            // summary:
            //      Returns either the current content or a deferred which will resolve a content data as soon as it becomes available.
            // example:
            //      dojo.when(this.getCurrentContent(), function(content) {
            //          console.log("now we know we've got ", content);
            //      });
            // tags:
            //      protected

            var deferred = new Deferred();

            when(this.getCurrentContext(), lang.hitch(this, function (ctx) {
                if (!this._isContentContext(ctx)) {
                    deferred.reject({ message: "Not a content data", context: ctx });
                    return;
                }

                when(this.getContentDataStore().get(ctx.id), function (contentData) {
                    deferred.resolve(contentData);
                });
            }));

            return deferred.promise;
        },

        contextChanged: function (ctx, callerData) {
            this.inherited(arguments);

            if (!this._isContentContext(ctx)) {
                this._currentContentContext = null;
                return;
            }

            var forceChange = (callerData && callerData.forceContextChange ? callerData.forceContextChange : false);

            if (!forceChange && this._isSameAsCurrentContentContext(ctx)) {
                // already loaded
                return;
            }

            this._currentContentContext = ctx;

            this.contentContextChanged(ctx, callerData);
        },

        contextUpdated: function (ctx, callerData) {

            if (!this._isContentContext(ctx)) {
                this._currentContentContext = null;
                return;
            }

            this._currentContentContext = ctx;

            this.contentContextUpdated(ctx, callerData);
        },

        contentContextChanged: function (ctx, callerData) {
            // summary:
            //      Called when the currently loaded content changes. I.e. a new content data object is loaded into the preview area.
            // tags:
            //      protected
        },

        contentContextUpdated: function (ctx, callerData) {
            // summary:
            //      Called when the currently loaded content updated.
            // tags:
            //      protected
        },

        itemChanged: function (id, item) {
            // summary:
            //      Notification event when an item has been patched or reloaded.
            // object: id
            //      The id of the updated item.
            // object: item
            //      The updated item.
            // tags:
            //      public deprecated
        },

        _isContentContext: function (ctx) {
            // summary:
            //      Verifies that the context has content data
            // ctx: context
            //      The context to check
            // tags:
            //      protected

            return ctx && ctx.type === "epi.cms.contentdata";
        },

        _isSameAsCurrentContentContext: function (ctx) {
            // summary:
            //      Checks if the content context has Id and PreferredLanguage the same as the already loaded current content context.
            // ctx: Object
            //      The content context to compare with current content context.
            // tags:
            //      protected

            if (this._currentContentContext && ctx) {
                return this._currentContentContext.id === ctx.id
                        && (this._currentContentContext.languageContext && ctx.languageContext
                            && this._currentContentContext.languageContext.preferredLanguage === ctx.languageContext.preferredLanguage);
            } else {
                return false;
            }
        },

        _isSameAsCurrentContext: function (uri) {
            // summary:
            //      Checks if the URI is the same as the already loaded context.
            // object: uri
            //      The uri of the context to compare with current.
            // tags:
            //      protected

            if (this._currentContext) {
                return this._compareUris(uri, this._currentContext.uri);
            } else {
                return false;
            }
        },

        _compareUris: function (obj1, obj2) {
            // summary:
            //      Checks if the URI:s are equal
            // object: obj1
            //      First object to compare.
            // object: obj2
            //      Second object to compare.
            // tags:
            //      protected

            var uri1 = new UriParser(obj1),
                uri2 = new UriParser(obj2);

            if (this.ignoreVersionWhenComparingLinks &&
                uri1.getType() === "epi.cms.contentdata" &&
                uri2.getType() === "epi.cms.contentdata" &&
                ContentReference.compareIgnoreVersion(uri1.getId(), uri2.getId())) {
                return true;
            } else if (obj1 === obj2) {
                return true;
            }

            return false;
        }

    });

});
