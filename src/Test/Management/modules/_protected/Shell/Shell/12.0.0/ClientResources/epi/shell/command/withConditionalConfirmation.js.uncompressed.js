define("epi/shell/command/withConditionalConfirmation", [
    "dojo/Deferred",
    "dojo/when",
    "epi/shell/DialogService"
], function (
    Deferred,
    when,
    dialogService
) {

    return function (command, settings) {
        // summary:
        //      Displays a confirmation before executing a command if the command is in a state that
        //      requires confirmation; otherwise the command is executed as normal.
        // tags:
        //      internal

        var originalExecute = command._execute,
            conditionProperty = settings.property || "requiresConfirmation";

        // Wrap the execution with a confirmation dialog if the condition is true.
        command._execute = function () {

            var promise = command[conditionProperty] ? dialogService.confirmation(settings) : new Deferred().resolve();

            return promise.then(function () {
                return when(originalExecute.apply(command, arguments));
            });
        };

        return command;
    };
});
