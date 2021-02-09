define("epi/shell/StatefulArray", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful"
], function (array, declare, lang, Stateful) {

    return declare([Stateful], {
        // summary:
        //      A stateful class with the ability to watch for changes on array properties
        //      as well as the standard getter/setter functionality.
        //
        // tags:
        //      internal

        add: function (/*String*/name, /*Object*/value) {
            // summary:
            //		Append the given value to an array on a Stateful instance.
            // tags:
            //		public

            var index, items = this[name];

            if (!lang.isArray(items)) {
                throw name + " is not of type Array.";
            }

            index = items.push(value);

            if (this._watchCallbacks) {
                // Always notify with arrays for conformance with remove.
                this._watchCallbacks(name, null, lang.isArray(value) ? value : [value]);
            }
            return index;
        },

        remove: function (/*String*/name, /*Object*/value) {
            // summary:
            //		Changes the content of an array on a Stateful instance.
            // tags:
            //		public

            var index, removed, items = this[name];

            if (!lang.isArray(items)) {
                throw name + " is not of type Array.";
            }

            index = array.indexOf(items, value);
            if (index >= 0) {
                removed = items.splice(index, 1);

                if (this._watchCallbacks) {
                    this._watchCallbacks(name, removed, null);
                }
                return removed;
            }
        }
    });
});
