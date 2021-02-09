define("epi-cms/extension/events", [
    "dojo/keys",                                            // used to detect keyboard event
    "dojo/on"                                               // used to query dom by query string inside this.domNode
], function (
    keys,
    on
) {
    // =======================================================================
    // Helper method
    //
    function isDeleteKey(e) {
        return e.keyCode === keys.DELETE;
    }
    function isShiftKey(e) {
        return e.shiftKey;
    }
    function isF10(e) {
        return e.keyCode === keys.F10;
    }
    function isShiftF10(e) {
        return isShiftKey(e) && isF10(e);
    }

    // =======================================================================
    // Common function to create a customize event
    //
    function eventHandler(type, selectHandler) {
        var handler = function (node, listener) {
            return on(node, type, function (evt) {
                if (selectHandler) {
                    return selectHandler(evt, listener);
                }
                return listener.call(this, evt);
            });
        };

        return handler;
    }

    return {
        // summary:
        //      An static class that add default events (keyboard/mouse) for common uses.
        // tags:
        //      internal

        // Support this for more convenient
        selector: on.selector,

        contextmenu: eventHandler("contextmenu", function (e, listener) {
            // summary:
            //      Shortcut way to listen to the contextmenu event
            // tags:
            //      public event

            listener.call(this, e);
        }),

        // =======================================================================
        // Keyboard events
        //

        // keys: [internal] Object
        //      Key event handlers
        keys: {
            shiftf10: eventHandler("keyup", function (e, listener) {
                // summary:
                //      Shortcut way to listen shift-f10 key event
                // tags:
                //      public event

                if (isShiftF10(e)) {
                    listener.call(this, e);
                }
            }),

            del: eventHandler("keydown", function (e, listener) {
                // summary:
                //      Shortcut way to listen delete keydown event
                // tags:
                //      public event

                if (isDeleteKey(e)) {
                    listener.call(this, e);
                }
            })
        }
    };
});
