require({cache:{
'url:epi/shell/widget/dialog/templates/LightWeight.html':"﻿<div class=\"epi-lfw-dialog epi-lfw-dialog--dark dijitDialog\" role=\"dialog\" aria-labelledby=\"${id}_title\">\r\n    <div data-dojo-attach-point=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n        <span data-dojo-attach-point=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\r\n         <span data-dojo-attach-point=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" data-dojo-attach-event=\"ondijitclick: onButtonClose\" title=\"${buttonCloseText}\" role=\"button\" tabIndex=\"0\">\r\n            <span data-dojo-attach-point=\"closeText\" class=\"closeText\" title=\"${buttonCloseText}\">x</span>\r\n        </span>\r\n    </div>\r\n    <div class=\"dijitDialogPaneContent\">\r\n        <div data-dojo-attach-point=\"containerNode\" class=\"dijitDialogPaneContentArea\" data-dojo-attach-event=\"onclick:_onContainerNodeClick\"></div>\r\n        <div data-dojo-attach-point=\"buttonContainerNode\" class=\"dijitDialogPaneActionBar clearfix\">\r\n            <button data-dojo-attach-point=\"doneButtonNode\" data-dojo-type=\"dijit/form/Button\" type=\"button\">${buttonDoneText}</button>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi/shell/widget/dialog/LightWeight", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/has",
    "dijit/focus",
    "dijit/DialogUnderlay",
    // Parent class and mixins
    "dijit/Dialog",
    "epi/shell/widget/dialog/_DialogMixin",
    "dijit/_WidgetsInTemplateMixin",
    // Resources
    "epi/i18n!epi/nls/episerver.shared",
    "dojo/text!./templates/LightWeight.html"
],
function (
    declare,
    lang,
    aspect,
    domGeom,
    domStyle,
    has,
    focus,
    DialogUnderlay,
    // Parent class and mixins
    Dialog,
    _DialogMixin,
    _WidgetsInTemplateMixin,
    // Resources
    localizations,
    template
) {

    return declare([Dialog, _DialogMixin, _WidgetsInTemplateMixin], {
        // summary:
        //		A lightweight dialog Widget
        //
        // description:
        //		Pops up a modeless lightweight dialog window
        //
        // tags:
        //      public

        // templateString: [protected] String
        //		A string that represents the widget template.
        templateString: template,

        // buttonCloseText: [protected] String
        //      Text to be displayed on the 'close' button
        buttonCloseText: localizations.action.close,

        // buttonDoneText: [protected] String
        //      Text to be displayed on the 'done' button
        buttonDoneText: localizations.action.done,

        // buttonLearnMoreText: [protected] String
        //      Text to be displayed on the 'learnmore' button
        buttonLearnMoreText: localizations.action.learnmore,

        // useGlassUnderlay: [public] Boolean
        //    Denotes that a glass underlay should be used. This underlay is not the global dijit/_underlay which is designed for modal dialogs only.
        useGlassUnderlay: false,

        // _glassUnderlay: [public] dijit/DialogUnderlay
        //    Underlay object. dijit/Dialog use a single global underlay which is not fully transparent for all dialog layers.
        //    This lightweight dialog maintains a different underlay to avoid messing up dijit's dialog stack.
        _glassUnderlay: null,

        "class": "epi-lfw-dialog",

        // snapToNode: [public] domNode
        //    The DomNode to snap to when doing positioning.
        snapToNode: null,

        // positioner: [public] epi/shell/layout/PositioningUtility
        //    Utility used to determine the correct position to display this dialog.
        positioner: null,

        // showButtonContainer: [public] Boolean
        //      A flag indicating whether the button container should be visible.
        showButtonContainer: true,

        destroy: function () {
            // summary:
            //		Destroy dialog

            this._interval && clearInterval(this._interval);

            this.inherited(arguments);
        },

        show: function () {
            // summary:
            //		Display the dialog
            // returns: dojo/Deferred
            //		Deferred object that resolves when the display animation is complete

            return this.inherited(arguments).then(lang.hitch(this, this._onAfterShow));
        },

        _size: function () {

            var transformId = this._relativePosition && this._relativePosition.id;

            // Set the overflow to visible before we calculate the container size. The size of the
            // dialog may be smaller than the content, causing it to scroll. However the default
            // dialog implementation doesn't account for this and so will calculate incorrectly.
            domStyle.set(this.containerNode, "overflow", "visible");

            this.inherited(arguments);

            // Reset the overflow to auto so that it scrolls if needed.
            domStyle.set(this.containerNode, "overflow", "auto");

            // Optional property. Check null before using
            if (this.positioner) {
                var obj = { snapTo: this.snapToNode, transformIndex: transformId};
                this._relativePosition = this.positioner.findPosition(this.domNode, obj);
            }
        },

        resize: function () {
            this._size();
            this._position();
        },

        _onAfterShow: function () {
            // summary:
            //		Additional work after dialog is shown.

            function checkSize() {

                var curPos = domGeom.position(this.domNode),
                    oldPos = this._relativePosition;

                if (oldPos && (Math.abs(oldPos.w - curPos.w) > 8 || Math.abs(oldPos.h - curPos.h) > 8)) {
                    this.resize();
                }
            }

            if (this.content && this.content.focus) {
                this.content.focus();
            }

            if (this.useGlassUnderlay) {
                this._createUnderlay();
            } else {
                //No glass underlay created when showing up, we use a temporary underlay to avoid lag when moving/resizing.
                //Handle moving
                if (this._moveable && !this._attachedMoveEvents) {
                    this.connect(this._moveable, "onMoveStart", lang.hitch(this, this._createUnderlay));
                    this.connect(this._moveable, "onMoveStop", lang.hitch(this, this._removeUnderlay));
                    this._attachedMoveEvents = true;
                }

                //Handle content resizing
                if (this.content && this.content.onResizeStart && this.content.onResizeStop && !this._attachedContentResizeEvents) {
                    this.own(
                        aspect.after(this.content, "onResizeStart", lang.hitch(this, this._createUnderlay)),
                        aspect.after(this.content, "onResizeStop", lang.hitch(this, this._removeUnderlay))
                    );
                    this._attachedContentResizeEvents = true;
                }
            }

            this._interval = setInterval(lang.hitch(this, checkSize), 250);

            this.onAfterShow();
        },

        _createUnderlay: function () {
            // summary:
            //		Handle move start event.
            // description:
            //      Show a transparent underlay to prevent lagging when drag over the underneath iframe.

            var container = this.containerNode,
                contentWidth = domStyle.get(container, "width");

            // Special handling for IE since it ignores the box sizing model and the scrollbar width
            // when retrieving the width of the DOM node.
            if (has("trident")) {
                var scrollbarWidth = container.offsetWidth - container.clientWidth;

                contentWidth += domGeom.getPadBorderExtents(container).w + scrollbarWidth;
            }

            // Calculate the width of the dialog container node and set it specifically as a style. This
            // fixes an issue where editors that have width of 100% cause the dialog to grow or shrink when dragged.
            domStyle.set(container, {
                width: contentWidth + "px"
            });

            if (this._glassUnderlay) {
                this._glassUnderlay.show();
            } else {
                this.own(
                    this._glassUnderlay = new DialogUnderlay()
                );
                this._glassUnderlay.show();

                // Set z-index a bit under the dialog
                var zIndex = domStyle.get(this.domNode, "zIndex");
                domStyle.set(this._glassUnderlay.domNode, "zIndex", zIndex - 1);

                //Make it transparent
                domStyle.set(this._glassUnderlay.domNode, "opacity", "0");
            }
        },

        _endDrag: function () {
            // summary:
            //      Called after dragging the dialog; sets the transform ID for the current position to be user set.
            // tags:
            //      protected
            this.inherited(arguments);

            this._relativePosition.id = this.positioner.userSetTransformId;
        },

        _removeUnderlay: function () {
            // summary:
            //		Handle move stop event.
            // description:
            //      Hide the transparent underlay.

            this._glassUnderlay.hide();
        },

        _onContainerNodeClick: function (e) {
            //If we inside the dialog, set the focus to the first focusable item
            if (e.target === this.containerNode) {
                this._getFocusItems();
                this._firstFocusItem && focus.focus(this._firstFocusItem);
            }
        },

        _setSnapToNodeAttr: function (node) {
            // Work-around permission denied in IE when the document containing the old reference has been unloaded.
            this.snapToNode = null;
            this._set("snapToNode", node);
        },


        onButtonClose: function () {

        },

        onAfterShow: function () {
            // summary:
            //    Fired on after show.
            //
            // tags:
            //    public, callback
        },

        onAfterHide: function () {
            // summary:
            //    Fired on hide.
            //
            // tags:
            //    public, callback
        },

        hide: function () {
            // summary:
            //		Hide the dialog
            // returns: dojo/Deferred
            //		Deferred object that resolves when the hide animation is complete

            this._interval && clearInterval(this._interval);
            this._interval = null;

            return this.inherited(arguments).then(lang.hitch(this, this._onAfterHide));
        },

        _onAfterHide: function () {
            if (this.useGlassUnderlay) {
                this._removeUnderlay();
            }

            this.onAfterHide();
        },

        layout: function () {
            // summary:
            //		Position the Dialog and the underlay
            // tags:
            //		private

            if (this._glassUnderlay && domStyle.get(this._glassUnderlay.domNode, "display") !== "none") {
                // Calling layout of the underlay sets display, and since show() calls layout we can ignore it if it's not shown
                this._glassUnderlay.layout();
            }

            var underlay = DialogUnderlay._singleton;

            //Adjust other dijit underlay display state, since Dialog.layout always set the modal Dialog's underlay to visible.
            var dijitUnderlayDisplay = underlay ? domStyle.get(underlay.domNode, "display") : null;

            this.inherited(arguments);

            if (underlay) {
                domStyle.set(underlay.domNode, "display", dijitUnderlayDisplay);
            }
        },

        _setShowButtonContainerAttr: function (showButtonContainer) {
            this._set("showButtonContainer", showButtonContainer);
            domStyle.set(this.buttonContainerNode, "display", showButtonContainer ? "" : "none");
        },

        _checkIfSingleChild: function () {
            // Force the lightweight dialog to run as if it doesn't have a single child.
            // This forces the dialog to set any width and height styles to itself instead
            // of the child, meaning that scrolling will occur on the container node rather
            // than the child node. This is necessary since our dialog styles only allow
            // for scrolling on the container node and not the child node.
            this._singleChild = null;
        }
    });
});
