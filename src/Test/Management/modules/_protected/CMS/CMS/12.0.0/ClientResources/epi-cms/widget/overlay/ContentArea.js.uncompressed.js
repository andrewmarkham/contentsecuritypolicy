require({cache:{
'url:epi-cms/widget/templates/ContentArea.html':"﻿<div class=\"epi-overlay-blockarea\">\r\n\t<div class=\"epi-overlay-item-container\">\r\n        <span data-dojo-attach-point=\"informationNode\" class=\"epi-overlay-item-info\"></span>\r\n        <div class=\"epi-overlay-bracket\"></div>\r\n\t</div>\r\n\t<div data-dojo-attach-point=\"containerNode\" class=\"epi-overlay-blockarea-container\"></div>\r\n\t<div data-dojo-attach-point=\"actionsNode\" class=\"epi-overlay-blockarea-actionscontainer\">\r\n\t\t<div data-dojo-attach-point=\"actionsNodeControls\" class=\"epi-overlay-blockarea-actions\"></div>\r\n\t</div>\r\n</div>\r\n"}});
﻿define("epi-cms/widget/overlay/ContentArea", [
    // Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dnd/Manager",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/json",
    "dojo/on",
    "dojo/query",

    // Dijit
    "dijit/_Container",
    "dijit/registry",

    // EPi Framework
    "epi",
    "epi/shell/widget/overlay/Item",
    "epi/shell/dnd/Source",
    "epi/shell/dnd/_MarkerSource",

    // EPi CMS
    "epi-cms/core/ContentReference",
    "epi-cms/widget/overlay/Block",
    "epi-cms/contentediting/editors/ContentBlockEditor",
    "epi-cms/widget/command/CreateContentFromSelector",
    "epi-cms/contentediting/viewmodel/ContentAreaViewModel",
    "epi-cms/contentediting/viewmodel/ContentBlockViewModel",
    "epi-cms/contentediting/editors/_TextWithActionLinksMixin",

    // Resources
    "dojo/text!../templates/ContentArea.html"
], function (
    // Dojo
    array,
    declare,
    lang,
    aspect,
    dndManager,
    domAttr,
    domConstruct,
    domGeometry,
    domStyle,
    json,
    on,
    query,

    // Dijit
    _Container,
    registry,

    // EPi Framework
    epi,
    Item,
    Source,
    _MarkerSource,

    // EPi CMS
    ContentReference,
    Block,
    ContentBlockEditor,
    CreateContentFromSelector,
    ContentAreaViewModel,
    ContentBlockViewModel,
    _TextWithActionLinksMixin,

    // Resources
    template
) {

    return declare([Item, _Container, _TextWithActionLinksMixin], {
        // tags:
        //      internal xproduct

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // layout: [public] String
        //      Used to indicate in which direction drag and drop should function; vertical or horizontal.
        layout: "",

        // defaultWatchKey: [public] String
        //      Used to kind of default handler when children change for all area.
        defaultWatchKey: "",

        allowedDndTypes: null,

        // blockClass: [public] Class
        //      Used to inject block overlay class.
        blockClass: Block,

        // modelClass: [public] Class
        //      Used to inject model for this.
        modelClass: ContentAreaViewModel,

        dndSourceClass: declare([Source, _MarkerSource]),

        // dndSourceSettings: [public] Json object
        //      Used to inject settings for dnd source.
        dndSourceSettings: null,

        // allowedTypes: [public] Array
        //      The types which are allowed. i.e used for filtering based on AllowedTypesAttribute
        allowedTypes: null,

        // restrictedTypes: [public] Array
        //      The types which are restricted.
        restrictedTypes: null,

        _supressValueChanged: false,

        constructor: function () {
            this._watches = {};
        },

        postMixInProperties: function () {
            // summary:
            //      Create the view model if it doesn't exist and update the view model with the current value of this property.
            // tags:
            //      protected
            this.inherited(arguments);

            if (!this.model) {
                this.model = new this.modelClass();
            }

            this.own(this.model);

            // Must copy the values, otherwise updates are done to the values inside the content model,
            // circumventing the undo function.
            // Shouldn't be done here, but since we only have the content model there's really no other solution.
            this.model.set("value", lang.clone(this.contentModel.get(this.name)));

            // Since we're copying the values we must also listen to changes, since we no longer have
            // references to the backing data.
            this.own(this.contentModel.watch(this.name, lang.hitch(this, function (name, oldValue, value) {
                if (epi.areEqual(value, this.model.get("value"))) {
                    return;
                }
                this.refresh();
            })));

            this._pendingPersonalizations = [];

            this._ownerContentLink = this.contentModel.get("icontent_contentlink");
        },

        buildRendering: function () {
            this.inherited(arguments);

            this.setupActionLinks(this.actionsNodeControls);
        },

        postCreate: function () {
            // summary:
            //      Configure the drag and drop direction and synchronize the visible content blocks with the view model.
            // tags:
            //      protected
            this.inherited(arguments);

            this.own(on(this.model, "changed", lang.hitch(this, function () {

                if (!this._started || this._supressValueChanged) {
                    return;
                }

                this._onChildrenChanged();

                if (this._pendingPersonalizations.length > 0) {
                    this._pendingPersonalizations = [];

                    // TODO: refactor this, trigger an activate/select event or watch to force a start edit
                    this.onClick(this);
                }
            })));

            this._setupDirectionality();

            this._setupBlocks();
        },

        destroy: function () {

            this.inherited(arguments);

            // Destroy all the current blocks and reset the map.
            for (var i in this._watches) {
                this._watches[i].remove();
            }
            this._watches = {};

            this._source.destroy();

            if (this.textWithLinks) {
                this.textWithLinks.destroy();
                this.textWithLinks = null;
            }
        },


        isCreateLinkVisible: function () {
            // summary:
            //      Overridden to hide the "create block" link when user doesn't have permission to create new blocks in the local assets folder.

            return this.model.canCreateBlock(this.allowedTypes, this.restrictedTypes);
        },

        _setHasChildrenAttr: function (value) {
            this._set("hasChildren", value);
        },

        _getMinHeightAttr: function () {
            return domStyle.get(this.sourceItemNode, "minHeight");
        },

        onValueChange: function (values) {
            // summary:
            //      Event to notify that this and possibly other properties
            //      has changed their values
            // values: Object || [Object]
            //      The property values that has changed. {propertyName: "propertyName", value: value}
            // tags:
            //      public callback
        },

        updatePosition: function (position) {
            // summary:
            //      Override of the base implementation to include positioning
            //      of the blocks
            //
            // position: Object
            //      the coordinates to set the position to

            if (!this.canUpdatePosition()) {
                return false;
            }

            // first size this to match source node
            var result = this.inherited(arguments),
                currentActionNodeHeight,
                actionNodeHeight,
                originalMinHeight,
                sourceNodeHeight;

            if (this.hasChildren) {
                // update position of blocks
                this._setupDirectionality();
                this._positionBlocks();
            }

            // get min height before we reset it
            originalMinHeight = this.get("minHeight");

            // reset min height on source node
            domStyle.set(this.sourceItemNode, "minHeight", "");

            // NOTE: this assumes there's a width, but maybe not a height
            currentActionNodeHeight = Math.floor(domGeometry.position(this.actionsNodeControls, false).h);
            actionNodeHeight = currentActionNodeHeight > 0 ? currentActionNodeHeight : this.get("actionNodeHeight") || 0;
            sourceNodeHeight = Math.floor(domGeometry.position(this.sourceItemNode, false).h);

            // actionNode has not taken it's height yet, no need to resize anything, abort.
            if (actionNodeHeight === 0) {

                // if sourceNodeHeight is 0 then ContentArea is hidden and _clearPosition
                // will be executed in every iteration.
                // This will affect whole iframe to be reloaded endless
                if (sourceNodeHeight !== 0) {
                    this._clearPosition();
                    return result;
                }
            }

            actionNodeHeight && (this.set("actionNodeHeight", actionNodeHeight));

            // set a min height
            domStyle.set(this.sourceItemNode, "minHeight", (sourceNodeHeight + actionNodeHeight) + "px");
            domStyle.set(this.actionsNodeControls, "marginTop", (sourceNodeHeight) + "px");

            // if we got here, return false, this is considered to be no resize of dom node
            if (originalMinHeight === sourceNodeHeight + actionNodeHeight) {
                return result;
            }

            // if we get here we consider it as a resizse
            return true;
        },

        refresh: function () {
            // summary:
            //      Recreate block overlay item for the current content area.
            // tags:
            //      public
            this._actionNodeHeight = null;

            // Destroy all the child blocks and clear the drag and drop items from the source.
            this.destroyDescendants();
            this._source.clearItems();
            if (this._source.anchor) {
                domConstruct.destroy(this._source.anchor);
            }

            // Destroy all the current blocks and reset the map.
            for (var i in this._watches) {
                this._watches[i].remove();
            }
            this._watches = {};

            this._supressValueChanged = true;

            // Update model to the latest value and recreate the blocks from the DOM.
            this.model.set("value", lang.clone(this.contentModel.get(this.name)));
            this._setupBlocks();

            this.inherited(arguments);

            this._supressValueChanged = false;
        },

        _setDisabledAttr: function () {
            this.inherited(arguments);
            if (this.position) {
                // when Disabled value is false, the display attribute will change to ""
                // but somethimes the overlay should be forced to be hidden by updatePosition function
                // Calling updatePosition again will check this and eventually set display to "none"
                this.updatePosition(this.position);
            }
        },

        _setupDnd: function () {
            // summary:
            //      Overrides the default implementation creating a suitable source for the BlockArea
            // tags:
            //      private

            var settings = lang.mixin({
                _skipStartup: true,
                creator: lang.hitch(this, "_creator"),
                copyOnly: false,
                alwaysCopy: false,
                dropParent: this.containerNode,
                type: this.allowedDndTypes,
                accept: this.allowedDndTypes,
                reject: this.restrictedDndTypes,
                singular: true,
                propertyName: this.name
            }, this.dndSourceSettings || {});

            this._source = new this.dndSourceClass(this.domNode, settings);

            this._source.defaultCheckAcceptance = this._source.checkAcceptance;
            this._source.checkAcceptance = lang.hitch(this, this._checkAcceptance);

            this.own(aspect.after(this._source, "onDropData", lang.hitch(this, "_onDrop"), true));
            this.own(aspect.before(this._source, "delItem", lang.hitch(this, "_onDndItemRemoved"), true));
        },

        _creator: function (item) {
            // summary:
            //      Customizes dnd item creation
            // tags:
            //      protected
            var node = domConstruct.create("div"),
                itemData;

            if (typeof item.getNormalizedData == "function") {
                itemData = item.getNormalizedData();
            }

            itemData = itemData ? itemData.data : item;

            return {
                node: node,
                type: this.allowedDndTypes,
                data: itemData
            };
        },

        _setupBlocks: function () {
            // summary:
            //      Creates and positions the blocks.
            var blocks = this._getBlockNodes();

            array.forEach(blocks, this._createBlock, this);

            this.set("hasChildren", blocks.length > 0);
        },

        _createBlock: function (node) {
            // summary:
            //      Creates a single block.

            var id = domAttr.get(node, "data-epi-block-id"),
                info = json.parse(domAttr.get(node, "data-epi-block-personalization")),
                contentGroup = info ? info.contentGroup : this.defaultWatchKey,
                model = this.model;

            // Get the view model for the item's group.
            if (contentGroup) {
                model = model.getChild({ name: contentGroup });
            }

            // Get the view model for the item.
            var indexChild = model && model.getChild(lang.mixin({ contentLink: new ContentReference(id).createVersionUnspecificReference().toString() }, info));
            if (!indexChild) {
                // Happens when we're notified about model updates, but the markup hasn't
                // been refreshed yet so the block info grabbed from dom doesn't match the model.
                // Should sort itself out once new markup arrives.
                return;
            }

            // TODO: Pass context menu through instead of provider.
            var block = new this.blockClass({
                disabled: this.disabled,
                viewModel: indexChild,
                sourceItemNode: node
            });

            this.addChild(block);

            this._watches["block_" + id + "_ensurePersonalization"] = indexChild.watch("ensurePersonalization", lang.hitch(this, function (propertyName, oldValue, newValue) {

                var index = array.indexOf(this._pendingPersonalizations, indexChild);

                if (newValue) {

                    // add if it doesn't exist
                    if (index < 0) {
                        this._pendingPersonalizations.push(indexChild);
                    }
                } else {
                    // remove if exists
                    if (index > 0) {
                        this._pendingPersonalizations.splice(index, 1);
                    }
                }

            }));

            // Mark the block's model as visible.
            indexChild.set("visible", true);

            // Add the block's node to the drag and drop souce.

            this._source.setItem(block.domNode.id, {
                name: indexChild.name,
                data: indexChild,
                type: this.allowedDndTypes
            });
        },

        _onChildrenChanged: function () {

            this.onValueChange({
                propertyName: this.name,
                value: this.model.get("value")
            });
        },

        _positionBlocks: function () {
            // summary:
            //      Centralized position logic for all blocks within the
            //      area. It is done here since we need to nudge them a
            //      bit to cover the entire area even if the position method disagrees.
            var widgets = this.getChildren(),
                positions = [],
                position = this.get("position");

            array.forEach(widgets, function (widget, i) {

                var widgetPos;

                if (!positions[i]) {
                    positions[i] = domGeometry.position(widget.sourceItemNode, false);
                }

                widgetPos = positions[i];
                widgetPos.x -= position.x;
                widgetPos.y -= position.y;

                widget.resize(widgetPos);

            }, this);

        },

        _checkAcceptance: function (source, nodes) {
            // summary:
            //      Customize checkAcceptance func
            // source: Object
            //      The source which provides items
            // nodes: Array
            //      The list of transferred items
            if (this.readOnly || nodes === undefined) {
                return false;
            }
            var widget = registry.getEnclosingWidget(nodes[0]);
            if (widget.isInstanceOf(ContentBlockEditor)) {
                return false;
            }

            return this._source.defaultCheckAcceptance(source, nodes);
        },

        _getBlockNodes: function () {

            if (!this.canUpdatePosition()) {
                return [];
            }

            var allBlockNodes = query("[data-epi-block-id]", this.sourceItemNode);
            var nestedBlockNodes = query("[data-epi-block-id] [data-epi-block-id]", this.sourceItemNode);

            return array.filter(allBlockNodes, function (node) {
                // return the blocks that are not nested
                return nestedBlockNodes.indexOf(node) === -1;
            });
        },

        _setupDirectionality: function () {
            // summary:
            //      Iterates over the sourceItemNodes children checking if any is floating.
            // tags:
            //      private
            var horizontal;

            if (/vertical|horizontal/.test(this.layout)) {
                horizontal = this.layout === "horizontal";
            } else {
                horizontal = array.some(this._getBlockNodes(), function (node) {
                    var style = domStyle.getComputedStyle(node),
                        floating = /left|right/.test(style.cssFloat),
                        inline = /inline|inline-block/.test(style.display);

                    return floating || inline;
                });
            }

            this._source.setHorizontal(horizontal);
        },

        executeAction: function (actionName) {
            // summary:
            //      Overidden mixin class, listen acion clicked on textWithLinks widget
            // actionName: [String]
            //      Action name of link on content area
            // tags:
            //      public

            if (actionName === "createnewblock") {

                // TODO: destroy and dereference command when done
                var command = new CreateContentFromSelector({
                    creatingTypeIdentifier: "episerver.core.blockdata",
                    createAsLocalAsset: true,
                    treatAsSecondaryView: true,
                    autoPublish: true,
                    allowedTypes: this.allowedTypes,
                    restrictedTypes: this.restrictedTypes
                });

                command.set("model", {
                    save: lang.hitch(this, function (block) {
                        var value = lang.clone(this.model.get("value"), true) || [];
                        value.push(block);

                        this.onValueChange({
                            propertyName: this._source.propertyName,
                            value: value
                        });
                    })
                });

                command.execute();

            } else {
                this.inherited(arguments);
            }
        },

        _onDrop: function (data, source, nodes, isCopy) {
            // summary:
            //      onDrop handler for the source
            // data:
            //      Data extracted from the dragged items.
            // source:
            //      The source that the drag event originated from.
            // nodes:
            //      The nodes being dragged.
            // isCopy:
            //      Flag indicating whether the drag is a copy. False indicates a move.
            // tags:
            //      protected
            var model = this.model,
                target = this._source;

            // If the drag source item and drag target item are the same node then return since
            // we don't want to move if the node is dropped on itself.
            if (target.anchor === target.targetAnchor) {
                return;
            }

            // Calculate the visual index of the target.
            var index = array.indexOf(target.getAllNodes(), target.targetAnchor) + (target.before ? -1 : 1),
                children = array.filter(model.getChildren(), function (child) {
                    return child.get("visible");
                });

            // Calculate the actual index in the model to move to.
            index = model.indexOf(children[index - 1]) + 1;

            // Normalize the data to an array.
            if (!lang.isArray(data)) {
                data = [data];
            }

            // If the drag and drop event originated from ourself and is a move, then
            // we need to remove the item before we add them again at the new index.
            if (target === source && !isCopy) {
                model.modify(function () {
                    array.forEach(data, function (item, i) {
                        var data = item.data;

                        // If the item is in a group then move the group instead.
                        if (data.contentGroup) {
                            data = model.getChild({ name: data.contentGroup });
                        }

                        model.move(data, index + i);
                    });
                });
            } else {
                model.modify(function () {
                    array.forEach(data, function (item, i) {
                        var block = new ContentBlockViewModel(item.data);
                        model.addChild(block, index + i);
                    });
                });
            }
        },

        _onDndItemRemoved: function (key) {
            // summary:
            //      Called when item are dragged out of the source and dropped in another target.
            // tags:
            //      protected

            // Normalize the data to an array.
            var data = this._source.getItem(key);

            if (!lang.isArray(data)) {
                data = [data];
            }

            // Remove each item from the model.
            this.model.modify(function () {
                array.forEach(data, function (item) {
                    this.model.removeChild(item.data);
                }, this);
            }, this);
        }
    });
});
