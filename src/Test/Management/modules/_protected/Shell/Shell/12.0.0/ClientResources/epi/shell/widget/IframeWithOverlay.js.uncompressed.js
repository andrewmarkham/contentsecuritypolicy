require({cache:{
'url:epi/shell/widget/templates/IframeWithOverlay.html':"﻿<div data-dojo-attach-point=\"containerNode\" class=\"epi-editorViewport\">\r\n    <div data-dojo-attach-point=\"scroller\" class=\"epi-editorViewport-center\">\r\n        <div data-dojo-attach-point=\"previewContainer\" class=\"epi-editorViewport-previewBox\"  data-dojo-props=\"region: 'center'\">\r\n            <iframe data-dojo-attach-point=\"iframe\" data-dojo-type=\"epi/shell/widget/AutoResizingIframe\" data-dojo-props=\"autoFit : false\" name=\"${iframeName}\"></iframe>\r\n            <div data-dojo-attach-point=\"overlay\" data-dojo-type=\"epi/shell/widget/overlay/OverlayContainer\"></div>\r\n            <div data-dojo-attach-point=\"scrollSizer\" class=\"epi-editorViewport-scrollSizer\"></div>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi/shell/widget/IframeWithOverlay", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",

    "dojo/has",
    "dojo/number",
    "dojo/aspect",

    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-class",

    // Dijit
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

    // EPi Framework
    "./_ScrollbarMeasurementMixin",
    "./AutoResizingIframe", //Used in template
    "./overlay/OverlayContainer",
    "epi/shell/layout/_LayoutWidget",
    "epi/shell/widget/DelayableStandby",

    // Resources
    "dojo/text!./templates/IframeWithOverlay.html"
],

function (
// Dojo
    declare,
    lang,
    array,

    has,
    number,
    aspect,

    domGeom,
    domStyle,
    domConstruct,
    domClass,

    // Dijit

    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    // EPi Framework
    _ScrollbarMeasurementMixin,
    AutoResizingIframe, //used in template
    Overlay,
    _LayoutWidget,
    DelayableStandby,

    // Resources
    template
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ScrollbarMeasurementMixin], {
        // summary:
        //    This widget displays a page within an iframe. It will publish notifications when the
        //    page within the iframe is changed.
        //
        // tags:
        //      internal

        // templateString: [protected] String
        //    A string that represents the iframe template for the widget.
        templateString: template,

        // autoResize: [public] Boolean
        //    Flag to indicate whether this widget will be resized, based on _contentBox.
        autoResize: true,

        // previewSize: [public] Object
        //    A dimension, which stores the last preview size.
        previewSize: null,

        // devicePreviewClass: [public] String
        //    A class that is applied to the scroller for displaying background images of devices.
        devicePreviewClass: "",

        // iframeName: [readonly] String
        //      The name to assign to the iframe. Used for topics generated within the iframe.
        iframeName: "",

        // previewClass: [public] String
        //    A class that is applied to the scroller for toggling a css class that tells us we're previewing.
        previewClass: "",

        // standbySettings: [public] Object
        //    Settings object used to initialize the standby widget.
        standbySettings: {
            delayTime: 3000,
            duration: 350
        },

        postCreate: function () {
            this.inherited(arguments);

            this.overlay.set("target", this.iframe);
            this._setupStandby();
        },

        startup: function () {

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            this.connect(this.iframe, "onUnload", function () {
                this._standby.show();
            });

            this.connect(this.iframe, "onLoad", function () {
                this._standby.hide();
            });

            this.own(
                aspect.after(this.iframe, "onAfterResize", function () {
                    this.emit("viewportresized");
                }.bind(this), true)
            );

            this._setCenterViewport(
                this._availableViewport || this._contentBox || domGeom.getContentBox(this.containerNode),
                true
            );
        },

        addChild: function (/*dijit/_Widget*/widget, /*int?*/insertIndex) {
            function show() {
                this.layout();

                array.forEach(widget.getChildren(), function (childWidget) {
                    childWidget.connect(childWidget, "onLayoutChanged", lang.hitch(this, function () {
                        if (widget.open) {
                            this.layout();
                        }
                    }));
                }, this);
            }

            widget.connect(widget, "onAfterShow", lang.hitch(this, show));
            widget.connect(widget, "onAfterHide", lang.hitch(this, this._hide));

            this.inherited(arguments);
        },

        onLayoutChanged: function () {
            this.inherited(arguments);

            this.getChildren().forEach(lang.hitch(this, function (widget) {
                if (widget.open) {
                    this.scrollIntoView(widget.overlayItem);
                } else if (widget !== this.iframe || widget !== this.overlay) {
                    this._hide();
                }
            }));
        },

        layout: function (force) {
            // summary:
            //    Required override when inheriting _LayoutWidget.
            //    Called from resize
            //
            // force: Boolean
            //    Flag to indicates that force layout or not
            //
            // tags:
            //    public

            if (!this._contentBox) {
                return;
            }

            this._layoutChildren(force);

            this.inherited(arguments);
        },

        _layoutChildren: function (force) {
            // force is true when a display channel is changed
            if (force) {
                this._resetScroll();
            }
            this._positionChildren();
            this._setCenterViewport(this._availableViewport, force);
        },

        _positionChildren: function () {
            // summary:
            //    Set correct position for child elements
            // centerSize: Object
            //    The value of preview size
            // tags:
            //    private

            var centerSize = this.get("centerSize");

            this._availableViewport = lang.mixin({}, this._contentBox);

            domStyle.set(this.scroller, { width: "" });

            var scrollbars = this.getScrollbars(this.scroller);

            array.forEach(this.getChildren(), function (child) {

                if (child === this.iframe || child === this.overlay ||
                    child.open === false || child.visible === false) {
                    return;
                }

                var childSize;

                switch (child.region) {
                    case "leading":
                        if (child.resize) {
                            child.resize({
                                t: 0,
                                l: 0,
                                h: this._contentBox.h - scrollbars.x
                            });
                        }

                        childSize = domGeom.position(child.domNode);
                        this._availableViewport.w -= childSize.w;
                        this._availableViewport.l += childSize.w;

                        break;

                    case "trailing":

                        if (child.resize) {
                            if (!child._computedStyle) {
                                child._computedStyle = domStyle.getComputedStyle(child.domNode);
                            }
                            childSize = domGeom.getMarginBox(child.domNode, child._computedStyle);

                            child.resize({
                                t: 0,
                                h: this._contentBox.h - scrollbars.x
                            });

                            domStyle.set(child.domNode, { right: scrollbars.y + "px" });

                            domStyle.set(this.scroller, { width: (this._availableViewport.w - childSize.w) + "px" });

                            this._availableViewport.w -= childSize.w + scrollbars.y;
                        }

                        break;

                    case "center":
                        if (child.resize) {
                            child.resize(centerSize);
                        }
                        break;

                    default:
                        break;
                }

            }, this);
        },

        _setCenterViewport: function (availableViewport, forceIframeResize) {
            // summary:
            //      Reset position of preview container to center.
            // availableViewport: Object
            //      The dimensions of the available viewport.
            // forceIframeResize: Boolean
            //      Set to [true] to force the iframe to recalculate it's size.
            // tags:
            //      private

            var centerSize = lang.clone(this.get("centerSize")),
                scrollbarSize,
                previewPadding;

            // Calculate to align the preview iframe
            // If top and left position is negative, it will cause scrollIntoView to
            // calculate wrong position value for previewContainer, so force them to be 0
            function getSize(dimension, axis) {
                var viewport = availableViewport[dimension],
                    center  = centerSize[dimension],
                    size = viewport > center ? (viewport - center) / 2 : 0;

                size -= previewPadding[axis];

                return Math.round(size);
            }

            if (!centerSize) {
                return;
            }

            this.previewContainer._computedStyle = this.previewContainer._computedStyle || domStyle.getComputedStyle(this.previewContainer);
            previewPadding = domGeom.getPadBorderExtents(this.previewContainer, this.previewContainer._computedStyle);

            if (!this.autoResize) {
                scrollbarSize = this.getScrollbarSize();
                centerSize.w = parseInt(centerSize.w) + scrollbarSize.x;
                centerSize.h = parseInt(centerSize.h);
            }

            domStyle.set(this.previewContainer, {
                top: getSize("h", "t") + "px",
                left: getSize("w", "l") + "px",
                width: centerSize.w + "px",
                height: centerSize.h + "px"
            });

            this.iframe.resize(centerSize, !!forceIframeResize);
        },

        onViewportPullDown: function () {
            // summary:
            //      Fired when the viewport pulled down and vice versa
            // tags:
            //      public

            this.emit("viewportpulldown");
        },

        scrollIntoView: function (/* epi/shell/overlay/_Base */overlayItem) {
            // summary:
            //    Scroll the iframe content into viewable area
            // tags:
            //    public

            var overlayItemPosition,
                overlap,
                scrollNeeded,
                gutter = 16;

            // While loading and in early setup no sane calculation of scroll can be done
            if (this.iframe.isLoading || !this._contentBox) {
                return;
            }

            this._layoutChildren();

            // The full width of the preview is visible, no need to change the users choice of scroll position
            if ((!this.autoResize && this.previewSize.w < this._availableViewport.w)) {
                return;
            }

            overlayItemPosition = overlayItem.get("position");
            overlap = overlayItemPosition.x + overlayItemPosition.w + gutter - this.scroller.scrollLeft - this._availableViewport.w;
            scrollNeeded = this.previewContainer.clientWidth + overlap;

            domStyle.set(this.scrollSizer, { width: scrollNeeded + "px" });
            this.previewContainer.scrollLeft = overlap;

            // Re-position children in case scrollbars disappear
            this._positionChildren(this.get("centerSize"));
        },

        _resetScroll: function () {
            domStyle.set(this.scrollSizer, { width: "1px" });
        },

        _setupStandby: function () {
            // summary:
            //    Setup standby widget based on selected resolution
            //
            // tags:
            //    private

            var settings = lang.mixin(this.standbySettings, { target: this.scroller });

            this.own(
                this._standby = new DelayableStandby(settings).placeAt(this.domNode, "last")
            );
        },

        _getCenterSizeAttr: function () {
            // summary:
            //    Get the center size to display content
            // tags:
            //    private

            return this.previewSize || this._contentBox;
        },

        _setPreviewSizeAttr: function (size) {
            // summary:
            //    Applies preview size for the iframe and overlay.
            //
            // tags:
            //    private

            this.autoResize = !size;
            this.previewSize = size;

            domClass.toggle(this.scroller, "epi-editorViewport-preview", !this.autoResize);

            this.layout();
        },

        _setDevicePreviewClassAttr: function (value) {
            // summary:
            //    Applies a device preview class for the iframe and iframe's overlay.
            // tags:
            //    private

            if (value) {
                domClass.replace(this.scroller, value, this.devicePreviewClass);
            } else {
                domClass.remove(this.scroller, this.devicePreviewClass);
            }

            this._set("devicePreviewClass", value);
        },

        _setPreviewClassAttr: function (value) {
            // summary:
            //    Applies a preview class for the iframe and iframe's overlay.
            // tags:
            //    private

            if (value) {
                domClass.replace(this.scroller, value, this.previewClass);
            } else {
                domClass.remove(this.scroller, this.previewClass);
            }

            this._set("previewClass", value);
        },

        _hide: function () {
            // summary:
            //      Hide and reset the scrollbar
            // tags:
            //      private

            this._resetScroll();
            domStyle.set(this.scroller, { width: "" });
            this._setCenterViewport(this._contentBox);
        },

        showDelay: function (delay) {
            this._standby.show(delay);
        },

        hideDelay: function (delay) {
            this._standby.hide();
        }
    });
});
