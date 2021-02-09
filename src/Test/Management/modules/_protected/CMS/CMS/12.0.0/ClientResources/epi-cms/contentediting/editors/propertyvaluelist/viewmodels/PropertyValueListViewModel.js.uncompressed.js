define("epi-cms/contentediting/editors/propertyvaluelist/viewmodels/PropertyValueListViewModel", [
    // dojo
    "dojo/_base/declare",
    "dojo/Evented",
    "dojo/Stateful",
    "dojo/store/Observable",
    // dijit
    "dijit/Destroyable",
    // epi
    "epi/shell/command/_CommandProviderMixin",
    "epi/shell/store/SortableMemory",
    "../command/MoveUpPropertyValue",
    "../command/MoveDownPropertyValue",
    "../command/DeletePropertyValue"
], function (
    // dojo
    declare,
    Evented,
    Stateful,
    Observable,
    // dijit
    Destroyable,
    // epi
    _CommandProviderMixin,
    SortableMemory,
    MoveUpPropertyValue,
    MoveDownPropertyValue,
    DeletePropertyValue
) {
    return declare([Stateful, Evented, _CommandProviderMixin, Destroyable], {
        // summary:
        //      The view model for PropertyValueList
        // tags:
        //      internal

        // commands: [public] Array
        //      An array of commands available for the PropertyValueList
        commands: null,

        // store: [public] Store
        //      Store with editor widgets
        store: null,

        // value: [public] Object
        //      Value of the property value list
        value: null,

        // readOnly: [public] Boolean
        //      If the model is in read only state
        readOnly: false,

        // maxLength: [public] Number
        //      Controls how many list items can be added to the list
        maxLength: null,

        postscript: function () {
            this.inherited(arguments);
            this.store = new Observable(SortableMemory());
            this.own(this.store.query().observe(function () {
                this._changeAttrValue("value", this.get("value"));
            }.bind(this)));
            this._createCommands();
        },

        addItem: function (value) {
            // summary:
            //      Adds an editor to the list
            // tags:
            //      public

            if (this.readOnly) {
                return;
            }

            var itemId = this.store.add({ item: value });
            this.emit("itemAdded", { itemId: itemId });
        },

        remove: function () {
            // summary:
            //      Removes selected value from store and refreshes the list
            // tags:
            //      public

            if (this.readOnly || !this.selectedValue) {
                return;
            }

            this.store.remove(this.selectedValue.id);
        },

        getPreviousElement: function (propertyValue) {
            // summary:
            //      Gets the previous element in the list
            // tags:
            //      public
            return this.store.getSibling(propertyValue, true);
        },

        getNextElement: function (propertyValue) {
            // summary:
            //      Gets the next element in the list
            // tags:
            //      public
            return this.store.getSibling(propertyValue, false);
        },

        moveUp: function () {
            // summary:
            //      Moves a property value up in the list
            // tags:
            //      public
            this._move(true);
        },

        moveDown: function () {
            // summary:
            //      Moves a property value down in the list
            // tags:
            //      public
            this._move(false);
        },

        getFilteredValue: function () {
            // summary:
            //      Returns value excluding empty items
            // tags:
            //      public

            return this.get("value").filter(function (item) {
                return item === 0 || !!item;
            });
        },

        put: function (id, value) {
            var storeValue = this.store.get(id);
            if (storeValue && storeValue.item === value) {
                return;
            }
            storeValue.item = value;
        },

        _move: function (up) {
            // summary:
            //      Moves the propertyvalue up or down in the list.
            // tags:
            //      public

            if (this.readOnly || !this.selectedValue) {
                return;
            }

            var beforeSibling = this.store.getSibling(this.selectedValue.data, up);

            // Do an early exit in the case the step is being moved up but is already first or it is
            // being moved down but is already last. The sibling will be null in both cases.
            if (!beforeSibling) {
                return;
            }

            // If the step is moving down then get the next sibling to insert before.
            if (!up) {
                beforeSibling = this.store.getSibling(beforeSibling);
            }

            this.store.put(this.selectedValue.data, { before: beforeSibling });
        },

        _hasValueGetter: function () {
            // summary:
            //      return true if contains at least one non-empty item; otherwise false.
            // tags:
            //      public

            return this.getFilteredValue().length > 0;
        },

        _valueSetter: function (value) {
            this.store.query().forEach(function (item) {
                this.store.remove(item.id);
            }.bind(this));

            if (value) {
                value.forEach(function (item) {
                    this.store.put({item: item});
                }, this);
            }
        },
        _valueGetter: function () {
            return this.store.data.map(function (listItem) {
                return listItem.item;
            });
        },

        _createCommands: function () {
            // summary:
            //      Create the commands for the context menu.
            // tags:
            //      private

            this.add("commands", new MoveUpPropertyValue({ model: this }));
            this.add("commands", new MoveDownPropertyValue({ model: this }));
            this.add("commands", new DeletePropertyValue({ model: this }));
        }
    });
});
