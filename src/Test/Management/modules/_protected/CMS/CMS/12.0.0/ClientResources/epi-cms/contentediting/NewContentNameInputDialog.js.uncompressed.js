require({cache:{
'url:epi-cms/contentediting/templates/NewContentNameInputDialog.html':"﻿<div class=\"epi-formContainer\">\r\n    <div data-dojo-attach-point=\"messageNode\"></div>\r\n    <br />\r\n    <div>\r\n        <label data-dojo-attach-point=\"contentNameLabelNode\">${nameLabel}</label>\r\n        <input type=\"text\" size=\"40\" maxlength=\"255\"  data-dojo-attach-point=\"contentNameTextbox\" data-dojo-type=\"dijit/form/ValidationTextBox\"\r\n                data-dojo-props=\"required: true, trim:true, selectOnClick: true\"\r\n                data-dojo-attach-event=\"onBlur: _onBlurVerifyContent\"\r\n                missingMessage: \"${res.errormessage.missingmessage}\" />\r\n    </div>\r\n</div>"}});
﻿define("epi-cms/contentediting/NewContentNameInputDialog", [

// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/keys",

    // Dijit
    "dijit/_CssStateMixin",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/TextBox",

    // EPi Framework
    "epi",
    "epi/shell/widget/dialog/_DialogContentMixin",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/_ActionProviderWidget",

    // Template
    "dojo/text!./templates/NewContentNameInputDialog.html",

    // Resource
    "epi/i18n!epi/cms/nls/episerver.cms.widget.newcontentnamedialog"
],
function (

// Dojo
    declare,
    lang,
    domStyle,
    keys,

    // Dijit
    _CssStateMixin,
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _TextBox,

    // EPi Framework
    epi,
    _DialogContentMixin,
    _ModelBindingMixin,
    _ActionProviderWidget,

    // Template
    template,

    // Resource
    res
) {
    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _ActionProviderWidget, _DialogContentMixin, _CssStateMixin], {
        // tags:
        //      internal

        templateString: template,

        res: res,

        defaultContentName: null,

        message: null,

        title: null,

        nameLabel: epi.resources.header.name,

        _setMessageAttr: { node: "messageNode", type: "innerHTML" },

        postMixInProperties: function () {
            this.inherited(arguments);
            this.message = lang.replace(this.res.warningtext, {
                defaultname: this.defaultContentName
            });
            this._set("message", this.message);
            this.title = res.title;
        },

        postCreate: function () {
            this.inherited(arguments);
            this.contentNameTextbox.set("value", this.defaultContentName);

            this.contentNameTextbox.on("keyup", lang.hitch(this, function (evt) {

                var isValid = this.contentNameTextbox.isValid();

                if (evt.keyCode === keys.ENTER && isValid) {
                    this.executeDialog();
                }
            }));

            this.on("focus", lang.hitch(this, function () {
                this.contentNameTextbox.textbox.select();
            }));
        },

        _getValueAttr: function () {
            return this.contentNameTextbox.get("value");
        },

        _onBlurVerifyContent: function () {
            // summary:
            //    check if the textfield content is empty on blur,
            //    set to default value if it is.
            //
            // tags:
            //    private
            if (this.contentNameTextbox.get("value") === "") {
                this.contentNameTextbox.set("value", this.defaultContentName);
            }
        },

        getActions: function () {
            // summary:
            //      Overridden from _ActionProvider to get the select current content action added to the containing widget
            //
            // returns:
            //      An array contining a select page action definition, if it is not a shared block

            this._actions = [
                {
                    name: "ok",
                    label: epi.resources.action.ok,
                    settings: { type: "button", "class": "Salt" },
                    action: lang.hitch(this, function () {
                        if (this.contentNameTextbox.isValid()) {
                            this.executeDialog();
                        } else {
                            this.contentNameTextbox.focus();
                        }
                    })
                },
                {
                    name: "cancel",
                    label: epi.resources.action.cancel,
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
