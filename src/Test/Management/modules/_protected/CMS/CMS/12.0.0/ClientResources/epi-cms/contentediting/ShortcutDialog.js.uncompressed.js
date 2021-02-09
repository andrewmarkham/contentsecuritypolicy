require({cache:{
'url:epi-cms/contentediting/templates/ShortcutDialog.html':"﻿<div class=\"epi-form-container\">\r\n    <div data-dojo-type=\"epi-cms/widget/Breadcrumb\" data-dojo-attach-point=\"breadcrumb\" data-dojo-props=\"showCurrentNode: false\"></div>\r\n    <h1 data-dojo-attach-point=\"contentNameNode\" class=\"epi-breadCrumbsCurrentItem dijitInline dojoxEllipsis\"></h1>\r\n    <div data-dojo-type=\"dijit/form/Form\" data-dojo-attach-point=\"form\"></div>\r\n</div>"}});
﻿define("epi-cms/contentediting/ShortcutDialog", [

// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/html",

    // Dijit
    "dijit/_CssStateMixin",

    //Dojox
    "dojox/validate/regexp",

    // EPi CMS
    "epi-cms/widget/Breadcrumb",
    "epi-cms/contentediting/PageShortcutTypeSupport",

    // EPi Framework
    "epi/shell/widget/dialog/_DialogContentMixin",
    "epi/shell/widget/FormContainer",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/_ActionProviderWidget",

    // Template
    "dojo/text!./templates/ShortcutDialog.html",

    // Resources
    "epi/i18n!epi/nls/episerver.shared"
],
function (

// Dojo
    declare,
    lang,
    domStyle,
    domClass,
    html,

    // Dijit
    _CssStateMixin,

    //Dojox
    regexp,

    // EPi CMS
    Breadcrumb,
    PageShortcutTypeSupport,

    // EPi Framework
    _DialogContentMixin,
    FormContainer,
    _ModelBindingMixin,
    _ActionProviderWidget,

    // Template
    template,

    // Resources
    sharedResources) {

    return declare([FormContainer, _ActionProviderWidget, _DialogContentMixin, _CssStateMixin, _ModelBindingMixin], {
        // summary:
        //      Dialog used to modify edit content shortcuts
        // tags:
        //      internal

        // templateString: String
        //      The template of widget
        templateString: template,

        // contentLink: String
        //      The content link id
        contentLink: null,

        // contentName: String
        //      The content name
        contentName: null,

        baseClass: "epi-statusIndicator",

        // _externalLinkWidget: Object
        //      The external link widget
        _externalLinkWidget: null,

        // _shortcutLinkWidget: Object
        //      The shortcut link widget
        _shortcutLinkWidget: null,

        // _shortcutTypeWidget: Object
        //      The shortcut type widget
        _shortcutTypeWidget: null,

        // _targetFrameWidget: Object
        //      The target frame widget
        _targetFrameWidget: null,

        //  _switchLinkTypeFirstRunDone: Boolean
        //     Indicate whether we ever have chosen the external link
        _switchLinkTypeFirstRunDone: false,

        modelBindingMap: {
            contentLink: ["contentLink"],
            contentName: ["contentName"],
            enableSaveButton: ["enableSaveButton"],
            enableShortcutLink: ["enableShortcutLink"],
            enableExternalLink: ["enableExternalLink"],
            clearExternalLink: ["clearExternalLink"],
            enableOpenIn: ["enableOpenIn"]
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            // This form container is used inside a dialog without any size constraints because the dialog allow its content to overflow.
            // Therefore, we should not layout the form's top layout container.
            this.doLayout = false;
        },

        _setContentLinkAttr: function (value) {
            this.breadcrumb.set("contentLink", value);
        },

        _setContentNameAttr: {
            node: "contentNameNode",
            type: "innerText"
        },

        _setEnableSaveButtonAttr: function (value) {
            // summary
            //      Disable/Enable save button
            // tag
            //      Private

            if (this._actions && this._actions.length) {
                this.setActionProperty("save", "disabled", !value);
            }
        },

        _setEnableShortcutLinkAttr: function (value) {
            // Summary
            //      Disable/Enable validation of shortcut link
            //      Reset state of widget
            //      Show/hide shortcut link widget
            // value: Boolean
            //      If this is true, shortcut link  will be show, enable validation, otherwise it hidden
            // tag
            //      Private

            if (this._shortcutLinkWidget) {
                this._shortcutLinkWidget.set("required", value);
                // Set state of textbox to normal
                this._shortcutLinkWidget.set("state", "");
                var formRowNode = this._getAncestorNode(this._shortcutLinkWidget.domNode, "epi-form-container__section__row");
                if (formRowNode) {
                    domStyle.set(formRowNode, "display", value ? "" : "none");
                }
            }
        },

        _setEnableExternalLinkAttr: function (value) {
            // Summary
            //      Disable/Enable validation of textbox
            //      Reset state of textbox
            //      Show/hide external link widget
            // value: Boolean
            //      If this is true, external link will be show, enable validation, otherwise it hidden
            // tag
            //      Private

            if (this._externalLinkWidget) {
                this._externalLinkWidget.set("required", value);
                this._externalLinkWidget.set("disabled", !value);
                // Set state of textbox to normal
                this._externalLinkWidget._set("state", "");

                var formRowNode = this._getAncestorNode(this._externalLinkWidget.domNode, "epi-form-container__section__row");
                if (formRowNode) {
                    domStyle.set(formRowNode, "display", value ? "" : "none");
                }
            }
        },

        _setEnableOpenInAttr: function (value) {
            if (this._targetFrameWidget) {

                var formRowNode = this._getAncestorNode(this._targetFrameWidget.domNode, "epi-form-container__section__row");
                if (formRowNode) {
                    domStyle.set(formRowNode, "display", value ? "" : "none");
                }
            }
        },

        _getAncestorNode: function (node, classAttr) {
            // Summary
            //      Get ancestor node which has class classAttr
            // node: DomNode
            //      The domNode which need to get ancestor.
            // classAttr: String
            //      The class attribute.
            // tag
            //      Private

            var parentNode = node ? node.parentNode : null;
            if (!parentNode) {
                return null;
            }

            if (!domClass.contains(parentNode, classAttr)) {
                return this._getAncestorNode(parentNode, classAttr);
            }

            return parentNode;
        },

        _setClearExternalLinkAttr: function (value) {
            // summary
            //      Clear text and reset state of external link textbox
            //  tag
            //      Private

            if (this._externalLinkWidget && value && !this._switchLinkTypeFirstRunDone) {
                // We need to clear the input textbox for external link the first time we chose external link.
                // If the page is saved with external link chosen however, we do not wish to clear the input textbox.
                this._externalLinkWidget.reset();
                this._switchLinkTypeFirstRunDone = true;
            }
        },

        onFieldCreated: function (fieldName, widget) {
            // summary:
            //     Raised when a field editor widget is created.
            // description:
            //     Override the FormContainer method to catch and keep reference to externalLink, shortcutLink and shortcutType widget
            // fieldName: String
            //     The field name
            // widget: dijit/_Widget
            //     The widget
            // tags:
            //     callback

            switch (fieldName) {
                case "pageLinkURL":
                    this._externalLinkWidget = widget;
                    this.connect(this._externalLinkWidget.domNode, "onkeyup", lang.hitch(this, function (evt) {
                        // Enable save button when user start typing
                        this.model.set("enableSaveButton", true);
                    }));
                    break;

                case "contentShortcutLink":
                    this._shortcutLinkWidget = widget;
                    this._shortcutLinkWidget.set("contentLink", this.model.get("contentLink"));
                    break;

                case "pageShortcutType":
                    this._shortcutTypeWidget = widget;
                    break;

                case "pageTargetFrame":
                    this._targetFrameWidget = widget;
                    break;

                default:
                    break;
            }
        },

        onChange: function (value) {
            this.inherited(arguments);
            this.model.set("intermediateValue", lang.mixin(value, { pageShortcutTypeName: this._shortcutTypeWidget ? this._shortcutTypeWidget.get("displayedValue") : "" }));

            var shortCutType = this._shortcutTypeWidget && this._shortcutTypeWidget.get("value");

            // The same content link should not be able to set as short cut link
            if (shortCutType === PageShortcutTypeSupport.pageShortcutTypes.Shortcut) {
                this._shortcutLinkWidget && this._shortcutLinkWidget.set("canSelectOwnerContent", false);
            }
        },

        _getValueAttr: function () {
            //We need to override getValue because the FormContainer returns the values in the form
            //But this dialog values that is not visible in the form

            return this.model.get("intermediateValue");
        },

        getActions: function () {
            // summary:
            //      Overridden from _ActionProvider to get the select current content action added to the containing widget
            //
            // returns:
            //      An array contining a select page action definition, if it is not a shared block

            this._actions = [
                {
                    name: "save",
                    label: sharedResources.action.save,
                    settings: { type: "button", disabled: true, "class": "Salt" },
                    action: lang.hitch(this, function () {
                        if (this.validate()) {
                            this.executeDialog();
                        } else {
                            this.model.set("enableSaveButton", false);
                        }
                    })
                },
                {
                    name: "cancel",
                    label: sharedResources.action.cancel,
                    settings: { type: "button" },
                    action: lang.hitch(this, function () {
                        this.cancelDialog();
                    })
                }
            ];

            return this._actions;
        }
    });
});
