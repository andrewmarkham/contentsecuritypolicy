define("epi/shell/widget/Iframe", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom",
    "dojo/dom-style",

    "dojo/Deferred",
    "dojo/io-query",
    "dojo/on",
    "dojo/sniff",
    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/focus",
    // epi
    "epi",
    "epi/Url",
    "epi/shell/applicationSettings",
    "epi/shell/DestroyableByKey",
    "epi/shell/postMessage",
    "epi/routes"
],

function (
// dojo
    declare,
    lang,

    dom,
    domStyle,

    Deferred,
    ioQuery,
    on,
    sniff,

    // dijit
    _TemplatedMixin,
    _Widget,
    focus,

    // epi
    epi,
    Url,
    applicationSettings,
    DestroyableByKey,
    postMessage,
    routes
) {

    return declare([_Widget, _TemplatedMixin, DestroyableByKey], {
        // summary:
        //      This widget displays a page within an iframe. It will publish notifications when the
        //      page within the iframe is changed.
        //
        // tags:
        //      public

        // autoFit: [public] bool
        //    Enable resizing based on the iframe content.
        autoFit: false,

        // isLoading: [public] bool
        //     Indicates whether the iframe is currently loading content
        isLoading: false,

        // name: [public] string
        //    The name to set to the iframe element.
        name: "",

        // responseTimeout: [public] Number
        //    How long to wait in ms when loading a page.
        responseTimeout: 15000,

        // templateString: [protected] String
        //    A string that represents the iframe template for the widget.
        templateString: "<iframe data-dojo-attach-point=\"iframe\" class=\"dijitReset\" name=\"${name}\" src=\"${url}\" role=\"presentation\" frameborder=\"0\" style=\"width:100%; user-select: none;\"></iframe>",

        // visible: [public] bool
        //     Set to false to hide this widget
        visible: true,

        // url: [public] String
        //    A string URL that represents the source of the iframe.
        url: "about:blank",

        // isInspectable: [private] bool
        //     Indicates if the iframes content is available
        //     for modification i.e. in the same domain
        _isInspectable: null,

        _loadDeferred: null,

        // _triggeredExternally: [private] bool
        //    Set to true while url is changed by calling set("url", ...)
        _triggeredExternally: false,

        onLoading: function (url) {
            // summary:
            //      Called when the iframe starts to load after a new url is set
            //
            // tags:
            //      callback

            this._set("isLoading", true);
        },

        onUnload: function (url) {
            // summary:
            //      Called when the iframe is unloaded
            //
            // url: String?
            //      The unloaded URL, this will be null if requested URL is not a local one
            //
            // tags:
            //      callback
            this._set("isLoading", true);
        },

        onLoad: function (url, triggeredExternally) {
            // summary:
            //      Called when the iframe has loaded
            //
            // url: String?
            //      The loaded URL, this will be null if requested URL is not a local one
            //
            // triggeredExternally: Bool
            //      Was the load request triggered externally, i.e. by using set("url", ...)
            //
            // tags:
            //      callback
            this._set("isLoading", false);
        },

        buildRendering: function () {
            this.inherited(arguments);

            if (applicationSettings.previewTimeout) {
                this.set("responseTimeout", applicationSettings.previewTimeout);
            }

            this.own(
                on(this.iframe, "load", function () {
                    this._onIframeLoad();
                }.bind(this)),
                postMessage.subscribe(this.name + "/site/load", function (message) {
                    this._onIframeLoad(message.url);
                }.bind(this)),
                postMessage.subscribe(this.name + "/site/mouseup", function () {
                    // When the iframe is on different origin, bubble mouseup event
                    // outwards, so that we can stop editing
                    if (!this.isInspectable()) {
                        on.emit(this.domNode, "mouseup", {bubbles: true, cancelable: true});
                    }
                }.bind(this))
            );
        },

        resize: function (size) {
            // summary:
            //    Resize iframe.
            //
            // size: Object
            //    New size {w, h}
            //
            // tags:
            //    private

            if (this.autoFit) {
                return;
            }

            if (size) {
                domStyle.set(this.iframe, {
                    width: size.w + "px",
                    height: size.h + "px"
                });
            }
        },

        getDocument: function () {
            // summary:
            //    Gets the the currently loaded document if possible

            if (!this.isInspectable()) {
                return null;
            }

            try {
                // contentWindow might be undefined if we access this method too early, when iframe has not loaded any page
                return this.iframe.contentWindow ? this.iframe.contentWindow.document : null;
            } catch (ex) {
                return null;
            }
        },

        getWindow: function () {
            // summary:
            //    Gets the the window object of this iframe
            return this.iframe.contentWindow;
        },

        _setVisibleAttr: function (value) {
            this._set("visible", value);
            domStyle.set(this.domNode, "display", value ? "block" : "none");
        },

        _onIframeLoad: function (url) {
            // summary:
            //    Called when an load event has occurred.
            // tags:
            //    private

            var isInspectable = this.isInspectable(true);
            if (!this.isLoading && isInspectable) {
                return;
            }

            this.destroyByKey("loading");

            if (isInspectable) {

                url = url || this.getLocation().href;

                this.ownByKey("loaded",
                    on(this.getWindow(), "unload", this._onUnload.bind(this, url)),
                    focus.registerIframe(this.iframe),
                    this.connect(this.getDocument(), "onmousedown", function () {
                        on.emit(this.domNode, "mousedown", { bubbles: true, cancelable: true });
                    }),
                    this.connect(this.getDocument(), "onmouseup", function () {
                        on.emit(this.domNode, "mouseup", { bubbles: true, cancelable: true });
                    })
                );
            }

            this._set("url", url);

            if (url !== "about:blank") {
                if (this._loadDeferred) {
                    this._loadDeferred.resolve();
                    this._loadDeferred = null;
                }

                this.onLoad(this.url, this._triggeredExternally);
            }

            // reset variable
            if (this.url) {
                this._triggeredExternally = false;
            }

            if (this.autoFit) {
                this._adjustSize(this._calculateActualSize());
            }
        },

        _onUnload: function (url) {
            // remove this now before it's too late
            this.destroyByKey("loaded");

            this.set("_isInspectable", false);
            this.onUnload(url);
        },

        isInspectable: function (/*bool */clearCache) {
            // summary:
            //    Checks if the document loaded is
            //    accessible by code i.e. in the same domain

            if (!clearCache && this._isInspectable !== null) {
                return this._isInspectable;
            }

            try {
                // For chrome that doesn't throw in x-domain.
                // console logs it as errors though...
                return this._isInspectable = !!this.getLocation().href; // convert falsy/truthy value to corresponding bool
            } catch (ex) { } //eslint-disable-line no-empty

            return this._isInspectable = false;
        },

        load: function (url, parameters, mixWithExistingParams, forceReload) {
            // summary:
            //    Load a new document
            //
            // url: string
            //    The url to load
            //
            // parameters: Object
            //    Parameters to add to the url
            //
            // mixWithExistingParams: bool
            //    if true, mix parameters from the url with the ones
            //    from the parameter object
            //
            // forceReload: bool
            //    if true then reloads the page even if its the same url
            //    by default load will not trigger any request for the same url
            //
            // return: Deferred
            //    A deferred which resolves when the iframe load

            var deferred = new Deferred(),
                currentUrl = new Url(this.url),
                newUrl = new Url(url, parameters, mixWithExistingParams),
                windowProtocol = window.location.protocol.replace(":", ""),
                protocolIsNotEqual = (newUrl.scheme === "http" && windowProtocol === "https"),
                doLoad = function (url, setupTimeout) {
                    function handleTimeout() {
                        var url = routes.getActionPath({ moduleArea: "Shell", controller: "PreviewUnavailable", action: "Timeout"});
                        doLoad(url, false);
                    }

                    if (setupTimeout) {
                        this.destroyByKey("loading");
                        this.ownByKey("loading", this.defer(handleTimeout.bind(this), this.responseTimeout));
                    }
                    this.set("url", url.toString());
                }.bind(this);

            if (this._loadDeferred) {
                this._loadDeferred.cancel();
            }

            if (!url) {
                deferred.cancel();
                return deferred.promise;
            }

            this._loadDeferred = deferred;

            if (protocolIsNotEqual) {
                newUrl = routes.getActionPath({ moduleArea: "Shell", controller: "PreviewUnavailable"});
            }

            if (forceReload || !(newUrl.path === currentUrl.path && epi.areEqual(newUrl.query, currentUrl.query))) {
                doLoad(newUrl, true);
            } else if (!this.isLoading) {
                return deferred.resolve();
            }

            return deferred.promise;
        },

        reload: function () {
            // summary:
            //    Reload the currently loaded url
            //
            // return: Deferred
            //    A deferred which resolves when the iframe load

            return this.load(this.get("url"), null, null, true);
        },

        getCurrentQuery: function () {
            // REMARK: if url is not local this will fail
            return ioQuery.queryToObject(this.getWindow().location.search.substring(1));
        },

        getLocation: function () {
            // summary:
            //    Gets the current location property of the iframe
            //
            return this.getWindow().location;
        },

        _getUrlAttr: function () {
            return this.url;
        },

        _setUrlAttr: function (url) {
            this._triggeredExternally = true;
            this.onLoading(url);

            if (this.iframe.contentWindow) {
                this.iframe.contentWindow.location.replace(url);
            } else {
                this.iframe.src = url;
            }

            this._set("url", url);
        },

        _calculateActualSize: function () {
            // summary:
            //    Calculate the best actual size for the dialog.
            //
            // tags:
            //    private

            var doc = this.getDocument();

            function getSize(dir) {
                if (doc && doc.body && doc.documentElement) {

                    return Math.max(
                        doc.documentElement["client" + dir],
                        doc.documentElement["scroll" + dir],
                        doc.documentElement["offset" + dir],
                        doc.body["scroll" + dir],
                        doc.body["offset" + dir]
                    );
                }

                return 0;
            }

            return { h: getSize("Height"), w: getSize("Width") };
        },

        _adjustSize: function (size) {
            // summary:
            //    Adjust dialog size according to inner content.
            //
            // tags:
            //    private

            //Manually resizing inner content will force the widget to resize
            domStyle.set(this.iframe, "height", size.h + "px");

            // set the iframe's body height to "auto" to hide the vertical scrollbar
            domStyle.set(this.getWindow().document.body, "height", "auto");
        }

    });

});
