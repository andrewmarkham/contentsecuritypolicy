define("epi/shell/XhrWrapper", [
    "dojo/_base/array",
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/when",
    "epi/shell/applicationSettings",
    "epi/shell/request/xhr",
    "epi/shell/DialogService",
    "epi/i18n!epi/nls/episerver.shared",
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.reloaddialog"
], function (
    array,
    connect,
    declare,
    lang,
    Deferred,
    when,
    applicationSettings,
    xhr,
    dialogService,
    sharedResources,
    loginResources
) {

    // Shared variables between all instances of this class
    var reloadDeferred;

    var cls = declare(null, {
        // summary:
        //    Wrapper of xhr requests with support for XSRF validation and logout error handling
        //
        // tags:
        //    internal

        // xhrHandler: [public] Object
        //  The xhr implementation to use when requesting data. Defaults to dojo.xhr
        xhrHandler: null,

        // _dialogService: [private] Object
        //  The dialog service used to create the reload dialog. Defaults to epi/shell/DialogService.
        _dialogService: null,

        _headerKeys: {
            // loginScreen: [const private] String
            //    The name of the field in the request headers that indicates that the result
            //    is a login screen rather than the expected json data.
            loginScreen: "X-EPiLogOnScreen",
            postUrl: "X-EPiLogOnScreen-PostUrl",
            readOnlyMode: "X-EPiReadOnlyMode",
            readOnlyModeRedirectUrl: "X-EPiReadOnlyMode-RedirectUrl"
        },

        constructor: function (options) {
            // summary:
            //  Creates a new XhrWrapper instance
            //
            // options: Object
            //  Configuration options that will be mixed into the handler.

            declare.safeMixin(this, options);

            // Default the xhr handler to the dojo one.
            this.xhrHandler = this.xhrHandler || xhr;

            this._dialogService = this._dialogService || dialogService;
        },

        _readValidationToken: function () {
            //	summary:
            //		Reads server generated antiforgery token

            if (cls.sharedXsrfHeader) {
                return cls.sharedXsrfHeader;
            }

            cls.sharedXsrfHeader = document.getElementsByName(applicationSettings.antiforgeryTokenFieldName)[0].value;
            return cls.sharedXsrfHeader;
        },

        xhr: function (/*String*/method, /*dojo.__XhrArgs*/args) {
            //	summary:
            //		Sends an HTTP request with the given method.
            //	description:
            //		Sends an HTTP request with the given method.
            //		See also dojo.xhrGet(), xhrPost(), xhrPut() and dojo.xhrDelete() for shortcuts
            //		for those HTTP methods. There are also methods for "raw" PUT and POST methods
            //		via dojo.rawXhrPut() and dojo.rawXhrPost() respectively.
            //	method:
            //		HTTP method to be used, such as GET, POST, PUT, DELETE.  Should be uppercase.
            //  args:
            //      xhr arguments passed to dojo's native xhr API. This method always supports xsrfProtection

            args.headers = args.headers || {};
            args.headers[applicationSettings.antiforgeryTokenHeaderName] = this._readValidationToken();

            // Modify arguments to match the dojo/request api
            var options = lang.delegate({
                method: method,
                data: args.content || args.postData
            }, args);

            var xhrResult = this.xhrHandler(options.url, options, true);

            var deferred = new Deferred();
            deferred.ioArgs = xhrResult.ioArgs;

            when(xhrResult, lang.hitch(this, function (data) {
                // The query method checks this
                deferred.ioArgs = xhrResult.ioArgs;
                deferred.resolve(data);

            }), lang.hitch(this, function (err) {
                // Error, is it caused by a logout?
                var loginScreen = xhrResult.ioArgs.xhr.getResponseHeader(this._headerKeys.loginScreen);
                if (loginScreen === "true" || xhrResult.ioArgs.xhr.status === 401) {
                    this._showReloadDialog().then(deferred.resolve);

                } else if (xhrResult.ioArgs.xhr.status === 503) {
                    // If the server returns a 503 (Service Unavailable)
                    // determine if the system is in read only mode, if so redirect to the provided read only url
                    // otherwise reject the promise
                    var readOnlyMode = xhrResult.ioArgs.xhr.getResponseHeader(this._headerKeys.readOnlyMode);
                    var readOnlyModeRedirectUrl = xhrResult.ioArgs.xhr.getResponseHeader(this._headerKeys.readOnlyModeRedirectUrl);
                    if (readOnlyMode && readOnlyModeRedirectUrl) {
                        this._redirect(readOnlyModeRedirectUrl);
                    } else {
                        deferred.reject(err);
                    }
                } else {
                    // Some unknown error, pass the error back to the caller
                    deferred.reject(err);
                }
            }));
            return deferred;
        },

        xhrDelete: function (/*dojo.__XhrArgs*/args) {
            //	summary:
            //		Sends an HTTP DELETE request to the server.

            return this.xhr("DELETE", args);
        },
        xhrGet: function (/*dojo.__XhrArgs*/args) {
            //	summary:
            //		Sends an HTTP GET request to the server.

            return this.xhr("GET", args);
        },
        xhrPost: function (/*dojo.__XhrArgs*/args) {
            //	summary:
            //		Sends an HTTP POST request to the server. In addtion to the properties
            //		listed for the dojo.__XhrArgs type, the following property is allowed:
            //	postData:
            //		String. Send raw data in the body of the POST request.

            return this.xhr("POST", args, true);
        },
        xhrPut: function (/*dojo.__XhrArgs*/args) {
            //	summary:
            //		Sends an HTTP PUT request to the server. In addtion to the properties
            //		listed for the dojo.__XhrArgs type, the following property is allowed:
            //	putData:
            //		String. Send raw data in the body of the PUT request.

            return this.xhr("PUT", args, true);
        },

        _redirect: function (url) {
            window.top.location = url;
        },

        _showReloadDialog: function () {
            // summary:
            //    Show a dialog informing the user that they need to reload the site.
            //
            // returns:
            //    A deferred that will resolve when closing the dialog.
            //
            // tags:
            //   private

            if (this._isShowingReloadDialog()) {
                return reloadDeferred;
            }

            reloadDeferred = this._dialogService.alert({
                acknowledgeActionText: sharedResources.action.login,
                description: loginResources.loggedout,
                onAction: function () {
                    reloadDeferred = null;
                    // reload the page since that will force a new login
                    window.top.location.reload();
                }
            });

            return reloadDeferred;
        },

        _isShowingReloadDialog: function () {
            // tags:
            //   private

            return reloadDeferred && !reloadDeferred.isResolved();
        }
    });

    // create a shared variable
    cls.sharedXsrfHeader = undefined;

    return cls;
});
