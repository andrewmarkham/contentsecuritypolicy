define("epi-cms/contentediting/viewmodel/_ViewModelMixin", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/Stateful",
    "dojo/Evented",
    "dijit/Destroyable"
], function (array, declare, Stateful, Evented, Destroyable) {
    //TODO: Rename to _ViewModel

    return declare([Stateful, Evented, Destroyable], {
        // tags:
        //      public

        modify: function (callback, scope, emitChanged) {
            // summary:
            //      Method used to wrap several changes in one "operation"
            //      When the callback has been executed the "changed" event will be emitted
            //
            // callback: function
            //      Function to execute
            //
            // scope: Object?
            //      The scope that the callback should be executed in
            //
            // emitChanged: Boolean?
            //      Whether the "changed" event should be emitted after the changes have been applied.
            //      Default is true.

            this._isBeingModified = true;
            if (scope) {
                callback.apply(scope);
            } else {
                callback();
            }
            this._isBeingModified = false;

            if (emitChanged || emitChanged === undefined) {
                this.emit("changed");
            }
        },

        emit: function (type, event) {

            if (type === "changed" && this._isBeingModified) {
                return;
            }

            this.inherited(arguments);
        }
    });
});
