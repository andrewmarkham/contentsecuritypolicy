define("epi/shell/command/_Command", [
// dojo
    "dojo/_base/declare",
    "dojo/Stateful"
],

function (
// dojo
    declare,
    Stateful
) {

    return declare([Stateful], {
        // summary:
        //      A base class implementation for commands.
        // tags:
        //      public abstract

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: null,

        // tooltip: [public] String
        //      The description text of the command to be used in visual elements.
        tooltip: null,

        // iconClass: [public] String
        //      The icon class of the command to be used in visual elements.
        iconClass: null,

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed, e.g. "setting".
        category: null,

        // order: [readonly] Integer
        //      An ordering indication used when generating a ui for this command.
        //      Commands with order indication will be placed before commands with no order indication.
        order: null,

        // model: [public] Object
        //      The model which this command will use to determine if it can execute; this may
        //      also be the subject of the execute action.
        model: null,

        // canExecute: [readonly] Boolean
        //      Flag which indicates whether this command is able to be executed.
        canExecute: false,

        // isAvailable: [readonly] Boolean
        //      Flag which indicates whether this command is available in the current context.
        isAvailable: true,

        // _callOnModelChange: [private] Boolean
        //      Flag indicating if _onModelChange should be called when the model changes.
        _callOnModelChange: false,

        // =======================================================================
        // Public overridden functions

        postscript: function ()  {
            // summary:
            //      Watch model and initialize model dependent properties.
            // tags:
            //      public

            this.inherited(arguments);

            // Make initial onModelChange call if a model was injected in the constructor.
            this.model && this._onModelChange();
            this._callOnModelChange = true;
        },

        // =======================================================================
        // Public functions

        destroy: function () {
            // summary:
            //      Subclasses needing to release resources should override this method
            // tags:
            //      public
        },

        execute: function () {
            // summary:
            //      Executes this command if canExecute is true; otherwise do nothing.
            // tags:
            //      public

            if (this.isAvailable && this.canExecute) {
                return this._execute();
            }
        },

        watchModelChange: function () {
            // summary:
            //      Register a watch handler when the command change its model
            // tags:
            //      internal

            this.set("_callOnModelChange", true);
        },

        unwatchModelChange: function () {
            // summary:
            //      Clear the registered watch handler for command model change
            // tags:
            //      internal

            this.set("_callOnModelChange", false);
        },

        // =======================================================================
        // Protected functions

        _execute: function () {
            // summary:
            //      Executes this command assuming canExecute has been checked. Subclasses should override this method.
            // tags:
            //      protected
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated. Subclasses should override this method.
            // tags:
            //      protected
        },

        _modelSetter: function (model) {
            // summary:
            //
            // tags:
            //      protected

            this.model = model;
            this._callOnModelChange && this._onModelChange();
        }
    });
});
