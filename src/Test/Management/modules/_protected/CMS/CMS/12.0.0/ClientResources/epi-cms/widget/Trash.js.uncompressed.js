require({cache:{
'url:epi-cms/widget/templates/Trash.html':"﻿<div class=\"epi-trash\">\r\n    <div class=\"epi-listingTopContainer\">\r\n        <h1 class=\"dijitInline\">${resources.heading}</h1>\r\n        <div class=\"epi-mediumButton epi-button--bold epi-emptyCommand\" data-dojo-attach-point=\"emptyTrashMenu\" data-dojo-type=\"epi-cms/widget/EmptyTrashMenu\"\r\n            data-dojo-props=\"title: '${resources.emptytrash.tooltip}'\"></div>\r\n    </div>\r\n    <div data-dojo-attach-point=\"stackContainer\">\r\n        <div data-dojo-type=\"dijit/layout/TabContainer\" data-dojo-attach-point=\"tabContainer\" data-dojo-props=\"doLayout:false, useMenu:true, useSlider:false\"> <!-- doLayout=\"false\" for flexible height -->\r\n        </div>\r\n    </div>\r\n</div>\r\n"}});
define("epi-cms/widget/Trash", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/Evented",
    "dojo/_base/Deferred",
    "dojox/html/entities",

    // Dijit
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "dijit/registry",

    // EPi Framework
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/DialogService",
    "epi/shell/command/withConfirmation",

    // EPi
    "epi-cms/widget/TrashItemList",
    "epi-cms/widget/EmptyTrashMenu",
    "epi-cms/widget/TrashViewModelConfirmation",
    "epi-cms/widget/command/EmptyTrash",
    "epi-cms/widget/command/RestoreContent",
    "epi-cms/widget/command/DeleteContent",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.trash",
    "dojo/text!./templates/Trash.html"
], function (
// Dojo
    array,
    declare,
    lang,
    domClass,
    domConstruct,
    Evented,
    Deferred,
    entities,

    // Dijit
    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    TabContainer,
    ContentPane,
    registry,

    // EPi Framework
    _ModelBindingMixin,
    dialogService,
    withConfirmation,

    // EPi
    TrashItemList,
    EmptyTrashMenu,
    TrashViewModelConfirmation,
    EmptyTrashCommand,
    RestoreContentCommand,
    DeleteContentCommand,

    // Resources
    resources,
    template
) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin, Evented], {
        // summary:
        //      A widget to display trash page.
        // tags:
        //      internal

        resources: resources,

        templateString: template,

        _restoreContentCommand: null,

        typeIdentifiers: null,

        // Map property name in view model to a list of properties in this widget
        modelBindingMap: {
            contentStore: ["store"],
            queryOptions: ["queryOptions"],
            actionResponse: ["actionResponse"],
            trashes: ["trashes"]
        },

        postCreate: function () {
            this.inherited(arguments);

            // watch for tab change to get data
            this.tabContainer.watch("selectedChildWidget", lang.hitch(this, function (name, oldValue, newValue) {
                this.model.set("currentTrash", newValue.trash);
            }));

            // create a shared instance of Restore Content command, then watch for model updated to update model for that command.
            this._restoreContentCommand = new RestoreContentCommand({ model: this.model /* TrashViewModel */ });
            this.watch("model", lang.hitch(this, function () {
                this.model = TrashViewModelConfirmation(this.model);
                this._restoreContentCommand.set("model", this.model);
            }));

            this.on("restoreItem", this._onRestoreItemClick); // listen for restoreItem event of Trash Item List, to execute Restore Content Command.
            this.on("deleteItem", this._onDeleteItemClick);
        },

        _setTrashesAttr: function (trashes) {
            // summary:
            //      Builds Empty Trash button and Tab strip based on input trashes
            // tags:
            //      private

            // Remove all tab pane before adding new
            this.tabContainer.destroyDescendants();
            var listCommand = [];
            array.forEach(trashes, function (trash) {
                if (trash && trash.active) {
                    this._addTrash(trash); // add a Tab pane

                    var command = new EmptyTrashCommand({
                        hasDeleteAccess: trash.hasDeleteAccess,
                        label: trash.name,
                        tooltip: trash.name,
                        trashId: trash.wasteBasketLink,
                        model: this.model
                    });

                    listCommand.push(withConfirmation(command,
                        null,
                        {
                            title: resources.emptytrash.title,
                            description: this.model.getEmptyTrashConfirmMessage(trash.name),
                            onShow: lang.hitch(this,
                                function () {
                                    var trashItemList = this.tabContainer.selectedChildWidget.getChildren()[0];
                                    trashItemList.clearSelection();
                                })
                        }));
                }
            }, this);

            // Update model for empty menu
            this.emptyTrashMenu.set("commands", listCommand);

            if (trashes && trashes.length === 1) {
                domClass.add(this.tabContainer.domNode, "hide-tablist");
            }

            this.tabContainer.startup();
            this.tabContainer.layout();
        },

        _addTrash: function (trash) {
            // summary:
            //      Adds tab panes to tab container for every trash
            // tags:
            //      private

            var _selectedItem = null;

            if (trash.active) { // add active trash only
                trash.isRequireLoad = true; // make sure trash data will be load on first load
                var item = new ContentPane({
                    title: trash.name, // TODO update the total item number, for example: Pages 1000+
                    trash: trash
                });
                this.tabContainer.addChild(item);
                if (this._isSelected(trash)) {
                    _selectedItem = item;
                }
            }
            if (_selectedItem) {
                this.tabContainer.selectChild(_selectedItem);
            }
        },

        _isSelected: function (trash) {
            var result = false;
            array.some(trash.typeIdentifiers, lang.hitch(this, function (feederType) {
                return array.some(this.typeIdentifiers, function (type) {
                    if (feederType === type) {
                        result = true;
                        return false; // return false to quite the loop, in case we find a match.
                    }
                });
            }));
            return result;
        },

        _setQueryOptionsAttr: function (queryOptions) {
            // summary:
            //      When query is set, use this query options to get content for current tab.
            // tags:
            //      private

            if (queryOptions) {
                var selectedTab = this.tabContainer.selectedChildWidget;
                if (selectedTab) {
                    var contentStore = this.get("store"),
                        trashItemListWidget = null;

                    if (selectedTab.itemListId) { // update itemList's store instead of creating new instance
                        trashItemListWidget = registry.byId(selectedTab.itemListId);
                        trashItemListWidget.set("queryOptions", queryOptions);
                    } else {
                        trashItemListWidget = new TrashItemList({ queryOptions: queryOptions, store: contentStore, model: this.model });

                        trashItemListWidget.on("restoreItem", lang.hitch(this, function (row) {
                            this.emit("restoreItem", row);
                        }));
                        trashItemListWidget.on("deleteItem", lang.hitch(this, function (row) {
                            this.emit("deleteItem", row);
                        }));

                        trashItemListWidget.on("searchBoxChange", lang.hitch(this, this._onSearchBoxChange));

                        selectedTab.set("content", trashItemListWidget);
                        selectedTab.itemListId = trashItemListWidget.id;
                    }
                }
            }
        },

        _setActionResponseAttr: function (message) {
            // summary:
            //      Fired when execute action return response.
            // message: String|Array
            //      One or more messages to show as notification message.
            // tags:
            //      private

            if (!message) {
                return;
            }

            this._showNotificationMessage(message);
        },

        _showNotificationMessage: function (message) {
            // summary:
            //     Show an alert dialog with error message.
            // message: String|Array
            //     The message to be displayed in the alert.

            if (message instanceof Array) {
                dialogService.alertWithErrors({}, message);
            } else {
                dialogService.alert(message ? message : "");
            }
        },

        _onRestoreItemClick: function (row) {
            // summary:
            //     Fired when a row of Trash Item list has been clicked.
            // row:
            //     Selected row.
            // tags:
            //      private

            if (row && row.data && this.model.get("currentTrash")) {
                // set current content to be restored
                this._restoreContentCommand.set("content", row.data);
                this._restoreContentCommand.execute();
            }
        },

        _onDeleteItemClick: function (row) {
            // summary:
            //     Fired when a delete link has been clicked.
            // row:
            //     Selected row.
            // tags:
            //      private

            if (row && row.data && this.model.get("currentTrash")) {
                var command = withConfirmation(
                    new DeleteContentCommand({ model: this.model, contentId: row.data.contentLink}),
                    null,
                    {
                        title: resources.singledelete.dialog.title,
                        description: lang.replace(resources.singledelete.dialog.description, [entities.encode(row.data.name)])
                    }
                );

                command._execute();

            }
        },

        _onSearchBoxChange: function (/* String */queryText) {
            // summary:
            //      Perform search when text changed in search box
            // tags:
            //      private

            var currentTrash = this.model.get("currentTrash");
            currentTrash.queryText = queryText;
            currentTrash.isRequireLoad = true;
            this.model.set("currentTrash", currentTrash);
        }
    });
});
