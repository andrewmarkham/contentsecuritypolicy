define("epi/shell/layout/PinnablePaneSplitter", [
    "dojo",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/on",
    "dojo/touch"
], function (
    dojo,
    domClass,
    domConstruct,
    domGeometry,
    domStyle,
    on,
    touch
) {

    return function (splitter) {
        // summary:
        //      A draggable spacer between a PinnablePane and other content in a "dijit/layout/BorderContainer".
        //
        // tags:
        //      internal

        return dojo.mixin(splitter, {
            _startDrag: function (e) {
                if (!this.cover) {
                    this.cover = dojo.doc.createElement("div");
                    domClass.add(this.cover, "dijitSplitterCover");
                    domConstruct.place(this.cover, this.child.domNode, "after");
                }
                domClass.add(this.cover, "dijitSplitterCoverActive");

                // Safeguard in case the stop event was missed. Shouldn't be necessary if we always get the mouse up.
                if (this.fake) {
                    domConstruct.destroy(this.fake);
                }
                if (!(this._resize = this.live)) {
                    // Create fake splitter to display at old position while we drag
                    (this.fake = this.domNode.cloneNode(true)).removeAttribute("id");
                    domClass.add(this.domNode, "dijitSplitterShadow");
                    domConstruct.place(this.fake, this.domNode, "after");
                }
                domClass.add(this.domNode, "dijitSplitterActive dijitSplitter" + (this.horizontal ? "H" : "V") + "Active");
                if (this.fake) {
                    domClass.remove(this.fake, "dijitSplitterHover dijitSplitter" + (this.horizontal ? "H" : "V") + "Hover");
                }

                // Performance: load data info local vars for onmousevent function closure
                var factor = this._factor,
                    isHorizontal = this.horizontal,
                    axis = isHorizontal ? "pageY" : "pageX",
                    pageStart = e[axis],
                    splitterStyle = this.domNode.style,
                    dim = isHorizontal ? "h" : "w",
                    childStart = domGeometry.getMarginBox(this.child.containerNode)[dim],
                    max = this._computeMaxSize(),
                    min = this.child.minSize || 20,
                    region = this.region,
                    splitterAttr = region === "top" || region === "bottom" ? "top" : "left", // style attribute of splitter to adjust
                    splitterStart = parseInt(splitterStyle[splitterAttr], 10),
                    resizeFunc = dojo.hitch(this.child, "resize"),
                    layoutFunc = dojo.hitch(this.container, "_layoutChildren", this.child.id),
                    de = dojo.doc,
                    pinned = this.child.pinned;

                this._handlers = this._handlers.concat([
                    on(de, touch.move, this._drag = function (e, forceResize) {
                        var delta = e[axis] - pageStart,
                            childSize = factor * delta + childStart,
                            boundChildSize = Math.max(Math.min(childSize, max), min);

                        if (this.live || forceResize) {
                            pinned ? layoutFunc(boundChildSize) : resizeFunc({ w: boundChildSize });
                        }
                        splitterStyle[splitterAttr] = delta + splitterStart + factor * (boundChildSize - childSize) + "px";
                    }),
                    on(de, "dragstart", dojo.stopEvent),
                    on(dojo.body(), "selectstart", dojo.stopEvent),
                    on(de, touch.release, dojo.hitch(this, "_stopDrag"))
                ]);
                dojo.stopEvent(e);
            },

            show: function () {
                domStyle.set(this.domNode, {
                    display: "",
                    margin: ""
                });
            },

            hide: function () {
                domStyle.set(this.domNode, {
                    display: "none",
                    margin: "0"
                });
            }
        });
    };
});
