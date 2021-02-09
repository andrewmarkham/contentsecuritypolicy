define("epi/shell/DialogService", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/on",
    "dgrid/List",
    "dgrid/extensions/DijitRegistry",
    "put-selector/put",
    "epi/shell/widget/dialog/Alert",
    "epi/shell/widget/dialog/Confirmation",
    "epi/shell/widget/dialog/Dialog"
], function (
    declare,
    lang,
    Deferred,
    on,
    List,
    DijitRegistry,
    put,
    Alert,
    Confirmation,
    Dialog
) {
    var ErrorList = declare([List, DijitRegistry], {
        renderRow: function (value, options) {
            return put("div", "", {
                innerHTML: value
            });
        }
    });

    return {
        // summary:
        //		Show different dialogs.
        //
        // description:
        //		Use the "show" method to pick the type of dialog by its name (useful for data objects where
        //      the message type is a part of it) or use the stand-alone methods to easily show a dialog with sensible
        //      defaults.
        //
        // tags:
        //      public

        show: function (type, settings) {
            // summary:
            //      Convenience method to show a dialog based on the "type" instead of calling the specific method.
            // description:
            //      type: The type of dialog. I.e. alert, confirm.
            //      settings: Include "title" and "description" to set the text. Optionally override the default settings.
            //      Returns a promise.
            // tags:
            //      public

            if (!this[type]) {
                throw new Error("Dialog type " + type + " is not a valid DialogService option.");
            }

            return this[type].call(this, settings);
        },

        alert: function (settings) {
            // summary:
            //      Displays an Alert dialog.
            // settings: [Object|string]
            //      Include "title" and "description" to set the text. Optionally override the default settings.
            //      when settings is a string then used as a description
            // returns:
            //      Returns a promise. Always resolves.
            // tags:
            //      public

            if (typeof settings === "string") {
                settings = {
                    description: settings
                };
            }
            return this.alertWithErrors(settings);
        },

        alertWithErrors: function (settings, errors) {
            // summary:
            //      Displays an Alert dialog with a list errors
            // settings: Object
            //      Include "heading" and "description" to set the text. Optionally override the default settings.
            // errors:  [string]
            //      A list of errors to display, it will replace the description passed in the settings object
            // returns:
            //      Returns a promise. Always resolves.
            // tags:
            //      public

            var deferred = new Deferred();

            if (errors instanceof Array) {
                var list = new ErrorList({ className: "epi-grid-max-height--300" });
                list.renderArray(errors);
                list.startup();

                settings.content = list;
                settings.description = null;
            }

            this._callDialog(Alert, settings, deferred.resolve);

            return deferred.promise;
        },

        confirmation: function (settings) {
            // summary:
            //      Displays an Confirmation dialog.
            // description:
            //      settings: Include "title" and "description" to set the text. Optionally override the default settings.
            //      Returns a promise. Resolves on confirm, rejects on cancel.
            // tags:
            //      public

            var deferred = new Deferred();

            this._callDialog(Confirmation, settings, function (confirm) {
                if (confirm) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            });

            return deferred.promise;
        },

        dialog: function (settings) {
            // summary:
            //      Displays a dialog.
            // description:
            //      settings: Include "title" and "description" to set the text. Optionally override the default settings.
            //      Returns a promise. Resolves on dialog submit, rejects on cancel.
            // tags:
            //      internal

            var deferred = new Deferred();

            var dialog = new Dialog(settings);
            on.once(dialog, "execute", function (value) {
                deferred.resolve(value);
            });
            on.once(dialog, "cancel", function () {
                deferred.reject();
            });

            dialog.show();

            return deferred.promise;
        },

        _callDialog: function (dialogClass, settings, callback) {
            var dialog = new dialogClass(settings);

            dialog.on("action", callback);
            dialog.show();
        }
    };
});
