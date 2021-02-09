define("epi/shell/command/withConfirmation", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "dojo/Deferred",
    "epi/shell/widget/dialog/Confirmation"
],
function (declare, lang, when, Deferred, Confirmation) {

    function defaultConfirmationHandler(settings) {

        var deferred = new Deferred(),
            dialog = new Confirmation(settings);

        dialog.connect(dialog, "onAction", function (confirm) {
            if (confirm) {
                deferred.resolve();
            } else {
                //TODO: reject() is called in DialogService. Need to investigate (CMS-6808)
                deferred.cancel();
            }
        });

        dialog.show();

        return deferred.promise;
    }

    return function (command, /* function */confirmationHandler, /* Object */settings) {
        // summary:
        //      Adds confirmation before executing a command.
        //
        // tags:
        //      internal xproduct

        // keep original method.
        var originalExecute = command._execute;

        // wrap with a confirmation dialog and return a deferred.
        command._execute = function () {

            var commandDeferred = new Deferred();

            function executioner() {
                when(originalExecute.apply(command, arguments),
                    commandDeferred.resolve,
                    commandDeferred.cancel);
            }

            confirmationHandler = confirmationHandler || defaultConfirmationHandler;
            when(confirmationHandler(settings), executioner, commandDeferred.cancel);
            return commandDeferred;
        };

        // return the wrapped command.
        return command;
    };
});
