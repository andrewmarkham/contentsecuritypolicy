define("epi/shell/dnd/_MarkerSource", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/has",
    "dojo/dnd/Manager",
    "dojo/dnd/Source",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-style"
],
function (
    array,
    declare,
    has,
    Manager,
    Source,
    domClass,
    domConstruct,
    domGeom,
    domStyle
) {

    return declare(null, {
        // summary:
        //      Use as a mixin with a dnd Source to enable an absolutely positioned marker
        //      and extra css classes for the sibling nodes when hovering over a target item
        //      during drag and drop operations.
        //
        // tags:
        //      internal

        _markerNode: null,

        // markerTemplateString: String
        //      The html template for the marker
        markerTemplateString: "<div class=\"dojoDndItem-marker\"><div class=\"epi-dndDropMarker\"></div></div>",

        // markerDelay: Number
        //      The amount of time in milliseconds to delay the switch between marker positions
        markerDelay: 150,

        // markOnlyAllowedDropLocations: Boolean
        //      If set to true only positions where a drop will occur is be highlighted
        markOnlyAllowedDropLocations: false,

        _calculatedCurrent: false,

        destroy: function () {
            // summary:
            //		prepares the object to be garbage-collected
            this.inherited(arguments);

            this.targetAnchorSibling = null;
            if (this._markerNode) {
                domConstruct.destroy(this._markerNode);
                this._markerNode = null;
            }
        },

        setHorizontal: function (horizontal) {
            // summary:
            //		Changes the direction for drop markers
            // horizontal: Boolean
            //		true for horizontal direction, false for vertical

            domClass.toggle(this.node, "dojoDndHorizontal", horizontal);
            this.horizontal = horizontal;
        },

        onMouseOver: function (e) {
            // summary:
            //		event processor for onmouseover
            // e: Event
            //		mouse event

            this.inherited(arguments);
            this._calculatedCurrent = false;
        },

        onMouseMove: function (e) {
            // summary:
            //		event processor for onmousemove
            // e: Event
            //		mouse event

            if (this.isDragging && this.targetState === "Disabled") {
                return;
            }
            Source.superclass.onMouseMove.call(this, e);
            var m = Manager.manager();
            var copyKey = has("mac") ? "metaKey" : "ctrlKey";

            if (!this.isDragging) {
                if (this.mouseDown && this.isSource &&
     (Math.abs(e.pageX - this._lastX) > this.delay || Math.abs(e.pageY - this._lastY) > this.delay)) {
                    var nodes = this.getSelectedNodes();
                    if (nodes.length) {
                        m.startDrag(this, nodes, this.copyState(e[copyKey], true));
                    }
                }
            }

            if (this.isDragging) {
                // calculate before/after
                var before = false;

                if (this.current && !this._calculatedCurrent) {
                    if (!this.targetBox || this.targetAnchor !== this.current) {
                        this.targetBox = domGeom.position(this.current, true);
                    }
                    if (this.horizontal) {
                        before = (e.pageX - this.targetBox.x) < (this.targetBox.w / 2);
                    } else {
                        before = (e.pageY - this.targetBox.y) < (this.targetBox.h / 2);
                    }
                } else {
                    before = this._calculateCurrent({ x: e.pageX, y: e.pageY });
                }

                if (this.current !== this.targetAnchor || before !== this.before) {
                    this._markTargetAnchor(before);
                    m.canDrop(!this.current || m.source !== this || !this.markOnlyAllowedDropLocations || !(this.current.id in this.selection));
                }
            }
        },

        _calculateCurrent: function (point) {
            // summary:
            //      Finds the closest dnd item in the collection and sets it to this.current.
            //      Use to locate where to drop when not having a current item i.e not hovering over any.
            //
            //  point: Object {x: 0, y:0}
            //      The anchor point for the calculation. Most likely the current mouse position

            var points = [],
                current,
                minDistance;

            function calcDistance(startPoint, endPoint) {

                function square(value) {
                    return value * value;
                }

                return Math.sqrt(square(startPoint.x - endPoint.x) + square(startPoint.y - endPoint.y));
            }

            this.getAllNodes().forEach(function (node) {

                var pos = domGeom.position(node);
                pos.x2 = pos.x + pos.w;
                pos.xCentered = pos.x + pos.w / 2;
                pos.y2 = pos.y + pos.h;
                pos.yCentered = pos.y + pos.h / 2;

                if (this.horizontal) {
                    // put measuring points in middle of left and right side
                    points.push({ node: node, before: true, x: pos.x, y: pos.yCentered },
                        { node: node, before: false, x: pos.x2, y: pos.yCentered });
                } else {
                    // put measuring points in centered top and bottom
                    points.push({ node: node, before: true, x: pos.xCentered, y: pos.y },
                        { node: node, before: false, x: pos.xCentered, y: pos.y2 });
                }
            }, this);

            // Brute force distance check. Betting on few points to compare, and a simple
            // point to point calculation instead of checking the full segments for the closest point
            array.forEach(points, function (value) {
                value.distance = calcDistance(point, value);

                if (!current || value.distance < minDistance) {
                    current = value;
                    minDistance = value.distance;
                }
            }, this);

            if (current) {
                this.current = current.node;
                this._calculatedCurrent = true;

                return current.before;
            }

            return false;
        },

        _markTargetAnchor: function (before) {
            // summary:
            //		assigns a class to the current target anchor based on state
            //
            // state: Boolean
            //		insert before, if true, after otherwise

            var targetNotInSelection = true,
                siblingNotInSelection = true;

            if (this.current === this.targetAnchor && this.before === before) {
                return;
            }

            // Remove the previous set classes
            if (this.targetAnchor) {
                this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
            }
            if (this.targetAnchorSibling) {
                this._removeItemClass(this.targetAnchorSibling, !this.before ? "Before" : "After");
            }

            this.targetAnchor = this.current;
            this.targetBox = null;
            this.before = before;

            // Add the new classes
            if (this.targetAnchor) {

                this.targetAnchorSibling = before ? this.targetAnchor.previousSibling
                    : this.targetAnchor.nextSibling;

                // Verify that the sibling is a node that we are interested in
                if (!(this.targetAnchorSibling &&
                          this.targetAnchorSibling.nodeType === 1 &&
                          domClass.contains(this.targetAnchorSibling, "dojoDndItem"))) {

                    this.targetAnchorSibling = null;
                }

                if (this.markOnlyAllowedDropLocations) {
                    targetNotInSelection = !(this.targetAnchor.id in this.selection);
                    siblingNotInSelection = !this.targetAnchorSibling || !(this.targetAnchorSibling.id in this.selection);
                }
                if (targetNotInSelection && siblingNotInSelection) {
                    this._addItemClass(this.targetAnchor, this.before ? "Before" : "After");
                }

                if (this.targetAnchorSibling && targetNotInSelection && siblingNotInSelection) {
                    this._addItemClass(this.targetAnchorSibling, !this.before ? "Before" : "After");
                }

                this._positionMarker(targetNotInSelection && siblingNotInSelection);


            } else {
                this._positionMarker(false);
            }
        },

        _unmarkTargetAnchor: function () {
            // summary:
            //		removes a class of the current target anchor based on state

            if (this.targetAnchor) {
                this._removeItemClass(this.targetAnchor, this.before ? "Before" : "After");
            }
            if (this.targetAnchorSibling) {
                this._removeItemClass(this.targetAnchorSibling, !this.before ? "Before" : "After");
            }

            this._positionMarker(false);

            this.targetAnchor = this.targetAnchorSibling = this.targetBox = null;
            this.before = true;
        },

        _positionMarker: function (enable) {

            var markerNode = this._markerNode,
                anchorPos,
                siblingAnchorPos,
                boxPos,
                style,
                top,
                left,
                height,
                width,
                gap = -1;

            if (enable) {

                anchorPos = domGeom.position(this.targetAnchor, false);
                siblingAnchorPos = this.targetAnchorSibling ? domGeom.position(this.targetAnchorSibling, false) : { h: 0, w: 0 };
                boxPos = domGeom.position(this.node, false);

                if (this.horizontal) {

                    if (this.before) {

                        left = anchorPos.x - boxPos.x;

                        // Check if we have a gap between siblings and in that case adjust for it
                        if (this.targetAnchorSibling) {
                            gap = (anchorPos.x - siblingAnchorPos.x - siblingAnchorPos.w) / 2;
                        }
                        if (gap >= 0) {
                            left -= gap;
                        }
                    } else {

                        left = anchorPos.x + anchorPos.w - boxPos.x;

                        // Check if we have a gap between siblings and in that case adjust for it
                        if (this.targetAnchorSibling) {
                            gap = (siblingAnchorPos.x - anchorPos.x - anchorPos.w) / 2;
                        }
                        if (gap >= 0) {
                            left += gap;
                        }
                    }

                    // if we have a sibling in adjacent location take the biggest width
                    // to avoid the markers size changing when moving between them
                    height = gap >= 0 ? Math.max(anchorPos.h, siblingAnchorPos.h) : anchorPos.h;

                    style = {
                        display: "block",
                        top: anchorPos.y - boxPos.y + "px",
                        left: left + "px",
                        height: height + "px"
                    };

                } else {
                    if (this.before) {

                        top = anchorPos.y - boxPos.y;

                        // Check if we have a gap between siblings and in that case adjust for it
                        if (this.targetAnchorSibling) {
                            gap = (anchorPos.y - siblingAnchorPos.y - siblingAnchorPos.h) / 2;
                        }
                        if (gap >= 0) {
                            top -= gap;
                        }
                    } else {

                        top = anchorPos.y + anchorPos.h - boxPos.y;

                        // Check if we have a gap between siblings and in that case adjust for it
                        if (this.targetAnchorSibling) {
                            gap = (siblingAnchorPos.x - anchorPos.x - anchorPos.w) / 2;
                        }
                        if (gap >= 0) {
                            top -= gap;
                        }
                    }

                    // if we have a sibling in adjacent location take the biggest width
                    // to avoid the markers size changing when moving between them
                    width = gap >= 0 ? Math.max(anchorPos.w, siblingAnchorPos.w) : anchorPos.w;

                    style = {
                        display: "block",
                        top: top + "px",
                        width: width + "px"
                    };
                }

            } else {
                style = {
                    display: "none"
                };
            }

            if (!markerNode) {
                markerNode = this._markerNode = domConstruct.place(this.markerTemplateString, this.node);
                domStyle.set(markerNode, style);
            } else {
                setTimeout(function () {
                    domStyle.set(markerNode, style);
                }, this.markerDelay);
            }
        }
    });
});
