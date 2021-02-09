define("epi-cms/contentediting/editors/_ContentAreaTreeNodeMixin", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dijit/focus",
    "dojo/_base/event",
    "dojo/dom-class"
], function (declare, lang, on, focusUtil, event, domClass) {

    return declare([], {
        // summary:
        //      Common functionality used by the _BlockTreeNode and _GroupTreeNode
        // tags:
        //      internal

        destroy: function () {
            this._unBindContextMenu();

            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);

            // Need the focus set on the label before opening the context menu,
            // otherwise focus is lost if the menu is closed using escape
            this.own(on(this.iconNodeMenu, "click", lang.hitch(this.labelNode, this.labelNode.focus)));
        },

        _unBindContextMenu: function () {
            if (this.contextMenu) {
                this.contextMenu.unBindDomNode(this.iconNodeMenu);
            }
        },

        _setContextMenuAttr: function (contextMenu) {
            this._unBindContextMenu();

            this._set("contextMenu", contextMenu);
            this.contextMenu.bindDomNode(this.iconNodeMenu);
        },

        _setMouseHoverAttr: function (hover) {
            this._set("hover", hover);

            if (this.item.get("selected")) {
                return;
            }
            domClass.toggle(this.iconNodeMenu, this._contextMenuClass, this.hover);
        }
    });
});
