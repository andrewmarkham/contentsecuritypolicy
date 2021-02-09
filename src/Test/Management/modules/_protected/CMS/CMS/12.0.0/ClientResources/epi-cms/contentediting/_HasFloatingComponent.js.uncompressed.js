define("epi-cms/contentediting/_HasFloatingComponent", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-geometry",

    "epi/obsolete"
],

function (
// dojo
    declare,
    lang,
    domGeometry,
    // epi
    obsolete
) {

    return declare(null, {
        // summary:
        //      An interface for a component that wants to floating its child based on its child relative container
        // tags:
        //      internal xproduct deprecated

        // componentGutter: [public] Integer
        //      The external component's gutter
        componentGutter: 7,

        // _floatingComponentSize: [private] Object
        //      Object's properties:
        //          height: [Integer]
        //          width: [Integer]
        //      Scrolling information of the component
        _floatingComponentSize: null,

        // _floatingComponent: [private] DOM
        //      The DOM that will be position
        _floatingComponent: null,

        // _floatingComponentSizeBox: [private] DOM
        //      The DOM used to get the size
        _floatingComponentSizeBox: null,

        // _floatingRelativeContainer: [private] DOM
        //      The DOM used as an anchor for the floating component
        _floatingRelativeContainer: null,

        // _floatingRefContainer: [private] DOM
        //      The DOM used as the root container of the floating component and its relative container
        _floatingRefContainer: null,

        constructor: function () {
            obsolete("epi-cms/contentediting/_HasFloatingComponent", null, "12.0");
        },

        // =======================================================================
        // Public events

        onComponentFloat: function (/*Object*/componentFloatInfo) {
            // summary:
            // componentFloatInfo: [Object]
            //      Object's properties:
            //          component: [DOM]
            //          componentSizeBox: [DOM]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // tags:
            //      public, callback

            this._floatingComponent = componentFloatInfo.componentInfo.component;
            this._floatingComponentSizeBox = componentFloatInfo.componentInfo.componentSizeBox;
            this._floatingRelativeContainer = componentFloatInfo.componentInfo.relativeContainer;
            this._floatingRefContainer = componentFloatInfo.componentInfo.refContainer;
        },

        // =======================================================================
        // Public functions

        getComponentInfo: function () {
            // summary:
            //      Get the external component related information
            // returns: [Object]
            //      Object's properties:
            //          component: [DOM]
            //          componentSize: [Object]
            //          relativeContainer: [DOM]
            //          refContainer: [DOM]
            // tags:
            //      public

            return {
                component: this._floatingComponent,
                componentSize: this._getFloatingComponentSize(),
                relativeContainer: this._floatingRelativeContainer,
                refContainer: this._floatingRefContainer
            };
        },

        // =======================================================================
        // Overrides public functions

        destroy: function () {

            this._floatingComponentSizeBox = this._floatingComponent = this._floatingRelativeContainer = this._floatingRefContainer = null;
            this._floatingComponentSize = null;

            this.inherited(arguments);
        },

        // =======================================================================
        // Private functions

        _getFloatingComponentSize: function () {
            // summary:
            //      Get scroll information for the external editor toolbar
            // returns: [Object]
            //      Object's properties:
            //          height: [Integer]
            //          width: [Integer]
            // tags:
            //      private

            if (this._floatingComponentSize) {
                return this._floatingComponentSize;
            }

            var floatingComponentSize = domGeometry.getMarginBox(this._floatingComponentSizeBox);

            return this._floatingComponentSize = {
                height: parseInt(floatingComponentSize.h, 10) + this.componentGutter,
                width: parseInt(floatingComponentSize.w, 10)
            };
        }

    });

});
