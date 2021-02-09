define("epi-cms/contentediting/command/ContentAreaCommands", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/Stateful",
    "dijit/Destroyable",
    "epi-cms/ApplicationSettings",
    "./BlockRemove",
    "./BlockEdit",
    "./MoveVisibleToPrevious",
    "./MoveVisibleToNext",
    "./Personalize",
    "./SelectDisplayOption"
], function (array, declare, Stateful, Destroyable, ApplicationSettings, Remove, Edit, MoveVisibleToPrevious, MoveVisibleToNext, Personalize, SelectDisplayOption) {

    return declare([Stateful, Destroyable], {
        // tags:
        //      internal

        commands: null,

        constructor: function () {
            this.commands = [
                new Edit(),
                new SelectDisplayOption(),
                new MoveVisibleToPrevious(),
                new MoveVisibleToNext(),
                new Remove()
            ];
            // Only add personalize command if the ui is not limited
            if (!ApplicationSettings.limitUI) {
                this.commands.splice(2, 0, new Personalize());
            }

            this.commands.forEach(function (command) {
                this.own(command);
            }, this);
        },

        _modelSetter: function (model) {
            this.model = model;

            array.forEach(this.commands, function (command) {
                command.set("model", model);
            });
        }
    });
});
