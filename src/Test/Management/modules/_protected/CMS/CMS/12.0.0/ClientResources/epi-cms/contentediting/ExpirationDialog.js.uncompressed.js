require({cache:{
'url:epi-cms/contentediting/templates/ExpirationDialog.html':"﻿<div class=\"epi-formContainer\">\r\n    <div data-dojo-type=\"epi-cms/widget/Breadcrumb\" data-dojo-attach-point=\"breadcrumb\" data-dojo-props=\"showCurrentNode: false\"></div>\r\n    <h1 data-dojo-attach-point=\"contentNameNode\" class=\"epi-breadCrumbsCurrentItem dijitInline dojoxEllipsis\"></h1>\r\n    <div data-dojo-attach-point=\"stateNode\" class=\"epi-notificationBar epi-notificationBarItem\">\r\n        <div class=\"epi-notificationBarText\" data-dojo-attach-point=\"infoTextNode\"></div>\r\n        <div class=\"epi-notificationBarButtonContainer\">\r\n            <button data-dojo-type=\"dijit/form/Button\" data-dojo-attach-point=\"removeButton\" data-dojo-attach-event=\"onClick: _onRemoveButtonClick\">${res.removebutton}</button>\r\n        </div>\r\n    </div>\r\n    <div data-dojo-type=\"dijit/form/Form\" data-dojo-attach-point=\"form\"></div>\r\n</div>\r\n"}});
﻿define("epi-cms/contentediting/ExpirationDialog", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dijit/_CssStateMixin",
    "epi-cms/widget/Breadcrumb",
    "epi/shell/widget/dialog/_DialogContentMixin",
    "epi/shell/widget/FormContainer",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/_ActionProviderWidget",
    "dojo/text!./templates/ExpirationDialog.html",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.expirationeditor",
    "epi/i18n!epi/nls/episerver.shared"
],
function (declare, lang, domStyle, _CssStateMixin, Breadcrumb, _DialogContentMixin, FormContainer, _ModelBindingMixin, _ActionProviderWidget, template, res, sharedResources) {
    return declare([FormContainer, _ActionProviderWidget, _DialogContentMixin, _CssStateMixin, _ModelBindingMixin], {
        // tags:
        //      internal xproduct

        templateString: template,

        res: res,

        contentLink: null,

        contentName: null,

        baseClass: "epi-statusIndicator",

        modelBindingMap: {
            contentLink: ["contentLink"],
            contentName: ["contentName"],
            infoText: ["infoText"],
            state: ["state"],
            enableSaveButton: ["enableSaveButton"],
            showRemoveButton: ["showRemoveButton"]
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            // Things that need to set up the form container
            this.set("metadata", this.model.metadata);
            this.set("value", this.model.value);

            // This form container is used inside a dialog without any size constraints because the dialog allow its content to overflow.
            // Therefore, we should not layout the form's top layout container.
            this.doLayout = false;
        },

        _archiveLinkSelector: null,

        _setContentLinkAttr: function (value) {
            this.breadcrumb.set("contentLink", value);
        },

        _setContentNameAttr: {
            node: "contentNameNode",
            type: "innerText"
        },

        _setInfoTextAttr: {
            node: "infoTextNode",
            type: "innerText"
        },

        _setEnableSaveButtonAttr: function (value) {
            if (this._actions && this._actions.length) {
                this.setActionProperty("save", "disabled", !value);
            }
        },

        _setShowRemoveButtonAttr: function (value) {
            domStyle.set(this.removeButton.domNode, "display", value ? "" : "none");
        },

        _onRemoveButtonClick: function () {
            var resetValue = {
                stopPublish: null,
                archiveLink: null
            };
            this.set("value", resetValue);
            this.onChange(resetValue);
        },

        onFieldCreated: function (fieldName, widget) {
            // summary:
            //     Raised when a field editor widget is created.
            // description:
            //     Override the FormContainer method to catch and keep reference to archiveLink widget
            // fieldName: String
            //     The field name
            // widget: dijit/_Widget
            //     The widget
            // tags:
            //     callback

            if (fieldName === "stopPublish") {
                widget.set("minimumValue", this.model.get("minimumExpireDate"));
                widget.set("minimumValueMessage", this.model.get("minimumExpireDateMessage"));
            } else if (fieldName === "archiveLink") {

                // TODO: remove link on destroy?

                this._archiveLinkSelector = widget;
                if (this._archiveLinkSelector.readOnly) {
                    //if the widget is already read only is because the property is not language specific and we're not the master language.
                    this._archiveLinkSelector._keepReadOnly = true;
                }

                this._archiveLinkSelector.set("contentLink", this.model.get("contentLink"));
            }
        },

        onChange: function (value) {
            this.inherited(arguments);
            this.model.set("intermediateValue", value);
        },

        getActions: function () {
            // summary:
            //      Overridden from _ActionProvider to get the select current content action added to the containing widget
            //
            // returns:
            //      An array containing a select page action definition, if it is not a shared block

            this._actions = [
                {
                    name: "save",
                    label: sharedResources.action.save,
                    settings: { type: "button", disabled: true },
                    action: lang.hitch(this, function () {
                        if (this.validate()) {
                            this.model.save();
                            this.executeDialog(this.model.get("value"));
                        }
                    })
                },
                {
                    name: "cancel",
                    label: sharedResources.action.cancel,
                    settings: { type: "button" },
                    action: lang.hitch(this, function () {
                        this.model.reset();
                        this.cancelDialog();
                    })
                }
            ];

            return this._actions;
        }
    });
});
