require({cache:{
'url:epi-cms/widget/templates/ContentType.html':"﻿<li class=\"clearfix\" data-dojo-attach-event=\"onkeypress:_onKeyPress, onmouseover:_onMouseOver, onmouseout:_onMouseOut\" data-dojo-attach-point=\"focusNode\">\r\n    <div class=\"epi-browserWindow\"><div class=\"epi-browserWindowContent\" data-dojo-attach-point=\"iconNode\">${emptyIconTemplate}</div></div>\r\n    <h3 data-dojo-attach-point=\"nameNode\"></h3>\r\n    <p data-dojo-attach-point=\"descriptionNode\"></p>\r\n</li>"}});
﻿define("epi-cms/widget/ContentType", [
    "dojo",
    "dojo/dom-class",
    "dojo/string",

    "dijit/focus",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",

    "epi/i18n!epi/cms/nls/episerver.cms.widget.pagetype",
    "dojo/text!./templates/ContentType.html"
], function (dojo, domClass, string, focus, _Widget, _TemplatedMixin, i18n, template) {

    return dojo.declare([_Widget, _TemplatedMixin], {
        // summary:
        //		Widget for displaying content type information.
        //
        // tags:
        //      internal

        // templateString: [protected] String
        //		The widget template.
        templateString: template,

        // contentType: [public] Object
        //		The content type to be displayed.
        contentType: null,

        // iconTemplate: [public] String
        //		The template used when an icon image is provided.
        iconTemplate: "<img src=\"${0}\" alt=\"${1}\" class=\"epi-preview\" />",

        // emptyIconTemplate: [public] String
        //		The template used when no icon image is provided.
        emptyIconTemplate: string.substitute("<div class=\"epi-noPreviewIcon\"><span class=\"epi-noPreview\">${0}</span></div>", [i18n.nopreview]),

        buildRendering: function () {
            // summary:
            //		Construct the UI with the initial content type.
            // tags:
            //		protected

            this.inherited(arguments);

            this.connect(this.domNode, "onclick", this._onClick);
            this.render();
        },

        render: function () {
            // summary:
            //		Render the content type information.
            // tags:
            //		public

            var type = this.contentType;
            if (type) {
                this.set("name", type.localizedName);
                this.set("description", type.localizedDescription || i18n.nodescription);
                this.set("icon", type.imagePath);
            }
        },

        _setContentTypeAttr: function (value) {
            this._set("contentType", value);
            if (this._created) {
                this.render();
            }
        },

        _setNameAttr: { node: "nameNode", type: "innerText" },

        _setDescriptionAttr: { node: "descriptionNode", type: "innerText" },

        _setIconAttr: function (value) {
            this._set("icon", value);
            this.iconNode.innerHTML = value ? string.substitute(this.iconTemplate, [value, this.name]) : this.emptyIconTemplate;
        },

        focus: function () {
            this.inherited(arguments);

            domClass.add(this.focusNode, "epi-advancedListingItemActive");

            focus.focus(this.focusNode);
        },

        _onBlur: function () {
            this.inherited(arguments);

            domClass.remove(this.focusNode, "epi-advancedListingItemActive");
        },

        _onKeyPress: function (e) {
            //Fire click when pressing the enter/space key
            if (e.keyCode === 13 || e.keyCode === 32) {
                this.onSelect(this.contentType);
            }
        },

        _onClick: function () {
            // summary:
            //    Raised when the widget is clicked.
            //
            // tags:
            //   private

            this.onSelect(this.contentType);
        },

        _onMouseOver: function () {
            domClass.add(this.focusNode, "epi-advancedListingItemActive");
        },
        _onMouseOut: function () {
            domClass.remove(this.focusNode, "epi-advancedListingItemActive");
        },

        onSelect: function (item) {
            // summary:
            //    Raised when the content type is selected.
            //
            // item:
            //    The content type.
            //
            // tags:
            //   public event
        }
    });
});
