require({cache:{
'url:epi-cms/widget/templates/ContentReferences.html':"﻿<div class=\"epi-contentReferences\">\r\n    <div data-dojo-attach-point=\"contentReferencesNotificationBar\" class=\"epi-notificationBar epi-notificationBarWithBorders epi-notificationBarItem\">\r\n        <div data-dojo-attach-point=\"contentReferencesNotificationNode\" class=\"epi-notificationBarText\" ></div>\r\n    </div>\r\n    <div class=\"epi-captionPanel\" data-dojo-attach-point=\"captionPanelNode\">\r\n        <strong data-dojo-attach-point=\"totalLinksNode\"></strong>\r\n        <div class=\"epi-floatRight\">\r\n            <button class=\"epi-chromelessButton\"\r\n                    data-dojo-type=\"dijit/form/Button\"\r\n                    data-dojo-attach-event=\"onClick:fetchData\"\r\n                    data-dojo-props=\"iconClass:'epi-iconReload'\">${res.buttons.refresh}</button>\r\n        </div>\r\n    </div>\r\n    <div data-dojo-attach-point=\"gridNode\"></div>\r\n</div>\r\n"}});
define("epi-cms/widget/ContentReferences", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/keys",
    "dojo/when",
    //epi
    "epi-cms/dgrid/formatters",
    "epi/dependency",
    // dgrid
    "dgrid/tree",
    // Base class and mixins
    "./_GridWidgetBase",
    "./viewmodel/ContentReferencesViewModel",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/Evented",
    "epi/shell/widget/_ModelBindingMixin",
    // Resources
    "dojo/text!./templates/ContentReferences.html",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentreferences",
    // Widgets used in the template
    "dijit/form/Button"
], function (
    declare,
    lang,
    domClass,
    domConstruct,
    domStyle,
    keys,
    when,
    formatters,
    dependency,
    // dgrid
    tree,
    // Base class and mixins
    _GridWidgetBase,
    ContentReferencesViewModel,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    Evented,
    _ModelBindingMixin,
    // Resources
    template,
    resources
) {

    return declare([_GridWidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented, _ModelBindingMixin], {
        // tags:
        //      internal

        // widget resources
        res: resources,

        // templateString: String
        //  Template for the widget
        templateString: template,

        storeKeyName: "epi.cms.referenced-content",

        contextChangeEvent: "dblclick",

        // trackActiveItem: [public] Boolean
        //      A flag indicating whether the item matching the current context should be highlight. The default value is false.
        trackActiveItem: false,

        // ignoreVersionWhenComparingLinks: [public] Boolean
        //      A flag indicating whether the version should be ignored when comparing content references.
        ignoreVersionWhenComparingLinks: false,

        // modelBindingMap: [protected] Object
        //      A map contain bindings from the model to properties on this object.
        modelBindingMap: {
            notification: ["notification"],
            notificationBarStyle: ["notificationBarStyle"],
            numberOfReferences: ["numberOfReferences"],
            showToolbar: ["showToolbar"],
            showGrid: ["showGrid"],
            totalLinks: ["totalLinks"]
        },

        constructor: function (params) {
            this.model = lang.mixin(new ContentReferencesViewModel(), params);
            this.own(this.model);
        },

        _setTotalLinksAttr: { node: "totalLinksNode", type: "innerText" },

        _setNotificationAttr: { node: "contentReferencesNotificationNode", type: "innerText" },

        _setNotificationBarStyleAttr: function (value) {
            // summary:
            //      Sets the color for notification bar. 1 for green, 2 for orange and yellow for everything else
            // tags:
            //      protected
            switch (value) {
                case 1:          // green
                    domClass.add(this.contentReferencesNotificationBar, "epi-statusIndicator epi-statusIndicatorOk");
                    break;
                case 2:      // orange
                    domClass.add(this.contentReferencesNotificationBar, "epi-statusIndicator epi-statusIndicatorWarning");
                    break;
            }
        },

        _setShowToolbarAttr: function (value) {
            domStyle.set(this.captionPanelNode, "display", value ? "" : "none");
        },

        _setShowGridAttr: function (value) {
            domStyle.set(this.grid.domNode, "visibility", value ? "visible" : "hidden");
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            this.store = this.model.getUpdatedStore(this.store);
        },

        buildRendering: function () {
            // summary:
            //      Construct the UI for this widget. this.gridNode is initialized as a dGrid.
            // tags:
            //      protected
            var linkTemplate = this._getLinkTemplate();

            var gridSettings = lang.mixin({
                columns: {
                    name: tree({
                        renderCell: lang.hitch(this, "_renderContentItem"),
                        shouldExpand: function () {
                            return true;
                        }
                    }),
                    language: {
                        className: "epi-width10",
                        renderCell: function (obj, language, node) {
                            // If the language hasn't been specified there is no need to try to compare
                            // it with the current edit language
                            if (!language) {
                                return;
                            }
                            when(dependency.resolve("epi.shell.Profile").getContentLanguage(), function (profileContentLanguage) {
                                if (language !== profileContentLanguage) {
                                    node.textContent = language;
                                }
                            });
                        }
                    },
                    treePath: {
                        className: "epi-width50",
                        formatter: function (value) {
                            return formatters.path(value, {
                                skipEncode: true,
                                skipDefaultClass: true
                            });
                        }
                    },
                    uri: {
                        className: "epi-width10",
                        label: " ",
                        formatter: function (value) {
                            return value ? linkTemplate : "";
                        },
                        sortable: false
                    }
                },
                store: this.store,
                query: {
                    ids: this.model.contentItems.map(function (content) {
                        return content.contentLink;
                    })
                },
                showHeader: false
            }, this.defaultGridMixin);

            this.inherited(arguments);

            this.grid = new this._gridClass(gridSettings, this.gridNode);

            // Hide the notification box if in show mode.
            domClass.toggle(this.contentReferencesNotificationBar, "dijitHidden", this.model.mode === "show");
        },

        startup: function () {
            this.inherited(arguments);

            // Setup event handling for click on the view link.
            this.grid.on(".dgrid-column-uri a:click", lang.hitch(this, "_onChangeContext"));
        },

        fetchData: function () {
            // summary:
            //      Fetches data by setting a query on the grid. A get children query will be performed on the store.
            // tags:
            //      protected

            this.grid.refresh();
        },

        _onChangeContext: function (e) {
            // summary:
            //      Change the context to the content associated with the given row.
            // tags:
            //      private
            var row = this.grid.row(e),
                newContext = { uri: row.data.uri };

            if (newContext.uri) {
                this._requestNewContext(newContext, { sender: this });

                this.emit("viewReference");
            }
        },

        _getLinkTemplate: function () {
            // summary:
            //      Returns an HTML string representing the view link.
            // tags:
            //      private
            var node = domConstruct.create("a", {
                "class": "epi-visibleLink",
                innerHTML: resources.view.label,
                title: resources.view.tooltip
            });

            return node.outerHTML;
        }
    });
});
