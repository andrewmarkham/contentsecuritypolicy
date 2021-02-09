define("epi-cms/contentediting/command/ItemCollectionCommands", [
    "dojo/_base/declare",
    "./BlockRemove",
    "./ItemEdit",
    "./MoveToPrevious",
    "./MoveToNext",
    "./ContentAreaCommands"
], function (declare, Remove, Edit, MoveToPrevious, MoveToNext, ContentAreaCommands) {

    return declare([ContentAreaCommands], {
        // summary:
        //      The commands for context menu of editor,
        //      and use as class for commandProviderClass
        // description:
        //      That include:
        //          - Edit command
        //          - Move previous command
        //          - Move next command
        //          - Remove command
        // tags:
        //      internal

        constructor: function (/*Object*/options) {
            // summary:
            //      Overwrite base class
            // tags:
            //      protected

            var commandOptions = options ? options.commandOptions : {};
            this.commands = [
                new Edit(commandOptions),
                new MoveToPrevious(commandOptions),
                new MoveToNext(commandOptions),
                new Remove(commandOptions)
            ];
        }
    });
});
