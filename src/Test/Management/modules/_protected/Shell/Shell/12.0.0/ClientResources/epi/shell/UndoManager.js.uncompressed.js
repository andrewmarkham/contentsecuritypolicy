define("epi/shell/UndoManager", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful"
], function (
    declare,
    lang,
    Stateful
) {

    return declare(Stateful, {
        // summary:
        //    This class manages undo and redo stack so provides undo/redo capabilities to undoable actions.
        // tags:
        //    internal

        // maxLevels: Integer
        //    Max number of steps to keep in undo/redo stack
        maxSteps: 10,

        // hasUndoSteps: Boolean
        //    True when there is any undo step
        hasUndoSteps: false,

        // hasRedoSteps: Boolean
        //    True when there is any redo step
        hasRedoSteps: false,

        // _undoStack: [private] Array
        //    The undo stack
        _undoStack: null,

        // _redoStack: [private] Object
        //    The redo stack
        _redoStack: null,

        // _isUndoing: [private] Object
        //    Internal flag specify that we are undoing. Used to know which stack to put action to.
        _isUndoing: false,

        // _isRedoing: [private] Object
        //    Internal flag specify that we are undoing. Used to know if the redo stack should be reset when new action is done.
        _isRedoing: false,

        constructor: function () {
            this._undoStack = [];
            this._redoStack = [];
        },

        createStep: function (context, callback, parameters, description) {
            // summary:
            //    Create an undo step.
            //
            // context: Object
            //    The context object used when calling the callback. Can be null.
            //
            // callback: Function|String
            //    The callback function. It can be a function or a string.
            //    If the callback is a string, context object must be provided from which the actual method is located.
            //
            // parameters: Object|Array
            //    The parameters passed to callback function.
            //
            // description: String
            //    The undo step's description.
            //
            // tags:
            //    public

            var fn = callback;

            if (typeof callback == "string") {
                fn = context[callback];
            }

            if (typeof fn != "function") {
                throw ("No such callback function");
            }

            var action = {
                context: context,
                callback: fn,
                parameters: lang.isArray(parameters) ? parameters : [parameters],
                description: description
            };

            if (!action.context && typeof action.callback === "string") {
                throw ("Context object is needed to find the callback");
            }

            // Stack to push actions into
            var stack = this._isUndoing ? this._redoStack : this._undoStack;

            if (!this._isUndoing && !this._isRedoing) {
                //when we create a totally new step, clear the redo stack, since we will go a new branch
                this._redoStack.splice(0, this._redoStack.length);
            }

            // add action to stack
            stack.push(action);

            // Keep undo stack within max size, ie remove first items in list
            if (this.maxSteps > 0 && this._undoStack.length > this.maxSteps) {
                this._undoStack.shift();
            }

            this._updateFlags();
        },

        undo: function () {
            // summary:
            //    Undo a step.
            //
            // tags:
            //    public

            // check if undo stack is empty first
            if (this._undoStack.length === 0) {
                return;
            }

            this._isUndoing = true;

            var action = this._undoStack.pop();

            // do actual undo
            action.callback.apply(action.context, action.parameters);

            this._updateFlags();

            this._isUndoing = false;
        },

        redo: function () {
            // summary:
            //    Redo a step.
            //
            // tags:
            //    public

            // check if undo stack is empty first
            if (this._redoStack.length === 0) {
                return;
            }

            this._isRedoing = true;

            var action = this._redoStack.pop();

            // do actual redo
            action.callback.apply(action.context, action.parameters);

            this._updateFlags();

            this._isRedoing = false;
        },

        _updateFlags: function () {
            this.set("hasUndoSteps", this._undoStack.length > 0);
            this.set("hasRedoSteps", this._redoStack.length > 0);
        },

        clear: function () {
            this._undoStack = [];
            this._redoStack = [];
            this._updateFlags();
        }
    });
});
