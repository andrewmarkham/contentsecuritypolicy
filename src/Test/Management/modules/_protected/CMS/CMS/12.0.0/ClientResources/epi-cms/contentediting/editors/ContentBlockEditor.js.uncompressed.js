require({cache:{
'url:epi-cms/contentediting/editors/templates/ContentBlockEditor.html':"﻿<div class=\"epi-content-block-editor\">\r\n    <a href=\"#\" data-dojo-attach-point=\"itemNode\" style=\"display: block;\" data-dojo-attach-event=\"onclick:_onClick\">\r\n        <span data-dojo-attach-point=\"contentNode\" class=\"epi-content-block-node\">\r\n            <span data-dojo-attach-point=\"labelNode\" class=\"dojoxEllipsis\"></span>\r\n            <span data-dojo-attach-point=\"extraIconsContainer\" class=\"epi-floatRight\">\r\n                <span data-dojo-attach-point=\"iconNodeMenu\" class=\"epi-iconContextMenu\" style=\"visibility: hidden;\" data-dojo-attach-event=\"onclick:_onContextMenu\"></span>\r\n            </span>\r\n        </span>\r\n    </a>\r\n</div>"}});
﻿define("epi-cms/contentediting/editors/ContentBlockEditor", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/event",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/html",
    "dojo/NodeList-dom",
    "dojo/query",

    //Dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/popup",

    // Dojox
    "dojox/html/ellipsis",

    // EPi Framework
    "epi/shell/widget/_ModelBindingMixin",

    // EPi CMS
    "epi-cms/contentediting/editors/ContentBlockEditorViewModel",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.blockcontextmenu",

    "dojo/text!./templates/ContentBlockEditor.html",

    "dojo/NodeList-manipulate"

], function (

    // Dojo
    declare,
    Deferred,
    event,
    domAttr,
    domClass,
    domStyle,
    html,
    NodeList,
    query,

    // Dijit
    _Widget,
    _TemplatedMixin,
    pm,

    // Dojox
    ellipsis,

    // EPi Framework
    _ModelBindingMixin,

    //EPi
    ContentBlockEditorViewModel,

    //Resources
    res,

    template
) {

    return declare([_Widget, _TemplatedMixin, _ModelBindingMixin], {
        // summary:
        //      The editor for an content.
        //
        // tags:
        //      internal xproduct

        // templateString: String
        //      UI template for content editor
        templateString: template,

        // model: Object
        //      Content block editor view model
        model: null,

        contextMenu: null,

        isDraggable: true,

        modelBindingMap: {
            contentLink: ["contentLink"],
            name: ["name"],
            contentGroup: ["contentGroup"],
            roleIdentities: ["roleIdentities"],
            selected: ["selected"]
        },

        _setSelectedAttr: function (isSelected) {
            this.inherited(arguments);

            domClass.toggle(this.itemNode, "epi-content-block-editor-node-selected", isSelected);
            domStyle.set(this.iconNodeMenu, "visibility", isSelected ? "visible" : "hidden");
        },

        _setNameAttr: function (value) {
            this.inherited(arguments);

            query(this.labelNode).text(value);
            domAttr.set(this.iconNodeMenu, "title", res.settingstooltip);
        },

        postMixInProperties: function () {
            this.inherited(arguments);
            this.model = this.model || new ContentBlockEditorViewModel(this.modelData);
        },

        _setIsDraggableAttr: function (isDraggable) {
            this._set("isDraggable", isDraggable);

            if (this.isDraggable) {
                domClass.add(this.domNode, "dojoDndItem");
            } else {
                domClass.remove(this.domNode, "dojoDndItem");
            }
        },

        _onClick: function (evt) {
            event.stop(evt);
            this.contextMenu && pm.close(this.contextMenu);

            this.model.set("selected", !this.model.selected);
        },

        _onContextMenu: function (evt) {
            // summary:
            //      Handler onclick event on iconNodeMenu to show context menu manually.
            // tags:
            //      Private

            event.stop(evt);
            this.contextMenu && this.contextMenu.scheduleOpen(evt.target, null, { x: evt.pageX, y: evt.pageY });
        }
    });
});
