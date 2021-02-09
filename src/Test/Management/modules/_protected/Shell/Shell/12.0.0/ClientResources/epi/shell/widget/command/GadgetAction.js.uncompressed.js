define("epi/shell/widget/command/GadgetAction", [
    "dojo/_base/declare",
    "epi/shell/command/_Command"
], function (declare, _Command) {

    return declare([_Command], {
        // summary:
        //      A command which causes the gadget to load a given view when executed.
        //
        // tags:
        //      public

        // actionName: [public] String
        //		String defining the view to load in the gadget.
        actionName: null,

        // category: [readonly] String
        //		A category which provides a hint about how the command could be displayed.
        category: "setting",

        // canExecute: [readonly] Boolean
        //		This command can always be executed.
        canExecute: true,

        _execute: function () {
            // summary:
            //		Causes a close to happen on the associated gadget.
            // tags:
            //		protected

            this.model.loadView({ action: this.actionName });
        }
    });
});
