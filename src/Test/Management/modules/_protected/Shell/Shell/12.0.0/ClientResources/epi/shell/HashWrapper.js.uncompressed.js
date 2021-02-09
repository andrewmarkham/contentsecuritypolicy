define("epi/shell/HashWrapper", [
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/cookie",
    "dojo/io-query",
    "dojo/hash",
    "dojo/Stateful",
    "epi/epi"
],
function (connect, declare, lang, cookie, io, hash, StateFul, epi) {

    return declare([StateFul], {
        // summary:
        //      HashWrapper widget wrap [dojo.hash]
        //      It possible to specify a URL that gets you into edit view for a specific page.
        //
        //      This means that when we change the current context, the hash part of the URL should be updated.
        //      When you use back/forward in the browser this changes the hash tag which in turn changes the active object.
        //      A user can always copy the current URL to get a direct URL to the currently selected item (page, block etc.)
        //
        // tags:
        //      internal

        // encodeEnabled: Boolean
        //    Flag indicates that user want encode hash or not
        encodeEnabled: false,

        // _requestContext: Boolean
        //    Flag indicates that request context need to be sent or not
        _requestContext: true,

        // _hashChanged: Boolean
        //    Flag indicates that url's hash changed or not
        _hashChanged: true,

        constructor: function (settings) {
            // summary:
            //      Creates new HashWrapper instance.
            //      Subcribe [hashchange] event
            //
            // settings: Object
            //      Settings for new instance
            //
            // tags:
            //      Public

            if (settings) {
                this.encodeEnabled = settings.encodeEnabled;
            }

            this._hash = this._hash || hash;
            this._cookie = this._cookie || cookie;

            connect.subscribe("/dojo/hashchange", this, "_onHashChanged");
        },

        getHash: function () {
            // summary:
            //      Return current hash stored by browser and convert it to object
            //
            // tags:
            //      Public
            var currentHash = this._hash();
            if (!currentHash) {
                var hashInCookie = this._cookie("epihash");
                if (hashInCookie) {
                    currentHash = this._hash(hashInCookie);
                }
                this._cookie("epihash", null, { expires: -1, path: "/" });
            }
            return io.queryToObject(decodeURIComponent(currentHash));
        },

        setHash: function (fragment) {
            // summary:
            //      Stores new hash, convert back to query
            //
            // fragment: Object
            //      Hash object defined by it's self
            //
            // tags:
            //      Public

            this._hash(this.encodeEnabled ? encodeURIComponent(decodeURIComponent(io.objectToQuery(fragment))) : decodeURIComponent(io.objectToQuery(fragment)));
        },

        hashEmpty: function () {
            // summary:
            //      Indicates that current hash empty or not
            //
            // tags:
            //      Public

            return epi.isEmpty(this.getHash());
        },

        onHashChanged: function (ctx) {
            // summary:
            //      Call back function to overrided from outside (from caller), triggered when hash changed
            //
            // ctx: Object
            //      Current page data context
            //
            // tags:
            //      Public callback
        },

        _hashAreEqual: function (firstHash, secondHash) {
            // summary:
            //      Utilities function to compare 2 hash objects
            //
            // firstHash: Object
            //
            // secondHash: Object
            //
            // tags:
            //      Private

            if (!firstHash && !secondHash) {
                return true;
            }

            if (firstHash && secondHash) {
                return (firstHash.context === secondHash.context);
            }

            return false;
        },

        onContextChange: function (ctx, callerData) {
            // summary:
            //      Called when user click on page tree node for instance, we only set hash like this case
            //
            // ctx: Object
            //      Page data context
            //
            // callerData: Object
            //      Sources that fire the event
            //
            // tags:
            //      Public

            this._onContextChange(ctx, callerData);
        },

        extractHash: function (ctx, callerData) {
            // summary:
            //      Extracts hash string from context.
            //
            // ctx: Object
            //      Page data context
            //
            // callerData: Object
            //      Sources that fire the event
            //
            // tags:
            //      Public

            var storedHash = this.getHash();
            var newHash = this._getNewHash(ctx);
            var fragment = this.hashEmpty() ? newHash : lang.mixin(storedHash, newHash);
            return this.encodeEnabled ? encodeURIComponent(decodeURIComponent(io.objectToQuery(fragment))) : decodeURIComponent(io.objectToQuery(fragment));
        },

        _onContextChange: function (ctx, callerData) {
            // summary:
            //      Handlers [/epi/shell/context/changed] event
            //      The event fired when user click on page tree node for instance, we only set hash like this case
            //
            // ctx: Object
            //      Page data context
            //
            // callerData: Object
            //      Sources that fire the event
            //
            // tags:
            //      Private

            var storedHash = this.getHash();
            var newHash = this._getNewHash(ctx);

            // Prevent onHashChange fired when moving selected page
            if (!this._hashAreEqual(storedHash, newHash)) {
                if (!callerData || callerData.sender !== this) {
                    this._requestContext = false;
                    this._hash(this.extractHash(ctx, callerData));
                }

                //  Set by self (call setHash)
                this.onHashChanged(ctx);

            } else if (this._hashChanged) {

                //  Set by user (change context in url)
                this.onHashChanged(ctx);
            }

            this._hashChanged = false;
        },

        _getNewHash: function (ctx) {
            // summary:
            //      Gets a new hash value from context
            //
            // ctx: Object
            //      Page data context
            //
            // tags:
            //      Private

            return { context: ctx.requestedUri || ctx.versionAgnosticUri || ctx.uri };
        },

        _onHashChanged: function (newHash) {
            // summary:
            //      Handlers [/dojo/hashchange] event that fire when:
            //          + Users enter url with fragment (hash)
            //          + Fire by self to update hash part of URL
            // newHash: String
            //      New hash will be changed
            // tags:
            //      Private

            if (this._requestContext) {
                this._hashChanged = true;

                var hashObj = io.queryToObject(decodeURIComponent(newHash));
                if (hashObj && hashObj.context) {
                    var contextParameters = { uri: hashObj.context };
                    connect.publish("/epi/shell/context/request", [contextParameters, { sender: this }]);
                }
            }

            // reset variable to default
            this._requestContext = true;
        }
    });
});
