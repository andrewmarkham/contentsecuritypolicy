define("epi-cms/contentediting/command/_ContentAreaCommand", [
    // General application modules
    "dojo/_base/declare",
    "dojo/_base/lang",
    // Parent class
    "epi/shell/command/_Command"
], function (declare, lang, _Command) {

    return declare([_Command], {
        // summary:
        //      Base class for content area commands that execute on selected content item on the model.
        //
        // tags:
        //      internal

        _onModelChange: function () {
            // summary:
            //      Watches the model for changes to the current content after the model has been updated.
            // tags:
            //      protected
            var model = this.model;

            this._destroyModelHandles();

            if (!model) {
                this.set("canExecute", false);
                return;
            }

            this._watch("readOnly", function () {
                this._onModelValueChange();
            }, this);

            this._onModelValueChange();
        },

        destroy: function () {
            this._destroyModelHandles();

            this.inherited(arguments);
        },

        _destroyModelHandles: function () {
            if (this._handles) {
                // Remove any exisiting handles.
                for (var i = 0; i < this._handles.length; i++) {
                    this._handles[i].remove();
                }
            }

            this._handles = [];
        },

        _watch: function (property, callback, scope) {
            // summary:
            //      Attach a watch handler to the model
            // property: [String]
            //      The name of the property to watch
            // callback: [function]
            //      The function to execute when the property changed
            // scope: [Object]
            //      The scope in which the callback should be executed

            if (scope) {
                this._handles.push(this.model.watch(property, lang.hitch(scope, callback)));
            } else {
                this._handles.push(this.model.watch(property, callback));
            }
        },

        _getItem: function () {
            // summary:
            //      Get the selected content model, based on its group
            // tags:
            //      protected

            return this.model.contentGroup ? this.model.parent : this.model;
        },

        _getContainer: function () {
            // summary:
            //      Get the selected content parent model
            // tags:
            //      protected

            var getContainer = function (item) {
                if (item.parent) {
                    return getContainer(item.parent);
                }
                return item;
            };

            return getContainer(this.model);
        },

        _onModelValueChange: function () {
            // summary:
            //      Updates canExecute after the current model value has changed. Subclasses should override this method.
            // tags:
            //      protected
        }
    });
});
