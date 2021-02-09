require({cache:{
'url:epi-cms/widget/templates/Block.html':"﻿<div class=\"dojoDndItem epi-overlay-block\">\r\n    <div data-dojo-attach-point=\"containerDomNode\"></div>\r\n    <span class=\"epi-personalized\" data-dojo-attach-point=\"iconsContainer\">\r\n        <span class=\"epi-overlayControls epi-mediumButton \">\r\n            <span class=\"dijitReset dijitInline dijitIcon epi-iconWarning\" data-dojo-attach-point=\"warningIcon\"></span>\r\n            <span class=\"dijitReset dijitInline dijitIcon epi-iconUsers\" data-dojo-attach-point=\"personalizedIcon\"></span>\r\n        </span>\r\n    </span>\r\n    <button class=\"epi-chromelessButton epi-overlayControls epi-settingsButton epi-mediumButton\" data-dojo-attach-point=\"settingsButton\" data-dojo-type=\"dijit/form/DropDownButton\" data-dojo-props=\"showLabel:false, title:'${res.settingstooltip}', iconClass:'epi-iconContextMenu'\">\r\n        <div data-dojo-attach-point=\"contextMenu\" data-dojo-type=\"epi/shell/widget/ContextMenu\"></div>\r\n    </button>\r\n</div>"}});
﻿define("epi-cms/widget/overlay/Block", [
    // General application modules
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/on",
    "dojo/when",

    // Parent classes
    "epi/shell/widget/overlay/_Base",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "epi-cms/widget/overlay/_OverlayItemInfoMixin",
    "epi-cms/contentediting/command/ContentAreaCommands",
    "epi-cms/ContentLanguageHelper",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.blockcontextmenu",
    "dojo/text!../templates/Block.html",
    // Widgets used in template
    "dijit/form/DropDownButton",
    "epi/shell/widget/ContextMenu"
], function (
    // General application modules
    declare,
    event,
    lang,
    domClass,
    domStyle,
    on,
    when,

    // Parent classes
    _Base,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _OverlayItemInfoMixin,
    ContentAreaCommands,
    ContentLanguageHelper,

    // Resources
    resources,
    template
) {

    return declare([_Base, _TemplatedMixin, _WidgetsInTemplateMixin, _OverlayItemInfoMixin], {
        // summary:
        //    The block widget is used together with the BlockArea widget to show the
        //    position of the different blocks for a ContentAreaProperty.
        // tags:
        //      internal xproduct

        // templateString: [public] String
        templateString: template,

        res: resources,

        _setMissingRendererAttr: function (value) {
            domClass.toggle(this.domNode, "epi-overlay-item-missing-renderer", value);
        },

        buildRendering: function () {
            this.inherited(arguments);

            domStyle.set(this.personalizedIcon, "display", this.viewModel.contentGroup ? "" : "none");
        },

        postCreate: function () {
            // summary:
            //      Initialize widgets
            // tags:
            //      protected
            this.inherited(arguments);

            this._injectDynamicStyles();

            this.own(
                // Make command provider is injected
                this.commandProvider = this.commandProvider || new ContentAreaCommands({ model: this.viewModel }),

                this.viewModel.watch("statusMessage", lang.hitch(this, function (propertyName, oldValue, newValue) {
                    when(ContentLanguageHelper.getMissingLanguageMessage(this.viewModel.content), lang.hitch(this, function (message) {
                        domStyle.set(this.warningIcon, "display", message ? "" : "none");
                    }));
                    //Show/Hide the icons container
                    domStyle.set(this.iconsContainer, "display", this.viewModel.contentGroup || newValue ? "" : "none");
                }))
            );

            this.viewModel.loadStatus();

            this.contextMenu.addProvider(this.commandProvider);

            if (this.blockInfo && this.blockInfo.missingrenderer) {
                this.set("missingRenderer", this.blockInfo.missingrenderer);
            }

            this.own(
                on(this.domNode, "click", lang.hitch(this.viewModel, "set", "selected", true)),
                on(this.settingsButton, "click", lang.hitch(this, "_onContextMenuClick")),
                on(this.domNode, "mouseout", lang.hitch(this, function (e) {
                    if (this.contextMenu && this.contextMenu.isShowingNow) {
                        event.stop(e);
                    }
                }))
            );
        },

        _injectDynamicStyles: function () {
            // summary:
            //      Inject dynamic styles for original dom node
            // tags:
            //      private
            var node = this.sourceItemNode,
                display = domStyle.get(node, "display"),
                suffix = /inline|inline-block/.test(display) ? "-inline" : "";

            domClass.add(node, "epi-injected-minSize" + suffix);
        },

        _onContextMenuClick: function () {
            // Set the viewmodel to the command provider again
            this.commandProvider.set("model", this.viewModel);

            this.viewModel.set("selected", true);
            // Return false to cause prevent default in dijit/form/_ButtonMixin
            return false;
        }
    });
});
