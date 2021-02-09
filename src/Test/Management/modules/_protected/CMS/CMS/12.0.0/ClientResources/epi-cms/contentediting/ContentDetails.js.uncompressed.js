require({cache:{
'url:epi-cms/contentediting/templates/ContentDetails.html':"﻿<ul class=\"epi-form-container__section\">\r\n    <ul data-dojo-type=\"epi/shell/layout/SimpleContainer\" data-dojo-attach-point=\"widgetContainer\"></ul>\r\n    <li class=\"epi-form-container__section__row\">\r\n        <label>${resources.visibleto.title}</label>\r\n        <div class=\"epi-previewableTextBox-wrapper dijitInline\">\r\n            <span data-dojo-attach-point=\"visibleToNode\" class=\"epi-previewableTextBox-text dojoxEllipsis dijitInline\"></span>\r\n            <div data-dojo-type=\"dijit/form/Button\" data-dojo-attach-point=\"manageAccessRightsButton\" data-dojo-attach-event=\"onClick: _onManageAccessRightsClick\" class=\"epi-chromelessButton epi-chromelessLinkButton epi-functionLink epi-valign--top\">${resources.manage}</div>\r\n        </div>\r\n    </li>\r\n    <li class=\"epi-form-container__section__row\">\r\n        <label>${resources.existinglanguages}</label>\r\n        <span data-dojo-attach-point=\"languagesNode\" class=\"epi-previewableTextBox-text dijitInline\"></span>\r\n    </li>\r\n    <li class=\"epi-form-container__section__row\">\r\n        <label>${resources.idandtypename}</label>\r\n        <div class=\"epi-previewableTextBox-wrapper dijitInline\">\r\n            <span class=\"epi-previewableTextBox-text dojoxEllipsis dijitInline\">\r\n                <span data-dojo-attach-point=\"idNode\"></span>, <span data-dojo-attach-point=\"typeNode\"></span>\r\n            </span>\r\n        </div>\r\n    </li>\r\n    <li class=\"epi-form-container__section__row\">\r\n        <label></label>\r\n        <div data-dojo-attach-point=\"dropdownButton\" data-dojo-type=\"dijit/form/DropDownButton\" class=\"dijit dijitReset dijitInline epi-mediumButton\">\r\n            <span>${resources.toolsbutton.label}</span>\r\n            <div data-dojo-type=\"dijit/DropDownMenu\" data-dojo-attach-point=\"additionalActionsMenu\"></div>\r\n        </div>\r\n    </li>\r\n</ul>"}});
define("epi-cms/contentediting/ContentDetails", [
// Dojo
    "dojo",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/url",
    "dojo/_base/window",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/topic",

    // Dijit
    "dijit/_TemplatedMixin",
    "dijit/_WidgetBase",
    "dijit/_WidgetsInTemplateMixin",

    // EPi
    "epi",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/command/builder/MenuBuilder",
    "epi/shell/command/builder/MenuAssembler",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.contentdetails",
    "dojo/text!./templates/ContentDetails.html"

], function (
// Dojo
    dojo,
    array,
    declare,
    lang,
    url,
    win,
    domStyle,
    domConstruct,
    on,
    topic,

    // Dijit
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    // EPi
    epi,
    _ModelBindingMixin,
    MenuBuilder,
    MenuAssembler,

    // Resources
    res,
    template
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      Displays extra information about the page. This information includes
        //      page type, ID, created date, changed date and who made the changes.
        //
        // tags:
        //      internal

        // templateString: [protected] String
        //		A string that represents the widget template.
        templateString: template,

        // Attributes and mappings
        _setContentTypeNameAttr: function (value) {
            this.typeNode.textContent = value;
            this.typeNode.title  = value;
        },

        _setContentIdAttr: { node: "idNode", type: "innerHTML" },

        _setExistingLanguagesAttr: function (languages) {
            this.languagesNode.innerHTML = "";

            // Create text or link elements base on language information.
            array.forEach(languages, function (item, idx) {
                var elm, isLast = idx === languages.length - 1;
                if (item.isCurrentLanguage) {
                    elm = domConstruct.create("span", {
                        innerHTML: item.urlSegment
                    });
                } else {
                    var url = new dojo._Url(window.top.location.href);
                    elm = domConstruct.create("a", {
                        innerHTML: item.urlSegment,
                        href: [url.scheme, "://", url.authority, url.path, "?language=", item.text, "#context=epi.cms.contentdata:///", item.contentLink].join(""),
                        "class": "epi-visibleLink"
                    });
                }
                domConstruct.place(elm, this.languagesNode);

                if (!isLast) {
                    domConstruct.place(win.doc.createTextNode(", "), this.languagesNode);
                }
            }, this);
        },

        _setVisibleToAttr: function (visibleToEveryOne) {
            this.visibleToNode.innerHTML = visibleToEveryOne ? res.visibleto.everyone : res.visibleto.restricted;
        },

        _setManageAccessRightsVisibleAttr: function (value) {
            domStyle.set(this.manageAccessRightsButton.domNode, "display", value ? "" : "none");
        },

        // resources: [readonly] Object
        //		The localization resource for the label headers.
        resources: null,

        modelBindingMap: {
            contentTypeName: ["contentTypeName"],
            contentId: ["contentId"],
            existingLanguages: ["existingLanguages"],
            visibleToEveryOne: ["visibleTo"]
        },

        _menuAssembler: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            this.resources = dojo.mixin({}, epi.resources.action, res);
        },

        postCreate: function () {
            this.inherited(arguments);

            var builder = new MenuBuilder();
            this._menuAssembler = new MenuAssembler({ configuration: [{ builder: builder, target: this.additionalActionsMenu }], commandSource: this.model });

            this.dropdownButton.set("title", this.resources.toolsbutton.tooltip);
        },

        destroy: function () {
            if (this._menuAssembler) {
                this._menuAssembler.destroy();
            }

            this.inherited(arguments);

            if (this.model) {
                this.model.destroy();
            }
        },

        _setModelAttr: function (value) {

            this.inherited(arguments);

            if (this._menuAssembler) {
                this._menuAssembler.set("commandSource", this.model);
            }

            if (this.model && this.model.accessRightsCommand) {
                this.own(this.model.accessRightsCommand.watch("canExecute", lang.hitch(this, function () {
                    // Manage links visibility
                    this.set("manageAccessRightsVisible", this.model.accessRightsCommand.canExecute);
                })));
            }
        },

        _onManageAccessRightsClick: function () {
            if (this.model && this.model.accessRightsCommand) {
                this.model.accessRightsCommand.execute();
            }
        }
    });
});
