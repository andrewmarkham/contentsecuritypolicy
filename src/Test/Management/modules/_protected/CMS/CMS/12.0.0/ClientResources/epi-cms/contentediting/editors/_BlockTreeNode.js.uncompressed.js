require({cache:{
'url:epi-cms/contentediting/editors/templates/_BlockTreeNode.html':"﻿<div class=\"dijitTreeNode\" role=\"presentation\">\r\n    <div class=\"epi-tree-mngr--node-wrapper\" data-dojo-attach-point=\"rowNode\">\r\n        <span data-dojo-attach-point=\"rolesNode, _buttonNode\" class=\"epi-tree-mngr--view-settings\"></span>\r\n        <div class=\"dijitTreeRow dijitInline\" role=\"presentation\">\r\n            <div data-dojo-attach-point=\"indentNode\" class=\"dijitInline\"></div>\r\n            <span data-dojo-attach-point=\"expandoNode\" class=\"dijitTreeExpando\"></span>\r\n            <span data-dojo-attach-point=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"contentNode\" class=\"dijitTreeContent\" role=\"presentation\">\r\n                <span data-dojo-attach-point=\"extraIconsContainer\" class=\"epi-extraIconsContainer\" role=\"presentation\">\r\n                    <span data-dojo-attach-point=\"iconNodeMenu\" class=\"epi-extraIcon epi-pt-contextMenu\" title=\"${resources.settingstooltip}\" role=\"presentation\">&nbsp;</span>\r\n                </span>\r\n                <span data-dojo-attach-point=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"></span>\r\n                <span data-dojo-attach-point=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\"></span>\r\n\r\n            </span>\r\n        </div>\r\n        <div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/contentediting/editors/_BlockTreeNode", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/keys",

    "dojo/dom-class",

    "dijit/Tree",
    "dijit/focus",
    "dijit/_HasDropDown",

    "epi-cms/widget/PersonalizationSelector",

    "epi-cms/dgrid/formatters",

    "./_ContentAreaTreeNodeMixin",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.blockcontextmenu",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea.personalize",
    "dojo/text!./templates/_BlockTreeNode.html"
], function (declare, lang, keys, domClass, Tree, focusUtil, _HasDropDown, PersonalizationSelector, formatters, _ContentAreaTreeNodeMixin, tooltip, resources, template) {

    return declare([Tree._TreeNode, _ContentAreaTreeNodeMixin, _HasDropDown], {
        // tags:
        //      internal

        templateString: template,

        _contextMenuClass: "epi-iconContextMenu",
        isExpandable: false,
        dropDownPosition: ["before"],
        resources: lang.mixin(tooltip, resources),

        buildRendering: function () {
            this.inherited(arguments);

            this.dropDown = new PersonalizationSelector({ model: this.item });
            this.own(this.dropDown);
            this.aroundNode = this.domNode;
            this.set("readOnly", this.item.readOnly);

            domClass.add(this.domNode, "epi-tree-mngr--block");

            var node = this.rolesNode;

            // Get the icon from the type descriptor
            var iconClass = formatters.contentIconClass(this.item.typeIdentifier);
            domClass.add(this.iconNode, iconClass);

            node.innerHTML = this.item.get("rolesString");
            this.own(this.item.watch("rolesString", lang.hitch(this, function (property, oldValue, newValue) {
                node.innerHTML = newValue;
            })));

            this.own(this.item.watch("readOnly", lang.hitch(this, function () {
                this.set("readOnly", this.item.readOnly);
            })));
        },

        setSelected: function (selected, internalSelect) {
            this.inherited(arguments);

            this.item.set("selected", selected);

            domClass.toggle(this.iconNodeMenu, this._contextMenuClass, selected);
        },

        showPersonalizationSelector: function () {
            if (this.readOnly) {
                return;
            }

            this.item.set("ensurePersonalization", false);

            focusUtil.focus(this.labelNode);

            this.loadAndOpenDropDown();
        },

        focus: function () {
            // summary:
            //      We need this method because _HasDropDown calls focus when toggling the dropdown
            this.labelNode.focus();
        },

        _onKey: function (/*Event*/ e) {
            // summary:
            //      We need to override the default behaviour otherwise the dropdown will popup
            //      when we click the downarrow on the tree node
            if (this.dropDown && this._opened && e.keyCode === keys.ESCAPE) {
                this.closeDropDown();
            }
        },

        _onKeyUp: function () {

        }
    });
});
