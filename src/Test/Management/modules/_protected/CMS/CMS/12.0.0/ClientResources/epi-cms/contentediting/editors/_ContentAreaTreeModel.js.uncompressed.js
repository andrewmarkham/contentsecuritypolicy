define("epi-cms/contentediting/editors/_ContentAreaTreeModel", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/tree/model",

    "epi-cms/contentediting/viewmodel/ContentBlockViewModel",
    "epi-cms/contentediting/viewmodel/PersonalizedGroupViewModel"
], function (
    array,
    declare,
    lang,
    TreeModel,

    ContentBlockViewModel,
    PersonalizedGroupViewModel) {

    return declare([TreeModel], {
        // tags:
        //      internal

        model: null,
        root: {
            id: "root",
            name: "root"
        },

        constructor: function (params) {
            declare.safeMixin(this, params);
        },

        pasteItem: function (childItem, oldParentItem, newParentItem, bCopy, insertIndex, before) {
            // summary:
            //      Move or copy an item from one parent item to another.
            //      Used in drag & drop.
            //      If oldParentItem is specified and bCopy is false, childItem is removed from oldParentItem.
            //      If newParentItem is specified, childItem is attached to newParentItem.
            // childItem: Item
            // oldParentItem: Item
            // newParentItem: Item
            // bCopy: Boolean
            // insertIndex: int?
            //      Allows to insert the new item as the n'th child of `parent`.
            // before: Item?
            //      Insert the new item as the previous sibling of this item.  `before` must be a child of `parent`.
            // tags:
            //      extension
            var oldParent = oldParentItem.id === "root" ? this.model : this.model.getChildById(oldParentItem.id);

            var child = oldParent.getChildById(childItem.id);

            var newParent = newParentItem.id === "root" ? this.model : this.model.getChildById(newParentItem.id);

            if (child instanceof ContentBlockViewModel && !child.hasAnyRoles()) {
                child.set("ensurePersonalization", true);
            }

            if (oldParent === newParent) {
                this.model.modify(function () {
                    newParent.move(child, insertIndex);
                });

                return;
            }

            this.model.modify(function () {
                oldParent.removeChild(child);
                newParent.addChild(child, insertIndex);
            });
        },

        deleteItem: function (item) {
            this.model.modify(lang.hitch(this, function () {
                this.model.removeChild(item, true);
            }));
        },

        newItem: function (args, parent, insertIndex, before) {
            if (args.dndData && args.dndData.data) {
                var parentModel = parent.id === "root" ? this.model : this.model.getChildById(parent.id);

                var item = args.dndData.data;
                if (!(item instanceof ContentBlockViewModel) && !(item instanceof PersonalizedGroupViewModel)) {
                    item = new ContentBlockViewModel(item);
                }

                item.set("ensurePersonalization", true);

                this.model.modify(function () {
                    parentModel.addChild(item, insertIndex);
                });
            }
        },

        checkItemAcceptance: function (target, item, position) {
            if (position === "over") {
                if (!(target instanceof PersonalizedGroupViewModel)) {
                    return false;
                }

                if (!(item instanceof ContentBlockViewModel)) {
                    return false;
                }
            }

            if (target instanceof ContentBlockViewModel && item instanceof PersonalizedGroupViewModel && target.contentGroup) {
                return false;
            }

            return true;
        },

        getRoot: function (onItem) {
            onItem(this.root);
        },

        getLabel: function (item) {
            return item.label;
        },

        mayHaveChildren: function (item) {
            if (typeof item.getChildren == "function" || item.id === "root") {
                return true;
            }

            return false;
        },

        getIdentity: function (item) {
            return item.id;
        },

        getChildren: function (parentItem, onComplete) {
            var children;

            if (parentItem.id === "root") {
                children = this.model.getChildren();
                onComplete(children);

                this.model.on("childrenChanged", lang.hitch(this, function (index, removals, adds) {
                    this.onChildrenChange(this.root, this.model.getChildren());
                }));
            } else {
                var model = this.model.getChildById(parentItem.id);
                if (model && typeof model.getChildren == "function") {
                    children = model.getChildren();
                    onComplete(children);

                    model.on("childrenChanged", lang.hitch(this, function (index, removals, adds) {
                        this.onChildrenChange(parentItem, model.getChildren());
                    }));

                } else {
                    onComplete([]);
                }

            }
        }
    });
});
