require({cache:{
'url:epi-cms/widget/templates/TooltipDialog.html':"﻿<div class=\"epi-dijitTooltipDialog\" role=\"presentation\" tabindex=\"-1\">\r\n    <div class=\"dijitTooltipContainer epi-dijitTooltipContainer\" role=\"presentation\">\r\n        <div class=\"dijitTooltipContents dijitTooltipFocusNode epi-dijitTooltipContents\" data-dojo-attach-point=\"containerNode\" role=\"dialog\"></div>\r\n    </div>\r\n    <div class=\"dijitTooltipConnector epi-dijitTooltipConnector\" data-dojo-attach-point=\"connectorNode\" role=\"presentation\"></div>\r\n</div>"}});
﻿define("epi-cms/widget/TooltipDialog", [
    "dojo",
    "dojo/number",
    "dijit",
    "dijit/TooltipDialog",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/TooltipDialog.html"
],

function (dojo, number, dijit, TooltipDialog, _Widget, _TemplatedMixin, template) {
    return dojo.declare([TooltipDialog], {
        // tags:
        //      internal

        templateString: template,

        connectorMargin: 25, // Changable margin (left or right) for tooltip dialog connector
        _defaultConnectorMargin: 25, // Default margin (left or right) for tooltip dialog connector

        hideOnBlur: false,

        _isFirstShow: false,

        _beforeCssClass: "epi-dijitTooltipBefore", // Customized css class for before orient
        _afterCssClass: "epi-dijitTooltipAfter", // Customized css class for after orient

        _pos: 0,
        _defaultConnectorRight: 0, // Default margin right for tooltip dialog connector, will be set on the first tooltip show
        _defaultConnectorLeft: 0, // Default margin left for tooltip dialog connector, will be set on the first tooltip show

        _wrapperPosX: 0,
        _availableSpace: 0,
        _right: 0,
        _left: 0,

        onBlur: function () {
            this.inherited(arguments);

            if (this.hideOnBlur) {
                this.hideTooltipDialog();
            }
        },

        postCreate: function () {
            // summary:
            //    Inits tooltip dialog
            // tags:
            //    public

            this.inherited(arguments);

            // Set the default value for connector margin (left or right)
            if (!this.connectorMargin || !number.parse(this.connectorMargin) || this.connectorMargin === "" || this.connectorMargin < this._defaultConnectorMargin) {
                this.connectorMargin = this._defaultConnectorMargin;
            }
        },

        showTooltipDialog: function (target, orient) {
            // summary:
            //    Simply show tooltip dialog like dijit tooltip
            // tags:
            //    public

            dijit.popup.open({
                popup: this,
                around: target,
                orient: orient
            });

            if (this.hideOnBlur) {
                this.focus();
            }
        },

        hideTooltipDialog: function () {
            // summary:
            //    Simply hide tooltip dialog like dijit tooltip
            // tags:
            //    public

            dijit.popup.close(this);
        },

        onOpen: function (pos) {
            // summary:
            //    Overrides from dijit TooltipDialog
            // tags:
            //    extended

            this._pos = pos; // Save position object to use on _onShow()
            this.inherited(arguments);
        },

        _onShow: function () {
            // summary:
            //    Overrides from ContentPane
            // tags:
            //    extended

            this._setDefaultValues();
            this._updatePositions();

            this.inherited(arguments);
        },

        _setDefaultValues: function () {
            // summary:
            //    Sets default values
            // tags:
            //    private

            // Set default connector right and left margins on first show
            if (!this._isFirstShow) {
                this._defaultConnectorRight = this._getConnectorSpace("right") || this._defaultConnectorMargin;
                this._defaultConnectorLeft = this._getConnectorSpace("left") || this._defaultConnectorMargin;
                this._isFirstShow = true;
            }

            this._wrapperPosX = number.parse(this._pos.x); // Get position x of the tooltip dialog wrapper tag
            this._availableSpace = dojo.body().clientWidth; // Get full visible width of browser

            // Set position of tooltip connector to center vertical of around node
            if (this._pos.aroundCorner === "MR" || this._pos.aroundCorner === "ML") {
                var positionTop = number.round((this._pos.h - this.connectorNode.clientHeight) / 2);
                dojo.style(this.connectorNode, "top", this._getNumberInPx(positionTop));
            }
        },

        _updatePositions: function () {
            // summary:
            //    Updates positions of tooltip dialog's connector and tooltip dialog
            // tags:
            //    private

            switch (this._pos.aroundCorner) {
                // Top right or bottom right of around node (by set above or below in orient)
                case "TR":
                case "BR":
                    // Calculates to set connector node point to center horizontal of around node
                    this._calculateConnectorMarginRight();
                    this._calculateAvailableSpaceLeft();
                    this._updateAlignedRightPositions();
                    break;
                // Top left or bottom left of around node (by set above or below in orient)
                case "TL":
                case "BL":
                    // Calculates to set connector node point to center horizontal of around node
                    this._calculateConnectorMarginLeft();
                    this._calculateAvailableSpaceRight();
                    this._updateAlignedLeftPositions();
                    break;
                // Middle right of around node (by set after in orient)
                case "MR":
                    dojo.addClass(this.domNode, this._afterCssClass);
                    break;
                // Middle left of around node (by set before in orient)
                case "ML":
                    dojo.addClass(this.domNode, this._beforeCssClass);
                    break;
                default:
                    break;
            }
        },

        _updateAlignedRightPositions: function () {
            // summary:
            //    Updates positions of tooltip dialog's connector and tooltip dialog when it aligned right around node
            // tags:
            //    private

            if (this._availableSpace >= this.connectorMargin) {
                dojo.style(this.connectorNode, "right", this._getNumberInPx(this.connectorMargin));
                dojo.style(this._popupWrapper, "left", this._getNumberInPx(this._wrapperPosX + (this.connectorMargin - this._right)));
            } else {
                dojo.style(this.connectorNode, "right", this._getNumberInPx(this._defaultConnectorRight));
                dojo.style(this._popupWrapper, "left", this._getNumberInPx(this._wrapperPosX - (this._right - this._defaultConnectorRight)));
            }
        },

        _updateAlignedLeftPositions: function () {
            // summary:
            //    Updates positions of tooltip dialog's connector and tooltip dialog when it aligned left around node
            // tags:
            //    private

            if (this._availableSpace >= this.connectorMargin) {
                dojo.style(this.connectorNode, "left", this._getNumberInPx(this.connectorMargin));
                dojo.style(this._popupWrapper, "left", this._getNumberInPx(this._wrapperPosX + (this.connectorMargin - this._left)));
            } else {
                dojo.style(this.connectorNode, "left", this._getNumberInPx(this._defaultConnectorLeft));
                dojo.style(this._popupWrapper, "left", this._getNumberInPx(this._wrapperPosX - (this._left - this._defaultConnectorLeft)));
            }
        },

        _calculateAvailableSpaceRight: function () {
            // summary:
            //    Calculates available space on right when tooltip dialog aligned left around node
            // tags:
            //    private

            this._wrapperPosX -= this._left + this._getCenterHorizontalAroundNode();
            this._availableSpace -= (this._wrapperPosX + this._pos.w);
        },

        _calculateAvailableSpaceLeft: function () {
            // summary:
            //    Calculates available space on left when tooltip dialog aligned right around node
            // tags:
            //    private

            this._wrapperPosX += this._right + this._getCenterHorizontalAroundNode();
            this._availableSpace -= (this._wrapperPosX + this._pos.w);
        },

        _calculateConnectorMarginRight: function () {
            // summary:
            //    Calculates margin right of the connector
            // tags:
            //    private

            this._right = this._getConnectorSpace("right");
            if (this._right < this.connectorMargin) {
                this._right = this.connectorMargin;
            }
        },

        _calculateConnectorMarginLeft: function () {
            // summary:
            //    Calculates margin left of the connector
            // tags:
            //    private

            this._left = this._getConnectorSpace("left");
            if (this._left < this.connectorMargin) {
                this._left = this.connectorMargin;
            }
        },

        _getConnectorSpace: function (position) {
            // summary:
            //    Gets connector margin (left or right)
            // position:
            //    Css position: left or right
            // tags:
            //    private

            if (!position) {
                return 0;
            }

            if (position === "right" || position === "left") {
                var positionValue = dojo.style(this.connectorNode, position);
                if (!positionValue) {
                    return 0;
                }
                var patterns = /(px|em|%)/ig;
                return number.parse(positionValue) || number.parse(positionValue.replace(patterns, ""));
            }

            return 0;
        },

        _getNumberInPx: function (number) {
            // summary:
            //    Gets number in pixel format
            // number:
            //    Integer number
            // tags:
            //    private

            return number + "px";
        },

        _getCenterHorizontalAroundNode: function () {
            // summary:
            //    Gets number of the center horizontal of tooltip dialog around node
            // tags:
            //    private

            return number.round((number.parse(this.connectorNode.clientWidth) - number.parse(this._pos.aroundNodePos.w)) / 2);
        }
    });
});
