require({cache:{
'url:epi/shell/widget/templates/_TabButton.htm':"﻿<div role=\"presentation\" data-dojo-attach-point=\"titleNode,innerDiv,tabContent\" class=\"dijitTabInner dijitTabContent\">\r\n\t<img src=\"${_blankGif}\" alt=\"\" class=\"dijitIcon dijitTabButtonIcon\" data-dojo-attach-point=\"iconNode\"/>\r\n    <span class=\"tabLabel\" data-dojo-attach-point=\"tabName,containerNode,focusNode\"></span>\r\n    <input type=\"text\" style=\"display:none;\" class=\"tabLabel\" data-dojo-attach-point=\"editBox\" data-dojo-attach-event=\"onblur: _editBoxBlur, onkeypress: _editBoxKeyDown\" maxlength=\"50\" />\r\n\t<span class=\"dijitInline dijitTabCloseButton dijitTabCloseIcon\" data-dojo-attach-point=\"closeNode\" role=\"presentation\">\r\n\t\t<span data-dojo-attach-point=\"closeText\" class=\"dijitTabCloseText\">[x]</span>\r\n    </span>\r\n    <span class=\"dijitInline\" role=\"presentation\">\r\n        <div data-dojo-type=\"dijit/form/DropDownButton\" data-dojo-attach-point=\"nodeOptions\" showLabel=\"false\" title=\"\" iconClass=\"epi-iconSettingsMenu\" class=\"epi-mediumButton epi-chromelessButton\" style=\"display: none\" data-dojo-attach-event=\"onMouseDown: onMenuButton\">\r\n            <div data-dojo-type=\"dijit/Menu\" data-dojo-attach-point=\"dropDown\">\r\n                <div data-dojo-type=\"dijit/MenuItem\" data-dojo-attach-event=\"onClick: onRenameMenuItem\">${res.menuitemrename}</div>\r\n                <div data-dojo-type=\"dijit/PopupMenuItem\">\r\n                    <span>${res.menuitemlayout}</span>\r\n                    <div data-dojo-type=\"dijit/Menu\" data-dojo-attach-point=\"menuLayout\">\r\n                        <div data-dojo-type=\"dijit/CheckedMenuItem\" checked=\"false\" title=\"${res.menuitemlayout1}\" data-dojo-props=\"column: 1\" data-dojo-attach-event=\"onClick: onLayoutClick\">${res.menuitemlayout1}</div>\r\n                        <div data-dojo-type=\"dijit/CheckedMenuItem\" checked=\"false\" title=\"${res.menuitemlayout2}\" data-dojo-props=\"column: 2\" data-dojo-attach-event=\"onClick: onLayoutClick\">${res.menuitemlayout2}</div>\r\n                        <div data-dojo-type=\"dijit/CheckedMenuItem\" checked=\"false\" title=\"${res.menuitemlayout3}\" data-dojo-props=\"column: 3\" data-dojo-attach-event=\"onClick: onLayoutClick\">${res.menuitemlayout3}</div>\r\n                    </div>\r\n                </div>\r\n                <div data-dojo-type=\"dijit/MenuSeparator\"></div>\r\n                <div data-dojo-type=\"dijit/MenuItem\" data-dojo-attach-point=\"closeTabMenuItem\" data-dojo-attach-event=\"onClick: onCloseMenuItem\">${res.menuitemclose}</div>\r\n            </div>\r\n        </div>\r\n    </span>\r\n</div>"}});
﻿define("epi/shell/widget/_TabButton", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/has",
    "dojo/keys",
    "dijit/focus",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/_TextBoxMixin",
    "dijit/layout/TabController",
    "dojox/html/entities",
    "dojo/text!./templates/_TabButton.htm",
    "epi/i18n!epi/shell/ui/nls/EPiServer.Shell.UI.Resources.TabContainer"
], function (array, declare, dom, domStyle, has, keys, focus, _WidgetsInTemplateMixin, _TextBoxMixin, TabController, entities, template, res) {

    return declare([TabController.TabButton, _WidgetsInTemplateMixin], {
        // summary:
        //    The button to be used on every tab in the tab container.
        //
        // description:
        //    Contains the title of the pane, and optionally a close-button to destroy the pane.
        //    This is an internal widget and should not be instantiated directly.
        //
        // tags:
        //    internal

        // res: [private] Object
        //    Localization resources for the tab button.
        res: res,

        // editing: [private] Boolean
        //    Boolean flag telling whether this tab is in editable state
        editing: false,

        // tabCurrentName: [public] String
        //    the tab's current name.
        tabCurrentName: "",

        // templateString: [protected] String
        //    The layout of the tab button.
        templateString: template,

        buildRendering: function () {
            this.inherited(arguments);

            // TODO: We should reconcile the names for gadget heading properties. (bemc + mast)
            this.label = this.page.personalizableHeading || this.page.heading || this.page.title || this.title || this.res.newtabname;

            // wire up the layout settings menu options.
            array.forEach(this.menuLayout.getChildren(), function (child) {
                // Add the connection to the menu item so its properly destroyed by dijit/_Widget
                child.connect(child, "onChange", this.onChangeLayout);
            }, this);

            if (!this.closeButton) {
                this.closeTabMenuItem.set("disabled", true);
            }

        },

        onChangeLayout: function (/*Boolean*/checked) {
            // summary:
            //    Raised when a checkbox value has changed
            //
            // checked:
            //    Flag determining whether an layout menu option for the current tab is visible or not.
            //
            // tags:
            //    public callback
            if (checked) {
                array.forEach(this.getParent().getChildren(), function (child) {
                    child.set("checked", false);
                });
            }
            this.set("checked", true);
        },

        onLayoutClick: function (/*Event*/evt) {
            // summary:
            //    Raised when a checkbox in the layout menu is clicked
            //    It will notify the tabController that the layout need to be changed.
            //
            // evt:
            //    Event fired by the layout menu item.
            //
            // tags:
            //    public callback
        },

        onTabTitleChanged: function (/*String*/value) {
            // summary:
            //    Raised when the title of the tab is changed.
            //
            // value: String
            //    The new tab title
            //
            // tags:
            //    public callback
        },

        onMenuButton: function (/*Event*/evt) {
            // summary:
            //    Raised when the dropdown button is clicked.
            //    This is done to keep focus on the dropdown so the menu doesn't close.
            //
            // evt:
            //    Event fired by the tab's dropdown button.
            //
            // tags:
            //    public callback
            evt.stopPropagation();
        },

        onRenameMenuItem: function (/*Event*/evt) {
            // summary:
            //    Raised when the rename menu item is clicked.
            //
            // evt:
            //    Event fired by the rename menu item.
            //
            // tags:
            //    public callback

            var currentValue = entities.decode(this.tabName.innerHTML);
            if (currentValue) {
                this._lastNonEmptyValue = currentValue;
            }

            this._setTabTitleEditable(true);
            evt.stopPropagation();
        },

        onCloseMenuItem: function (/*Event*/evt) {
            // summary:
            //    Raised when the close menu item is clicked.
            //
            // evt:
            //    Event fired by the close menu item.
            //
            // tags:
            //    public callback
            evt.stopPropagation();
        },

        onClick: function (/*Event*/evt) {
            // summary:
            //    Raised when the tab is clicked.
            //
            // evt:
            //    Event fired by the selected tab.
            //
            // tags:
            //    public callback
        },

        toggleMenu: function (/*Boolean*/selected) {
            // summary:
            //    Updates visibility of the drop-down menu based on the current tab selection
            //
            // selected: Boolean
            //    Flag determining whether the drop down menu is visible or not.
            //
            // tags:
            //    private
            domStyle.set(this.nodeOptions.domNode, "display", selected ? "" : "none");
        },

        _editBoxBlur: function (/*Event*/evt) {
            // summary:
            //    Called when the edit box loses focus
            //
            // evt:
            //    Event fired by the tabname edit box.
            //
            // tags:
            //    private
            if (this.editing) {
                this._saveTabTitleChanges();
            } else {
                this._setTabTitleEditable(false);
            }
        },

        // _lastNonEmptyValue: [private] String
        //    Preserves the last non-empty value
        _lastNonEmptyValue: null,

        _editBoxKeyDown: function (/*Event*/evt) {
            // summary:
            //    Handles key down events in the tab title edit box to save changes and prevent the tab controller from switching tabs for arrow keys.
            //
            // evt:
            //    Event fired by the tabname edit box.
            //
            // tags:
            //    private
            if (!this.editing) {
                return;
            }

            var k = keys;
            switch (evt.keyCode) {
                case k.LEFT_ARROW:
                case k.RIGHT_ARROW:
                case k.DELETE:
                    // Prevent the event from propagating to the tab controller.
                    evt.stopPropagation();
                    break;
                case k.ESCAPE:
                    // restore last value
                    this._saveTabTitleChanges(true);
                    break;
                case k.ENTER:
                    // Save changes (and disable edit)
                    this._saveTabTitleChanges(false);
                    break;
            }
        },

        _setTabTitleEditable: function (/*Boolean*/editable, /* String? */text) {
            // summary:
            //    Toggles editability of the tab title
            //
            // editable:
            //    Boolean determining whether the tab title is editable or not.
            //
            // tags:
            //    private
            this.editing = editable;

            // Makes the edit box selectable, since the tab is unselectable otherwise
            dom.setSelectable(this.focusNode, editable);

            if (editable) {
                domStyle.set(this.tabName, "display", "none");
                domStyle.set(this.editBox, "display", "");

                if (text) {
                    this.editBox.value = text;
                } else {
                    this.editBox.value = entities.decode(this.tabName.innerHTML);
                }

                _TextBoxMixin.selectInputText(this.editBox);
                focus.focus(this.editBox);
            } else {
                domStyle.set(this.editBox, "display", "none");
                domStyle.set(this.tabName, "display", "");
                this.editBox.value = "";
                if (has("ie")) {
                    // Trigger hasLayout to make IE redraw the tab properly (both lines required)
                    domStyle.set(this.domNode, "zoom", "1");
                    domStyle.set(this.domNode, "zoom", "");
                }
                focus.focus(this.focusNode);
            }
        },

        _saveTabTitleChanges: function (/*Boolean*/restoreLastNonEmptyValue) {
            // summary:
            //    Saves the changes from the tab title and reverts it to a non-editable state.
            //
            // restoreLastNonEmptyValue:
            //    Boolean determining whether to restore the old value or the newly entered.
            // tags:
            //    private

            var validValueToSave = this.editBox.value;

            // in case of esc, restore the last value (it should always be a non-empty)
            if (restoreLastNonEmptyValue) {
                validValueToSave = this._lastNonEmptyValue;
            }
            this.tabName.innerHTML = entities.encode(validValueToSave);
            this.onTabTitleChanged(validValueToSave);
            this._setTabTitleEditable(false);
        },

        revertTabTitleChanges: function (/*Boolean*/editable, /*String*/tabValue, /*String?*/inputValue) {
            // summary:
            //      Reverts the tab title.
            // editable:
            //      Set the tab in an editable state if set to true
            // tags:
            //      public

            this.tabName.innerHTML = entities.encode(tabValue);
        },

        _setCloseButtonAttr: function (/*Boolean*/disp) {
            // summary:
            //    This method on the base class add a context menu and configure the close button,
            //    since we're not using it, just hide the close button.
            //
            // disp:
            //    Flag determining if the close button should be visible or not.
            //
            // tags:
            //    private
            domStyle.set(this.closeNode, "display", "none");
        },

        _setLabelAttr: function (/*String*/content) {
            // summary:
            //    Hook for attr('label', ...) to work.
            //
            // description:
            //    takes an HTML string.
            //    Inherited ToggleButton implementation will Set the label (text) of the button;
            //    Need to set the alt attribute of icon on tab buttons if no label displayed
            //
            // content:
            //    The button name.
            //
            // tags:
            //    private
            this.tabName.innerHTML = entities.encode(content);
        }

    });
});
