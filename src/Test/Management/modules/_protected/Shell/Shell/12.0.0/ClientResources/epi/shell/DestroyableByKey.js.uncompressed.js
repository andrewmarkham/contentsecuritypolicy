define("epi/shell/DestroyableByKey", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dijit/Destroyable"
],
function (
    array,
    declare,
    Destroyable
) {

    return declare([Destroyable], {
        // summary:
        //		A base class which enables owning a set of handles that could
        //      need to be destroyed during this instance's lifetime. For
        //      instance we have an object that's handed a model, it watches
        //      some properties on the model. When our object is handed a new
        //      model we want an easy way to destroy the watches and create
        //      new ones. And we also want these handles to be be destroyed
        //      when our object is destroyed.
        //
        // tags:
        //      public

        // _ownedByKey: Object[]
        //      The owned handles
        _ownedByKey: null,

        constructor: function () {
            this._ownedByKey = [];
        },

        destroy: function () {

            // destroy all handles we have
            var item;
            while (item = this._ownedByKey.pop()) { //eslint-disable-line no-cond-assign
                item.handler.destroy();
            }

            this.inherited(arguments);
        },

        ownByKey: function (/*Object*/ key, /*Object...*/ handle) {
            // summary:
            //      Own a set of handles
            // key:
            //      The key to identify the set of handles. It can be a model
            //      object, but note that the same instance must be used when
            //      destroying the handles
            // handle:
            //      The handle

            var i;
            var ownedByKey = this._findOwnedByKey(key);

            // create a new item if missing
            if (!ownedByKey) {
                ownedByKey = {
                    key: key,
                    handler: new Destroyable()
                };
                this._ownedByKey.push(ownedByKey);
            }

            // own all handles
            for (i = 1; i < arguments.length; i++) {
                ownedByKey.handler.own(arguments[i]);
            }

            // return this instance for easy chaining
            return this;
        },

        destroyByKey: function (key) {
            // summary:
            //      Destroy a set of handles
            // key:
            //      The key to identify the set of handles. It can be a model
            //      object, but note that the same instance must be used as
            //      when owning the handles

            var ownedByKey = this._findOwnedByKey(key);
            var index;

            if (!ownedByKey) {
                return;
            }

            // destroy handlers
            ownedByKey.handler.destroy();

            // remove from array
            index = array.indexOf(this._ownedByKey, ownedByKey);
            this._ownedByKey.splice(index, 1);
        },

        _findOwnedByKey: function (/*Object*/ key) {
            // summary:
            //      find a set of owned handles

            var ownedByKey;
            array.some(this._ownedByKey, function (item) {
                if (item.key === key) {
                    ownedByKey = item;
                    return false;
                }
            });

            return ownedByKey;
        }

    });
});
