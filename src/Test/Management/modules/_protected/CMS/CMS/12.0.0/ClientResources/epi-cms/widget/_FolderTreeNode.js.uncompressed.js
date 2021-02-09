require({cache:{
'url:epi-cms/widget/templates/_FolderTreeNode.html':"﻿<div class=\"dijitTreeNode epi-folderTreeNode\" role=\"presentation\">\r\n    <div tabindex=\"-1\" data-dojo-attach-point=\"rowNode\" class=\"dijitTreeRow\" role=\"presentation\">\r\n        <div data-dojo-attach-point=\"indentNode\" class=\"dijitInline\"></div>\r\n        <span data-dojo-attach-point=\"contentNode\" class=\"dijitTreeContent\" role=\"presentation\">\r\n            <span data-dojo-attach-point=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"extraIconsContainer\" class=\"epi-extraIconsContainer\" role=\"presentation\">\r\n                <span data-dojo-attach-point=\"iconNodeMenu\" class=\"epi-extraIcon dijitTreeIcon\" role=\"presentation\" title=\"${_menuTooltip}\">&nbsp;</span>\r\n                <span data-dojo-attach-point=\"iconNodeLanguage\" class=\"epi-extraIcon epi-ft-currentLanguageMissing\" role=\"presentation\">&nbsp;</span>\r\n            </span>\r\n            <span data-dojo-attach-point=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\"></span>\r\n        </span>\r\n    </div>\r\n    <div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\r\n</div>"}});
﻿define("epi-cms/widget/_FolderTreeNode", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/dom-style",

    "dojo/Evented",
    "dojo/Deferred",
    "dojo/keys",
    "dojo/on",
    "dojo/when",

    "dojox/html/entities",

    // template
    "dojo/text!./templates/_FolderTreeNode.html",
    // dijit
    "dijit/form/TextBox",
    "dijit/form/ValidationTextBox",

    "dijit/InlineEditBox",
    // epi
    "epi",
    "epi-cms/widget/_ContentTreeNode"
],

function (
// dojo
    declare,
    lang,

    domAttr,
    domClass,
    domGeom,
    domStyle,

    Evented,
    Deferred,
    keys,
    on,
    when,
    htmlEntities,
    // template
    template,
    // dijit
    TextBox,
    ValidationTextBox,

    InlineEditBox,
    // epi
    epi,
    _ContentTreeNode
) {

    declare("_TreeInlineEditor", [InlineEditBox._InlineEditor], {
        // tags:
        //      internal

        postCreate: function () {
            this.inherited(arguments);

            this.own(
                on(this.domNode, "mousedown, mouseup, click, keydown, keypress, selectstart", function (e) {
                    e.stopPropagation();
                })
            );
        }
    });

    return declare([_ContentTreeNode, Evented], {
        // summary:
        //      A customized treenode for block folder tree
        // tags:
        //      public

        templateString: template,

        _blockFolderMenu: "epi-iconContextMenu",

        _blockFolderDnDIcon: "epi-iconDnD",

        _blockFolderExpand: "epi-iconObjectFolderOpen",

        _blockFolderCollapse: "epi-iconObjectFolder",

        _isResetValue: false,

        _menuTooltip: undefined,

        contextMenu: null,

        _editWidget: null,

        // _rowStates: Enum flag
        _rowStates: {
            NORMAL: 1,
            EXPANDED: 2,
            ENTERED: 4,
            SELECTED: 8
        },

        _currentRowState: 1, /* NORMAL row state by default */

        postMixInProperties: function () {
            this.inherited(arguments);
            this._menuTooltip = epi.resources.action.options;
        },

        postCreate: function () {
            this.inherited(arguments);

            domStyle.set(this.iconNodeMenu, "zIndex", domGeom.position(this.rowNode).zIndex + 1);
            this._updateStyle();
        },

        buildRendering: function () {
            this.inherited(arguments);

            this.labelWidget = new InlineEditBox({
                value: this.label,
                editorWrapper: "_TreeInlineEditor",
                editor: "dijit/form/ValidationTextBox",
                width: "auto",
                editorParams: { maxLength: 255 },
                _onMouseOver: function () { /* disable style hover*/ },
                _onClick: function () { /* disable default onclick on editor*/ },
                onChange: lang.hitch(this, this._onChangeLabelValue),
                onCancel: lang.hitch(this, function () {
                    this.emit("cancelEdit", this.item.contentLink);
                    this._resetValue();
                    this._setEditorState();
                })
            }, this.labelNode);

        },

        edit: function () {
            //We need to specificly make sure that the value is updated since the model might have changed and dijit/Tree only updates the value
            //for the dom node, thus making the visual value and the value of the label widget out of sync.
            this.labelWidget.value = this.label;

            this.labelWidget.edit();
            this._editWidget = this.labelWidget.wrapperWidget.editWidget;
            this.own(
                on(this._editWidget.domNode, "keydown", lang.hitch(this, function (e) {
                    if (!this._editWidget.isValid() && e.keyCode !== keys.ENTER) {
                        this._setEditorState();
                    }
                }))
            );
        },

        _resetValue: function (val) {
            // summary:
            //      Reset value of folder name
            // val: [String]
            //      The name of folder
            // tags:
            //      private

            this._isResetValue = true;
            this.labelWidget.set("value", val || this.label);
        },

        _onChangeLabelValue: function (val) {
            // summary:
            // tags:
            //      private

            if (!val) {
                this._resetValue();
                return;
            }

            if (!this._isResetValue) {
                this.emit("rename", val);
            }

            // reset flag to default
            this._isResetValue = false;
        },

        _onClick: function (evt) {
            this.inherited(arguments);

            domClass.remove(this.labelNode, "dijitInlineEditBoxDisplayModeHover");
            this.emit("nodeSelected", this);
        },

        rollbackLabel: function (val, error) {
            // summary:
            //      Set error for editor and reset value
            // val: [String]
            //      The value rollback
            // error: [Object]
            //      The error object
            // tags:
            //      public

            // Reset if value is null
            if (!this.labelWidget.value) {
                this._resetValue(val);
            }

            // Show error message
            if (error && error.length > 0) {
                this._setEditorState(error[0].errorMessage);
            }
        },

        bindContextMenu: function (menu) {
            this.contextMenu = menu;
            this.connect(this.iconNodeMenu, "onclick", "_onIconNodeMenuClick");
        },

        collapse: function () {
            var self = this,
                def = new Deferred();

            when(self.inherited(arguments), function () {
                self._currentRowState = self._currentRowState ^ self._rowStates.EXPANDED;
                self._updateStyle();
                // collapse successful trigger event here
                def.resolve(true);
            });

            return def;
        },

        expand: function () {
            var self = this,
                def = new Deferred();

            when(self.inherited(arguments), function () {
                self._currentRowState = self._currentRowState | self._rowStates.EXPANDED;
                self._updateStyle();
                // expand successful trigger event here
                def.resolve();
            });

            return def;
        },

        setSelected: function (/*Boolean*/selected) {

            // If the current item data object is not existing, do nothing
            if (!this.tree.getNodesByItem(this.item)[0]) {
                return;
            }

            this.inherited(arguments);

            var oldState = this._currentRowState;
            this._currentRowState = selected ?
                (this._currentRowState | this._rowStates.SELECTED) :
                parseInt(this._currentRowState & this._rowStates.SELECTED, 10) > 0 ? (this._currentRowState ^ this._rowStates.SELECTED) : oldState;
            this._updateStyle();

            if (selected) {
                this.emit("nodeSelected", this);
            }
        },

        setFocusable: function (hasFocus) {
            this.inherited(arguments);

            domClass.toggle(this.domNode, "epi-folderTreeNode--focused", hasFocus);
        },

        _updateIndividualLayout: function () {
            // summary:
            //      update folder icon is expanded or not
            // tags:
            //      private
            this._updateStyleBySingleState();

            if (this.item && this.item.contentLink) {
                this.emit("nodeRefreshed", this.item.contentLink);
            }
        },

        _updateBlockFolderTypeIcon: function () {
            // summary:
            //      Set page type icon for the tree node
            // tags:
            //      private

            if (this._isTypeOfRoot()) {
                this._iconNodeClass = this.tree.model.getObjectIconClass(this.item, this._blockFolderCollapse);
            } else {
                this._iconNodeClass = this.isExpanded ? this._blockFolderExpand : this._blockFolderCollapse;
            }

            // Add new class
            domClass.add(this.iconNode, this._iconNodeClass);
        },

        _handleMouseEnter: function () {
            this._currentRowState = this._currentRowState | this._rowStates.ENTERED;
            this._updateStyle();
            domClass.remove(this.labelNode, "dijitInlineEditBoxDisplayModeHover");
            domClass.add(this.domNode, "epi-folderTreeNode--hovered");
        },

        _handleMouseLeave: function () {
            this._currentRowState = this._currentRowState ^ this._rowStates.ENTERED;
            this._updateStyle();
            domClass.remove(this.domNode, "epi-folderTreeNode--hovered");
        },

        _onIconNodeMenuClick: function (evt) {
            this.contextMenu && this.contextMenu.scheduleOpen(evt.target, null, { x: evt.pageX, y: evt.pageY });
            this.emit("nodeSelected", this);
        },

        _updateStyleBySingleState: function (singleRowState) {
            // summary:
            //      Update style for single state
            // singleRowState: Flag
            //      Single (basic) state of the row node
            // tags:
            //      Private

            var states = this._rowStates;
            switch (singleRowState) {
                case states.SELECTED:
                case states.ENTERED:
                    if (this.contextMenu) {
                        domClass.add(this.iconNodeMenu, this._blockFolderMenu);
                    }
                    break;
                default:
                    /* Clear all style */
                    if (this.contextMenu) {
                        domClass.remove(this.iconNodeMenu, this._blockFolderMenu);
                    }
                    domClass.remove(this.iconNode, this._blockFolderExpand);
                    domClass.remove(this.iconNode, this._blockFolderCollapse);

                    /* Re-apply necessary styles */
                    var nodeClass = this.isExpanded && this.hasChildren() ? this._blockFolderExpand : this._blockFolderCollapse;
                    domClass.add(this.iconNode, this._isTypeOfRoot() ? this.tree.model.getObjectIconClass(this.item, this._blockFolderCollapse) : nodeClass);

                    if (this.contextMenu && parseInt(this._currentRowState & this._rowStates.SELECTED, 10) > 0) {
                        domClass.add(this.iconNodeMenu, this._blockFolderMenu);
                    }

                    break;
            }
        },

        _updateStyle: function () {
            // summary:
            //      Update the style by the current state
            // tags:
            //      Private

            //don't worry about looking stylish if you're being destroyed
            if (this._destroyed) {
                return;
            }

            for (var singleRowState in this._rowStates) {
                if (parseInt(this._currentRowState & this._rowStates[singleRowState], 10) > 0) {
                    this._updateStyleBySingleState(this._rowStates[singleRowState]);
                }
            }
        },

        _addLanguageIndicator: function () {
            // summary:
            //      Setup missing language branch indicator UI
            // tags:
            //      protected override

            this.inherited(arguments);

            domAttr.remove(this.iconNodeLanguage, "title");
        },

        _setEditorState: function (/*String*/ errorMessage) {
            // summary:
            //      Set state error for editor widget if there are error message, otherwise reset state
            // errorMessage: [String]
            //      The error message
            // tags:
            //      private

            if (this._editWidget) {
                errorMessage = htmlEntities.encode(errorMessage);
                this._editWidget.invalidMessage = errorMessage || "";
                this._editWidget.set("state", errorMessage ? "Error" : "");
                this._editWidget.isValid = function () {
                    return !errorMessage;
                };
                this._editWidget.validate();
            }
        }

    });

});
