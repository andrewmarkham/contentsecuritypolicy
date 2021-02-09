define("epi/shell/xhr/errorHandler", [
    "dojo/_base/declare",
    "dojo/when",
    "dojo/_base/json",
    "dgrid/List",
    "dgrid/extensions/DijitRegistry",
    "epi/shell/DialogService",
    "../widget/dialog/Alert",
    "../widget/dialog/ErrorDialog"
], function (
    declare,
    when,
    json,
    List,
    DijitRegistry,
    dialogService,
    Alert,
    ErrorDialog
) {
    var ErrorList = declare([List, DijitRegistry]),
        module;

    function parseResponseText(responseData) {
        if (typeof responseData === "string") {
            try {
                return json.fromJson(responseData);
            } catch (e) {
                console.warn("Failed to parse responseText as json", e);
            }
        }

        return {};
    }

    module = {
        // tags:
        //      internal xproduct

        forXhr: function (response) {
            // summary:
            //      Shows an alert dialog with the response message from a failed xhr result.
            //      If it's a 5xx error then the entire body is shown, otherwise the message
            //      is shown in an Alert dialog.
            //
            // tags:
            //      internal

            var data,
                settings,
                list;

            if (response.status >= 500) {
                ErrorDialog.showXmlHttpError(response, response);
            } else {
                data = parseResponseText(response.responseText);
                settings = {
                    description: data.message || response.message
                };

                // If there is additional information for the error then display it as a
                // list within the alert dialog.
                if (data.additionalInformation instanceof Array) {
                    list = new ErrorList({ className: "epi-grid-max-height--300" });
                    list.renderArray(data.additionalInformation);
                    list.startup();

                    settings.content = list;
                }

                return dialogService.alert(settings);
            }
        },
        wrapXhr: function (promise) {
            // summary:
            //      Shows an alert dialog with the response message from a failed xhr result.
            //      If it's a 5xx error then the entire body is shown, otherwise the message
            //      is shown in an Alert dialog.
            // returns:
            //      A promise
            //
            // tags:
            //      internal

            promise = when(promise);
            promise.otherwise(module.forXhr);

            return promise;
        }
    };

    return module;
});
