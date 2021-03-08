define([
    "dojo/string",
    "epi/i18n!epi/nls/episerver.cms.tinymce"
], function (string, resources) {
    "use strict";

    return function (display, transformationErrors) {
        // summary:
        //      Generates error messages for the given transformation errors and displays the using the display function
        // display: function
        //      The display function to call when the error message should be displayed
        // transformationErrors: Object
        //      The transformation errors
        // tags:
        //      internal

        if (!transformationErrors) {
            return;
        }

        var errorMessages = Object.keys(transformationErrors).map(function (key) {
            var error = transformationErrors[key];

            //Log the error to the console
            console.error(string.substitute("An error occurred when running the settings transform '${key}' for property '${error.propertyName}' with exception '${error.errorMessage}' on '${error.content.contentLink}'",{
                key: key,
                error: error
            }));

            return string.substitute(resources.settingstransformerror, {
                transformName: key,
                propertyName: error.propertyName
            });
        });

        if (errorMessages.length > 0) {
            display({
                text: errorMessages.join("<br />"),
                type: "error"
            });
        }
    };
});
