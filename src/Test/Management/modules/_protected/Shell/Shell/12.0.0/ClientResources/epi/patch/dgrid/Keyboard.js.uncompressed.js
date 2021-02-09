define("epi/patch/dgrid/Keyboard", [
    "dojo/_base/lang",
    "dojo/keys",
    "dgrid/Keyboard"
], function (lang, keys, Keyboard) {
    // module:
    //		epi/patch/dgrid/Keyboard
    // summary:
    //		Changed keyup and keydown events to handle empty list scenario

    // patch for arrow down
    var originalMoveFocusDown = Keyboard.moveFocusDown;

    Keyboard.defaultKeyMap[keys.DOWN_ARROW] = function () {
        if (!this._focusedNode) {
            return;
        }
        originalMoveFocusDown.apply(this, arguments);
    };

    // patch for arrow up
    var originalMoveFocusUp = Keyboard.moveFocusUp;

    Keyboard.defaultKeyMap[keys.UP_ARROW] = function () {
        if (!this._focusedNode) {
            return;
        }
        originalMoveFocusUp.apply(this, arguments);
    };

    // patch for page up
    var originalMoveFocusPageUp = Keyboard.moveFocusPageUp;

    Keyboard.defaultKeyMap[keys.PAGE_UP] = function () {
        if (!this._focusedNode) {
            return;
        }
        originalMoveFocusPageUp.apply(this, arguments);
    };

    // patch for page down
    var originalMoveFocusPageDown = Keyboard.moveFocusPageDown;

    Keyboard.defaultKeyMap[keys.PAGE_DOWN] = function () {
        if (!this._focusedNode) {
            return;
        }
        originalMoveFocusPageDown.apply(this, arguments);
    };
});
