define("epi/shell/layout/PositioningUtility", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/window"
],
function (
    declare,
    lang,
    dom,
    domGeom,
    domStyle,
    win
) {
    return declare(null, {
        // summary:
        //		Class that helps positioning elements in in the vicinity of other elements,
        //      taking frames, scroll, window size, and element (re)sizes into consideration.
        //
        // example:
        //	|	var poser = new PositioningUtility();
        //	|	poser.place(widget, { snapTo: node });
        //
        // example:
        //	|	var poser = new PositioningUtility();
        //	|	poser.findPosition(widget, { snapTo: { w: 100, h: 100, x: 100, y:200 };
        //
        // tags:
        //      internal

        _margin: 10,

        // userSetTransformId: [readonly] Number
        //      The ID of the transform for user set.
        userSetTransformId: -1,

        place: function (/*Object*/elementToPosition, /*Object*/settings) {
            // summary:
            //      Positions elementToPosition close but not over settings.snapTo
            //      using the lightweight floating window ruleset.
            // elementToPosition:
            //      The node|id|position we want to get a position for.
            // settings:
            //      An object containing settings:
            //          - snapTo: The node|id|position elementToPosition should dock to.

            var node = this._getNode(elementToPosition),
                pos = this.findPosition(node, settings);

            domStyle(node,
                {
                    position: "absolute",
                    top: pos.y + "px",
                    left: pos.x + "px"
                });
        },

        findPosition: function (/*Object*/elementToPosition, /*Object*/settings) {
            // summary:
            //      Gets the best suitable position for elementToPosition close but
            //      not over settings.snapTo using the lightweight floating window ruleset.
            // elementToPosition:
            //      The node|id|position we want to get a position for.
            // settings:
            //      An object containing settings:
            //          - snapTo: The node|id|position elementToPosition should dock to.

            var blockViewport = settings.blockViewport || settings.frame || this._getFramePosition(settings.snapTo, elementToPosition),
                blockPos = this._getVisiblePosition(this._getPosition(settings.snapTo), blockViewport),
                dialogViewport = settings.dialogViewport || win.getBox(),
                dialogPos = this._getPosition(elementToPosition);

            return this._executeTransformers(dialogPos, blockPos, dialogViewport, settings.transformIndex);
        },

        _getVisiblePosition: function (block, blockViewport) {
            // get the visible portion of the block and offset the position to the outer frame's coordinates

            var visibleBlock = lang.clone(block);

            if (blockViewport.w > 0 && visibleBlock.x + visibleBlock.w > blockViewport.w) {
                visibleBlock.w = blockViewport.w - visibleBlock.x;
            }
            if (blockViewport.h > 0 && visibleBlock.y + visibleBlock.h > blockViewport.h) {
                visibleBlock.h = blockViewport.h - visibleBlock.y;
            }

            visibleBlock.x += blockViewport.x;
            visibleBlock.y += blockViewport.y;

            if (visibleBlock.y < blockViewport.y) {
                visibleBlock.h = visibleBlock.h - blockViewport.y + visibleBlock.y;
                visibleBlock.y = blockViewport.y;
            }

            if (visibleBlock.x < blockViewport.x) {
                visibleBlock.w = visibleBlock.w - blockViewport.x + visibleBlock.x;
                visibleBlock.x = blockViewport.x;
            }

            return visibleBlock;
        },

        _getFramePosition: function (blockNode, dialogNode) {

            var iframe = blockNode.ownerDocument.defaultView.frameElement,
                position;

            function iterateIframes(iframe, position) {

                var doc = iframe.ownerDocument,
                    pos = domGeom.position(iframe);

                if (!position) {
                    position = pos;
                } else {
                    position.x += pos.x;
                    position.y += pos.y;
                }


                if (doc === dialogNode.ownerDocument) {
                    return position;
                } else {
                    iframe = doc.defaultView.frameElement;
                    return iterateIframes(iframe, position);
                }
            }

            if (!iframe) {
                position = win.getBox(blockNode.ownerDocument);
                position.x = position.l;
                position.y = position.t;

                return position;
            }

            return iterateIframes(iframe);

        },

        _executeTransformers: function (pos, block, viewport, transformIndex) {

            // If the transform index is -1 then the position is user set and we shouldn't
            // move. Simply ensure that it appears within the viewport.
            if (transformIndex === this.userSetTransformId) {
                return this._moveIntoViewport(lang.mixin({ id: this.userSetTransformId }, pos), viewport);
            }

            // Otherwise run the given tranform to ensure it is correctly positioned. If no transform is given then
            // we run through them all in priority order till we find a suitible position.
            var position = null,
                transformers = isNaN(transformIndex) ? this._transformers : [this._transformers[transformIndex]];

            transformers.some(lang.hitch(this, function (transform) {

                position = this._moveIntoViewport(transform.call(this, pos, block, viewport), viewport);

                return transformers.length === 1 || this._isInside(position, viewport) && this._isOutside(position, block);

            }));

            return position;
        },

        _getNode: function (idOrWidgetOrNode) {

            if (idOrWidgetOrNode && (typeof idOrWidgetOrNode === "string" || idOrWidgetOrNode.nodeType)) {
                return dom.byId(idOrWidgetOrNode);
            }

            if (idOrWidgetOrNode && idOrWidgetOrNode.domNode) {
                return idOrWidgetOrNode.domNode;
            }

            return null;
        },

        _getPosition: function (idOrWidgetOrNodeOrPosition) {

            var pos = { x: 0, y: 0, w: 0, h: 0 },
                node;

            if (typeof idOrWidgetOrNodeOrPosition === "undefined" ||
                idOrWidgetOrNodeOrPosition === null) {
                return pos;
            }

            if (typeof idOrWidgetOrNodeOrPosition.x !== "undefined" &&
                typeof idOrWidgetOrNodeOrPosition.y !== "undefined") {
                pos = idOrWidgetOrNodeOrPosition;
            }

            node = this._getNode(idOrWidgetOrNodeOrPosition);
            if (node) {
                pos = domGeom.position(node, false);
            }

            return pos;
        },

        _moveIntoViewport: function (dialog, viewport) {

            dialog.x = Math.min(viewport.w - dialog.w, Math.max(0, dialog.x));
            dialog.y = Math.min(viewport.h - dialog.h, Math.max(0, dialog.y));

            return dialog;
        },

        _isInside: function (dialog, viewport) {
            return dialog.x > 0 &&
                   dialog.y > 0 &&
                   dialog.x + dialog.w < viewport.w &&
                   dialog.y + dialog.h < viewport.h;
        },

        _isOutside: function (dialog, block) {
            return dialog.x > block.x + block.w ||
                   dialog.y > block.y + block.h ||
                   dialog.x + dialog.w < block.x ||
                   dialog.y + dialog.h < block.y;
        },

        _transformers: [
            function (dialog, block, viewport) {
                //pos 1 = right align top
                return {
                    x: block.x + block.w + this._margin,
                    y: block.y,
                    w: dialog.w,
                    h: dialog.h,
                    id: 0
                };
            },
            function (dialog, block, viewport) {
                //pos 2 = centered below
                return {
                    x: block.x + (block.w / 2 - dialog.w / 2),
                    y: block.y + block.h + this._margin,
                    w: dialog.w,
                    h: dialog.h,
                    id: 1
                };
            },
            function (dialog, block, viewport) {
                //pos 3 = left align top
                return {
                    x: block.x - dialog.w - this._margin,
                    y: block.y,
                    w: dialog.w,
                    h: dialog.h,
                    id: 2
                };
            },
            function (dialog, block, viewport) {
                //pos 4 = centered above
                return {
                    x: block.x + (block.w / 2 - dialog.w / 2),
                    y: block.y - dialog.h - this._margin,
                    w: dialog.w,
                    h: dialog.h,
                    id: 3
                };
            },
            function (dialog, block, viewport) {
                // pos 5 = fallback, over
                return {
                    x: viewport.w / 2 - dialog.w / 2,
                    y: viewport.h / 2 - dialog.h / 2,
                    w: dialog.w,
                    h: dialog.h,
                    id: 4
                };
            }
        ]
    });
});
