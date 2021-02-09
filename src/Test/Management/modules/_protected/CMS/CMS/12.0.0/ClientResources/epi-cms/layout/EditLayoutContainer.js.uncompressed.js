require({cache:{
'url:epi-cms/layout/templates/EditLayoutContainer.html':"﻿<div class=\"dijitTabContainer\">\r\n    <div data-dojo-attach-point=\"topPaneContainerNode\"></div>\r\n\t<div class=\"dijitTabListWrapper\" data-dojo-attach-point=\"tablistNode\"></div>\r\n\t<div data-dojo-attach-point=\"tablistSpacer\" class=\"dijitTabSpacer ${baseClass}-spacer\"></div>\r\n\t<div class=\"dijitTabPaneWrapper ${baseClass}-container\" data-dojo-attach-point=\"containerNode\"></div>\r\n</div>\r\n"}});
define("epi-cms/layout/EditLayoutContainer", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/when",
    "dijit/layout/TabContainer",
    "dijit/registry",
    "dojo/text!./templates/EditLayoutContainer.html"
], function (
    array,
    declare,
    domConstruct,
    when,
    TabContainer,
    registry,
    template
) {

    return declare([TabContainer], {
        // summary:
        //     Widget that contains a group form items widgets, aimed to apply the html formatting specific to a group
        //
        // tags:
        //      internal

        templateString: template,

        postMixInProperties: function () {
            this.inherited(arguments);

            // This container does not allow doing layout children and only support top tabs because we use relative position when laying out.
            // The reason behind is that absolute position make the container zero height when it is laid out without size constraints.
            this.doLayout = false;
            this.tabPosition = "top";
        },

        addChild: function (widget, index) {
            // summary:
            //     Add a child o the container.
            // widget: dijit/_Widget
            //     The widget to add
            // index: Number
            //     The position
            // tags:
            //     public

            if (this._destroyed) {
                return;
            }

            if (widget.region === "top") {
                this.own(widget.placeAt(this.topPaneContainerNode));
            } else {
                this.inherited(arguments);
            }
        },

        removeChild: function (widget) {
            // Overrides _Container.removeChild() to do layout

            if (widget.region === "top") {
                // Return if we are being destroyed
                if (this._descendantsBeingDestroyed) {
                    return;
                }

                // Otherwise, do layout again
                if (this._started) {
                    this.layout();
                }
            } else {
                this.inherited(arguments);
            }
        },

        layout: function () {
            // Overrides TabContainer.layout().
            // Configure the content pane to take up all the space except for where the tabs and the top panel are.

            if (!this._contentBox || typeof (this._contentBox.l) == "undefined") {
                return;
            }

            // layout the top panel first
            var topPaneContents = registry.findWidgets(this.topPaneContainerNode);
            array.forEach(topPaneContents, function (widget) {
                widget.resize();
            });

            return this.inherited(arguments);
        },

        selectChild: function (widget) {
            // summary:
            //     Select child widget or group.
            // widget: dijit/_Widget
            //     The child widget or group
            // tags:
            //     public

            if (widget.region === "top") {
                return;
            } else {
                // After inherited finishes we call layout to reflow the content
                // in case a scrollbar has appeared on tab change, and then we pass on the result
                return when(this.inherited(arguments)).then(function (result) {
                    this.layout();
                    return result;
                }.bind(this));

            }
        }
    });
});
