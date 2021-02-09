define("epi/shell/widget/command/RemoveGadget", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/i18n!epi/shell/ui/nls/episerver.shell.ui.resources.gadgetchrome",
    "epi/shell/command/_Command"
], function (declare, lang, resources, _Command) {

    return declare([_Command], {
        // summary:
        //      A commands which causes the associated gadget to be removed from the component grid.
        //
        // tags:
        //      internal

        // label: [public] String
        //		The action text of the command to be used in visual elements.
        label: resources.deletemenuitemlabel,

        // category: [readonly] String
        //		A category which provides a hint about how the command could be displayed.
        category: "setting",

        // order: [readonly] Integer
        //      An ordering indication used when generating a ui for this command.
        //      Commands with order indication will be placed before commands with no order indication.
        order: 1000,

        // canExecute: [readonly] Boolean
        //		This command can always be executed.
        canExecute: true,

        _execute: function () {
            // summary:
            //		Causes a close to happen on the associated gadget.
            // tags:
            //		protected

            this.model.onClose();
        }
    });
});
