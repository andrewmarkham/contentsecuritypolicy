require({cache:{
'url:epi/shell/widget/templates/_TabController.htm':"﻿<div class=\"dijitTabListContainer-${tabPosition}\" style=\"visibility:hidden\">\r\n    <div data-dojo-type=\"dijit/Toolbar\" class=\"epi-componentToolbar\" data-dojo-attach-point=\"_toolbar\">\r\n        <div data-dojo-type=\"dijit/form/DropDownButton\" id=\"${id}_addBtn\" class=\"epi-componentToolbarButton epi-componentSettingsContainer epi-mediumButton\" iconClass=\"epi-iconSettingsMenu\" data-dojo-attach-point=\"_addBtn\" showLabel=\"false\" title=\"${res.settingsmenutooltip}\">\r\n            <div data-dojo-type=\"dijit/Menu\" data-dojo-attach-point=\"_addMenu\"></div>\r\n        </div>\r\n    </div>\r\n    <div data-dojo-type=\"dijit.layout._ScrollingTabControllerButton\" class=\"tabStripButton-${tabPosition}\" id=\"${id}_menuBtn\" iconClass=\"dijitTabStripMenuIcon\" data-dojo-attach-point=\"_menuBtn\" showLabel=\"false\">&#9660;</div>\r\n    <div data-dojo-type=\"dijit.layout._ScrollingTabControllerButton\" class=\"tabStripButton-${tabPosition}\" id=\"${id}_leftBtn\" iconClass=\"dijitTabStripSlideLeftIcon\" data-dojo-attach-point=\"_leftBtn\" data-dojo-attach-event=\"onClick: doSlideLeft\" showLabel=\"false\">&#9664;</div>\r\n    <div data-dojo-type=\"dijit.layout._ScrollingTabControllerButton\" class=\"tabStripButton-${tabPosition}\" id=\"${id}_rightBtn\" iconClass=\"dijitTabStripSlideRightIcon\" data-dojo-attach-point=\"_rightBtn\" data-dojo-attach-event=\"onClick: doSlideRight\" showLabel=\"false\">&#9654;</div>\r\n    <div class=\"dijitTabListWrapper\" data-dojo-attach-point=\"tablistWrapper\">\r\n        <div wairole=\"tablist\" data-dojo-attach-event=\"onkeypress:onkeypress\" data-dojo-attach-point=\"containerNode\" class=\"nowrapTabStrip\"></div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi/shell/widget/TabController", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-style",
    "dojo/dom-geometry",
    "dojo/_base/array",
    "dojo/query",
    "dojo/sniff",
    "dijit/layout/ScrollingTabController",
    "dijit/layout/StackController",
    "dijit/layout/utils",
    "dijit/form/DropDownButton",
    "dijit/form/TextBox",
    "dijit/CheckedMenuItem",
    "dijit/InlineEditBox",
    "dijit/Menu",
    "dijit/MenuItem",
    "dijit/PopupMenuItem",
    "dijit/MenuSeparator",
    "dijit/registry",
    "epi/shell/widget/_TabButton",
    "dojo/text!./templates/_TabController.htm",
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.GadgetChrome"
],

function (
    declare,
    lang,
    domStyle,
    domGeom,
    array,
    query,
    has,
    ScrollingTabController,
    StackController,
    layoutUtils,
    DropDownButton,
    TextBox,
    CheckedMenuItem,
    InlineEditBox,
    Menu,
    MenuItem,
    PopupMenuItem,
    MenuSeparator,
    registry,
    _TabButton,
    template,
    res) {

    return declare(ScrollingTabController, {
        // summary:
        //    Controls the tabs in the container.
        //
        // description:
        //    It is used by the epi/shell/widget/TabContainer to
        //    control the tab navigation, addition and removal of new tabs and event handling.
        //
        // tags:
        //    internal

        // buttonWidget: [const] String
        //    Specify the button for every tab in the tab controller.
        buttonWidget: _TabButton,

        // res: Object
        //    Localization resources for the tab controller.
        res: res,

        // useAddMenu: Boolean
        //    Specify if the add button will be displayed or not on the tab controller.
        useAddMenu: true,

        // templateString: String
        //    The layout of the tab controller.
        templateString: template,

        onAddChild: function (/*dijit/_Widget*/page, /*Integer?*/insertIndex) {
            // summary:
            //    Called whenever a page is added to the container.
            //    Create button corresponding to the page.
            //
            // page:
            //    The tab that is beign added to the container.
            //
            // insertIndex:
            //    The position on the container where the new tab will be added.
            //
            // tags:
            //    private

            this.inherited(arguments);
            // hook up to the events on the tab button.
            this.connect(page.controlButton, "onClick", lang.hitch(this, "onButtonClick", page));
            this.connect(page.controlButton, "onClickCloseButton", lang.hitch(this, "onCloseButtonClick", page));
            this.connect(page.controlButton, "onCloseMenuItem", lang.hitch(this, "onCloseButtonClick", page));
            this.connect(page.controlButton, "onLayoutClick", lang.hitch(this, "onLayoutChanged", page));
            this.connect(page.controlButton, "onTabTitleChanged", lang.hitch(this, "onTabTitleChanged", page));

            // make sure all tabs have the same length
            if (!this.isLeftToRight() && has("ie") && this._rectifyRtlTabList) {
                this._rectifyRtlTabList();
            }

            var menuItem;
            if (this.useMenu) {
                var containerId = this.containerId;
                menuItem = new MenuItem({
                    id: page.id + "_stcMi",
                    label: page.title,
                    dir: page.dir,
                    lang: page.lang,
                    onClick: lang.hitch(this, function () {
                        var container = registry.byId(containerId);
                        container.selectChild(page);
                    })
                });
                this._menuChildren[page.id] = menuItem;
                this._menu.addChild(menuItem, insertIndex);
            }

            // Increment the width of the wrapper when a tab is added
            // This makes sure that the buttons never wrap.
            // The value 200 is chosen as it should be bigger than most
            // Tab button widths.
            domStyle.set(this.containerNode, "width", (domStyle.get(this.containerNode, "width") + 200) + "px");

            //check the layout menu item for the configured number of columns
            var targetColumn = page.params.numberOfColumns || 1;
            var layoutOption = page.controlButton.menuLayout.getChildren()[targetColumn - 1];
            layoutOption && layoutOption.set("checked", true);

            var numberOfTabs = this.getChildren().length;

            for (var button in this.pane2button) {
                this.pane2button[button].closeTabMenuItem.set("disabled", (numberOfTabs === 1 ? true : false));
            }

        },

        _initButtons: function () {
            // summary:
            //    Creates the buttons used to scroll to view tabs that
            //    may not be visible if the TabContainer is too narrow.
            //
            // tags:
            //    private

            this._menuChildren = {};

            // Make a list of the buttons to display when the tab labels become
            // wider than the TabContainer, and hide the other buttons.
            // Also gets the total width of the displayed buttons.
            this._btnWidth = 0;
            this._buttons = query("> .tabStripButton", this.domNode).filter(function (btn) {
                if ((this.useMenu && btn === this._menuBtn.domNode) ||
            (this.useAddMenu && btn === this._addBtn.domNode) ||
            (this.useSlider && (btn === this._rightBtn.domNode || btn === this._leftBtn.domNode))) {
                    this._btnWidth += domGeom.getMarginBox(btn).w;
                    return true;
                } else {
                    domStyle.set(btn, "display", "none");
                    return false;
                }
            }, this);

            if (this.useMenu) {
                // Create the menu that is used to select tabs.
                this._menu = new Menu({
                    id: this.id + "_menu",
                    dir: this.dir,
                    lang: this.lang,
                    targetNodeIds: [this._menuBtn.domNode],
                    leftClickToOpen: true,
                    refocus: false	// selecting a menu item sets focus to a TabButton
                });
                this._supportingWidgets.push(this._menu);
            }

            domStyle.set(this._addBtn.domNode, "display", this.useAddMenu ? "" : "none");
        },

        addAddMenuItem: function (/*Object*/itemProperties) {
            // summary:
            //    Create a new menu item in the add menu of the tab controller.
            //
            // description:
            //    Create a new menu item in the add menu of the tab controller.
            //    The menu item will only be created when the property useAddMenu is set to true.
            //
            // itemProperties:
            //    Constructor properties for the dijit/MenuItem.
            //
            // tags:
            //    public
            if (!this.useAddMenu) {
                console.log("epi.shell.widget.TabController: Menu item not added since useAddMenu option is disabled");
                return;
            }

            var menuItem = null;
            if (itemProperties.type && itemProperties.type === "checkedmenuitem") {
                menuItem = new CheckedMenuItem(itemProperties);
            } else {
                menuItem = new MenuItem(itemProperties);
            }

            if (menuItem) {
                this._addMenu.addChild(menuItem);
            }
        },

        resize: function (/*Object*/dim) {
            // summary:
            //    Hides or displays the buttons used to scroll the tab list and launch the menu
            //    that selects tabs.
            //
            // dim:
            //    Object representing the new dimensions of the tab controller.
            //
            // tags:
            //    public
            if (this.domNode.offsetWidth === 0) {
                return;
            }

            // Save the dimensions to be used when a child is renamed.
            this._dim = dim;

            // Set my height to be my natural height (tall enough for one row of tab labels),
            // and my content-box width based on margin-box width specified in dim parameter.
            // But first reset scrollNode.height in case it was set by layoutChildren() call
            // in a previous run of this method.
            this.scrollNode.style.height = "auto";
            this._contentBox = layoutUtils.marginBox2contentBox(this.domNode, { h: 0, w: dim.w });
            this._contentBox.h = this.scrollNode.offsetHeight;
            domGeom.setContentSize(this.domNode, this._contentBox);

            // Show/hide the left/right/menu navigation buttons depending on whether or not they
            // are needed.
            var enable = this._enableBtn(this._contentBox.w);
            this._buttons.style("display", enable ? "" : "none");

            // Position and size the navigation buttons and the tablist
            this._leftBtn.layoutAlign = "left";
            this._rightBtn.layoutAlign = "right";
            this._menuBtn.layoutAlign = this.isLeftToRight() ? "right" : "left";
            this._addBtn.layoutAlign = this.isLeftToRight() ? "right" : "left";


            layoutUtils.layoutChildren(this.domNode, this._contentBox, [this._addBtn, this._menuBtn, this._leftBtn, this._rightBtn, { domNode: this.scrollNode, layoutAlign: "client"}]);

            // set proper scroll so that selected tab is visible
            if (this._selectedTab) {
                if (this._anim && this._anim.status() === "playing") {
                    this._anim.stop();
                }
                var w = this.scrollNode,
                    sl = this._convertToScrollLeft(this._getScrollForSelectedTab());
                w.scrollLeft = sl;
            }

            // Enable/disabled left right buttons depending on whether or not user can scroll to left or right
            this._setButtonClass(this._getScroll());

            domStyle.set(this._toolbar.domNode, "height", domGeom.position(this.domNode).h + "px");

            this._postResize = true;
        },

        onSelectChild: function (/*dijit/_Widget*/page) {
            // summary:
            //    Raised when a tab is selected.
            //
            // page:
            //    The current tab on the tab container.
            //
            // tags:
            //    callback public
            if (!page) {
                return;
            }

            if (this._currentChild) {
                this.pane2button[this._currentChild.id].toggleMenu(false);
            }

            this.pane2button[page.id].toggleMenu(true);

            array.some(this._addMenu.getChildren(), function (menu) {
                if (menu.rearrangeGadgets) {
                    menu.rearrangeGadgets(page.containerUnlocked);
                    return;
                }
            });

            this.inherited(arguments);
        },

        onLayoutChanged: function (/*dijit/_Widget*/page, /*Event*/evt) {
            // summary:
            //    Raised when user choose a new layout for the tabs.
            //
            // page:
            //    The current tab on the tab container.
            //
            // evt:
            //    Event fired by the layout menu item.
            //
            // tags:
            //    callback public
        },

        onTabTitleChanged: function (/*dijit/_Widget*/page, /*String*/value) {
            // summary:
            //    Raised when the tab is renamed.
            //
            // page:
            //    The current tab on the tab container.
            //
            // value:
            //    The new tab's name.
            //
            // tags:
            //    callback public
        },

        onAddGadget: function (/*Event*/evt) {
            // summary:
            //    Raised when the add gadget menu item is selected.
            //
            // evt:
            //    Event fired by the add gadget button.
            //
            // tags:
            //    callback public
        }
    });
});
