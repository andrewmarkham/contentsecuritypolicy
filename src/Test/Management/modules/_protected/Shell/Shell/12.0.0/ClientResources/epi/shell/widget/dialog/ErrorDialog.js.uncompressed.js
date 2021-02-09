define("epi/shell/widget/dialog/ErrorDialog", [
    "dojo",
    "dijit/Dialog"
], function (
    dojo,
    Dialog
) {

    var dialog = null;
    var resourceRootPath = "/shell/cms/errordialog/";

    // Fallback resources, since resource fetching may fail as well
    var resources = {
        title: "A background request has failed",
        reloadtext: "Reload",
        heading: "An unhandled error has occured in a background request.",
        description: "The page may not function properly unless it's reloaded. Press the button below to reload the page now."
    };

        // The banner shown above the original error message
    var errorBanner = "\
        <div style=\"padding-bottom:10px; width:600px\"> \
            <h1>${heading}</h1> \
            <div style=\"background-color:#FFF; border:1px solid #000; padding:3px\">${errorMessage}</div> \
            <p>${description}</p> \
            <input type=\"button\" onclick=\"document.location.reload()\" value=\"${reloadtext}\" /> \
        </div> \
    ";

    function getDialog() {
        if (!dialog) {
            dialog = new Dialog();
        }
        return dialog;
    }

    function constructContent(message, responseText) {
        var rootElement = dojo.create("div", {
            innerHTML: dojo.string.substitute(errorBanner, dojo.mixin({ errorMessage: message }, resources))
        });
        // Need to set a lot of iframe properties since IE7 ignores the style attributes
        var iFrame = dojo.create("iframe", {
            style: "width:100%; height:400px; border:inset 1px #CCC",
            frameborder: "0",
            width: "600",
            height: "400",
            src: "about:blank"
        });

        if (iFrame.attachEvent) {
            // Can't use connect when listening to the load event of iframes
            // http://bugs.dojotoolkit.org/ticket/9609
            var contentSetter = function () {
                iFrame.detachEvent("onload", contentSetter);
                iFrame.contentWindow.document.write(responseText);
            };
            iFrame.attachEvent("onload", contentSetter);
        } else {
            var listener = dojo.connect(iFrame, "load", null, function () {
                dojo.disconnect(listener);
                iFrame.contentWindow.document.write(responseText);
            });
        }

        dojo.place(iFrame, rootElement);
        return rootElement;
    }

    var pub = {
        // summary:
        //      A singleton implementation of an error message dialog where require handles
        //      the singleton behavior by only loading this file once.
        // tags:
        //      internal

        getTextResourceKeys: function () {
            // summary:
            //      Returns an array with cms xml file language keys for localization

            var resKeys = [];
            for (var p in resources) {
                resKeys.push(resourceRootPath + p);
            }
            return resKeys;
        },

        setTextResources: function (keys) {
            // summary:
            //      Update localized resources
            // keys:
            //      An array of objects containing the resource key
            //      and localized resource text in the format: {key: "k", text:"t" }

            if (!dojo.isArray(keys)) {
                return;
            }

            dojo.forEach(keys, function (item) {
                if (dojo.isString(item.key) && dojo.isString(item.text)) {
                    resources[item.key.replace(resourceRootPath, "")] = item.text;
                }
            });
        },

        showXmlHttpError: function (response, ioArgs) {
            // summary:
            //      Opens a dijit dialog and populates it with the message and responseText
            //      (containing the server response) from the xml http request
            // message:
            //      The message returned as parameter to an dojo.xhr error callback
            // ioArgs:
            //      The ioArgs parameter for the dojo.xhr error callback

            var dialog = getDialog();

            var responseText = "";
            var message = "";
            if (ioArgs && ioArgs.xhr) {
                responseText = ioArgs.xhr.responseText;
            }

            if (dojo.isObject(response) && dojo.isString(response.message)) {
                // If response is an error object
                message = response.message;
            } else {
                message = response;
            }

            var content = constructContent(message, responseText);

            dialog.set("title", resources.title);
            dialog.set("content", content);
            dialog.show();
        }
    };

    return pub;
});
