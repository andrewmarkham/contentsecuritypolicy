define("epi/shell/widget/overlay/OverlayContainer", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",
    "dojo/dom-style",

    // Dijit
    "dijit/_Container",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",

    // epi
    "epi/shell/postMessage"
],

function (
    // Dojo
    array,
    declare,
    Deferred,
    lang,
    domStyle,

    // Dijit
    _Container,
    _WidgetBase,
    _TemplatedMixin,

    // epi
    postMessage
) {

    return declare([_WidgetBase, _Container, _TemplatedMixin], {
        // summary:
        //    This widget holds overlay items over a source widget i.e an iframe, to enable visualizations
        //    of the content and to enable drag&drop with scrolling for elements inside
        //
        // tags:
        //      internal

        // updateInterval: Number
        //  The timeout in ms between checks for changes in the overlay
        updateInterval: 250,

        // enabled: boolean
        //  Toggles the overlay visibility
        enabled: false,

        // target: dijit/Widget
        //  The widget to act as an overlay to
        target: null,

        // targetCover: boolean
        //  Toggles the cover item. Used to catch mouse operations from passing down to the target widget
        targetCoverEnabled: false,

        // templateString: [protected] String
        //    A string that represents the iframe template for the widget.
        templateString: "<div data-dojo-attach-point=\"containerNode\" class=\"epi-overlay-container\"><div data-dojo-attach-point=\"targetCover\" class=\"epi-overlay-targetCover\"></div></div>",

        startup: function () {

            if (this._started) {
                return;
            }

            this.inherited(arguments);

            this._toggleTargetCover(this.enabled);

            this.subscribe("/dnd/start", function () {
                this.set("targetCoverEnabled", true);
            });
            this.subscribe("/dnd/cancel", function () {
                this.set("targetCoverEnabled", false);
            });
            this.subscribe("/dnd/drop", function () {
                this.set("targetCoverEnabled", false);
            });
            this.connect(this.target, "onUnload", this.disconnectOverlayItems);
            this.connect(this.target, "onAfterResize", this._onAfterResizeHandler);

        },

        addChild: function (/*dijit/_Widget*/widget, /*int?*/insertIndex) {

            this.inherited(arguments);

            widget.set("parent", this);
            widget.resize();

            if (widget.onResize) {
                widget.own(widget.on("resize", this._onContentChange.bind(this)));
            }
        },

        disconnectOverlayItems: function () {
            // summary:
            //      Disconnect the source item nodes for all overlay items
            //
            // tags:
            //      internal

            this.set("enabled", false);

            array.forEach(this.getChildren(), lang.hitch(this, function (childWidget) {
                childWidget.set("sourceItemNode", null);
            }));
        },

        _setReadOnlyAttr: function (readOnly) {
            // summary:
            //      Sets read only (or unsets) to the container and all the children as well
            // readOnly: Boolean
            //      A flag indicating if the container and all its children are read-only or not
            // tags:
            //      public
            this._set("readOnly", readOnly);

            array.forEach(this.getChildren(), lang.hitch(this, function (childWidget) {
                childWidget.set("readOnly", readOnly);
            }));
        },

        _onAfterResizeHandler: function (documentSize) {
            this.set("documentSize", documentSize);
            this._updateOverlayItems(true);
        },

        _onContentChange: function () {
            this.target.contentChange();
        },

        _updateOverlayItems: function (targetResized) {
            // summary:
            //      Updates the overlay document size and repositions all overlay items
            //
            // tags:
            //      protected
            //

            if (!this.get("enabled") || this.isUpdating || !this.target.isInspectable()) {
                return;
            }

            var maxIterations = 4;
            var iterations = 1; // keep track of iterations so we don't end up in an infinite loop
            var dirty;
            var isChanged;

            this.isUpdating = true;

            // resize all widgets in each iteration, even if only one is dirty
            do {
                dirty = false;
                array.forEach(this.getChildren(), function (widget) {

                    var position = widget.get("position");
                    isChanged = position.isChanged || isChanged;
                    if (position.isChanged) {
                        dirty = widget.updatePosition(position) || dirty;
                    }

                }, this);

            } while (dirty && iterations++ < maxIterations);

            this.isUpdating = false;

            if (iterations >= 2 || !targetResized && isChanged) {
                this.target.contentChange();
            } else if (!targetResized) {
                this.target.checkSize();
            }
        },

        _toggleTargetCover: function (enabled) {
            var docSize = this.get("documentSize");

            if (enabled && docSize) {
                domStyle.set(this.targetCover, {
                    width: (docSize.w) + "px",
                    height: (docSize.h) + "px"
                });
            }

            domStyle.set(this.targetCover, { display: enabled ? "block" : "none" });
        },

        _togglePoller: function (enable) {

            var self = this;

            function poller() {
                self._updateOverlayItems();
                if (self.updateInterval > 0) {
                    self._pollerToken = setTimeout(poller, self.updateInterval);
                }
            }

            if (self._pollerToken) {
                clearTimeout(self._pollerToken);
            }

            if (enable) {
                poller();
            }
        },

        _setUpdateIntervalAttr: function (interval) {
            this._set("updateInterval", interval);
            this._togglePoller(interval > 0);
        },

        _setEnabledAttr: function (/*bool*/value) {
            this._set("enabled", value);
            if (value) {
                this._updateOverlayItems();
            }

            array.forEach(this.getChildren(), function (w) {
                w.set("disabled", !value);
            }, this);

            this._togglePoller(value);

            domStyle.set(this.domNode, { display: value ? "" : "none" });
        },

        _setTargetCoverEnabledAttr: function (/*bool*/value) {
            if (this.targetCoverEnabled === value) {
                return;
            }
            this._toggleTargetCover(value);
            this._set("targetCoverEnabled", value);
        }

    });
}
);
