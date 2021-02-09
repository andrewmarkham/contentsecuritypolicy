define("epi/shell/customFocusIndicator", [
    "dojo/_base/window",
    "dojo/dom-class",
    "dojo/on",
    "dojo/domReady!"
], function (win, domClass, on) {

    /*=====
    return {
        // tags:
        //      internal
    };
    =====*/

    var body = win.body();

    var onMouseFocus = function () {
        domClass.add(body, "epi-mouse-focus");
        domClass.remove(body, "epi-keyboard-focus");
    };

    var onKeyboardFocus = function () {
        domClass.remove(body, "epi-mouse-focus");
        domClass.add(body, "epi-keyboard-focus");
    };

    domClass.add(body, "epi-mouse-focus");

    on(body, "mousedown", onMouseFocus);
    on(body, "mouseup", onMouseFocus);

    on(body, "keydown", onKeyboardFocus);
    on(body, "keyup", onKeyboardFocus);
});
