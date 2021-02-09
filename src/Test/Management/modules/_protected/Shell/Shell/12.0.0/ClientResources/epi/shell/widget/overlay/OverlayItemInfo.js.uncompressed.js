require({cache:{
'url:epi/shell/widget/overlay/templates/OverlayItemInfo.html':"﻿<span class=\"epi-overlay-content\">\r\n    <span data-dojo-attach-point=\"highlightArea\" class=\"epi-overlay-content-highlight-area\"></span>\r\n</span>"}});
﻿define("epi/shell/widget/overlay/OverlayItemInfo", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    // dijit
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    // dojox
    "dojox/html/entities",
    // epi
    "epi/string",
    "epi/shell/widget/Tooltip",
    // template
    "dojo/text!./templates/OverlayItemInfo.html"
],
function (
// dojo
    array,
    declare,
    lang,

    domClass,
    domConstruct,
    domStyle,
    // dijit
    _WidgetBase,
    _TemplatedMixin,
    // dojox
    htmlEntities,
    // epi
    epiString,
    Tooltip,
    // template
    template
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // summary:
        //      Widget that used to display information for an overlay item
        // tags:
        //      internal

        templateString: template,

        postCreate: function () {
            this.inherited(arguments);

            // Setup default settings
            this.showStatusMessage(false);
        },

        destroy: function () {
            this.inherited(arguments);
            this._destroyTooltip();
        },

        showStatusMessage: function (/* Boolean */visible) {
            // summary:
            //      Toggle display of opacity layer
            // visible: [Boolean]
            //      Indicates additional information tooltip will be shown or not
            // tags:
            //      public

            if (this._tooltip) {
                visible ? this._tooltip.open(this.domNode) : this._tooltip.close();
            }
        },

        _setStatusIconAttr: function (/*Object*/ iconCssClass) {
            // summary:
            //      Set icon class of overlay item info
            // iconCssClass: [Object]
            //      The icon css class name
            // tags:
            //      private

            var isArray = lang.isArray(iconCssClass);
            if (isArray) {
                // Loop through array and add css class
                array.forEach(iconCssClass, function (cssClass) {
                    domClass.add(this.highlightArea, cssClass);
                }, this);
            } else {
                domClass.add(this.highlightArea, iconCssClass);
            }
        },

        _setStatusMessageAttr: function (/* Object */message) {
            // summary:
            //      Additional information about the content could be accessible in a tooltip
            // message: [Object]
            //      Tooltip content in multiple lines format
            //      Line format: { label: "label string", text: "text string", htmlEncode: true/false }
            // tags:
            //      private

            if (!message) {
                return;
            }

            var isArray = lang.isArray(message);

            if (this._tooltip) {
                if (isArray) {
                    this._tooltip.tooltipRows = message;
                } else {
                    this._tooltip.label = htmlEntities.encode(message);
                }
            } else {
                var messageContainer = domConstruct.create("div",
                        {
                            "class": "epi-overlay-content-tooltip",
                            innerHTML: epiString.toHTML(htmlEntities.encode(message))
                        }),
                    properties = isArray ? { tooltipRows: message} : { label: messageContainer.outerHTML };

                this._tooltip = new Tooltip(properties);
            }
        },

        _destroyTooltip: function () {
            // summary:
            //      Destroy tooltip
            // tags:
            //      private

            if (this._tooltip) {
                this._tooltip.destroyRecursive();
                this._tooltip = null;
            }
        }
    });
});
