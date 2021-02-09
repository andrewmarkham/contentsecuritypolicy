define("epi-cms/contentediting/FloatingComponentHandler", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/dom-style",
    // dijit
    "dijit/Destroyable",
    // epi
    "epi/obsolete"
],

function (
// dojo
    declare,
    lang,
    domConstruct,
    domStyle,
    // dijit
    Destroyable,
    // epi
    obsolete
) {

    return declare([Destroyable], {
        // summary:
        //      Handler for floating external component, based on its container position
        // tags:
        //      internal xproduct deprecated

        constructor: function () {
            obsolete("epi-cms/contentediting/FloatingComponentHandler", null, "12.0");
        },

        // =======================================================================
        // Public functions

        setComponentPosition: function (/*Object*/componentInfo, /*Object*/scrollInfo) {
            // summary:
            //      Calculates and then float the external component based on its container and its container position
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          componentSize: [Object]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // scrollInfo: [Object]
            //      Includes:
            //          viewportScrollInfo: [Object]
            //          overlayItemScrollInfo: [Object]
            // tags:
            //      public

            if (!this._isValidComponentInfo(componentInfo) || !this._isValidScrollInfo(scrollInfo)) {
                return;
            }

            var componentScrollConditions = this._getComponentScrollConditions(componentInfo, scrollInfo);

            // Set the external component float at top with the default value
            this._floatComponentFromTop(componentInfo, componentInfo.componentSize.height);

            // Set the external component float at left/right with the default value
            componentScrollConditions.floatFromLeft ? this._floatComponentFromLeft(componentInfo.component, 0) : this._floatComponentFromRight(componentInfo.component, 0);

            // Set the external component float horizontal inside its container
            componentScrollConditions.floatHorizontalInside && this._floatComponentHorizontalInside(componentInfo, scrollInfo, componentScrollConditions);

            // Set the external component float vertical inside its container
            if (componentScrollConditions.floatVerticalInside) {
                this._floatComponentVerticalInside(componentInfo, scrollInfo, componentScrollConditions);

                return;
            }

            // Set the external component float at bottom with the default value
            componentScrollConditions.floatFromBottom && this._floatComponentFromBottom(componentInfo, componentInfo.componentSize.height);
        },

        // =======================================================================
        // Public overrided functions

        destroy: function () {

            this._clearTogglePositionTimeout();

            this.inherited(arguments);
        },

        // =======================================================================
        // Private functions

        _isValidComponentInfo: function (componentInfo) {
            // summary:
            //      Verifies the given object is valid or not
            // componentInfo: [Object]
            //      Object's properties:
            //          component: [DOM]
            //          componentSize: [Object]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // returns: [Boolean]
            // tags:
            //      private

            if (!componentInfo) {
                return false;
            }

            if (!componentInfo.component) {
                return false;
            }

            if (!componentInfo.componentSize || !componentInfo.componentSize.width || !componentInfo.componentSize.height) {
                return false;
            }

            if (!componentInfo.relativeContainer) {
                return false;
            }

            if (!componentInfo.refContainer) {
                return false;
            }

            return true;
        },

        _isValidScrollInfo: function (scrollInfo) {
            // summary:
            //      Verifies the given object is valid or not
            // componentInfo: [Object]
            //      Object's properties:
            //          viewportScrollInfo: [Object]
            //          overlayItemScrollInfo: [Object]
            // returns: [Boolean]
            // tags:
            //      private

            if (!scrollInfo) {
                return false;
            }

            if (!scrollInfo.viewportScrollInfo) {
                return false;
            }

            if (!scrollInfo.overlayItemScrollInfo) {
                return false;
            }

            return true;
        },

        _getComponentScrollConditions: function (/*Object*/componentInfo, /*Object*/scrollInfo) {
            // summary:
            //      Get scroll conditions information
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          componentSize: [Object]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // scrollInfo: [Object]
            //      Includes:
            //          viewportScrollInfo: [Object]
            //          overlayItemScrollInfo: [Object]
            // returns: [Object]
            //      Object's properties:
            //
            // tags:
            //      private

            var viewportScrollInfo = scrollInfo.viewportScrollInfo,
                overlayItemScrollInfo = scrollInfo.overlayItemScrollInfo,

                // Calculates top available space
                topAvailableSpace = overlayItemScrollInfo.horizontal - viewportScrollInfo.horizontal,
                // Calculates bottom available space
                bottomAvailableSpace = viewportScrollInfo.bottom - overlayItemScrollInfo.bottom,
                // Calculates right available space
                rightAvailableSpace = viewportScrollInfo.right - overlayItemScrollInfo.vertical,
                // Calculates left available space
                leftAvailableSpace = overlayItemScrollInfo.left + overlayItemScrollInfo.width,

                // Boolean variables
                horizontalScrolled = this._hasHorizontalScroll(viewportScrollInfo),
                keepPositionFromLeft = viewportScrollInfo.scrollLeft < overlayItemScrollInfo.left,
                insideContainerWidth = (overlayItemScrollInfo.width + overlayItemScrollInfo.left - viewportScrollInfo.scrollLeft) > componentInfo.componentSize.width,

                // Verifies that placeable from the left of the container
                floatFromLeft = rightAvailableSpace > componentInfo.componentSize.width || rightAvailableSpace >= leftAvailableSpace,
                // Verifies that need to place at the bottom of the container
                floatFromBottom = topAvailableSpace < componentInfo.componentSize.height,
                // Verifies that is inside the container's width
                floatHorizontalInside = horizontalScrolled && (componentInfo.componentSize.width < overlayItemScrollInfo.width),
                // Verifies that is inside the container's height
                floatVerticalInside = (componentInfo.componentSize.height > topAvailableSpace) && (componentInfo.componentSize.height > bottomAvailableSpace);

            return {
                horizontalScrolled: horizontalScrolled,
                keepPositionFromLeft: keepPositionFromLeft,
                insideContainerWidth: insideContainerWidth,
                floatFromLeft: floatFromLeft,
                floatFromBottom: floatFromBottom,
                floatHorizontalInside: floatHorizontalInside,
                floatVerticalInside: floatVerticalInside
            };
        },

        _refreshComponentVerticalPosition: function (/*Object*/componentInfo, /*Object*/componentScrollInfo) {
            // summary:
            //      Delay floating component when pin/un-pin the left/right pane
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // componentScrollInfo: [Object]
            //      Includes:
            //          viewportScrollInfo: [Object]
            //          overlayScrollInfo: [Object]
            // tags:
            //      private

            var viewportScrollInfo = componentScrollInfo.viewportScrollInfo;

            this._floatComponentVertical(componentInfo, componentScrollInfo.overlayItemScrollInfo.top);
            viewportScrollInfo.refreshPosition && this._toggleRelativeContainerPosition(componentInfo, viewportScrollInfo.refreshDelayTime);
        },

        _floatComponentHorizontalInside: function (/*Object*/componentInfo, /*Object*/componentScrollInfo, /*Object*/componentScrollConditions) {
            // summary:
            //      Float the external component in case it's inside its container with horizontally scrolling
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // componentScrollInfo: [Object]
            //      Includes:
            //          viewportScrollInfo: [Object]
            //          overlayScrollInfo: [Object]
            // componentScrollConditions: [Object]
            //      Includes:
            //
            // tags:
            //      private

            var viewportScrollInfo = componentScrollInfo.viewportScrollInfo,
                overlayItemScrollInfo = componentScrollInfo.overlayItemScrollInfo,

                // Boolean variables
                keepPositionFromLeft = componentScrollConditions.keepPositionFromLeft,
                insideContainerWidth = componentScrollConditions.insideContainerWidth;

            if (keepPositionFromLeft) {
                return;
            }

            if (insideContainerWidth) {
                this._floatComponentFromLeft(componentInfo.component, viewportScrollInfo.scrollLeft - overlayItemScrollInfo.left, true);

                return;
            }

            this._floatComponentFromRight(componentInfo.component, 0);
        },

        _floatComponentVerticalInside: function (/*Object*/componentInfo, /*Object*/componentScrollInfo, /*Object*/componentScrollConditions) {
            // summary:
            //      Float the external component in case it's inside its container with vertically scrolling
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // componentScrollInfo: [Object]
            //      Includes:
            //          viewportScrollInfo: [Object]
            //          overlayScrollInfo: [Object]
            // componentScrollConditions: [Object]
            //      Includes:
            //
            // tags:
            //      private

            var viewportScrollInfo = componentScrollInfo.viewportScrollInfo,
                overlayItemScrollInfo = componentScrollInfo.overlayItemScrollInfo,

                // Boolean variables
                floatFromLeft = componentScrollConditions.floatFromLeft,
                horizontalScrolled = componentScrollConditions.horizontalScrolled,
                keepPositionFromLeft = componentScrollConditions.keepPositionFromLeft,
                insideContainerWidth = componentScrollConditions.insideContainerWidth,
                skipHorizontalScroll = componentInfo.componentSize.width > overlayItemScrollInfo.width;

            if (!floatFromLeft) {
                var rightPosition = componentScrollConditions.horizontalScrolled
                    ? (viewportScrollInfo.scrollLeft - overlayItemScrollInfo.width)
                    : overlayItemScrollInfo.width;

                this._floatComponentFromRight(componentInfo.component, rightPosition, componentScrollConditions.horizontalScrolled);
                this._refreshComponentVerticalPosition(componentInfo, componentScrollInfo);

                return;
            }

            if (!horizontalScrolled) {
                this._refreshComponentVerticalPosition(componentInfo, componentScrollInfo);

                return;
            }

            if (skipHorizontalScroll) {
                this._floatComponentFromLeft(componentInfo.component, viewportScrollInfo.scrollLeft);
                this._refreshComponentVerticalPosition(componentInfo, componentScrollInfo);

                return;
            }

            var leftPosition = keepPositionFromLeft
                ? viewportScrollInfo.scrollLeft
                : (insideContainerWidth
                    ? overlayItemScrollInfo.left
                    : (componentInfo.componentSize.width + viewportScrollInfo.scrollLeft - overlayItemScrollInfo.width)
                );

            this._floatComponentFromLeft(componentInfo.component, leftPosition);
            this._refreshComponentVerticalPosition(componentInfo, componentScrollInfo);
        },

        _floatComponentVertical: function (/*Object*/componentInfo, /*Integer*/topPosition) {
            // summary:
            //      Float the external component vertical inside its container
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // topPosition: [Integer]
            //      Top position number
            // tags:
            //      private

            domStyle.set(componentInfo.component, {
                top: this._getPositionString(topPosition)
            });

            domStyle.set(componentInfo.relativeContainer, {
                position: "fixed"
            });
        },

        _floatComponentFromTop: function (/*Object*/componentInfo, /*Integer*/topPosition, /*Boolean*/positive) {
            // summary:
            //      Set top position for the floating external component
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // topPosition: [Integer]
            //      Top position number
            // positive: [Boolean]
            //      Indicates that need to get positive position string or not
            // tags:
            //      private

            // Move the external component relative container to top as the first child of the container in order to take it show at the top
            this._changeComponentContainerPlace(componentInfo, "first");

            // Set default styles to float the floating external component
            domStyle.set(componentInfo.component, {
                bottom: "auto",
                left: "auto",
                right: "auto",
                top: this._getPositionString(topPosition, positive)
            });
        },

        _floatComponentFromLeft: function (/*DOM*/component, /*Integer*/leftPosition, /*Boolean*/positive) {
            // summary:
            //      Set left position for the floating external component
            // component: [DOM]
            //      Floating DOM node that wanted to position
            // leftPosition: [Integer]
            //      Left position number
            // positive: [Boolean]
            //      Indicates that need to get positive position string or not
            // tags:
            //      private

            // Update float styles based on the default settings from _floatComponentFromTop() function
            domStyle.set(component, {
                left: this._getPositionString(leftPosition, positive),
                right: "auto"
            });
        },

        _floatComponentFromBottom: function (/*Object*/componentInfo, /*Integer*/bottomPosition, /*Boolean*/positive) {
            // summary:
            //      Set position of the floating external component to the container's bottom
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // bottomPosition: [Integer]
            //      Bottom position number
            // positive: [Boolean]
            //      Indicates that need to get positive position string or not
            // tags:
            //      private

            // Move the external component relative container to bottom as the last child of the container in order to take it show at the bottom
            this._changeComponentContainerPlace(componentInfo, "last");

            // Update float styles based on the default settings from _floatComponentFromTop() function
            domStyle.set(componentInfo.component, {
                bottom: this._getPositionString(bottomPosition, positive),
                top: "auto"
            });
        },

        _floatComponentFromRight: function (/*DOM*/component, /*Integer*/rightPosition, /*Boolean*/positive) {
            // summary:
            //      Set right position for the floating external component
            // component: [DOM]
            //      Floating DOM node that wanted to position
            // rightPosition: [Integer]
            //      Right position number
            // positive: [Boolean]
            //      Indicates that need to get positive position string or not
            // tags:
            //      private

            // Update float styles based on the default settings from _floatComponentFromTop() function
            domStyle.set(component, {
                left: "auto",
                right: this._getPositionString(rightPosition, positive)
            });
        },

        _changeComponentContainerPlace: function (/*Object*/componentInfo, /*String*/position) {
            // summary:
            //      Change the place of the floating external component relative container on its parent node
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // position: [String]
            //      Accept only: "first" or "last"
            // tags:
            //      private

            // Move the external component relative container to top/bottom as the first/last child of the container in order to take it show at the top/bottom
            domConstruct.place(componentInfo.relativeContainer, componentInfo.refContainer, position);
            domStyle.set(componentInfo.relativeContainer, { position: "relative" });
        },

        _toggleRelativeContainerPosition: function (/*Object*/componentInfo, refreshDelayTime) {
            // summary:
            //      Toggle position style of the component relative container
            // componentInfo: [Object]
            //      Floating DOM nodes that wanted to position, included:
            //          component: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // tags:
            //      private

            this._clearTogglePositionTimeout();

            var component = componentInfo.component,
                relativeContainer = componentInfo.relativeContainer,
                containerPosition = domStyle.get(componentInfo.relativeContainer, "position"),
                togglePosition = function () {
                    domStyle.set(relativeContainer, { position: containerPosition });
                    domStyle.set(component, { display: "block" });
                };

            domStyle.set(relativeContainer, { position: "relative" });
            domStyle.set(component, { display: "none" });

            refreshDelayTime != null ? (this._togglePositionTimeout = setTimeout(togglePosition, refreshDelayTime)) : togglePosition();
        },

        _clearTogglePositionTimeout: function () {
            // summary:
            //      Clear timeout set for toggle position process
            // tags:
            //      private

            if (this._togglePositionTimeout) {
                clearTimeout(this._togglePositionTimeout);
                this._togglePositionTimeout = null;
            }
        },

        _hasHorizontalScroll: function (/*Object*/viewportScrollInfo) {
            // summary:
            //      Verifies that the viewport horizontally scrolled
            // tags:
            //      private

            return viewportScrollInfo && viewportScrollInfo.scrollLeft != null && viewportScrollInfo.scrollLeft > 0;
        },

        _getPositionString: function (/*Integer*/inputNumber, /*Boolean*/positive) {
            // summary:
            //      Get positive/negative position in pixel string
            // inputNumber: [Integer]
            //      Position number
            // positive: [Boolean]
            //      Indicates that need to get positive position string or not
            // tags:
            //      private

            return inputNumber === 0 ? 0 : ((positive === true ? "" : "-") + inputNumber + "px");
        }

    });

});
