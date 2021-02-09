define("epi/patch/dojo/dnd/Selector", [
    "dojo/_base/lang",
    "dojo/dnd/common",
    "dojo/dnd/Selector",
    "dojo/mouse"
], function (lang, dnd, Selector, mouse) {
    // module:
    //		epi/patch/dojo/dnd/Selector
    // summary:
    //		Changed the mousedown callback to not stop propagation of events.

    lang.mixin(Selector.prototype, {
        onMouseDown: function (e) {
            // summary:
            //		event processor for onmousedown
            // e: Event
            //		mouse event
            if (this.autoSync) {
                this.sync();
            }
            if (!this.current) {
                return;
            }
            if (!this.singular && !dnd.getCopyKeyState(e) && !e.shiftKey && (this.current.id in this.selection)) {
                this.simpleSelection = true;
                if (mouse.isLeft(e)) {
                    // Accept the left button and stop the event.   Stopping the event prevents text selection while
                    // dragging.   However, don't stop the event on mobile because that prevents a click event,
                    // and also prevents scroll (see #15838).
                    // For IE we don't stop event when multiple buttons are pressed.
                    e.preventDefault();
                }
                return;
            }
            if (!this.singular && e.shiftKey) {
                if (!dnd.getCopyKeyState(e)) {
                    this._removeSelection();
                }
                var c = this.getAllNodes();
                if (c.length) {
                    if (!this.anchor) {
                        this.anchor = c[0];
                        this._addItemClass(this.anchor, "Anchor");
                    }
                    this.selection[this.anchor.id] = 1;
                    if (this.anchor != this.current) {
                        var i = 0, node;
                        for (; i < c.length; ++i) {
                            node = c[i];
                            if (node == this.anchor || node == this.current) {
                                break;
                            }
                        }
                        for (++i; i < c.length; ++i) {
                            node = c[i];
                            if (node == this.anchor || node == this.current) {
                                break;
                            }
                            this._addItemClass(node, "Selected");
                            this.selection[node.id] = 1;
                        }
                        this._addItemClass(this.current, "Selected");
                        this.selection[this.current.id] = 1;
                    }
                }
            } else {
                if (this.singular) {
                    if (this.anchor == this.current) {
                        if (dnd.getCopyKeyState(e)) {
                            this.selectNone();
                        }
                    } else {
                        this.selectNone();
                        this.anchor = this.current;
                        this._addItemClass(this.anchor, "Anchor");
                        this.selection[this.current.id] = 1;
                    }
                } else {
                    if (dnd.getCopyKeyState(e)) {
                        if (this.anchor == this.current) {
                            delete this.selection[this.anchor.id];
                            this._removeAnchor();
                        } else {
                            if (this.current.id in this.selection) {
                                this._removeItemClass(this.current, "Selected");
                                delete this.selection[this.current.id];
                            } else {
                                if (this.anchor) {
                                    this._removeItemClass(this.anchor, "Anchor");
                                    this._addItemClass(this.anchor, "Selected");
                                }
                                this.anchor = this.current;
                                this._addItemClass(this.current, "Anchor");
                                this.selection[this.current.id] = 1;
                            }
                        }
                    } else {
                        if (!(this.current.id in this.selection)) {
                            this.selectNone();
                            this.anchor = this.current;
                            this._addItemClass(this.current, "Anchor");
                            this.selection[this.current.id] = 1;
                        }
                    }
                }
            }
            e.preventDefault();
        }
    });

    Selector.prototype.onMouseDown.nom = "onMouseDown";
});
