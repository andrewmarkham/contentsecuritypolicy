define("epi-cms/contentediting/Operation", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Evented",
    "dojo/Stateful"
], function (array, declare, lang, Evented, Stateful) {

    return declare([Stateful, Evented], {
        // summary:
        //      This class represents a single operation. The default state commits save directly; otherwise it can run in a
        //      transaction-like state allowing for multiple data saves which will then be committed as a single operation.
        //
        // tags:
        //      internal

        // inProgress: [public] Boolean
        //      Flag indicating if there is an operation in progress.
        inProgress: false,

        // changes: [public] Array
        //      Array of changes associated with the current operation.
        changes: null,

        constructor: function () {
            this.changes = [];
        },

        begin: function () {
            // summary:
            //      Begins a new operation. If there is an operation already is progress this does nothing.
            // tags:
            //      public

            this.set("inProgress", true);
        },

        save: function (/* Object */ data) {
            // summary:
            //      Saves the data to the current active operation otherwise raises a commit event with the data.
            // tags:
            //      public

            if (this.inProgress) {
                // Remove any existing change for the property, but copy the oldValue property to the new data
                this.changes = array.filter(this.changes, function (change) {
                    if (change.propertyName === data.propertyName) {
                        data.oldValue = change.oldValue;
                        return false;
                    }
                    return true;
                });

                this.changes.push(data);

                return;
            }

            // Normalize the data to an array.
            if (!lang.isArray(data)) {
                data = [data];
            }

            this.emit("commit", data);
        },

        end: function () {
            // summary:
            //      Ends the current operation and raises a commit event with the accumulated data.
            // tags:
            //      public
            this.set("inProgress", false);

            if (this.changes.length > 0) {
                this.save(this.changes);
            }

            this.changes = [];
        },

        abort: function () {
            // summary:
            //      Aborts the current operation resetting the accumulated changes.
            // tags:
            //      public

            this.set("inProgress", false);
            this.changes = [];
        }
    });
});
