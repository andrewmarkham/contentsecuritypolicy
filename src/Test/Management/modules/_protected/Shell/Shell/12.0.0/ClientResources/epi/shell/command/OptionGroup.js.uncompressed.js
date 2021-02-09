define("epi/shell/command/OptionGroup", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    "epi/shell/DestroyableByKey"
], function (declare, lang, Stateful, DestroyableByKey) {

    return declare([Stateful, DestroyableByKey], {
        // summary:
        //      Defines a group of options when creating option menus
        // tags: internal

        // label: [public] String
        //      The heading for the option group. To be used in visual elements.
        label: "",

        // options: [public] Array
        //      An array of options objects within this group.
        options: null,

        // model: [public] Object
        //      The model on which the selected option is updated.
        model: null,

        // selected: [public] String|Number
        //      The value of the selected item from the options array.
        selected: null,

        // selected: [public] String
        //      Name of the property on the model to update when the selected option changes.
        property: "",

        constructor: function () {
            this.options = [];
        },

        _selectedSetter: function (value) {
            // summary:
            //      Updates the selected property if changed and propagates the new value to the backing model.
            if (this.selected !== value) {
                this.selected = value;
                this.model && this.model.set(this.property, value);
            }
        },

        _modelSetter: function (model) {
            this.destroyByKey("_model");
            this.model = model;
            if (model) {
                this.set("selected", model.get(this.property));
                this.ownByKey("_model", model.watch(this.property, lang.hitch(this, function (name, oldValue, newValue) {
                    this.set("selected", newValue);
                })));
            }
        }

    });
});

