define("epi/shell/form/uploader/HTML5", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojox/form/uploader/plugins/HTML5",
    "epi/shell/request/mutators",
    "epi/shell/applicationSettings",
    "epi/shell/XhrWrapper"
], function (
    declare,
    lang,
    HTML5,
    mutators,
    applicationSettings,
    XhrWrapper) {

    var plugin = declare([HTML5], {
        // summary:
        //      Extends the dojox HTML5 uploader plugin with support for adding headers to the upload request
        // tags:
        //      internal

        _headers: null,

        uploadWithFormData: function (/*Object*/ data) {
            // summary:
            //      Overridden to add custom headers appended by the epi/shell/request/mutators chain
            //      to the upload request

            return this._getHeadersThenExecute(this.getInherited(arguments), arguments);
        },

        sendAsBinary: function (/*Object*/ data) {
            // summary:
            //      Overridden to add custom headers appended by the epi/shell/request/mutators chain
            //      to the upload request

            return this._getHeadersThenExecute(this.getInherited(arguments), arguments);
        },

        createXhr: function () {
            // summary:
            //      Overridden to append any headers added by any 'beforeSend' mutators registered with epi/shell/request/mutators

            var xhr     = this.inherited(arguments),
                headers = this._headers;

            if (headers) {
                for (var key in headers) {
                    if (headers.hasOwnProperty(key)) {
                        xhr.setRequestHeader(key, headers[key]);
                    }
                }
            }
            xhr.setRequestHeader(applicationSettings.antiforgeryTokenHeaderName, XhrWrapper.sharedXsrfHeader);
            return xhr;
        },

        _getHeadersThenExecute: function (uploadMethod, args) {

            // The beforeSend handlers expect an options.headers property.
            var params = {
                options: {
                    headers: {}
                }
            };

            // Calls the base implementation once the headers have been added.
            // The base implementation then calls createXhr where the headers
            // are added to the request
            return mutators.execute("beforeSend", params)
                .then(lang.hitch(this, function (params) {
                    this._headers = params.options.headers;
                    var result = uploadMethod.apply(this, args);
                    this._headers = null;
                    return result;
                }));
        }
    });

    dojox.form.addUploaderPlugin(plugin); //eslint-disable-line no-undef
    return plugin;

});
