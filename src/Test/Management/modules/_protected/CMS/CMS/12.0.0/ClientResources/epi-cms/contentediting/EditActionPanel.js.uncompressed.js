require({cache:{
'url:epi-cms/contentediting/templates/EditActionPanel.html':"﻿<div style=\"display: inline-block\">\r\n    <div class=\"dijitInline dijitReset\" data-dojo-attach-point=\"stateNode\">\r\n        <span data-dojo-attach-point=\"statusNonEditableIcon\" class=\"dijitInline dijitReset dijitIcon\">&nbsp;</span>\r\n        <span class=\"epi-statusContainer dijitInline dijitReset\">\r\n            <span data-dojo-attach-point=\"statusTextIcon\" class=\"dijitInline dijitReset dijitIcon\"></span>\r\n            <span data-dojo-attach-point=\"statusTextNode\" class=\"epi-statusText\"></span>\r\n        </span><span class=\"epi-statusArrow dijitInline dijitReset\"></span><!-- These need to be on the same line. -->\r\n    </div>\r\n\r\n\r\n\r\n    <div data-dojo-attach-point=\"dropDownButton\" data-dojo-type=\"dijit/form/DropDownButton\"\r\n        data-dojo-props=\"label: '${commonRes.action.publish}', 'class': 'epi-mediumButton epi-button--bold'\">\r\n        <div data-dojo-attach-point=\"dropDownMenu\" data-dojo-type=\"epi-cms/contentediting/PublishMenu\"></div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/contentediting/EditActionPanel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/dom-attr",

    "dijit/_CssStateMixin",
    "dijit/_TemplatedMixin",
    "dijit/_Widget",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/DropDownButton",

    "epi",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/PublishMenu",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/string",

    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editactionpanel",
    "dojo/text!./templates/EditActionPanel.html"
],

function (
    declare,
    lang,
    domStyle,
    domClass,
    domAttr,

    _CssStateMixin,
    _TemplatedMixin,
    _Widget,
    _WidgetsInTemplateMixin,
    DropDownButton,

    epi,
    ContentActionSupport,
    PublishMenu,
    _ModelBindingMixin,
    string,

    res,
    template
) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _CssStateMixin, _ModelBindingMixin], {
        // tags:
        //      internal

        templateString: template,

        commonRes: epi.resources,

        // baseClass: [protected] String
        //		Root CSS class of the widget.
        baseClass: "epi-statusIndicator",

        // Declare view model binding
        modelBindingMap: {
            state: ["state"],
            statusText: ["statusText"],
            visible: ["visible"],
            buttonText: ["buttonText"],
            nonEditableIndicator: ["nonEditableIndicator"],
            statusIcon: ["statusIcon"],
            publishMenuViewModel: ["publishMenuViewModel"],
            additionalClass: ["additionalClass"],
            expanded: ["expanded"]
        },

        // statusText: [protected] String
        //      Content status text.
        _setStatusTextAttr: function (statusText) {
            this._set("statusText", statusText);

            this._setStatusNodeText(statusText);
        },

        _setStatusNodeText: function (/*String*/ statusText) {
            // summary:
            //      Updates the content status indication with the supplied text
            // tags: private

            this.statusTextNode.innerHTML = statusText;

            domStyle.set(this.stateNode, "visibility", statusText ? "visible" : "hidden");
            domAttr.set(this.stateNode, "title", string.stripHtmlTags(statusText));
        },

        // buttonText: [protected] String
        //      Publish button label.
        _setButtonTextAttr: function (val) {
            this.dropDownButton.set("label", val);
        },

        // visible: [protected] Boolean
        //      Visibility of the widget.
        _setVisibleAttr: function (val) {
            domStyle.set(this.domNode, "visibility", val ? "visible" : "hidden");
        },

        _setExpandedAttr: function (expanded) {
            this._set("expanded", expanded);

            this._setStatusNodeText(this.statusText);
        },

        // nonEditableIndicator: [protected] Boolean
        //      Visibility of the noneditable indicator.
        _setNonEditableIndicatorAttr: function (val) {
            if (val) {
                domClass.add(this.statusNonEditableIcon, "epi-iconPenDisabled");
            } else {
                domClass.remove(this.statusNonEditableIcon, "epi-iconPenDisabled");
            }
        },

        // statusIcon: [protected] String
        //      Content status icon.
        _setStatusIconAttr: function (val) {
            if (this.get("statusIcon")) {
                domClass.remove(this.statusTextIcon, this.get("statusIcon"));
            }
            this._set("statusIcon", val);
            domClass.add(this.statusTextIcon, val);
        },

        _setAdditionalClassAttr: function (val) {
            // remove
            var currentAdditionalClass = this.get("additionalClass");
            if (currentAdditionalClass) {
                domClass.remove(this.stateNode, currentAdditionalClass);
            }
            // add new
            this._set("additionalClass", val);
            domClass.add(this.stateNode, val);
        },

        focus: function () {
            // summary:
            //      Set focus on the widget
            // description:
            //      The dropdown menu will be the one takes focus when the widget become focused.

            this.dropDownButton.focus();
        },

        toggleDropDownMenu: function (val) {
            // summary:
            //      Close the dropdown menu if necessary and prevent it from being opened
            // description:
            //      The dropdown menu will be the one takes focus when the widget become focused.
            domStyle.set(this.dropDownMenu.domNode, "display", val ? "" : "none");
            this.dropDownButton.set("disabled", !val);
        },

        _setPublishMenuViewModelAttr: function (val) {
            this.dropDownMenu.set("model", val);
        },

        postCreate: function () {
            this.inherited(arguments);

            // align dropdown menu open on the left of the button
            this.dropDownButton.dropDownPosition = ["below-alt"];
        }
    });
});
