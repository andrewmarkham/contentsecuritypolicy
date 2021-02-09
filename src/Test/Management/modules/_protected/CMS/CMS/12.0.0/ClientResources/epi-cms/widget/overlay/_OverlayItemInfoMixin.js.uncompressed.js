define("epi-cms/widget/overlay/_OverlayItemInfoMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/when",
    "dojo/mouse",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/overlay/OverlayItemInfo",
    "epi-cms/widget/viewmodel/ContentStatusViewModel"
], function (declare, lang, domConstruct, on, when, mouse, TypeDescriptorManager, OverlayItemInfo, ContentStatusViewModel) {

    return declare(null, {
        // summary:
        //      A mixin for overlays that adds an information layer containing an icon and message.
        //
        // tags:
        //      internal

        // disableTooltip: [Boolean]
        //      Flag to indicate disable overlay information tooltip when starting drag.
        disableTooltip: false,

        // useIconOnBlock: [Boolean]
        //      Flag to indicate always show/not overlay and icon of block.
        useIconOnBlock: false,
        postCreate: function () {
            this.own(this.viewModel.watch("contentStatus", lang.hitch(this, "_setupIcon")));

            this.own(this.viewModel.watch("statusMessage", lang.hitch(this, function (propertyName, oldValue, newValue) {
                this.set("statusMessage", newValue);
            })));

            // Subcrible global dnd events to toggle state of disableTooltip.
            this.subscribe("/dnd/start", lang.hitch(this, function () {
                if (!this.disableTooltip) {
                    this._set("disableTooltip", true);

                    // Make sure close current tooltip if it showed.
                    this._showStatusMessage(false);
                }
            }));
            this.subscribe("/dnd/cancel", lang.hitch(this, function () {
                this._set("disableTooltip", false);
            }));
            this.subscribe("/dnd/drop", lang.hitch(this, function () {
                this._set("disableTooltip", false);
            }));

            // Connect onmouseenter/onmouseleave events in order to show/hide additional information
            var node = this.get("containerDomNode");
            if (node) {
                this.own(on(node, mouse.enter, lang.hitch(this, function () {
                    this._showStatusMessage(!this.get("disableTooltip"));
                })));

                this.own(on(node, mouse.leave, lang.hitch(this, function () {
                    this._showStatusMessage(false);
                })));
            }

            this.inherited(arguments);
        },

        destroy: function () {
            if (this._overlayItemInfo) {
                this._overlayItemInfo.destroyRecursive();
                this._overlayItemInfo = null;
            }

            this.inherited(arguments);
        },

        _setStatusIconAttr: function (/* String */ iconCSSClasses) {
            // summary:
            //      Apply CSS class for content status icon.
            // iconCSSClasses: [String]
            //      List of CSS class for content status icon
            // tags:
            //      private
            var overlayItemInfo = this.get("overlayItemInfo");

            if (!overlayItemInfo) {
                return;
            }

            overlayItemInfo.set("statusIcon", iconCSSClasses);
        },

        _setStatusMessageAttr: function (/* Object */ message) {
            // summary:
            //      Set content status message
            // message: [Object]
            //      Content status message object. Can be String data type or Array data type.
            // tags:
            //      private
            var overlayItemInfo = this.get("overlayItemInfo");

            if (!overlayItemInfo) {
                return;
            }

            overlayItemInfo.set("statusMessage", message);
        },

        _getContainerDomNodeAttr: function () {
            // summary:
            //      Get container DOM node.
            // tags:
            //      private
            return this.containerDomNode || this.domNode;
        },

        _getOverlayItemInfoAttr: function () {
            // summary:
            //      Get overlay item information widget
            // tags:
            //      private
            if (!this._overlayItemInfo) {
                // Setup overlay item information widget
                this._overlayItemInfo = new OverlayItemInfo();

                domConstruct.place(this._overlayItemInfo.domNode, this.get("containerDomNode"));
            }

            return this._overlayItemInfo;
        },

        _setupIcon: function () {

            var overlayItemInfo,
                useIconOnBlock,
                iconClass,
                description;

            overlayItemInfo = this.get("overlayItemInfo");
            overlayItemInfo.set("class", !this.viewModel.get("isVisibleOnSite") ? "epi-overlay-content-invisible" : "");

            // Get typeIdentifier of content first and if null then get of viewmodel.
            var typeIdentifier = (this.viewModel.content && this.viewModel.content.typeIdentifier) || this.viewModel.typeIdentifier;

            if (this.viewModel.get("isVisibleOnSite") && typeIdentifier) {
                useIconOnBlock = TypeDescriptorManager.getValue(typeIdentifier, "useIconOnBlock");
                iconClass = TypeDescriptorManager.getValue(typeIdentifier, "iconClass");
                description = TypeDescriptorManager.getValue(typeIdentifier, "description");

                if (useIconOnBlock) {
                    overlayItemInfo.set("class", "epi-overlay-content-info");
                    this.set("useIconOnBlock", true);
                    this.set("statusIcon", iconClass);
                    this.set("statusMessage", description);
                }
            }
        },

        _showStatusMessage: function (/* Boolean */ visible) {
            // summary:
            //      Set availibility to display additional information.
            // visible: [Boolean]
            //      Indicated that show additional information if true
            // tags:
            //      private
            if (this._overlayItemInfo) {
                this._overlayItemInfo.showStatusMessage(visible);
            }
        }
    });
});
