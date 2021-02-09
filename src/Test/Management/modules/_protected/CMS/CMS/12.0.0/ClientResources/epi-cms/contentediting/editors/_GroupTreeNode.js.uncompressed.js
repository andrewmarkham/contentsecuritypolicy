require({cache:{
'url:epi-cms/contentediting/editors/templates/_GroupTreeNode.html':"﻿<div class=\"dijitTreeNode epi-tree-mngr--group\" role=\"presentation\" data-dojo-attach-point=\"rowNode\">\r\n    <div class=\"dijitTreeRow dijitInline epi-tree-mngr--group-header\" role=\"presentation\">\r\n        <div data-dojo-attach-point=\"indentNode\" class=\"dijitInline\"></div>\r\n        <img src=\"${_blankGif}\" alt=\"\" data-dojo-attach-point=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"/>\r\n        <span data-dojo-attach-point=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"></span>\r\n        <span data-dojo-attach-point=\"contentNode\" class=\"dijitTreeContent\" role=\"presentation\">\r\n            <span data-dojo-attach-point=\"extraIconsContainer\" class=\"epi-extraIconsContainer\" role=\"presentation\">\r\n                <span data-dojo-attach-point=\"iconNodeMenu\" class=\"epi-extraIcon epi-pt-contextMenu\" role=\"presentation\">&nbsp;</span>\r\n            </span>\r\n            <img src=\"${_blankGif}\" alt=\"\" data-dojo-attach-point=\"iconNode\" class=\"dijitIcon dijitTreeIcon epi-iconUsers\" role=\"presentation\"/>\r\n            <span data-dojo-attach-point=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\"></span>\r\n        </span>\r\n    </div>\r\n    <hr />\r\n    <span data-dojo-attach-point=\"dropMoreMessageNode\" class=\"epi-tip epi-tip--block\">${resources.groupdropmoremessage}</span>\r\n    <div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\r\n</div>\r\n"}});
﻿define("epi-cms/contentediting/editors/_GroupTreeNode", [
    "dojo/aspect",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",
    "dojo/dom-style",

    "dijit/Tree",

    "./_ContentAreaTreeNodeMixin",

    "dojo/text!./templates/_GroupTreeNode.html",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea"

], function (aspect, array, declare, lang, domClass, domStyle, Tree, _ContentAreaTreeNodeMixin, template, resources) {

    return declare([Tree._TreeNode, _ContentAreaTreeNodeMixin], {
        // tags:
        //      internal

        templateString: template,

        _contextMenuClass: "epi-iconContextMenu",

        resources: resources,

        buildRendering: function () {
            this.inherited(arguments);

            domClass.remove(this.iconNode, "dijitFolderClosed");

            this.own(aspect.after(this, "expand", lang.hitch(this, function (deferred) {
                deferred.then(lang.hitch(this, function () {
                    // Seems the deferred is sometimes resolved after the tree has been destroyed
                    if (this._destroyed) {
                        return;
                    }

                    domClass.add(this.domNode, "epi-treeNodeOpen");

                    array.forEach(this.getChildren(), function (childNode) {
                        var child = childNode.item;

                        //If the child does not have any roles auto show the personalization selector
                        //TODO: What happens if there are more children that does not have any roles??
                        if (child.contentGroup && child.ensurePersonalization && child.hasAnyRoles && !child.hasAnyRoles()) {
                            child.set("ensurePersonalization", false);
                            childNode.showPersonalizationSelector();
                        }
                    }, this);
                }));

                return deferred;
            })));

            this.own(aspect.after(this, "collapse", lang.hitch(this, function (deferred) {
                deferred.then(lang.hitch(this, function () {
                    domClass.remove(this.domNode, "epi-treeNodeOpen");
                }));

                return deferred;
            })));

            this.own(this.item.watch("readOnly", lang.hitch(this, function () {
                this._toggleDropMoreMessageNode();
            })));
        },

        postCreate: function () {
            this.inherited(arguments);

            this.own(this.item.watch("count", lang.hitch(this, function (property, oldValue, newValue) {
                this.set("count", newValue);
            })));

            // copy initial value from model
            if (this.item) {
                this.set("count", this.item.count);
            }
        },

        setSelected: function (selected) {
            this.inherited(arguments);

            this.item.set("selected", selected);

            domClass.remove(this.rowNode, "dijitTreeRowSelected");
            domClass.toggle(this.domNode, "dijitTreeRowSelected", selected);
        },

        _setCountAttr: function (count) {
            this._set("count", count);

            this._toggleDropMoreMessageNode();
        },

        _toggleDropMoreMessageNode: function () {
            domStyle.set(this.dropMoreMessageNode, "display", !this.item.readOnly && this.count === 1 ? "" : "none");
        }
    });
});
