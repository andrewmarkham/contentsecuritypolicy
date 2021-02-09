require({cache:{
'url:epi-cms/widget/templates/_CategoryTreeNode.html':"﻿<div class=\"dijitTreeNode epi-categoryTreeNode\" role=\"presentation\">\r\n    <a href=\"#\" tabIndex=\"-1\" data-dojo-attach-point=\"rowNode\" class=\"dijitTreeRow\" role=\"presentation\">\r\n        <div data-dojo-attach-point=\"indentNode\" class=\"dijitInline\"></div>\r\n        <span data-dojo-attach-point=\"contentNode\" class=\"dijitTreeContent\" role=\"presentation\">\r\n            <span data-dojo-attach-point=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"labelNode\" class=\"dijitTreeLabel epi-categoryTreeLabel\" role=\"treeitem\"\r\n                  tabindex=\"-1\" aria-selected=\"false\" data-dojo-attach-event=\"onclick:_onLabelClick, keyup:_onLabelKeyUp\">\r\n            </span>\r\n        </span>\r\n    </a>\r\n    <div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\r\n</div>"}});
﻿define("epi-cms/widget/_CategoryTreeNode", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/keys",

    "dojo/text!./templates/_CategoryTreeNode.html",
    // dijit
    "dijit/_TemplatedMixin",
    "dijit/form/CheckBox",
    // epi
    "epi",
    "epi-cms/widget/_ContentTreeNode"
],

function (
// dojo
    declare,
    lang,

    domClass,
    domConstruct,
    keys,

    template,
    // dijit
    _TemplatedMixin,
    CheckBox,
    // epi
    epi,
    _ContentTreeNode
) {

    return declare([_ContentTreeNode, _TemplatedMixin], {
        // summary:
        //      A customized treenode for page tree
        //      Redefine template string. Use <a> tag to be able to drag in IE
        // tags:
        //      internal

        templateString: template,

        _checkbox: null,

        // checked: [Boolean] public
        //      Indicate that the current node is checked or not
        checked: false,

        postCreate: function () {
            // summary:
            //      Place checkbox into the tree node after node created.
            // tags:
            //      protected

            this.inherited(arguments);

            domClass.add(this.iconNode, "dijitHidden");

            this._checkbox = this._createCheckbox();
        },

        _createCheckbox: function () {
            // summary:
            //      Create checkbox for the tree node.
            // tags:
            //      private

            if (!this.item.selectable) {
                return;
            }

            var container = domConstruct.create("span", {
                "class": "epi-checkboxNode dijitTreeExpando"
            });

            var checkbox = new CheckBox({
                name: "checkboxCategory",
                value: this.item.id,
                tabIndex: -1,
                checked: false,
                onChange: lang.hitch(this, function (checked) {
                    this.onNodeSelectChanged(checked, this.item);
                })
            });

            checkbox.placeAt(container);
            domConstruct.place(container, this.expandoNode, "after");

            return checkbox;
        },

        onNodeSelectChanged: function (checked, item) {
            // summary:
            //      on checkbox clicked event.
            // tags:
            //      public callback
        },

        _onLabelClick: function () {
            // summary:
            //      clicking the label toggles the checkbox
            // tags:
            //      private

            if (!this._checkbox) {
                return;
            }

            this.set("checked", !this._checkbox.checked);
        },

        _onLabelKeyUp: function (evt) {
            // summary:
            //      pressing a key on the label toggles the checkbox
            // tags:
            //      private

            if (evt.keyCode === keys.SPACE || evt.keyCode === keys.ENTER) {
                this._onLabelClick();
            }
        },

        _setCheckedAttr: function (checked) {
            // summary:
            //      Check/UnCheck the node.
            // tags:
            //      public

            if (!this._checkbox) {
                return;
            }

            this._set("checked", checked);
            this._checkbox.set("checked", checked);
        },

        _setTotalSelectedNodesAttr: function (/*Int*/totalItems) {
            // summary:
            //      update label of the tree node.
            // totalItems:
            //      Total selected child nodes
            // tags:
            //      public

            var originalLabel = this.tree.model.getLabel(this.item),
                addTotal = !this.isExpanded && totalItems > 0;

            this.labelNode.innerHTML = addTotal ? originalLabel + " (" + totalItems + ")" : originalLabel;
        }
    });

});
