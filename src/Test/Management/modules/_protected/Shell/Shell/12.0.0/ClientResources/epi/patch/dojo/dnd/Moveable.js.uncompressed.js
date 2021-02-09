define("epi/patch/dojo/dnd/Moveable", [
    "dojo/_base/lang",
    "dojo/dnd/common",
    "dojo/dnd/Moveable",
    "dojo/touch",
    "dojo/on"
], function (lang, dnd, Moveable, touch, on) {
    // module:
    //		epi/patch/dojo/dnd/Movable
    // summary:
    //		Changed the mousedown callback to not stop propagation of events.

    lang.mixin(Moveable.prototype, {
        onMouseDown: function (e) {
            // summary:
            //      event processor for onmousedown/ontouchstart, creates a Mover for the node
            // e: Event
            //      mouse/touch event
            if (this.skip && dnd.isFormElement(e)) {
                return;
            }
            if (this.delay) {
                this.events.push(
                    on(this.handle, touch.move, lang.hitch(this, "onMouseMove")),
                    on(this.handle, touch.release, lang.hitch(this, "onMouseUp"))
                );
                this._lastX = e.pageX;
                this._lastY = e.pageY;
            } else {
                this.onDragDetected(e);
            }
            e.preventDefault();
        }
    });

    Moveable.prototype.onMouseDown.nom = "onMouseDown";

});
