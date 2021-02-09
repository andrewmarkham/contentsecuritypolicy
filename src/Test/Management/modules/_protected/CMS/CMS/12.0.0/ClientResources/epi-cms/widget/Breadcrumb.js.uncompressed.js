define("epi-cms/widget/Breadcrumb", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/on",
    "dojo/when",

    "dojo/query",
    "dojo/NodeList-manipulate",
    "dojo/topic",

    // dijit
    "dijit/_Widget",
    "dijit/layout/_LayoutWidget",

    // epi
    "epi/dependency",

    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/_ContextualContentContextMixin",
    "epi-cms/widget/_HierarchicalModelMixin"
],

function (
// dojo
    array,
    declare,
    lang,

    aspect,
    Deferred,
    domClass,
    domConstruct,
    domGeometry,
    domStyle,
    on,
    when,

    query,
    NodeList,
    topic,

    // dijit
    _Widget,
    _LayoutWidget,

    // epi
    dependency,

    ContentReference,
    _ContextualContentContextMixin,
    _HierarchicalModelMixin
) {

    return declare([_LayoutWidget, _HierarchicalModelMixin, _ContextualContentContextMixin], {
        // summary:
        //    Wiget used to show the content's path on a tree struture.
        //
        // tags:
        //      internal xproduct

        // contentLink: [public] String
        //    The current content link.
        contentLink: null,

        // store: [public] epi.cms.pagedata.light
        //    The widget data store.
        store: null,

        // showOnlyAncestors: [public] Boolean
        //    Flag indicating is the current node will be shown.
        showCurrentNode: true,

        // showLastBracket: [public] Boolean
        //    Flag indicating is the last bracket will be shown.
        showLastBracket: false,

        // displayAsText: [public] Boolean
        //    States if the path will be displayed as links or simple text.
        displayAsText: true,

        // minimumItemCount: [public] Number
        //    If set, when laying out, the widget wouldn't truncate if there is less than this number of item visible.
        minimumItemCount: null,

        baseClass: "epi-breadCrumbs",

        _resizeListener: null,
        _visibleItems: [],

        _currentContent: null,
        _ancestors: null,

        postMixInProperties: function () {
            // summary:
            //    Post mixin properties handler.

            var registry = dependency.resolve("epi.storeregistry");
            this.store = this.store || registry.get("epi.cms.content.light");

            this.minimumItemCount = this.minimumItemCount || 2;
        },

        buildRendering: function () {
            // summary:
            //      Constructs the base DOM node for this widget and sets it to this.domNode.
            // tags:
            //      protected
            this.domNode = this.ownerDocument.createElement("ul");

            this.inherited(arguments);
        },

        startup: function () {
            // summary:
            //      Start the widget up.

            this._addResizeListener();
        },

        destroy: function () {
            // summary:
            //      Destroy the widget.

            if (this._resizeListener) {
                this._resizeListener.remove();
            }

            this.destroyDescendants();

            this.inherited(arguments);
        },

        _addResizeListener: function () {
            // summary:
            //      Add a listener to the closest ancestor which is a layout container to be able to react to resize event.
            // remark:
            //      Since this widget might not be a direct child of a layout widget, it would unlikely know when it got resized.
            //      The dijit layout system relies on layout() and layoutChildren() methods in cases that resizing is caused by a layout container rather than a window resize.
            //      Therefore, we have to actively connect to the closest ancestor's layout method.

            if (this._resizeListener) {
                return;
            }

            var parent = this.getParent(),
                resizeContainer = parent;

            while (resizeContainer && !resizeContainer.isLayoutContainer && resizeContainer.getParent()) {
                resizeContainer = resizeContainer.getParent();
            }

            if (resizeContainer && resizeContainer !== parent) {
                this._resizeListener = aspect.after(resizeContainer, "resize", lang.hitch(this, function () {
                    var changeSize = domGeometry.getMarginBox(this.domNode);
                    this.resize(changeSize);
                }));
            }
        },

        resize: function (changeSize) {
            if (!changeSize && this._resizeListener) {
                return; // The window is resized. If we have a resize container, we will get resize request from resize container later.
            } else {
                // We need to re-layout all the time the sizing container resized
                this.layout();
            }
        },

        layout: function () {
            // summary:
            //      Layout the breadcrums items.

            this._visibleItems = [];

            when(this._buildPath(), lang.hitch(this, function () {
                //if still overflow.
                var actualWidth = domGeometry.getContentBox(this.domNode).w;
                if (actualWidth > this._availableWidth) {
                    var leadingItemWidth = this._leadingItem ? domGeometry.getMarginBox(this._leadingItem.domNode).w : 0;
                    var availableWidthToEllipsis = this._availableWidth - leadingItemWidth;
                    this._ellipsisize(0, availableWidthToEllipsis);
                }
            }));
        },

        _setContentLinkAttr: function (/*Integer*/value) {
            // summary:
            //   The value on the content property
            //
            // value:
            //    The content object.
            //
            // tags:
            //    private

            this._set("contentLink", value);
            this._currentContent = null;
            this._ancestors = null;
            this.layout();
        },

        _buildPath: function () {
            // summary:
            //    Helper function to build the content's path.
            //
            // tags:
            //    private

            var contentLink = this.get("contentLink"),
                def = new Deferred(),
                path = "";

            if (this._currentContent && this._ancestors) {
                this._createAllItems();
                def.resolve(path);
            } else if (contentLink) {
                var contentReference = new ContentReference(contentLink);
                var contentId = contentReference.createVersionUnspecificReference().toString();

                when(this.getCurrentContext(), lang.hitch(this, function (ctx) {

                    when(this.store.get(contentId), lang.hitch(this, function (currentContent) {

                        this.getAncestors(contentId, lang.hitch(this, function (ancestors) {

                            this._currentContent = currentContent;

                            this._ancestors = ancestors;

                            this._createAllItems();

                            def.resolve(path);
                        }));
                    }));
                }));
            } else {
                def.resolve(path);
            }

            return def.promise; // Promise
        },

        _createAllItems: function () {

            // Cleanup first
            this._cleanUp();

            if (!this.isTypeOfRoot(this._currentContent)) {
                var filteredItems = [],
                    ancestor = null;

                // Remove all but first sub root
                for (var i = this._ancestors.length - 1; i >= 0; i--) {
                    // Modify context root name
                    ancestor = this._ancestors[i];

                    // Do not add root node
                    if (!ancestor.parentLink) {
                        continue;
                    }

                    // Push item
                    filteredItems.push(ancestor);

                    // Break after first sub root or context root
                    if (this.isTypeOfRoot(ancestor)) {
                        break;
                    }
                }

                // Reverse the list
                filteredItems.reverse();

                var maxWidth = domGeometry.getContentBox(this.domNode).w;
                this._availableWidth = maxWidth >= 0 ? maxWidth : 0;

                array.forEach(filteredItems, lang.hitch(this, function (content) {
                    this._createItem(content, true);
                }));
            }

            if (this.showCurrentNode) {
                this._createItem(this._currentContent, this.showLastBracket);
            }
        },

        _cleanUp: function () {
            this.destroyDescendants();
            this._leadingItem = null;
            this._visibleItems = [];
        },

        _createItem: function (content, withSeparator) {
            // summary:
            //      Add a link to the content.
            // content: Object
            //      The content object.
            // withSeparator: Boolean
            //      Flag indicating whether a separator should be created after the new breadcrumb item.
            // tags:
            //      private

            var node,
                listNode = domConstruct.create("li"),
                isTextNode = this.displayAsText || !content.hasTemplate;

            if (isTextNode) {
                node = domConstruct.create("span", null, listNode);
            } else {
                node = domConstruct.create("a", { href: "#" }, listNode);

                this.own(on(node, "click", lang.hitch(this, function (e) {
                    this.onNodeClick(e, content);
                })));
            }

            node.textContent = this.isContextualContent(content) ? this.getContextualRootName(content) : content.name;

            if (withSeparator) {
                domConstruct.create("span", { innerHTML: "&gt;", "class": "epi-breadCrumbsSeparator" }, listNode);
            }

            this._addAndLayout(listNode);
        },

        onNodeClick: function (e, content) {
            // summary:
            //      Click on a node on breadcrumb, load new context .
            // e: Object
            //      The mouse event object.
            // content: Object
            //      The content object.
            // tags:
            //      protected

            e.preventDefault();
            topic.publish("/epi/shell/context/request", { uri: content.uri }, { sender: this });
        },

        _addAndLayout: function (node) {
            // summary:
            //      Add an item and do layout.
            // remark:
            //      If there was not space, the items on the left would be hidden.

            var toAdd = new _Widget({}, node);

            this._visibleItems.push(toAdd);
            this.addChild(toAdd);

            var newWidth = this._getTotalVisibleItemsSize(); //domGeometry.getContentBox(this.domNode).w;

            if (newWidth > this._availableWidth) {
                this._ensureLeadingItem();

                while (newWidth > this._availableWidth && this._visibleItems.length > this.minimumItemCount) {
                    var firstItem = this._visibleItems.splice(0, 1)[0];

                    domStyle.set(firstItem.domNode, "display", "none");
                    newWidth = this._getTotalVisibleItemsSize();
                }
            }
        },

        _getTotalVisibleItemsSize: function () {
            var width = 0;

            if (this._leadingItem) {
                width += domGeometry.getMarginBox(this._leadingItem.domNode).w;
            }

            array.forEach(this._visibleItems, function (item) {
                width += domGeometry.getMarginBox(item.domNode).w;
            });

            return width;
        },

        _ensureLeadingItem: function () {
            // summary:
            //      Make sure that we have an elipssis item at the beginning if some items is truncated.

            if (this._leadingItem) {
                return;
            }

            var leadingItemNode = domConstruct.create("li"),
                ellipsisNode = domConstruct.create("span", { innerHTML: "..." }),
                separator = domConstruct.create("span", { innerHTML: " &gt; ", "class": "epi-breadCrumbsSeparator" });

            domConstruct.place(ellipsisNode, leadingItemNode, "last");
            domConstruct.place(separator, leadingItemNode, "last");

            this._leadingItem = new _Widget({}, leadingItemNode);
            this.addChild(this._leadingItem, 0); //add to the first index
        },

        _ellipsisize: function (startIndex, availableWidth) {
            // summary:
            //      Ellipsisize a set of items.
            // startIndex: Number
            //      The index of item to start with.
            // availableWidth: Number
            //      Total available width in pixels.

            if (startIndex >= this._visibleItems.length) {
                return;
            }

            var noOfItems = this._visibleItems.length - startIndex,
                maxItemWidth = Math.floor(availableWidth / noOfItems),
                item = this._visibleItems[startIndex],
                actualItemWidth = domGeometry.getMarginBox(item.domNode).w;

            if (actualItemWidth <= maxItemWidth) {
                this._ellipsisize(startIndex + 1, availableWidth - actualItemWidth);
            } else {
                var nodeToEllipsis = query(this.displayAsText ? "span" : "a", item.domNode)[0],
                    separator = query("span.epi-breadCrumbsSeparator", item.domNode)[0],
                    itemWidth = maxItemWidth - domGeometry.getMarginBox(separator).w;

                if (itemWidth < 0) {
                    itemWidth = 0;
                }

                domStyle.set(nodeToEllipsis, "width", itemWidth + "px");
                domClass.add(nodeToEllipsis, "dojoxEllipsis");

                this._ellipsisize(startIndex + 1, availableWidth - maxItemWidth);
            }
        }

    });

});
