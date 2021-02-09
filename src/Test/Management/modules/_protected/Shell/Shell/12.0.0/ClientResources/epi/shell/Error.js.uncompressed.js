define("epi/shell/Error", [
    "dojo",
    "dijit/Dialog",
    "epi/i18n!epi/shell/nls/episerver.shell.resources.texts"],
function (dojo, Dialog, res) {
    return {
        // tags:
        //      internal

        openErrorDialog: function (element, errorText) {
            //Create the dialog
            var dialog = new Dialog({
                title: res.error,
                style: "width: 600px",
                content: errorText
            });

            //Open it
            dialog.show();
        },

        createErrorMessage: function (parentElement, errorTitle, errorText, status, includeMoreInformation) {
            if (errorTitle) {
                if (!errorText) {
                    includeMoreInformation = false;
                }

                if (includeMoreInformation) {
                    errorTitle = errorTitle + " <br/><a href='#' class='epi-openErrorDialogButton'>" + res.errormoreinformationtext + "</a>";
                }

                parentElement.innerHTML = errorTitle;

                dojo.query(".epi-openErrorDialogButton").connect("onclick", dojo.hitch(this, function () {
                    this.openErrorDialog(parentElement, errorText);
                }));
            }
        },

        showDialogWithElementContent: function (errorContainer) {
            this.openErrorDialog(dojo.body(), errorContainer.innerHTML);
        }
    };
});
