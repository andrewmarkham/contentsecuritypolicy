define("epi/shell/command/OptionCommand", [
    "dojo/_base/declare",
    "epi/shell/command/_Command",
    "dijit/Destroyable"
], function (declare, _Command, Destroyable) {

    return declare([_Command, Destroyable], {
        // summary:
        //      A base class implementation for a command with several options that execute when changed.
        //
        // tags:
        //      public

        // options: [public] Array
        //		An array of options objects that can be selected.
        options: null,

        // optionsLabel: [public] String
        //      An optional label for the options drop down
        optionsLabel: "",

        // optionsProperty: [readonly] String
        //      Name of a property on the model providing the options
        optionsProperty: null,

        // selected: [readonly] String|Number
        //		The value of the selected item from the options array.
        selected: null,

        // property: [public] String
        //		The name of the property on the model that will be set with the selected value on execute.
        property: null,

        _execute: function () {
            // summary:
            //		Toggles the value of the given property on the model.
            // tags:
            //		protected

            this.model.set(this.property, this.selected);
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var self = this,
                model = this.model;

            this.set("canExecute", !!model);

            if (model) {
                this.set("selected", this.model.get(this.property));
                this.own(model.watch(this.property, function (name, oldValue, value) {
                    self.set("selected", value);
                }));
            }
        },

        _optionsGetter: function () {
            // summary:
            //      Returns the options array if defined on the command, otherwise if model
            //      and optionsProperty is defined, the options is returned from the model
            // tags:
            //      public

            return this.options || (this.model && this.optionsProperty && this.model.get(this.optionsProperty));
        },

        _selectedSetter: function (selected) {
            // summary:
            //      Setter method for the selected property
            // tags:
            //      private
            var oldValue = this.selected;

            this.selected = selected;

            if (oldValue !== selected) {
                this.execute();
            }
        }
    });
});
