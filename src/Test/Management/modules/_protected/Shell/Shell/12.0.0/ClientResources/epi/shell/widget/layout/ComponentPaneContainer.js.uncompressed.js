define("epi/shell/widget/layout/ComponentPaneContainer", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-geometry",
    "dojo/dom-style",

    "epi/shell/widget/_ScrollbarMeasurementMixin",
    "epi/shell/widget/layout/ComponentContainer"
], function (
    array,
    declare,
    lang,
    domGeometry,
    domStyle,

    _ScrollbarMeasurementMixin,
    ComponentContainer
) {

    return declare([ComponentContainer, _ScrollbarMeasurementMixin], {
        // summary:
        //    A container extending the grid container with a component toolbar
        //
        // tags:
        //    internal

        _previousChildrenCount: null,

        layoutComponents: function () {
            // summary:
            //		Resize the child components to fit the container size.
            // tags:
            //		protected

            // Hide the scrollbar before we layout the children
            domStyle.set(this.containerNode, "overflow-y", "hidden");

            var children = this.getChildren();

            // In case last open height of widget < min height, need to set min height to make sure widget can view as normal (only if lastOpenHeight is present)
            array.forEach(children, function (widget) {
                if (widget.lastOpenHeight && (widget.lastOpenHeight < widget.minHeight)) {
                    widget.set("lastOpenHeight", widget.minHeight);
                }
            });

            if (children.length === 1) {

                // If there is only one child then ensure that its open and resize it to the entire container.
                var child = children[0];
                if (!child.open) {
                    child.set("open", true);
                }

                child.resize(this._containerSize);

            } else if (children.length === 2) {

                var resizable = array.every(children, function (child) {
                    return child.open;
                });
                array.forEach(children, function (child) {
                    child.set("resizable", resizable);
                });

                // If there are two children then do custom logic for this state.
                this._layout2Children(children[0], children[1]);
            } else {

                // Else resize components with only a width and let them determine their own height.
                var resizeAll = lang.hitch(this, function (width) {

                    // We need to calculate the total height of all children
                    // so we can subtract the width of the scrollbar if needed
                    var totalHeight = 0;
                    this.getChildren().forEach(function (child) {
                        totalHeight += child.getSize().h;
                    });

                    // If the totalHeight is greater than the size of the container
                    // substract the width of the scrollbars
                    if (width && (totalHeight > this._containerSize.h)) {
                        width -= this.getScrollbarSize().x;
                    }

                    array.forEach(this.getChildren(), function (widget) {
                        widget.set("resizable", widget.open);
                        if (widget.resize && lang.isFunction(widget.resize)) {
                            if (width) {
                                widget.resize({ w: width });
                            } else {
                                widget.resize();
                            }

                        }
                    });
                });

                // when moving from 2 to 3 components the gadget bar can't render correctly and messes up with scrollbar.
                // we re-run widget.resize when we add a gadget and gadget bar contains more than 2 gadgets.
                if (this._previousChildrenCount < 3) {
                    resizeAll(null);
                }

                resizeAll(this._containerSize.w);
            }

            this._previousChildrenCount = children.length;

            // Re-add the scrollbar if necessary
            domStyle.set(this.containerNode, "overflow-y", "auto");
        },

        _layout2Children: function (child, sibling) {
            // summary:
            //		Special case method for laying out two children. Since they need to remember their height between toggles.
            //		If both are closed then we reopen them at equal height, or if they have been added and don't have a height we open them as equal height.
            // tags:
            //		private

            var containerSize = this._containerSize;
            var childSize = { w: containerSize.w };
            var siblingSize = { w: containerSize.w };

            var childHeight = child.getSize().h;
            var siblingHeight = sibling.getSize().h;

            var halfHeight = Math.floor(containerSize.h / 2);

            if (child.open && sibling.open && (!child.lastOpenHeight || !sibling.lastOpenHeight)) {
                // if both components are open and don't have lastOpenHeight then assign the totalheight/2 to each of them
                childSize.h = halfHeight;
                siblingSize.h = containerSize.h - halfHeight;

            } else if (!child.open && !sibling.open) {
                // If both children are closed then only display their title height.
                childSize.h = childHeight;
                siblingSize.h = siblingHeight;

                // Reset the last open height to half of the container height for both children.
                child.set("lastOpenHeight", halfHeight);
                sibling.set("lastOpenHeight", containerSize.h - halfHeight);

            } else if (childHeight < siblingHeight) {
                // Else we determine which is the smaller child and give that its height and give the other child the difference.
                childSize.h = childHeight;
                siblingSize.h = containerSize.h - childHeight;
            } else {
                childSize.h = containerSize.h - siblingHeight;
                siblingSize.h = siblingHeight;
            }

            child.resize(childSize);
            sibling.resize(siblingSize);
        },

        _layoutChildren: function (child, height, complete) {
            var children = this.getChildren(),
                containerHeight = domGeometry.getContentBox(this.containerNode).h;

            // Resize the child based on the new height.
            child.resize({ h: height });

            // Handle special case where there are only two widgets.
            if (children.length === 2) {
                array.forEach(children, function (widget) {
                    if (widget !== child) {
                        // Calculate the height difference between the two widgets.
                        widget.resize({ h: containerHeight - height });
                    }
                });
            }

            // If the resize is complete persist settings and layout all the components.
            if (complete) {
                // reset the lastOpenHeight
                array.forEach(children, function (widget) {
                    if (widget.getSize().h) {
                        widget.set("lastOpenHeight", widget.getSize().h);
                    }
                });

                this.layoutComponents();

                this._persistComponentSettings();
            }
        },

        _onCompontentsChanged: function () {
            var children = this.getChildren(),
                toggleable = children.length > 1,
                showSplitter = children.length > 2,
                setDefaultStates = children.length === 1;

            array.forEach(children, function (child, index) {

                // If there are only two or less children hide the splitter on the last
                child.set("showSplitter", showSplitter || index < children.length - 1);

                // If there is only one child, disable toggle
                child.set("toggleable", toggleable);

                if (setDefaultStates && child.setDefaultStates) {
                    // If there is only one child, set default states
                    child.setDefaultStates();
                }
            }, this);
        },

        _componentToggle: function () {
            var children = this.getChildren();
            if (children.length === 2) {
                var resizable = array.every(children, function (child) {
                    return child.open;
                });
                array.forEach(children, function (child) {
                    child.set("resizable", resizable);
                });
            }

            this.inherited(arguments);
        },

        _getMaxSizeChild: function () {
            // summary:
            //      Get max size of child.
            // tags:
            //      private

            var children = this.getChildren(),
                child = children[0],
                sibling = children[1],
                childMaxSize = domGeometry.getMarginBox(child.domNode).h;

            // Set max height of first child in the case there are only two children.
            if (children.length === 2) {
                childMaxSize += domGeometry.getMarginBox(sibling.domNode).h - sibling.minHeight;
                return childMaxSize;
            }

            return child.maxHeight || Infinity;
        }
    });
});
