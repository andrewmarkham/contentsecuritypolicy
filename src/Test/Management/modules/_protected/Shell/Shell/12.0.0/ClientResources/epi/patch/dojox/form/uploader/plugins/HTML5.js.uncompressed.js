define("epi/patch/dojox/form/uploader/plugins/HTML5", [
    "dojo/_base/lang",
    "dojox/form/Uploader",
    "dojox/form/uploader/plugins/HTML5"
], function (lang, Uploader, HTML5) {
    // module:
    //		dojox/form/uploader/plugins/HTML5
    // summary:
    //		Fix issue with unhandled error when parsing non-JSON data as JSON

    lang.mixin(HTML5.prototype, {

        createXhr: function () {
            var xhr = new XMLHttpRequest();
            var timer;
            xhr.upload.addEventListener("progress", lang.hitch(this, "_xhrProgress"), false);
            xhr.addEventListener("load", lang.hitch(this, "_xhrProgress"), false);
            xhr.addEventListener("error", lang.hitch(this, function (evt) {
                this.onError(evt);
                clearInterval(timer);
            }), false);
            xhr.addEventListener("abort", lang.hitch(this, function (evt) {
                this.onAbort(evt);
                clearInterval(timer);
            }), false);
            xhr.onreadystatechange = lang.hitch(this, function () {
                if (xhr.readyState === 4) {
                    //				console.info("COMPLETE")
                    clearInterval(timer);

                    /* THE FIX GOES HERE */
                    /* --------------------------------------------------------------------------------------------- */

                    // Handle exception when parsing data and trigger onError if there was any error
                    var jsonData;
                    if (xhr.responseText) {
                        try {
                            jsonData = JSON.parse(xhr.responseText.replace(/^\{\}&&/, ''));
                        } catch (e) {
                            this.onError({
                                message: e.message,
                                data: xhr.responseText,
                                statusCode: xhr.status,
                                headers: xhr.getAllResponseHeaders()
                            });
                            return;
                        }
                    }
                    this.onComplete(jsonData);

                    /* --------------------------------------------------------------------------------------------- */
                    /* END FIX */
                }
            });
            xhr.open("POST", this.getUrl());

            timer = setInterval(lang.hitch(this, function () {
                try {
                    //  accessing this error throws an error. Awesomeness.
                    if (typeof (xhr.statusText)) { } //eslint-disable-line no-empty
                } catch (e) {
                    //this.onError("Error uploading file."); // not always an error.
                    clearInterval(timer);
                }
            }), 250);

            return xhr;
        }
    });

    HTML5.prototype.createXhr.nom = "createXhr";
});
