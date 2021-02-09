require({cache:{
'url:epi-cms/widget/templates/ContentTypeGroup.html':"﻿<div class=\"epi-listingContainer\" data-dojo-attach-point=\"focusNode\" tabIndex=\"${tabIndex}\">\r\n    <h2 data-dojo-attach-point=\"titleNode\" class=\"epi-ribbonHeader\"></h2>\r\n    <ul data-dojo-attach-point=\"containerNode\" class=\"epi-advancedListing\"></ul>\r\n</div>"}});
﻿define("epi-cms/widget/ContentTypeGroup", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/dom-style",
    "dojo/text!./templates/ContentTypeGroup.html",

    "dijit/_TemplatedMixin",
    "dijit/layout/_LayoutWidget",

    "epi-cms/widget/ContentType",
    "dojo/keys",
    "dijit/_KeyNavContainer"
], function (declare, lang, array, domStyle, template, _TemplatedMixin, _LayoutWidget, ContentType, keys, _KeyNavContainer) {

    return declare([_LayoutWidget, _TemplatedMixin, _KeyNavContainer], {
        // summary:
        //		Displays a group of content types under a common heading.
        //
        // tags:
        //      internal

        // title: [public] String
        //		The title for the content type group.
        title: "",

        // contentTypes: [public] Array
        //		Collection of content types that are displayed in the group.
        contentTypes: null,

        // templateString: [protected] String
        //		A string that represents the widget template.
        templateString: template,

        buildRendering: function () {
            // summary:
            //		Construct the UI with the initial content types
            // tags:
            //		protected

            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);

            this.render();

            this.connectKeyNavHandlers(
                this.isLeftToRight() ? [keys.LEFT_ARROW, keys.UP_ARROW] : [keys.RIGHT_ARROW, keys.DOWN_ARROW],
                this.isLeftToRight() ? [keys.RIGHT_ARROW, keys.DOWN_ARROW] : [keys.LEFT_ARROW, keys.UP_ARROW]
            );
        },

        render: function () {
            // summary:
            //		Render the group with the current content types. This will
            //		destroy the current view if it exists.
            // tags:
            //		public

            this.clear();
            array.forEach(this.contentTypes, function (type) {
                var child = new ContentType({ contentType: type });
                this.connect(child, "onSelect", this.onSelect);
                this.addChild(child);
            }, this);
        },

        clear: function () {
            // summary:
            //		Destroys the current view.
            // tags:
            //		public

            array.forEach(this.getChildren(), function (child) {
                this.removeChild(child);
                child.destroyRecursive();
            }, this);
        },

        _setTitleAttr: { node: "titleNode", type: "innerText" },

        _setContentTypesAttr: function (value) {
            this._set("contentTypes", value);
            if (this._created) {
                this.render();
            }
        },

        onSelect: function (/*===== item =====*/) {
            // summary:
            //		Callback that is executed when an item in this
            //		group is selected.
            // tags:
            //		callback
        },

        setVisibility: function (display) {
            // summary:
            //    Set the group's visibility
            //
            // display:
            //    Flag states if the group will be shown or not.
            //
            // tags:
            //    public
            var value = (display ? "block" : "none");
            domStyle.set(this.domNode, "display", value);
        }
    });
});
