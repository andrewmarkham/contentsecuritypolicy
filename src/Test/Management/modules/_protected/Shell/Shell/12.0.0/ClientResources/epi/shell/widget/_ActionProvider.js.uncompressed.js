define("epi/shell/widget/_ActionProvider", [
    "dojo",
    "dojo/_base/array",
    "epi/shell/widget/_ActionProviderBase"],

function (dojo, array, _ActionProviderBase) {

    return dojo.declare([_ActionProviderBase], {
        // summary:
        //    Mixin for components that can provide the list of action and handlers to execute
        //
        // tags:
        //    public deprecated

        // _actions: [private] Array
        //    The list of actions provided by this instance.
        _actions: null,

        constructor: function () {
            this._actions = [];
        },

        getActions: function () {
            // summary:
            //    Provides the list of actions.
            //
            // tags:
            //      public

            // Hand out a copy of the array instead of a reference
            return this._actions.concat();
        },

        hasAction: function (/*String*/actionName) {
            // summary:
            //      Check whether an action with the specified name exists in this provider.
            // actionName:
            //      Name of the action to check for
            // returns:
            //      true if an action with the specified name exists; otherwise false.

            return array.some(this._actions, function (action) {
                return action.name === actionName;
            });
        },

        setActionProperty: function (/*Object|String*/ actionOrName, /*String*/ property, /*Object*/ value) {
            // summary:
            //      Changes the property on a registered action
            //
            // actionOrName:
            //      The action object or the name of the action to change
            //
            // property:
            //      name of the property to alter.
            //
            // value:
            //      The new value of the action property
            //
            // tags:
            //      public

            var actionName = typeof actionOrName == "string" ? actionOrName : actionOrName.name;

            for (var i = 0; i < this._actions.length; i++) {
                var action = this._actions[i];
                if (action.name === actionName) {
                    action[property] = value;
                    this.onActionPropertyChanged(action, property, value);
                    return;
                }
            }
            throw new Error("No action registered with the name: " + actionName);
        },

        addActions: function (/* Object|Array */actions) {
            // summary:
            //    Adds an action or an array of actions to the action list.
            //
            // actions:
            //      A toolbar action definition, or an array of toolbar action definitions to add in the list.
            //
            //      Example of adding two actions:
            //      | toolbar.addActions([
            //      |     {
            //      |         name: "myAction1",
            //      |         label: "Do my action",
            //      |         action: console.log
            //      |     },
            //      |     {
            //      |         name: "myAction2",
            //      |         label: "Say hello",
            //      |         action: alert("Hello!")
            //      |     }]);
            //
            // tags:
            //      public

            if (dojo.isArray(actions)) {
                dojo.forEach(actions, this._addAction, this);
            } else {
                this._addAction(actions);
            }
        },

        removeActions: function (/* Object|Array */actions) {
            // summary:
            //      Remove a single action or an array of actions
            //
            // actions:
            //      The action(s) to remove
            //
            // tags: public

            if (dojo.isArray(actions)) {
                dojo.forEach(actions, this._removeAction, this);
            } else {
                this._removeAction(actions);
            }
        },

        _removeAction: function (action) {
            // summary:
            //      Removes a single action and raises the onActionRemoved event
            // tags: private
            for (var i = 0; i < this._actions.length; i++) {
                if (this._actions[i].name === action.name) {
                    this.onActionRemoved(this._actions.splice(i, 1)[0]);
                }
            }
        },

        _addAction: function (action) {
            // summary:
            //      Adds a single action to the action  collection and calls the onActionAdded event
            // tags:
            //      private
            if (dojo.some(this._actions, function (existingAction) {
                return existingAction.name === action.name;
            })) {
                throw new Error("An action named '" + action.name + "' is already registered");
            }

            this._actions.push(action);
            this.onActionAdded(action);
        }
    });
});
