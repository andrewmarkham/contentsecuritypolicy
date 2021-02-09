require({cache:{
'url:epi/shell/widget/layout/templates/ComponentTabContainer.htm':"﻿<div class=\"dijitTabContainer dojoxDragHandle epi-componentGroup epi-compactTabs\">\r\n    <div class=\"dijitTabListWrapper\" data-dojo-attach-point=\"tablistNode\"></div>\r\n    <div data-dojo-attach-point=\"tablistSpacer\" class=\"dijitTabSpacer ${baseClass}-spacer\"></div>\r\n    <div class=\"dijitTabPaneWrapper ${baseClass}-container\" data-dojo-attach-point=\"containerNode\"></div>\r\n    <div data-dojo-attach-point=\"_splitterNode\"></div>\r\n</div>\r\n"}});
define("epi/shell/widget/layout/ComponentTabContainer", [
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/topic",
    "dojo/when",
    "dojo/Evented",
    "dojo/text!./templates/ComponentTabContainer.htm",
    "dijit/layout/TabContainer",
    "dijit/layout/utils",
    "epi/dependency",
    "epi/shell/widget/layout/_ComponentTabController",
    "epi/shell/widget/layout/_ComponentResizeMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/ToggleButton",
    "epi/shell/widget/ComponentChrome",
    "epi/shell/widget/_FocusableMixin",
    "epi/shell/command/_CommandProviderMixin",
    "epi/shell/widget/command/RemoveGadget"
], function (
    array,
    lang,
    declare,
    domStyle,
    domConstruct,
    domAttr,
    domClass,
    domGeometry,
    topic,
    when,
    Evented,
    template,
    TabContainer,
    layoutUtils,
    dependency,
    _ComponentTabController,
    _ComponentResizeMixin,
    _WidgetsInTemplateMixin,
    ToggleButton,
    ComponentChrome,
    _FocusableMixin,
    _CommandProviderMixin,
    RemoveCommand) {

    return declare([TabContainer, _WidgetsInTemplateMixin, _ComponentResizeMixin, _FocusableMixin, Evented, _CommandProviderMixin], {
        // summary:
        //      A component container where added children are chromed and placed inside different tabs.
        //
        // tags:
        //      internal

        // useMenu: [const] Boolean
        //		True if a menu should be used to select tabs when they are too
        //		wide to fit the TabContainer, false otherwise.
        useMenu: true,

        // doLayout: Boolean
        //		If true, change the size of my currently displayed child to match my size
        doLayout: true,

        // useSlider: [const] Boolean
        //		Override the default behaviour and hide the sliders.
        useSlider: false,

        // toggleable: [public] Boolean
        //    Whether pane can be opened or closed by clicking the title bar.
        toggleable: true,

        templateString: template,

        controllerWidget: _ComponentTabController,

        _removeCommand: null,

        postMixInProperties: function () {
            this.inherited(arguments);
            this.profile = this.profile || dependency.resolve("epi.shell.Profile");
            this._removeCommand = new RemoveCommand({ model: this });
        },

        startup: function () {
            // summary:
            //    Start the widget. Setup widget styles and initialize its children.
            //
            // tags:
            //    public
            if (this._started) {
                return;
            }
            this.inherited(arguments);

            when(this.profile.get(this.componentId + "_selectedTab"))
                .then(this._selectStoredTab.bind(this));

            if (this.maxHeight) {
                domStyle.set(this.containerNode, "maxHeight", this.maxHeight);
            }
        },

        _selectStoredTab: function (storedTabId) {
            // summary:
            //    Selects the stored tab if it exists as a child to this container.
            // storedTabId: String
            //    The id of the stored tab.
            // tags:
            //    private

            if (!storedTabId) {
                return;
            }
            var children = this.getChildren();
            var storedTabExist = children.some(function (child) {
                return child.id === storedTabId;
            });
            if (storedTabExist) {
                this.selectChild(storedTabId, false, true);
            }
        },

        postCreate: function () {
            this.inherited(arguments);

            this.add("commands", this._removeCommand);

            this.tablist.on("toggle", lang.hitch(this, function (newValue) {
                this._started && this.set("open", newValue);
            }));
        },

        addChild: function (child, position) {
            // summary:
            //  Wraps the added child in a chrome widget before adding it as a child

            var componentChrome = new ComponentChrome({ title: child.get("heading") || "" });
            componentChrome.addChild(child);

            this.inherited(arguments, [componentChrome, position]);

            if (this._started && !componentChrome._started) {
                componentChrome.startup();
            }
        },

        layout: function () {
            // Overrides TabContainer.layout().
            // We need to override the layout function to add our gutter node to the size calculation

            if (!this._contentBox || typeof (this._contentBox.l) == "undefined") {
                return;
            }

            var sc = this.selectedChildWidget;

            if (this.doLayout) {
                // position and size the titles and the container node
                var titleAlign = this.tabPosition.replace(/-h/, "");
                this.tablist.layoutAlign = titleAlign;
                var children = [this.tablist, {
                    domNode: this.tablistSpacer,
                    layoutAlign: titleAlign
                }, {
                    domNode: this.containerNode,
                    layoutAlign: "client"
                }];

                if (this._splitter) {
                    children.push({
                        domNode: this._splitter.domNode,
                        layoutAlign: "bottom"
                    });
                }

                layoutUtils.layoutChildren(this.domNode, this._contentBox, children);

                // Compute size to make each of my children.
                // children[2] is the margin-box size of this.containerNode, set by layoutChildren() call above
                this._containerContentBox = layoutUtils.marginBox2contentBox(this.containerNode, children[2]);

                if (sc && sc.resize) {
                    sc.resize(this._containerContentBox);
                }
            } else {
                // just layout the tab controller, so it can position left/right buttons etc.
                if (this.tablist.resize) {
                    //make the tabs zero width so that they don't interfere with width calc, then reset
                    var s = this.tablist.domNode.style;
                    s.width = "0";
                    var width = domGeometry.getContentBox(this.domNode).w;
                    s.width = "";
                    this.tablist.resize({ w: width });
                }
            }
        },

        resize: function (changeSize) {
            changeSize = lang.mixin({}, changeSize);
            if (!changeSize.h) {
                if (!this.open) {
                    changeSize.h = this._getClosedHeight();
                } else if (this.lastOpenHeight) {
                    changeSize.h = this.lastOpenHeight;
                }
            }

            this.inherited(arguments, [changeSize]);
        },

        getSize: function () {
            var size = domGeometry.getMarginBox(this.domNode);
            if (!this.open) {
                size.h = this._getClosedHeight();
            }
            return size;
        },

        _getClosedHeight: function () {
            var marginExtents = domGeometry.getMarginExtents(this.domNode).h,
                headerHeight = this.tablist ? domGeometry.getMarginBox(this.tablist.domNode).h : 0,
                splitterHeight = this._splitter ? domGeometry.getMarginBox(this._splitter.domNode).h : 0;

            return headerHeight + splitterHeight + marginExtents;
        },

        selectChild: function (/*dijit/_WidgetBase|String*/ page, /*Boolean*/ animate, /*Boolean*/  skipStoringChild) {
            // summary:
            //      Show the given widget (which must be one of my children)
            // page:
            //      Reference to child widget or id of child widget
            // animate:
            //      Flag to determine if it should animate the transition to the page
            // skipStoringChild:
            //      Flag to determine if the id on the selected child should be stored on the profile.

            this.inherited(arguments);

            if (!skipStoringChild) {
                this.profile.set(this.componentId + "_selectedTab", this.selectedChildWidget.id);
            }

            //Set the currently selected tab as the model to the remove command
            this._removeCommand.set("model", this.selectedChildWidget);
        },

        _makeController: function (/*DomNode*/srcNode) {
            var controller = this.inherited(arguments);
            controller.set("title", this.get("heading") || "");
            return controller;
        },

        _setToggleableAttr: function (canToggle) {
            this._set("toggleable", canToggle);

            //Pass the toggleable to the tablist
            this.tablist && this.tablist.set("toggleable", this.toggleable);
        },

        _setOpenAttr: function (open) {
            this.inherited(arguments);

            this.tablist.setOpen(open);

            domStyle.set(this.containerNode, "display", open ? "" : "none");

            if (this._started) {
                if (!open) {
                    this.lastOpenHeight = domGeometry.getMarginBox(this.domNode).h;
                }

                //Emit the toggle event
                this.emit("toggle", this.open);
            }
        }
    });
});
