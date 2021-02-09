define("epi/shell/widget/_ScrollbarMeasurementMixin", [
    // Dojo
    "dojo/_base/declare",
    "dojo/_base/window",
    "dojo/dom-construct",
    "dojo/dom-style"
],

function (
// Dojo
    declare,
    win,
    domConstruct,
    domStyle
) {

    var mixin = declare([], {
        // tags:
        //    internal

        getScrollbars: function (node) {
            // summary:
            //    Gets the actual size of any present scrollbars
            //    Returns the scrollbar size in the format: {x: number, y: number}

            var sbSize = this.getScrollbarSize(),
                root = node.documentElement || node,
                styledScrollbars;

            function getCurrentScroll(size, sb) {
                if (root) {
                    return {
                        y: root.scrollHeight > root.clientHeight ? size.y : sb.y,
                        x: root.scrollWidth > root.clientWidth ? size.x : sb.x
                    };
                }

                return { x: 0, y: 0 };
            }

            function getStyledScrollbars(size) {
                var scroll = { x: 0, y: 0 };

                if (root) {
                    domStyle.get(root, "overflow-y") === "scroll" ? scroll.y = size.y : scroll.y = 0;
                    domStyle.get(root, "overflow-x") === "scroll" ? scroll.x = size.x : scroll.x = 0;
                    domStyle.get(root, "overflow") === "scroll" ? scroll = { x: size.x, y: size.y, permanent: true} : scroll.permanent = false;
                }

                return scroll;
            }

            if (root) {
                styledScrollbars = getStyledScrollbars(sbSize);

                return styledScrollbars.permanent ? styledScrollbars : getCurrentScroll(sbSize, styledScrollbars);
            }

            return { x: 0, y: 0 };
        },

        getScrollbarSize: function () {
            // summary:
            //    Gets the size of scrollbars in this system
            //    Returns the scrollbar size in the format: {x: number, y: number}

            function calculateScrollbarSize() {
                var scrollbarSize;

                try {
                    var measureElm = domConstruct.create("div", {
                        style: {
                            overflow: "scroll",
                            position: "absolute",
                            top: "-200px",
                            left: "-200px",
                            width: "100px",
                            height: "100px"
                        }
                    }, win.body());

                    scrollbarSize = {
                        x: measureElm.offsetWidth - measureElm.clientWidth,
                        y: measureElm.offsetHeight - measureElm.clientHeight
                    };

                    domConstruct.destroy(measureElm);

                } catch (ex) {
                    scrollbarSize = { x: 16, y: 16 };
                }

                return scrollbarSize;
            }

            return mixin._scrollbarSize = mixin._scrollbarSize || calculateScrollbarSize();
        }
    });

    return mixin;
});
