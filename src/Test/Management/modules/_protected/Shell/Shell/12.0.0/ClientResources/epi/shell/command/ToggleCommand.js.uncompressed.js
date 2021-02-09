define("epi/shell/command/ToggleCommand", [
    "dojo/_base/declare",
    "epi/shell/DestroyableByKey",
    "epi/shell/command/_Command"
], function (declare, DestroyableByKey, _Command) {

    return declare([_Command, DestroyableByKey], {
        // summary:
        //      A base class implementation for commands which toggles the value of a property on the model.
        //
        // tags:
        //      public

        // property: [public] String
        //		The name of the property on the model which this command will toggle.
        property: null,

        // active: [readonly] Boolean
        //		Flag which indicates whether this command is active. Value is true if command is active; otherwise false.
        active: false,

        _execute: function () {
            // summary:
            //		Toggles the value of the given property on the model.
            // tags:
            //		protected

            var name = this.property,
                value = !this.active;

            this.model.set(name, value);
            this.set("active", value);
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var self = this;

            var model = this.model,
                active = model && model[this.property],
                canExecute = typeof active == "boolean";

            this.set("canExecute", canExecute);
            this.set("active", canExecute && active);

            if (model) {
                this.destroyByKey("modelPropertyWatcher");
                this.ownByKey("modelPropertyWatcher", model.watch(this.property, function (name, oldValue, value) {
                    self.set("active", !!value);
                }));
            }

        }
    });
});
