define("epi/shell/command/DelegateCommand", [
    "dojo/_base/declare",
    "epi/shell/command/_Command"
], function (declare, _Command) {

    return declare([_Command], {
        // summary:
        //      A command implementation which can delegate execution to an external model.
        //
        // tags:
        //      internal

        // delegate: Function
        //      The delegate method.
        delegate: null,

        _execute: function () {
            // summary:
            //      Execute the command
            // tags:
            //      protected

            // Execute the delagate. Alter the arguments to send this instance as the first parameter.
            return this.delegate ? this.delegate.apply(this, [this].concat(arguments)) : null;
        }
    });
});
