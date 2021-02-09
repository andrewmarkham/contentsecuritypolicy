define("epi-cms/contentediting/_FloatingComponentEditorWrapperMixin", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",

    "dojo/dom-geometry",
    "dojo/dom-style",
    // epi
    "epi/obsolete",
    "epi-cms/contentediting/_HasFloatingComponent",
    "epi-cms/contentediting/FloatingComponentHandler"
],

function (
// dojo
    declare,
    lang,

    aspect,

    domGeometry,
    domStyle,
    // epi
    obsolete,
    _HasFloatingComponent,
    FloatingComponentHandler
) {

    return declare(null, {
        // summary:
        //      An interface for a component wrapper that wants to floating its child based on its child relative container
        // tags:
        //      internal xproduct deprecated

        // _component: [private] Object "epi-cms/contentediting/_HasFloatingComponent"
        //      Component object that will be floated by FloatingComponentHandler
        _component: null,

        // _viewport: [private] DOM
        _viewport: null,

        // _viewportIframe: [private] DOM
        _viewportIframe: null,

        // _viewportScroller: [private] DOM
        _viewportScroller: null,

        // _componentOverlayItem: [private] DOM
        _componentOverlayItem: null,

        // _floatingComponentHandler: [private] Object "epi-cms/contentediting/FloatingComponentHandler"
        //      Component used to float another component based on its relative container
        _floatingComponentHandler: null,

        constructor: function () {
            obsolete("epi-cms/contentediting/_FloatingComponentEditorWrapperMixin", null, "12.0");
        },

        // =======================================================================
        // Public events

        onComponentFloat: function (/*Object*/componentFloatInfo) {
            // summary:
            // componentFloatInfo: [Object]
            //      Object's properties:
            //          componentInfo: [Object]
            //              component: [Object]
            //              componentOverlayItem: [DOM]
            //              viewport: [DOM]
            //              viewportScroller: [DOM]
            //          floatingInfo: [Object]
            // tags:
            //      public

            this._onComponentFloat(componentFloatInfo);
        },

        // =======================================================================
        // Public functions

        setupFloatingComponentEditorWrapper: function (/*Object*/componentFloatInfo) {
            // summary:
            //      Setup interface by the given settings information
            // componentFloatInfo: [Object]
            //      Object's properties:
            //          componentInfo: [Object]
            //              component: [Object]
            //              componentOverlayItem: [DOM]
            //              viewport: [DOM]
            //              viewportScroller: [DOM]
            //          floatingInfo: [Object]
            // tags:
            //      public, extension

            this._component = componentFloatInfo.componentInfo.component;

            this.own(
                aspect.after(this._component, "onComponentFloat", lang.hitch(this, function () {
                    lang.mixin(componentFloatInfo, {
                        floatingInfo: {
                            delayTime: 100
                        }
                    });

                    this._onComponentFloat(componentFloatInfo);
                }))
            );
        },

        // =======================================================================
        // Overrides public functions

        destroy: function () {

            this._clearLocalDefers();

            this._component = null;
            this._componentOverlayItem = this._viewport = this._viewportScroller = null;
            this._floatingComponentHandler = null;

            this.inherited(arguments);
        },

        // =======================================================================
        // Private functions

        _onComponentFloat: function (/*Object*/componentFloatInfo) {
            // summary:
            // componentFloatInfo: [Object]
            // tags:
            //      private

            this._clearLocalDefers();

            var delayTime = componentFloatInfo.floatingInfo.delayTime,
                floatHandler = lang.hitch(this, function () {
                    var componentInfo = componentFloatInfo.componentInfo;

                    this._component = componentInfo.component;
                    this._componentOverlayItem = componentInfo.componentOverlayItem;
                    this._viewport = componentInfo.viewport;
                    this._viewportIframe = componentInfo.viewportIframe;
                    this._viewportScroller = componentInfo.viewportScroller;

                    this._isValidComponent() && this._getFloatingComponentHandler().setComponentPosition(
                        this._component.getComponentInfo(),
                        this._getScrollInfo(lang.delegate(this._getViewportScrollInfo(), componentFloatInfo.floatingInfo || {}))
                    );
                });

            delayTime == null ? floatHandler() : this._deferOnComponentFloat = this.defer(floatHandler, delayTime);
        },

        _clearLocalDefers: function () {
            // summary:
            //      Remove all local registered timeout
            // tags:
            //      private

            this._deferOnComponentFloat && this._deferOnComponentFloat.remove();
        },

        _isValidComponent: function () {
            // summary:
            //      Validate the given object is instance of "epi-cms/contentediting/_HasFloatingComponent" object type
            // tags:
            //      private

            return this._component && this._component.isInstanceOf(_HasFloatingComponent);
        },

        _getScrollInfo: function (/*Object*/viewportScrollInfo) {
            // summary:
            // viewportScrollInfo: [Object]
            // returns: [Object]
            //      Object's properties:
            //          viewportScrollInfo: [Object]
            //          overlayItemScrollInfo: [Object]
            // tags:
            //      private

            return {
                viewportScrollInfo: this._updateViewportScrollInfo(viewportScrollInfo),
                overlayItemScrollInfo: this._getOverlayItemScrollInfo()
            };
        },

        _getViewportScrollInfo: function () {
            // summary:
            //      Get the viewport scroll basic information
            // tags:
            //      private

            return {
                refreshPosition: false,
                scrollTop: this._viewport.scrollTop,
                scrollLeft: this._viewportScroller.scrollLeft === 0 ? this._viewport.scrollLeft : this._viewportScroller.scrollLeft
            };
        },

        _getOverlayItemScrollInfo: function () {
            // summary:
            //      Get scroll information for the current editing overlay item
            // tags:
            //      private

            if (!this._componentOverlayItem) {
                return;
            }

            var position = domGeometry.position(this._componentOverlayItem);

            return {
                bottom: position.y + position.h,
                height: position.h,
                horizontal: position.y,
                left: domStyle.get(this._componentOverlayItem, "left"),
                right: position.x + position.w,
                top: domStyle.get(this._componentOverlayItem, "top"),
                vertical: position.x,
                width: position.w
            };
        },

        _getFloatingComponentHandler: function () {
            // summary:
            //      Get floating external component handler
            // tags:
            //      private

            return this._floatingComponentHandler || (this._floatingComponentHandler = new FloatingComponentHandler());
        },

        _updateViewportScrollInfo: function (/*Object*/viewportScrollInfo) {
            // summary:
            //      Get scroll information for viewport
            // viewportScrollInfo: [Object]
            //      Basic scroll information returned from onscroll event of the iframeWithOverlay.previewContainer and iframeWithOverlay.scroller
            // tags:
            //      private

            if (!viewportScrollInfo) {
                viewportScrollInfo = this._getViewportScrollInfo();
            }

            var viewportPosition = domGeometry.position(this._viewport),
                viewportIframePosition = domGeometry.position(this._viewportIframe),
                // When changed display resolution to smaller size (ex: iPhone/Android), viewport will have horizontal scrollbar and fixed width.
                // So that, we need to get the max width in order to take right position for the given floating component.
                targetContentWidth = Math.max(viewportIframePosition.w, viewportPosition.w);

            viewportScrollInfo.bottom = viewportPosition.y + viewportPosition.h;
            viewportScrollInfo.height = viewportPosition.h;
            viewportScrollInfo.horizontal = viewportPosition.y;
            viewportScrollInfo.right = viewportPosition.x + targetContentWidth;
            viewportScrollInfo.vertical = viewportPosition.x;
            viewportScrollInfo.width = viewportPosition.w;

            return viewportScrollInfo;
        }

    });

});
