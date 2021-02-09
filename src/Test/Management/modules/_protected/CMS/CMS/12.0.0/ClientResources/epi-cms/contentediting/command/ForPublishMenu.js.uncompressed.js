define("epi-cms/contentediting/command/ForPublishMenu", [
    "dojo/_base/lang"
],
function (lang) {

    return function (command, options) {
        // summary:
        //      Adds some decorations for the command to be used in publish menu.
        // command: epi/shell/command/_Command
        //      The command
        // options: Object
        //      The options. Available options are:
        //          isMain: Indicate if the command can be the main command.
        //          priority: The command priority.
        //          mainButtonClass: CSS class applied to main button if command is main command.
        //          keepMenuOpen: Keep publish menu open after command executed.
        //          successStatus: The text to display when the command successfully executed.
        //
        // tags:
        //      internal

        // TODO: Use lang.delegate and return a new command instance, to avoid messing up the original command.
        // Temporarily set the options to the original command because lang.delegate doesn't work well with Stateful objects.

        options = lang.mixin({
            isMain: false,
            priority: 0,
            resetLabelAfterExecution: true,
            mainButtonClass: null,
            keepMenuOpen: false,
            successStatus: null
        }, options);

        command.options = options;

        return command;
    };
});
