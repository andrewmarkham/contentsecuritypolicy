define("epi/shell/dgrid/Focusable", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dijit/focus"
], function (declare, lang, aspect, focus) {

    return declare([], {
        // tags:
        //      internal

        postCreate: function () {
            this.inherited(arguments);

            // Reset the focus node after the grid is updated. This is a bug in dgrid: https://github.com/SitePen/dgrid/issues/899
            this._listeners.push(aspect.around(this, "_restoreFocus", function (originalMethod) {
                return function (row) {
                    var focusInfo = this._removedFocus;

                    originalMethod.apply(this, arguments);

                    if (!this._focusedNode) {
                        row = row && this.row(row);
                        var newTarget = row && row.element && row.id === focusInfo.rowId ? row :
                            typeof focusInfo.siblingId !== "undefined" && this.row(focusInfo.siblingId);

                        if (newTarget) {
                            this._focusedNode = newTarget.element;
                        }
                    }
                };
            }));
        },

        hasFocus: function () {
            // summary:
            //      Indicates whether the grid currently has focus.
            // tags:
            //      public

            return this._focusedNode && this._focusedNode === focus.curNode;
        },

        isFocusable: function () {
            // summary:
            //      Indicates whether this grid can currently be focused.
            // tags:
            //      public
            return !!this._focusedNode;
        },

        focus: function (element) {
            // summary:
            //      Set focus to the content of the grid.
            // tags:
            //      public

            // Convert the element to null in the case it is a string. This allows the dgrid to be
            // compatible with the dijit/_KeyNavContainer.
            if (typeof element == "string") {
                element = null;
            }
            this.inherited(arguments, [element]);
        },

        refresh: function (options) {
            // summary:
            //      Refreshes the contents of the grid.
            // options: Object?
            //      Optional object, supporting the following parameters:
            //      * refocus: like the refocusOnRefresh instance property;
            //          specifying it in the options here will override the instance
            //          property's value for this specific refresh call only.
            // tags:
            //      public

            var refocus = options && options.refocus,
                afterRefresh = function (results) {
                    if (this._refocusNode) {
                        this.focus(this.row(this._refocusNode).element);
                        this._refocusNode = null;
                    }
                    return results;
                };

            // Fallback to instance property if option is not defined.
            if (typeof refocus === "undefined") {
                refocus = this.refocusOnRefresh;
            }

            // If the grid has focus and we should refocus on refresh then save the ID of the
            // currently focused node.
            if (refocus && this.hasFocus()) {
                this._refocusNode = this.row(this._focusedNode).id;
            }

            // If the inherited method returns a promise then it is an on demand list and we should
            // bind the after refresh method to the promise.
            var promise = this.inherited(arguments);
            if (promise) {
                return promise.then(afterRefresh.bind(this));
            }
        }
    });
});
