require({cache:{
'url:epi-cms/asset/templates/HierarchicalList.html':"﻿<div class=\"epi-hierarchicalList\">\r\n    <div class=\"epi-gadgetInnerToolbar\" data-dojo-attach-point=\"searchBoxNode\">\r\n        <div data-dojo-attach-point=\"searchBox\"\r\n             data-dojo-type=\"epi/shell/widget/SearchBox\"\r\n             data-dojo-props=\"triggerContextChange: this.triggerContextChange, triggerChangeOnEnter: true, encodeSearchText: true\">\r\n        </div>\r\n    </div>\r\n    <div data-dojo-attach-point=\"container\"\r\n         data-dojo-type=\"dijit/layout/BorderContainer\"\r\n         data-dojo-props=\"gutters: false\">\r\n\r\n        <div data-dojo-attach-point=\"contentNode\">\r\n            <div class=\"epi-gadgetTopContainer ${additionalTreeClass}\"\r\n                 data-dojo-attach-point=\"tree\"\r\n                 data-dojo-type=\"epi-cms/widget/FolderTree\"\r\n                 data-dojo-props=\"region:'center', splitter:false, model: this.model.treeStoreModel, showRoot: false, contextMenu: this.contextMenu, dndSource: this.dndSource\"></div>\r\n            <div class=\"epi-gadgetBottomContainer\"\r\n                 data-dojo-attach-point=\"listContainer\"\r\n                 data-dojo-type=\"dijit/layout/BorderContainer\"\r\n                 data-dojo-props=\"region:'bottom', splitter:true, gutters: false\">\r\n                <div class=\"epi-createContentContainer\"\r\n                     data-dojo-attach-point=\"createContentArea\"\r\n                     data-dojo-type=\"dijit/layout/_LayoutWidget\"\r\n                     data-dojo-props=\"region:'top', splitter:false\">\r\n                    <button type=\"button\" class=\"epi-flat epi-chromeless\"\r\n                            data-dojo-type=\"dijit/form/Button\"\r\n                            data-dojo-attach-point=\"createContentAreaButton\"></button>\r\n                </div>\r\n                <div data-dojo-attach-point=\"list\"\r\n                     data-dojo-type=\"epi-cms/widget/ContentList\"\r\n                     data-dojo-props=\"region:'center', splitter:false, store: this.model.store, queryOptions: this.model.listQueryOptions, contextMenu: this.contextMenu, resources: this.res\">\r\n                </div>\r\n            </div>\r\n        </div>\r\n        <div data-dojo-attach-point=\"resultNode\" style=\"display:none\">\r\n            <div data-dojo-attach-point=\"searchResultList\"\r\n                 data-dojo-type=\"epi-cms/widget/ContentList\"\r\n                 data-dojo-props=\"region:'center', splitter:false, store: this.model.searchStore, queryOptions: this.model.searchResultQueryOptions, contextMenu: this.contextMenu, resources: this.res\">\r\n            </div>\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
define("epi-cms/asset/HierarchicalList", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/keys",
    "dojo/on",
    "dojo/when",

    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/_LayoutWidget",
    "dijit/layout/BorderContainer", // Used in template

    // dojox
    "dojox/html/entities",

    // epi
    "epi/string",
    "epi/shell/command/_WidgetCommandBinderMixin",
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/DestroyableByKey",
    "epi/shell/DialogService",

    "epi/shell/widget/ContextMenu",
    "epi/shell/widget/SearchBox",
    "epi-cms/widget/FolderTree",
    "epi-cms/widget/ContentList",
    "./view-model/HierarchicalListViewModel",
    "epi/shell/dnd/tree/multiDndSource",

    // template
    "dojo/text!./templates/HierarchicalList.html",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.hierachicallist"
],

function (
// dojo
    array,
    declare,
    lang,
    aspect,
    domClass,
    domGeometry,
    domStyle,
    keys,
    on,
    when,

    // dijit
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _LayoutWidget,
    BorderContainer,

    //dojox
    htmlEntities,

    // epi
    epistring,

    _WidgetCommandBinderMixin,
    _ModelBindingMixin,
    DestroyableByKey,
    dialogService,

    ContextMenu,
    SearchBox,
    FolderTree,
    ContentList,
    HierarchicalListViewModel,
    multiDndSource,

    // template
    template,

    // Resources
    res
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin, _WidgetCommandBinderMixin, DestroyableByKey], {
        // summary:
        //      Base widget for displaying the panel with tree on top and list for displaying leaf's items, as well as the search box on very top.
        // tags:
        //      internal xproduct abstract

        // contextMenu: [protected] epi/shell/widget/ContextMenu
        //      The context menu widget
        contextMenu: null,

        templateString: template,

        showRoot: false,

        // showThumbnail: [public] Boolean
        //      Flag to indicate this widget allowed to show a thumbnail in the list.
        showThumbnail: false,

        // showCreateContentArea: [public] Boolean
        //      Flag to indicate this widget allowed to show create content area by default or not.
        showCreateContentArea: false,

        triggerContextChange: false,

        res: res,

        modelClassName: HierarchicalListViewModel,

        // hierarchicalListClass: [readonly] String
        //      The CSS class to be used on the hierarchical list.
        hierarchicalListClass: "",

        // noDataMessages: [public] Object
        //      Object containing the texts for when the list contains no items. It should have two properties named single and multiple.
        noDataMessages: null,

        // noSearchResultMessage: [public] String
        //      No search result message for search result list.
        noSearchResultMessage: res.nosearchresults,

        // createContentIcon: [public] String
        //      The icon class to be used in the create content area of the list.
        createContentIcon: "",

        // createContentText: [public] String
        createContentText: "",

        // dndSource: [public] multiDndSource
        //      The dnd source to use for the tree
        dndSource: multiDndSource,

        // additionalTreeClass: [public] String
        //      Additional CSS class that will be applied to the tree element
        additionalTreeClass: "epi-secondaryGadgetContainer",

        modelBindingMap: {
            searchRoots: ["searchRoots"],
            searchArea: ["searchArea"],
            listQuery: ["listQuery"],
            treePaths: ["treePaths"],
            selectedListItems: ["selectedListItems"],
            searchListQuery: ["searchListQuery"],
            noDataMessage: ["noDataMessage"]
        },

        _setSearchAreaAttr: function (value) {
            this.searchBox.set("area", value);
        },

        _setSelectedListItemsAttr: function (value) {
            this.list.grid.clearSelection();
            (value || []).forEach(function (selectedItem) {
                this.list.grid.select(selectedItem.contentLink);
            }, this);
            this._set("selectedListItems", value);
        },

        _setSearchRootsAttr: function (value) {
            this.searchBox.set("searchRoots", value);
        },

        _setListQueryAttr: function (value) {
            this.list.set("query", value);
        },

        _setNoDataMessageAttr: function (value) {
            this.list.set("noDataMessage", value);
        },

        _setSearchListQueryAttr: function (value) {
            this.searchResultList.set("query", value);
            this._showSearchResults(value);
        },

        _setTreePathsAttr: function (value) {
            // Tree setter for paths attribute returns promise to indicate when the set is complete.
            // We can use this deferred when setting selectedListItems.
            return this.tree.set("paths", value);
        },

        _setShowRootAttr: function (value) {
            this.tree.set("showRoot", value);
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.model && !this.commandProvider && this.modelClassName) {
                var modelClass = declare(this.modelClassName);
                this.model = this.commandProvider = new modelClass({
                    componentId: this.componentId,
                    repositoryKey: this.repositoryKey,
                    noDataMessages: this.noDataMessages
                });
            }

            this.setupContextMenu();
        },

        setupContextMenu: function () {
            // summary: set up the context menu
            //
            // tags:
            //      public
            this.own(this.contextMenu = new ContextMenu({ category: "context", popupParent: this }));
            this.contextMenu.addProvider(this.model);
        },

        postCreate: function () {
            this.inherited(arguments);

            domClass.add(this.domNode, this.hierarchicalListClass);

            this._setupTree();
            this._setupCreateContentArea();
            this._setupList();

            this._toggleCreateContentArea(this.showCreateContentArea);

            // Watching instead of binding since we need the old value as well
            this.own(
                this.model.clipboardManager.watch("data", lang.hitch(this, this._updateClipboardIndicators)),
                this.searchBox.on("searchBoxChange", lang.hitch(this, this._onSearchTextChanged))
            );
        },

        startup: function () {
            this.inherited(arguments);

            this.model.startup();


            if (this.contextMenu) {
                this.contextMenu.startup();
            }
        },

        destroy: function () {
            this.model.destroy();

            this.inherited(arguments);
        },

        layout: function () {
            var searchBoxSize = domGeometry.getMarginBox(this.searchBoxNode),
                containerSize = {
                    h: this._contentBox.h - searchBoxSize.h,
                    w: this._contentBox.w,
                    l: this._contentBox.l,
                    t: this._contentBox.t
                };

            this.container.resize(containerSize);
        },

        _toggleCreateContentArea: function (display) {
            // summary:
            //      Toggle display of the create content area
            // display: [Boolean]
            // tags:
            //      protected

            domStyle.set(this.createContentArea.domNode, "display", display ? "" : "none");

            // Since the create area may no longer be visible we need to re-layout the container to ensure
            // the contents are displayed correctly.
            this.listContainer.layout();
        },

        _toggleActive: function (activeWidget) {
            // summary:
            //      Toggle visual indication between tree and list

            var listActiveClass = "epi-list--is-active";
            var treeActiveClass = "epi-tree--is-active";

            if (activeWidget === this.tree) {
                domClass.replace(this.domNode, treeActiveClass, listActiveClass);
            } else {
                domClass.replace(this.domNode, listActiveClass, treeActiveClass);
            }
        },

        _showNotification: function (message) {
            // summary:
            //      Uses the alert dialog implementation to show notification with the supplied message
            //
            // message:
            //      html encoded string to show in notification dialog
            //
            // tags:
            //      public callback

            dialogService.alert(epistring.toHTML(message));
        },

        _onSearchTextChanged: function (searchText) {
            // summary:
            //      Callback method for when the user has search for some content
            // tags:
            //      private callback

            this.model.setSearchText(searchText);
        },

        _showSearchResults: function (searchQuery) {
            domStyle.set(this.contentNode, "display", searchQuery ? "none" : "");
            domStyle.set(this.resultNode, "display", !searchQuery ? "none" : "");
            this.container.layout();
        },

        _setupTree: function () {
            // summary:
            //      Implementation should implement this, to setup the content tree. For example, command binding.
            //
            // tags:
            //      protected

            var registry = this.model._commandRegistry;

            function copyOrCuthandler(copy) {
                copy ? registry.copy.command.execute() : registry.cut.command.execute();
            }

            this.own(
                on(this.tree, "copyOrCut", copyOrCuthandler),
                on(this.tree, "paste", function () {
                    registry.paste.command.execute();
                }),
                on(this.tree, "delete", function () {
                    registry["delete"].command.execute();
                }),
                aspect.after(this.tree, "onFocus", function () {
                    this.model.updateTreeCommands();
                    this._toggleActive(this.tree);
                }.bind(this)),
                aspect.after(this.tree.rootNode, "setChildItems", function (childItems) {
                    this.model.updateTreePaths(childItems);
                }.bind(this), true)
            );

            if (this.contextMenu) {
                this.own(on(this.tree, "showContextMenu", this.contextMenu.forceOpen.bind(this.contextMenu)));
            }

            // start watching "paths" after tree is initialized
            this.tree.onLoadDeferred.then(function () {
                this.own(this.tree.watch("paths", function (property, old, newVal) {
                    this.model.setTreePaths(newVal);
                }.bind(this)));
            }.bind(this));

            registry.rename.command.set("renameDelegate", lang.hitch(this, function (model) {
                this.tree.getNodesByItem(model)[0].edit();
            }));

            // make sure the folder tree only accepts internal dnd operations or dnd from the content list
            this.tree.supportedDndSources = [this.tree.dndController, this.list.grid.dndSource];
        },

        _setupCreateContentArea: function () {
            // summary:
            //      Setup create content area for list widget
            // tags:
            //      protected

            this.createContentAreaButton.set("iconClass", this.createContentIcon);
            this.createContentAreaButton.set("label", this.createContentText);

            this.own(
                // Connect to create new item link when there's no children for the current parent.
                this.createContentAreaButton.on("click", lang.hitch(this, "_onCreateAreaClick"))
            );
        },

        _setupList: function () {
            // summary:
            //      Implementation should implement this, to setup the content list. For example, command binding.
            //
            // tags:
            //      protected
            var registry = this.model._commandRegistry;

            this.own(
                on(this.model, "setPathsAndItems", function (treePaths, selectedListItems) {
                    this.model.set("treePaths", treePaths);
                    // the previous line will trigger set "treePaths" on the view, but this time we want to wait
                    // until it's done and then set "selectedListItems"
                    this.set("treePaths", treePaths).then(function () {
                        // setting "selectedListItems" on model will trigger setting "selectedListItems" on view
                        this.model.set("selectedListItems", selectedListItems);
                    }.bind(this));
                }.bind(this)),
                aspect.after(this.model, "onListItemUpdated", lang.hitch(this.list, function (deferred) {
                    when(deferred, lang.hitch(this, this.editContent));
                })),
                this.searchResultList.grid.addKeyHandler(keys.ESCAPE, lang.hitch(this.searchBox, this.searchBox.clearValue)),
                aspect.after(this.model.treeStoreModel, "onDeleted", lang.hitch(this, function (items) {
                    array.forEach(items, function (item) {
                        var searchResultRow = this.searchResultList.grid.row(item.contentLink);
                        if (searchResultRow && searchResultRow.data) {
                            this.searchResultList.grid.removeRow(searchResultRow);
                        }
                    }, this);
                }), true),
                aspect.after(this.list, "onFocus", function () {
                    this.model.updateListCommands();
                    this._toggleActive(this.list);
                }.bind(this)),
                on(this.searchResultList, "selectionChanged",function (e) {
                    this.model.setSelectedSearchResults(e.selection);
                }.bind(this)),
                on(this.list, "selectionChanged",function (e) {
                    this.model.setSelectedListItems(e.selection);
                }.bind(this)),
                on(this.list.grid.domNode, "dgrid-refresh-complete", function () {
                    var selectedItems = this.get("selectedListItems");
                    this.list.grid.clearSelection();
                    if (selectedItems) {
                        selectedItems.forEach(function (item) {
                            this.list.grid.select(item.contentLink);
                        }, this);
                    }
                }.bind(this))
            );

            this.searchBox.on("keyup", lang.hitch(this, function (e) {
                if (e.keyCode === keys.ENTER) {
                    e.preventDefault();
                    this.searchResultList.editSelectedContent();
                }
            }));

            this.searchBox.on("keydown", lang.hitch(this, function (e) {
                if (e.keyCode === keys.DOWN_ARROW || e.keyCode === keys.UP_ARROW) {
                    e.preventDefault();
                    this.searchResultList.grid.moveSelection(e.keyCode === keys.UP_ARROW);
                }
            }));

            if (this.model.changeContextOnItemSelection) {
                var itemSelectAction =  function () {
                    registry.edit.command.execute();
                };
                this.own(
                    on(this.list, "itemAction", itemSelectAction),
                    on(this.searchResultList, "itemAction", itemSelectAction)
                );
            }
            if (this.showThumbnail) {
                domClass.add(this.list.grid.domNode, "epi-thumbnailContentList");
                domClass.add(this.searchResultList.grid.domNode, "epi-thumbnailContentList");
            }
            this.list.set("selectionMode", "extended");
            this.searchResultList.set("selectionMode", "extended");
            this.searchResultList.set("noDataMessage", this.noSearchResultMessage);

            this._handleListKeyEvents();
        },

        _handleListKeyEvents: function () {
            // summary:
            //      Listen to list key events and run related commands
            // tags:
            //      private

            var registry = this.model._commandRegistry,
                listWidget = this.list;

            this.own(
                on(listWidget, "copyOrCut", function copyOrCuthandler(copy) {
                    copy ? registry.copy.command.execute() : registry.cut.command.execute();
                }),

                on(listWidget, "paste", function () {
                    // paste command is not available for the list, but for the tree
                    // We need to focus tree to enable command
                    this.tree.focus();
                    registry.paste.command.execute();
                }.bind(this)),

                on(listWidget, "delete", function () {
                    registry["delete"].command.execute();
                })
            );
        },

        _onCreateAreaClick: function () {
            // summary:
            //      A callback function which is executed when the create area is clicked.
            // tags:
            //      protected
        },

        // =======================================================================
        // Clipboard handling

        _updateClipboardIndicators: function (name, oldValues, newValues) {

            var isCopy = this.model.clipboardManager.isCopy();

            if (oldValues instanceof Array) {
                array.forEach(oldValues, function (clip) {
                    this.tree.toggleCut(clip.data, false);
                    this.list.toggleCut(clip.data, false);
                    this.searchResultList.toggleCut(clip.data, false);
                }, this);
            }

            if (!isCopy && newValues instanceof Array) {
                array.forEach(newValues, function (clip) {
                    this.tree.toggleCut(clip.data, true);
                    this.list.toggleCut(clip.data, true);
                    this.searchResultList.toggleCut(clip.data, true);
                }, this);
            }
        }

    });

});
