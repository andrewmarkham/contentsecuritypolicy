require({cache:{
'url:epi/shell/widget/dialog/templates/Dialog.html':"﻿<div class=\"dijitDialog\" role=\"dialog\" aria-labelledby=\"${id}_title\">\r\n    <div data-dojo-attach-point=\"titleBar\" class=\"dijitDialogTitleBar\">\r\n        <span data-dojo-attach-point=\"titleNode\" class=\"dijitDialogTitle\" id=\"${id}_title\"></span>\r\n        <span data-dojo-attach-point=\"closeButtonNode\" class=\"dijitDialogCloseIcon\" data-dojo-attach-event=\"ondijitclick: onCancel\" title=\"${resources.close}\" role=\"button\" tabIndex=\"-1\">\r\n            <span data-dojo-attach-point=\"closeText\" class=\"closeText\" title=\"${resources.cancel}\">x</span>\r\n        </span>\r\n    </div>\r\n    <div data-dojo-attach-point=\"contentContainerNode\" class=\"epi-dialogPaneContent\">\r\n        <span data-dojo-attach-point=\"iconNode\" class=\"dijitIcon dijitInline epi-dialogIcon\"></span>\r\n        <div data-dojo-attach-point=\"headingNode\" class=\"epi-dialogDescriptionHeader\"></div>\r\n        <div data-dojo-attach-point=\"descriptionNode\" class=\"epi-dialogDescriptionSummary\"></div>\r\n        <div data-dojo-attach-point=\"containerNode\" class=\"dijitDialogPaneContentArea\"></div>\r\n        <div data-dojo-attach-point=\"actionContainerNode\" class=\"dijitDialogPaneActionBar\"></div>\r\n    </div>\r\n</div>"}});
﻿define("epi/shell/widget/dialog/_DialogBase", [
    "epi",
    "dojo",
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/query",
    "dojo/text!./templates/Dialog.html",
    "dojo/when",
    "dijit/a11y",
    "dijit/focus",
    "dijit/Dialog",
    "epi/shell/widget/dialog/_DialogMixin",
    "epi/shell/widget/_FocusableMixin"
], function (epi, dojo, declare, array, domClass, domStyle, query, template, when, a11y, focus, Dialog, _DialogMixin, _FocusableMixin) {

    var module = declare([Dialog, _DialogMixin, _FocusableMixin], {
        // summary:
        //		A modal dialog widget
        //
        // tags:
        //      internal

        // templateString: [protected] String
        //		A string that represents the widget template.
        templateString: template,

        // heading: [protected] String
        //		A string heading to be displayed in the dialog.
        heading: "",

        // description: [protected] String
        //		A string description to be displayed in the dialog.
        description: "",

        // dialogClass: [protected] String
        //		Class to apply to the root DOMNode of the dialog.
        dialogClass: "",

        // iconClass: [protected] String
        //		Class to apply to DOMNode to make it display an icon.
        iconClass: "dijitNoIcon",

        // destroyOnHide: [public] Boolean
        //		Flag which indicates whether the dialog will be destroyed after it is hidden.
        destroyOnHide: true,

        // focusActionsOnLoad: [public] Boolean
        //      A flag indicating whether the actions container should be the first focus target on dialog load.
        focusActionsOnLoad: false,

        postMixInProperties: function () {
            // summary:
            //		Mixin language resources to the class.
            // tags:
            //		protected

            this.inherited(arguments);
            this.resources = epi.resources.action;
        },

        buildRendering: function () {
            // summary:
            //		Construct the UI for this widget from a template, adding dialogClass to this.domNode.
            // tags:
            //		protected

            this.inherited(arguments);
            if (this.dialogClass) {
                domClass.add(this.domNode, this.dialogClass);
            }
            this.set("closeIconVisible", this.closeIconVisible);
            this.set("iconClass", this.iconClass);
            this.set("heading", this.heading);
            this.set("description", this.description);
        },

        postCreate: function () {
            this.inherited(arguments);

            // Check if content is _DialogContentMixin then wire up the provided methods to dialog events.
            if (this.content && this.content.executeDialog) {
                this.connect(this.content, "executeDialog", "onExecute");
            }
            if (this.content && this.content.cancelDialog) {
                this.connect(this.content, "cancelDialog", "onCancel");
            }
        },

        hide: function () {
            // summary:
            //		Hides the dialog and destroy, if it is required.
            // returns: dojo/Deferred
            //		Deferred object that resolves when the hide animation is complete or dialog is destroyed

            var onHideComplete = dojo.hitch(this, function () {
                if (this.destroyOnHide) {
                    this.destroyRecursive();
                }
            });
            return when(this.inherited(arguments), onHideComplete);
        },

        _getFocusItems: function () {
            // summary:
            //		Sets this._firstFocusItem and this._lastFocusItem to the dialog content
            //		if it exists or else to items in the action panel.
            // tags:
            //		protected
            var node = this.focusActionsOnLoad ? this.actionContainerNode : this.contentContainerNode,
                container = a11y._getTabNavigable(node);

            // Set focusActionsOnLoad to false since we don't want to limit the focus area after load.
            this.focusActionsOnLoad = false;

            this._firstFocusItem = container.lowest || container.first || this.closeButtonNode || this.domNode;
            this._lastFocusItem = container.last || container.highest || this._firstFocusItem;
        },

        _setDialogContentNode: function (targetNode, value) {
            // summary:
            //      Sets the inner html of content and adds the class epi-firstVisible to the fist visible content child div.
            // tags:
            //      private

            targetNode.innerHTML = value;
            domStyle.set(targetNode, "display", value ? "" : "none");

            var children = query("div", this.contentContainerNode);
            children.removeClass("epi-firstVisible");

            array.some(children, function (targetNode) {
                if (domStyle.get(targetNode, "display") !== "none") {
                    domClass.add(targetNode, "epi-firstVisible");
                    return true;
                }
            });
        },

        _setHeadingAttr: function (value) {
            this._setDialogContentNode(this.headingNode, value);
        },

        _setDescriptionAttr: function (value) {
            this._setDialogContentNode(this.descriptionNode, value);
        },

        _setIconClassAttr: function (value) {
            domClass.remove(this.iconNode, this.iconClass);
            this._set("iconClass", value);
            domClass.add(this.iconNode, this.iconClass);
        }
    });

    module.getDialogZindex = function () {
        // summary:
        //		Return the latest z-index value of the created dialogs or the default z-index value
        // tags:
        //		protected

        var obj = Dialog._dialogStack ? Dialog._dialogStack[Dialog._dialogStack.length - 1] : null;
        if (obj && obj.zIndex) {
            //When there are dialogs we return the latest zIndex of the object in the stack +1,
            //because the dialog steps +2 everytime so its safe to add +1. Or return the default zIndex from the dijit dialog.
            return obj.zIndex + 1;
        }
        return Dialog._DialogLevelManager._beginZIndex;
    };

    return module;
});
