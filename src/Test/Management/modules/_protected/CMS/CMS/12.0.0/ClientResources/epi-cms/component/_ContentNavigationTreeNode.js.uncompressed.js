require({cache:{
'url:epi-cms/component/templates/_ContentNavigationTreeNode.html':"﻿<div class=\"dijitTreeNode\" role=\"presentation\">\r\n    <div data-dojo-attach-point=\"rowNode\" class=\"dijitTreeRow dijitInline\" role=\"presentation\">\r\n        <div data-dojo-attach-point=\"indentNode\" class=\"dijitInline\"></div>\r\n        <span data-dojo-attach-point=\"contentNode\" class=\"dijitTreeContent\" role=\"presentation\">\r\n            <span data-dojo-attach-point=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"extraIconsContainer\" class=\"epi-extraIconsContainer\" role=\"presentation\">\r\n                <span data-dojo-attach-point=\"iconNodeMenu\" class=\"epi-extraIcon epi-pt-contextMenu\" role=\"presentation\" data-dojo-attach-event=\"onmousedown:_onMouseDownIconNodeMenu, click: _onClickIconNodeMenu\" >&nbsp;</span>\r\n                <span data-dojo-attach-point=\"iconNodeStatus\" class=\"epi-extraIcon\" role=\"presentation\">&nbsp;</span>\r\n                <span data-dojo-attach-point=\"iconNodeAccess\" class=\"epi-extraIcon\" role=\"presentation\">&nbsp;</span>\r\n                <span data-dojo-attach-point=\"iconNodeLanguage\" class=\"epi-extraIcon epi-pt-currentLanguageMissing\" role=\"presentation\">&nbsp;</span>\r\n            </span>\r\n            <span data-dojo-attach-point=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\"></span>\r\n        </span>\r\n    </div>\r\n    <div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\r\n</div>"}});
define("epi-cms/component/_ContentNavigationTreeNode", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/event",
    "dojo/_base/lang",

    "dojo/dom-attr",
    "dojo/dom-class",

    "dojo/Evented",
    "dojo/mouse",
    "dojo/on",

    // template
    "dojo/text!./templates/_ContentNavigationTreeNode.html",

    // epi
    "epi/datetime",
    "epi/dependency",
    "epi/string",

    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/widget/Tooltip",

    "epi-cms/core/ContentReference",
    "epi-cms/widget/_ContentTreeNode",
    "epi-cms/widget/viewmodel/ContentStatusViewModel",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.pagetree"
],

function (
// dojo
    array,
    declare,
    event,
    lang,

    domAttr,
    domClass,

    Evented,
    mouse,
    on,

    // template
    template,

    // epi
    epiDate,
    dependency,
    epiString,

    _ModelBindingMixin,
    Tooltip,

    ContentReference,
    _ContentTreeNode,
    ContentStatusViewModel,
    // resources
    res
) {

    return declare([_ContentTreeNode, _ModelBindingMixin, Evented], {
        // summary:
        //      A customized treenode for page tree
        // tags:
        //      public
        templateString: template,
        res: res,

        // hasContextMenu: [bool]
        //      Flag used to not create context menu
        hasContextMenu: true,

        _pageLocked: "epi-pt-accessRights",

        _pageBeingEdited: "epi-pt-edited",

        _contextMenuClass: "epi-iconContextMenu",

        // _iconNodeClass: [String]
        //      Custom icon for a node in the tree
        // tags:
        //      protected
        _iconNodeClass: "",

        _selected: false,

        // _contentTypeStore: [Object]
        //      Represents the ContentType REST store to get data.
        _contentTypeStore: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            var registry = dependency.resolve("epi.storeregistry");

            this._contentTypeStore = registry.get("epi.cms.contenttype");
        },

        postCreate: function () {
            this.inherited(arguments);

            this.set("model", new ContentStatusViewModel({ contentStatus: this.item.status }));
        },

        modelBindingMap: {
            statusIcon: ["statusIcon"],
            statusMessage: ["statusMessage"]
        },

        _setStatusMessageAttr: function (/* String */message) {
            // summary:
            //      Set content status message
            // tags:
            //      private

            domAttr.set(this.iconNodeStatus, "title", epiString.toTooltipText(message));
        },

        _setStatusIconAttr: function (/* String */cssClasses) {
            // summary:
            //      Set content status icon CSS classes
            // tags:
            //      private

            if (!(cssClasses instanceof Array)) {
                return;
            }

            //remove everything
            domClass.remove(this.iconNodeStatus);

            domClass.add(this.iconNodeStatus, "dijitTreeIcon epi-extraIcon");
            array.forEach(cssClasses, function (cssClass) {
                domClass.add(this.iconNodeStatus, cssClass);
            }, this);
        },

        setSelected: function (/*Boolean*/selected) {
            // summary:
            //      Override to show contex menu if the node is selected
            // tags:
            //      public

            this.inherited(arguments);
            if (this.hasContextMenu) {
                domClass.toggle(this.iconNodeMenu, this._contextMenuClass, this._selected = selected);
            }
        },

        showContextMenu: function (/* Boolean */show) {
            // summary:
            //      Toogle context menu icon
            // Remark:
            //      Do not use domClass.toggle because: we show the context menu using _onNodeMouseEnter event in the Tree
            //      but this event will be trigger twice (only in IE & FireFox) once the node is updated or reloaded.
            // tags:
            //      public

            if (!this._selected && this.hasContextMenu) {
                domClass.toggle(this.iconNodeMenu, this._contextMenuClass, show);
            }
        },

        _onClickIconNodeMenu: function (evt) {
            event.stop(evt);

            // Since we're stopping the event we're preventing the regular focus handling,
            // which means that the context menu won't have anything to restore focus to when closed
            this.labelNode.focus();
            this.emit("onContextMenuClick", { node: this, target: evt.target, x: evt.pageX, y: evt.pageY });
        },

        _onMouseDownIconNodeMenu: function (evt) {
            //Stop mouse down event when clicking on the context menu icon
            event.stop(evt);
        },

        _updateIndividualLayout: function () {
            this._updateAccessRightIcon();

            if (this.model) {
                this.model.set("contentStatus", this.item.status);
            }
        },

        _updateAccessRightIcon: function () {
            // summary:
            //      Set access right and icon for the tree node
            // tags:
            //      private

            // Display lock icon if current user has no permission or only has "Read" permission
            if (this.item.accessMask === 0 || this.item.accessMask === 1) {
                domClass.add(this.iconNodeAccess, this._pageLocked);
                // Add tooltip to icon
                domAttr.set(this.iconNodeAccess, "title", this.res.tooltip.pagelocked);

                // Set default background for this type of nodes
                domClass.add(this.contentNode, "epi-treeReadOnly");
            } else if (this.item.inUseNotifications && this.item.inUseNotifications.length > 0) {
                // Display being edited icon
                // Only display this icon if user has change permission on page
                domClass.add(this.iconNodeAccess, this._pageBeingEdited);

                // create list of user names and dates
                var tooltipRows = [this.res.tooltip.beingedited];

                array.forEach(this.item.inUseNotifications, function (inUseNotification) {
                    var date = epiDate.toUserFriendlyString(new Date(inUseNotification.created));
                    tooltipRows.push(inUseNotification.userName + ", " + date);
                }, this);

                domAttr.set(this.iconNodeAccess, "title", tooltipRows.join("\n"));

            } else {
                domClass.remove(this.iconNodeAccess, this._pageBeingEdited);
                domClass.remove(this.iconNodeAccess, this._pageLocked);
                domAttr.set(this.iconNodeAccess, "title", "");
                domClass.remove(this.contentNode, "epi-treeReadOnly");
            }
        }
    });
});
