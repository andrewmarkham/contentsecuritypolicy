define("epi-cms/contentediting/editors/_ContentAreaTree", [
    "dojo/_base/declare",
    "dojo/aspect",
    "dojo/_base/event",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dijit/registry",

    "epi/dependency",
    "epi/shell/conversion/ObjectConverterRegistry",
    "epi/shell/dnd/tree/dndSource",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/Tree",

    "epi-cms/contentediting/viewmodel/ContentBlockViewModel",
    "epi-cms/contentediting/viewmodel/PersonalizedGroupViewModel",

    "./_BlockTreeNode",
    "./_GroupTreeNode"
], function (
    declare,
    aspect,
    event,
    array,
    lang,
    domClass,
    registry,

    dependency,
    ObjectConverterRegistry,
    dndSource,
    TypeDescriptorManager,
    Tree,

    ContentBlockViewModel,
    PersonalizedGroupViewModel,
    _BlockTreeNode,
    _GroupTreeNode
) {

    return declare([Tree], {
        // tags:
        //      internal

        persist: false,
        showRoot: false,
        dndController: dndSource,
        betweenThreshold: 8,

        // _typeDescriptorManager: [private] TypeDescriptorManager
        _typeDescriptorManager: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            this._typeDescriptorManager =  this._typeDescriptorManager || TypeDescriptorManager;
            this.accept.push("personalizationarea");
        },

        postCreate: function () {
            this.inherited(arguments);

            domClass.add(this.domNode, "epi-tree-mngr");

            this.own(aspect.after(this.dndController, "onDndItemRemoved", lang.hitch(this, function (dndData) {
                if (dndData[0] && dndData[0].data) {
                    this.model.deleteItem(dndData[0].data);
                }
            }), true));

            this.own(aspect.after(this, "_onItemChildrenChange", lang.hitch(this, function (parent, children) {
                array.forEach(children, function (child) {
                    var childNode = this._itemNodesMap[this.model.getIdentity(child)];

                    //Auto-expand the node
                    if (child.expandOnAdd) {
                        this._expandNode(childNode[0]);
                    }

                    //If the child does not have any roles auto show the personalization selector
                    //TODO: What happens if there are more children that does not have any roles??
                    if (child.contentGroup && child.ensurePersonalization && child.hasAnyRoles && !child.hasAnyRoles()) {
                        childNode[0].showPersonalizationSelector();
                    }
                }, this);
            }), true));
        },

        getTooltip: function (item) {
            // summary:
            //      Gets the label as the tooltip text if it exists.

            return item.tooltip || item.label || "";
        },

        _setReadOnlyAttr: function (readOnly) {
            this._set("readOnly", readOnly);

            if (this.dndController) {
                this.dndController.isSource = !readOnly;
            }
        },

        getItemType: function (item) {
            // summary:
            //      Resolve the type for each item. Called by the dnd source.

            if (item.typeIdentifier) {
                var values = this._typeDescriptorManager.getAndConcatenateValues(item.typeIdentifier, "dndTypes");
                return values;
            } else if (item.contentGroup !== undefined) {
                //Since personalization items does not have a typeIdentifier we return a hardcoded type.
                return ["personalizationarea"];
            }
            return this.accept;
        },

        checkItemAcceptance: function (targetNode, source, position, copy) {
            if (this.tree.readOnly) {
                return false;
            }

            var targetTreeNode = registry.getEnclosingWidget(targetNode);
            var target = targetTreeNode.item;

            var accepts = true;
            source.forInSelectedItems(function (item) {
                accepts = this.tree.model.checkItemAcceptance(target, item.data.item, position);
            }, this);

            return accepts;
        },

        _onNodeMouseEnter: function (node) {
            node.set("mouseHover", true);
        },

        _onNodeMouseLeave: function (node) {
            node.set("mouseHover", false);
        },

        _createTreeNode: function (model) {
            var node;
            if (model.item instanceof PersonalizedGroupViewModel) {
                node = new _GroupTreeNode(model);
            } else if (model.item instanceof ContentBlockViewModel) {
                node = new _BlockTreeNode(model);
            } else {
                node = this.inherited(arguments);
            }

            //Set the context menu and the dndData for the node
            node.set("contextMenu", this.contextMenu);
            node.set("dndData", model.item);
            return node;
        },
        onClick: function (item, node, e) {

            //Auto expand/collapse the group tree node
            if (node instanceof _GroupTreeNode) {
                if (node.isExpanded) {
                    this._collapseNode(node);
                } else {

                    this._expandNode(node);
                }
            }
        }
    });
});
