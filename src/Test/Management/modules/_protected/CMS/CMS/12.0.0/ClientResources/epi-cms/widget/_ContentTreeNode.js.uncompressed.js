require({cache:{
'url:epi-cms/widget/templates/_ContentTreeNode.html':"﻿<div class=\"dijitTreeNode\" role=\"presentation\">\r\n    <a href=\"#\" tabindex=\"-1\" data-dojo-attach-point=\"rowNode\" class=\"dijitTreeRow\" role=\"presentation\">\r\n        <div data-dojo-attach-point=\"indentNode\" class=\"dijitInline\"></div>\r\n        <span data-dojo-attach-point=\"contentNode\" class=\"dijitTreeContent\" role=\"presentation\">\r\n            <span data-dojo-attach-point=\"expandoNode\" class=\"dijitTreeExpando\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"expandoNodeText\" class=\"dijitExpandoText\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"iconNode\" class=\"dijitIcon dijitTreeIcon\" role=\"presentation\"></span>            \r\n            <span data-dojo-attach-point=\"thumbnailNode\" class=\"epi-thumbnailIcon\" role=\"presentation\"></span>\r\n            <span data-dojo-attach-point=\"extraIconsContainer\" class=\"epi-extraIconsContainer\" role=\"presentation\">\r\n                <span data-dojo-attach-point=\"iconNodeLanguage\" class=\"epi-extraIcon epi-pt-currentLanguageMissing\" role=\"presentation\">&nbsp;</span>\r\n            </span>\r\n            <span data-dojo-attach-point=\"labelNode\" class=\"dijitTreeLabel\" role=\"treeitem\" tabindex=\"-1\" aria-selected=\"false\"></span>\r\n        </span>\r\n    </a>\r\n    <div data-dojo-attach-point=\"containerNode\" class=\"dijitTreeContainer\" role=\"presentation\" style=\"display: none;\"></div>\r\n</div>"}});
﻿define("epi-cms/widget/_ContentTreeNode", [
// dojo
    "dojo/_base/declare",

    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/string",

    // dijit
    "dijit/Tree",
    "dijit/_TemplatedMixin",
    // dojox
    "dojox/html/ellipsis",
    // epi
    "epi-cms/widget/_ContentTreeNodeMixin",
    // template
    "dojo/text!./templates/_ContentTreeNode.html"
],

function (
// dojo
    declare,
    domClass,
    domConstruct,
    string,

    // dijit
    Tree,
    _TemplatedMixin,
    // dojox
    htmlEllipsis,
    // epi
    _ContentTreeNodeMixin,
    // template
    templateString
) {

    return declare([Tree._TreeNode, _TemplatedMixin, _ContentTreeNodeMixin], {
        // summary:
        //      A customized treenode for page tree
        // description:
        //      Redefine template string. Use <a> tag to be able to drag in IE
        // tags:
        //      internal

        templateString: templateString,

        buildRendering: function () {
            this.inherited(arguments);

            domClass.add(this.labelNode, "dojoxEllipsis");
        },

        _setItemAttr: function (item) {

            this._set("item", item);
            this.set("dndData", item);

            if (item && item.thumbnailUrl) {
                var image = domConstruct.create("img", {
                    src: item.thumbnailUrl + string.substitute("?${0}", [new Date().getTime()]),
                    "class": "epi-thumbnail"
                });
                this.thumbnailNode.appendChild(image);
                domClass.add(this.contentNode, "epi-mediaContent");
            }

            this.inherited(arguments);
        }

    });

});
