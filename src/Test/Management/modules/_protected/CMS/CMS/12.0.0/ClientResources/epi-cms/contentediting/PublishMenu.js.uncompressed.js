require({cache:{
'url:epi-cms/contentediting/templates/PublishMenu.html':"﻿<div class=\"epi-invertedTooltip epi-publishActionMenu\" role=\"menu\" tabIndex=\"${tabIndex}\" data-dojo-attach-event=\"onkeypress:_onKeyPress\" >\r\n    <div class=\"epi-tooltipDialogTop\" data-dojo-attach-point=\"topInfoSection\">\r\n        <ul>\r\n            <li data-dojo-attach-point=\"lastChangeStatusNode\" class=\"epi-lastchangeStatus\"></li>\r\n            <li data-dojo-attach-point=\"mainButtonSection\">\r\n                <button data-dojo-type=\"dijit/form/Button\"\r\n                        data-dojo-attach-point=\"mainButton\"\r\n                        data-dojo-attach-event=\"onClick: _onMainButtonClick\"\r\n                        class=\"epi-button--full-width\"></button>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n    <div class=\"epi-tooltipDialogInfo\"data-dojo-attach-point=\"publishInfoSection\">\r\n        <ul>\r\n            <li data-dojo-attach-point=\"lastPublishedTitleNode\"></li>\r\n            <li>\r\n                <span data-dojo-attach-point=\"lastPublishedTextNode\"></span>\r\n            </li>\r\n            <li>\r\n                <a href=\"#\" title=\"${res.lastpublishedviewlinktooltip}\" data-dojo-attach-point=\"lastPublishedViewLinkNode\">${res.view}</a>\r\n            </li>\r\n        </ul>\r\n    </div>\r\n    <div class=\"epi-tooltipDialogInfo\" data-dojo-attach-point=\"additionalInfoSection\">\r\n        <ul>\r\n            <li data-dojo-attach-point=\"additionalInfoNode\"></li>\r\n        </ul>\r\n    </div>\r\n    <table class=\"dijitReset epi-tooltipDialogMenu epi-menuInverted\" data-dojo-attach-point=\"bottomInfoSection\" cellspacing=\"0\">\r\n\t    <tbody data-dojo-attach-point=\"containerNode\" ></tbody>\r\n    </table>\r\n</div>\r\n"}});
define("epi-cms/contentediting/PublishMenu", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/html",
    "dojo/on",
    "dojo/sniff",
    "dojo/Stateful",
    "dojo/when",

    // Dijit
    "dijit/DropDownMenu",
    "dijit/_KeyNavContainer",
    "dijit/_WidgetsInTemplateMixin",

    // EPi Framework
    "epi",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/command/builder/MenuBuilder",
    "epi/shell/Downloader",

    // EPi CMS
    "epi-cms/contentediting/ContentActionSupport",

    // Resources
    "dojo/text!./templates/PublishMenu.html",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editactionpanel.publishactionmenu"
],

function (
// Dojo
    array,
    declare,
    event,
    lang,
    domStyle,
    domAttr,
    domClass,
    domGeometry,
    html,
    on,
    sniff,
    Stateful,
    when,

    // Dijit
    DropDownMenu,
    _KeyNavContainer,
    _WidgetsInTemplateMixin,

    // EPi Framework
    epi,
    TypeDescriptorManager,
    _ModelBindingMixin,
    MenuBuilder,
    Downloader,

    // EPi CMS
    ContentActionSupport,

    // Resources
    template,
    res
) {
    return declare([DropDownMenu, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // tags:
        //      internal

        templateString: template,
        res: res,

        // _menuBuilder: [private] Object
        //      Instance of menu builder
        _menuBuilder: null,

        // Binding properties
        commands: null,
        mainButtonCommand: null,

        postMixInProperties: function () {
            this._menuBuilder = new MenuBuilder();
        },

        // Binding map
        modelBindingMap: {
            commands: ["commands"],
            mainButtonCommand: ["mainButtonCommand"],

            mainButtonSectionVisible: ["mainButtonSectionVisible"],

            lastChangeStatus: ["lastChangeStatus"],

            topInfoSectionVisible: ["topInfoSectionVisible"],

            publishInfoSectionVisible: ["publishInfoSectionVisible"],
            lastPublishedTitle: ["lastPublishedTitle"],
            lastPublishedTitleVisible: ["lastPublishedTitleVisible"],
            lastPublishedText: ["lastPublishedText"],
            lastPublishedViewLinkVisible: ["lastPublishedViewLinkVisible"],
            lastPublishedViewLinkHref: ["lastPublishedViewLinkHref"],

            additionalInfoSectionVisible: ["additionalInfoSectionVisible"],
            additionalInfoText: ["additionalInfoText"],

            typeIdentifier: ["typeIdentifier"],
            bottomInfoSectionVisible: ["bottomInfoSectionVisible"]
        },

        _setCommandsAttr: function (commands) {
            // Move focus away from current menu item, which may be removed after command executed.
            this.focusedChild = null;

            //Remove all children first
            this.destroyDescendants();

            this._addCommandsToMenu(commands);

            // Set focus on the main button or the first focusable item.
            this.focusFirstChild();
        },

        _setMainButtonCommandAttr: function (command) {
            this._set("mainButtonCommand", command);
            if (command) {
                this.mainButton.set("label", command.label);
                this.mainButton.set("disabled", !command.get("canExecute"));
                domClass.remove(this.mainButton.domNode, "epi-loading");

                if (this._addedMainButtonClass) {
                    domClass.remove(this.mainButton.domNode, this._addedMainButtonClass);
                }

                if (command.options && command.options.mainButtonClass) {
                    this._addedMainButtonClass = command.options.mainButtonClass;
                    domClass.add(this.mainButton.domNode, this._addedMainButtonClass);
                }
            }
        },

        _setMainButtonSectionVisibleAttr: function (visible) {
            domStyle.set(this.mainButtonSection, "display", visible ? "" : "none");

            // When hiding the main button section, we have to also hide the main button. Otherwise it is still focusable.
            domStyle.set(this.mainButton.domNode, "display", visible ? "" : "none");
        },

        _setLastChangeStatusAttr: {
            node: "lastChangeStatusNode",
            type: "innerHTML"
        },

        _setTopInfoSectionVisibleAttr: function (visible) {
            domStyle.set(this.topInfoSection, "display", visible ? "" : "none");
        },

        _setBottomInfoSectionVisibleAttr: function (visible) {
            domStyle.set(this.bottomInfoSection, "display", visible ? "" : "none");
        },

        _setPublishInfoSectionVisibleAttr: function (visible) {
            domStyle.set(this.publishInfoSection, "display", visible ? "" : "none");
        },

        _setLastPublishedTitleAttr: {
            node: "lastPublishedTitleNode",
            type: "innerHTML"
        },

        _setLastPublishedTitleVisibleAttr: function (visible) {
            domStyle.set(this.lastPublishedTitleNode, "display", visible ? "" : "none");
        },

        _setLastPublishedTextAttr: {
            node: "lastPublishedTextNode",
            type: "innerHTML"
        },

        _setLastPublishedViewLinkVisibleAttr: function (visible) {
            domStyle.set(this.lastPublishedViewLinkNode, "display", visible ? "" : "none");
        },

        _setLastPublishedViewLinkHrefAttr: function (value) {
            domAttr.set(this.lastPublishedViewLinkNode, "href", value);
        },

        _setAdditionalInfoSectionVisibleAttr: function (visible) {
            domStyle.set(this.additionalInfoSection, "display", visible ? "" : "none");
        },

        _setAdditionalInfoTextAttr: {
            node: "additionalInfoNode",
            type: "innerHTML"
        },

        _setTypeIdentifierAttr: function (/*String*/typeIdentifier) {

            var contentData = this.model && this.model.dataModel && this.model.dataModel.contentData,
                isDowloadLinkAvaiable = contentData && contentData.downloadUrl,
                typeShouldActAsAsset = typeIdentifier && TypeDescriptorManager.getValue(typeIdentifier, "actAsAnAsset");

            if (!typeShouldActAsAsset || !isDowloadLinkAvaiable) {
                // Restore default view
                domAttr.set(this.lastPublishedViewLinkNode, "title", res.lastpublishedviewlinktooltip);
                html.set(this.lastPublishedViewLinkNode, res.view);

                // Clear event handler
                if (this._downloadClickHandler) {
                    this._downloadClickHandler.remove();
                    this._downloadClickHandler = null;
                }
                return;
            }

            domAttr.set(this.lastPublishedViewLinkNode, "title", res.download);
            html.set(this.lastPublishedViewLinkNode, res.download);

            // Listen on click event to start download by Downloader
            if (!this._downloadClickHandler) {
                this.own(this._downloadClickHandler = on(this.lastPublishedViewLinkNode, "click", lang.hitch(this, function (e) {
                    event.stop(e);

                    // Should re-calculate to get correct contentData because event listense is added one time
                    // and used for multiple time (for different kinds of content).
                    var contentData = this.model && this.model.dataModel && this.model.dataModel.contentData,
                        url = contentData && contentData.downloadUrl,
                        name = contentData.name;

                    Downloader.download(url, name);
                })));
            }
        },

        postCreate: function () {
            this.inherited(arguments);

            // The main button should behave like a normal menu item.
            // When focused item is the main button and user close the menu, these functions which are not implemented in dijit/form/Button will be called.
            // So we supply dummy ones.
            this.mainButton._setSelected = this.mainButton._onUnhover = function () { };
        },

        onOpen: function () {
            this.model.set("isOpen", true);
            this.inherited(arguments);
        },

        onClose: function () {
            this.model.set("isOpen", false);
            this.inherited(arguments);
        },

        _setModelAttr: function () {
            this.inherited(arguments);

            // No need to do a destroyByKey as _ModelBindingMixin
            this.ownByKey(this.model, this.connect(this.model, "onCommandsChanged", "onCommandsChanged"));
        },

        onCommandsChanged: function (name, removed, added) {
            // summary:
            //		Callback when available commands have been changed.
            // tags:
            //		public

            if (removed) {
                this._removeCommandsFromMenu(lang.isArray(removed) ? removed : [removed]);
            }
            if (added) {
                this._addCommandsToMenu(lang.isArray(added) ? added : [added]);
            }
        },

        _addCommandsToMenu: function (commands) {
            // summary:
            //		Transforms the commands into widgets and adds them to the toolbar.
            // tags:
            //		private

            array.forEach(commands, function (command) {
                if (command !== this.model.mainButtonCommand) {
                    this._menuBuilder.create(command, this);
                }
            }, this);
        },

        _removeCommandsFromMenu: function (commands) {
            // summary:
            //		Removes the commands from the toolbar.
            // tags:
            //		private

            var children = this.getChildren();

            array.forEach(commands, function (command) {
                for (var i = children.length - 1; i >= 0; i--) {
                    var item = children[i];
                    if (item._command === command) {
                        this.removeChild(item);
                        item.destroyRecursive();
                        break;
                    }
                }
            }, this);
        },

        _onMainButtonClick: function () {
            if (this.mainButtonCommand) {
                this.mainButton.set("label", this.mainButtonCommand.executingLabel);
                domClass.add(this.mainButton.domNode, "epi-loading");

                var lastExecutedCommand = this.mainButtonCommand,
                    resetMainButton = lang.hitch(this, function () {
                        if (lastExecutedCommand.options && lastExecutedCommand.options.resetLabelAfterExecution) {
                            this.mainButton.set("label", lastExecutedCommand.label);
                        }
                        domClass.remove(this.mainButton.domNode, "epi-loading");

                        if (lastExecutedCommand.options && !lastExecutedCommand.options.keepMenuOpen) {
                            this.onExecute();
                        }
                    }),
                    setLastExecutedCommand = lang.hitch(this, function () {
                        this.model.set("lastExecutedCommand", lastExecutedCommand);
                    });

                when(this.mainButtonCommand.execute(), function () {
                    return when(resetMainButton(), setLastExecutedCommand);
                }, function () {
                    return resetMainButton();
                });
            }
        },

        focusFirstChild: function () {
            // summary:
            //		Focus the first focusable child in the container.
            // tags:
            //		protected

            if (this.mainButton.isFocusable()) {
                return this.focusChild(this.mainButton);
            } else {
                return this.inherited(arguments);
            }
        },

        focusNext: function () {
            // summary:
            //		Focus the next widget
            // tags:
            //		protected

            var lastFocusableMenuItem = this._getLastFocusableChild();
            if (!this.focusedChild.focused) {
                return this.focusChild(this._getFirstFocusableChild());
            } else if (this.focusedChild === lastFocusableMenuItem) {
                this.focusedChild._setSelected(false);
                return domStyle.get(this.mainButton.domNode, "display") === "none" ?
                    this.lastPublishedViewLinkNode.focus() : this.focusChild(this.mainButton);
            } else if (this.focusedChild === this.mainButton) {
                return this.lastPublishedViewLinkNode.focus();
            } else {
                return this.inherited(arguments);
            }
        },

        focusPrev: function () {
            // summary:
            //		Focus the next widget
            // tags:
            //		protected

            var firstFocusableMenuItem = this._getFirstFocusableChild();
            if (!this.focusedChild.focused) {
                return domStyle.get(this.mainButton.domNode, "display") === "none" ?
                    this.focusChild(this._getLastFocusableChild()) : this.focusChild(this.mainButton);
            } else if (this.focusedChild === firstFocusableMenuItem) {
                this.focusedChild._setSelected(false);
                return this.lastPublishedViewLinkNode.focus();
            } else {
                return this.inherited(arguments);
            }
        },

        resize: function (marginBox) {
            // summary:
            //      Resize action menu fit to large of main button or menu item
            // tags:
            //      Protected

            // Get dom geometry
            var selfMargin = domGeometry.getMarginBox(this.domNode),
                topPadding = domGeometry.getPadExtents(this.topInfoSection),
                mainButtonMargin = domGeometry.getMarginBox(this.mainButton.containerNode),
                menuMargin = domGeometry.getMarginBox(this.containerNode);

            // Get max width of domNode, main button and menu item
            var maxWidth = Math.max(mainButtonMargin.w + topPadding.l + topPadding.r, selfMargin.w);
            maxWidth = Math.max(menuMargin.w, maxWidth);

            marginBox.w = maxWidth;
            domGeometry.setMarginBox(this.domNode, marginBox);
        }
    });
});
