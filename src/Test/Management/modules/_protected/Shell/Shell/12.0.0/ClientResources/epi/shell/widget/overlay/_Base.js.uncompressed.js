define("epi/shell/widget/overlay/_Base", [
    "dojo/_base/declare",
    "dojo/dom-geometry",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/has",

    "dijit/_Widget"
],
function (
    declare,
    domGeom,
    domConstruct,
    domStyle,
    has,

    _Widget
) {

    return declare([_Widget], {
        // tags:
        //      public

        // disabled: Boolean
        //      A disabled item doesn't reposition itself or is visible
        disabled: false,

        //  refNode: DomNode
        //      The node to cover
        sourceItemNode: null,

        // position: Object
        //      The latest position of the sourceItemNode
        position: null,

        // parent: epi/shell/overlay/OverlayContainer
        //      The parent of this item
        parent: null,

        // adjustForMargins: Boolean
        //      If true checks the sourceItemNodes margins if it is needed to
        //      correct the size of the overlay
        adjustForMargins: true,

        onResize: function () {
            // summary:
            //      onResize event
            //
            // tags:
            //      callback
        },

        destroy: function () {
            this.sourceItemNode = null;
            this.parent = null;

            this.inherited(arguments);
        },

        refresh: function () {
            //  summary:
            //      Refresh is called when the sourceItemNode has been changed externally
            //      to give the overlay a chance to check if it needs to update itself.

            this._reset();
            this.resize();
            this.onResize();
        },

        resize: function (size) {
            //  summary:
            //      Resize and reposition this item according to the input

            if (!this.canUpdatePosition()) {
                return false;
            }

            size = size || this.get("position");

            this.updatePosition(size);
        },

        updatePosition: function (position) {
            // summary:
            //      Update size of our node according to the position argument
            //
            //      Returns true if the widget has triggered any layout of the source document
            //
            // position: Object
            //      the coordinates to set the position to

            domStyle.set(this.domNode,
                {
                    left: position.x + "px",
                    top: position.y + "px",
                    width: position.w + "px",
                    height: position.h + "px"
                });

            // if height & width is not clickable, then hide it
            if (position.y < 1 && position.w < 1) {
                domStyle.set(this.domNode, { display: "none" });
            } else {
                domStyle.set(this.domNode, { display: "" });
            }

            return false;
        },

        _getPositionAttr: function () {

            if (!this.canUpdatePosition()) {
                return { x: 0, y: 0, w: 0, h: 0 };
            }

            var position = domGeom.position(this.sourceItemNode, false),
                oldPosition = this._rawPosition,
                isChanged,
                computedStyle,
                margin;

            if (oldPosition) {
                isChanged = oldPosition.x !== position.x ||
                oldPosition.y !== position.y ||
                oldPosition.w !== position.w ||
                oldPosition.h !== position.h;

                if (!isChanged) {
                    this.position.isChanged = false;
                    return this.position;
                }
            }

            this._rawPosition = { x: position.x, y: position.y, w: position.w, h: position.h };

            if (this.adjustForMargins) {

                computedStyle = domStyle.getComputedStyle(this.sourceItemNode);

                // workaround for FF issue: if style can't be read - do not adjust for margin (see bug #90197)
                if (computedStyle) {
                    // deal with negative margins
                    margin = domGeom.getMarginExtents(this.sourceItemNode, computedStyle);

                    if (margin.l < 0) {
                        position.x -= margin.l;
                        position.w += margin.l;
                    }
                    if (margin.r < 0) {
                        position.w -= margin.r;
                    }
                    if (margin.t < 0) {
                        position.x -= margin.t;
                        position.h += margin.t;
                    }
                    if (margin.b < 0) {
                        position.h -= margin.b;
                    }
                }
            }

            position.isChanged = true;
            this.set("position", position);

            return position;

        },

        _reset: function () {
            this._clearPosition();
        },

        _clearPosition: function () {
            this.position = this._rawPosition = null;
        },

        _setDisabledAttr: function (disabled) {
            this._set("disabled", disabled);
            domStyle.set(this.domNode, { display: disabled ? "none" : "" });
        },

        _setSourceItemNodeAttr: function (value) {
            this._clearPosition();
            this._set("sourceItemNode", value);
        },

        canUpdatePosition: function () {
            // summary:
            //      Returns true if we can update position, ie is not disabled and have
            //      access to the sourceItemNode

            if (this.disabled) {
                return false;
            }

            // make sure we have a node we can access, otherwise exit
            try {
                if (!this.sourceItemNode || !this.sourceItemNode.ownerDocument) {
                    return false;
                }
            } catch (ex) {
                return false;
            }

            return true;
        }
    });
});
