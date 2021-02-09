define("epi-cms/contentediting/editors/model/ContentReferenceListEditorModel", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dojo/when",
    "dojo/topic",
    // epi
    "epi/datetime",
    "epi/dependency",
    "epi/shell/command/_CommandProviderMixin",
    "epi/shell/command/DelegateCommand",
    // epi cms
    "epi-cms/component/command/ChangeContext",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/viewmodel/_ViewModelMixin",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentlist",
    "epi/i18n!epi/nls/episerver.shared"
], function (
// dojo
    array,
    declare,
    lang,
    Memory,
    Observable,
    when,
    topic,
    // epi
    epiDate,
    dependency,
    _CommandProviderMixin,
    DelegateCommand,
    // epi cms
    ChangeContext,
    ContentActionSupport,
    _ViewModelMixin,
    // resources
    resources,
    sharedResources
) {
    return declare([_ViewModelMixin, _CommandProviderMixin], {
        // summary:
        //      The model for the ContentReferenceListEditor. It handles the data for the editor.
        // tags:
        //      internal

        // res: [public] Object
        //      The translated resources for this model.
        res: resources,

        // store: [readonly] Store
        //      A REST store for converting content links to content data objects.
        store: null,

        // valueStore: [readonly] Store
        //      A Memory store for the value in the model.
        valueStore: null,

        // contentLinks: [public] Array
        //      An array of content links that should match the value property.
        contentLinks: null,

        // query: [public] Object
        //      The query object for the store. It should define a query and queryOptions.
        query: null,

        readOnly: false,

        postscript: function () {
            // summary:
            //      Mix constructor arguments into the object after construction.
            // tags:
            //      protected
            this.inherited(arguments);
            this._contentLinkCountMap = {};
            this.query = {
                query: {},
                queryOptions: { sort: [{ attribute: "index" }] }
            };
            this.store = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
            this.valueStore = this.valueStore || new Observable(new Memory());
            this._createCommands();
        },

        _convertContentDataToListItems: function (contentDataItems) {
            // summary:
            //      Converts content data instances to the format that the list expects.
            // tags:
            //      private

            //this remapping tries its best to match the server side
            //EPiServer.Cms.Shell.UI.Rest.Projects.Models.ProjectItemConverter.
            //We're intentionally skipping path and any eventual project properties to avoid additional requests.
            return contentDataItems.map(function (contentData, index) {
                return lang.mixin({
                    id: this._getUniqueId(contentData.contentLink),
                    index: index,
                    userName: contentData.changedBy,
                    modified: contentData.saved,
                    contentLanguage: contentData.currentLanguageBranch ? contentData.currentLanguageBranch.languageId : null,
                    delayPublishUntil: contentData.status === ContentActionSupport.versionStatus.DelayedPublish
                        ? contentData.startPublish : null
                }, contentData);
            }, this);
        },

        _getUniqueId: function (contentLink) {
            // summary:
            //      Gets an unique id that is based on how many occurences of the specified contentlink
            //      exists on this model already.
            // tags:
            //      private

            var count = this._contentLinkCountMap[contentLink];
            if (!count) {
                count = 0;
            }
            this._contentLinkCountMap[contentLink] = count + 1;
            return contentLink + "_" + count;
        },

        _contentLinksGetter: function () {
            // summary:
            //      This returns the contentLinks from all items in the value store.
            // tags:
            //      public

            return this.valueStore.query(this.query.query, this.query.queryOptions).map(function (item) {
                return item.contentLink;
            });
        },

        setContentLinks: function (contentLinks) {
            // summary:
            //      Sets the contentLinks value and resets the valueStore with the detailed value for the content links.
            // tags:
            //      public

            return this._getDetailedValue(contentLinks).then(lang.hitch(this, function (detailedValue) {
                //We also need to reset the count here
                this._contentLinkCountMap = {};
                var listItems = this._convertContentDataToListItems(detailedValue);
                this.valueStore.setData(listItems);
                this.contentLinks = contentLinks;
            }));
        },

        addItems: function (items, existingItemIndex, before) {
            // summary:
            //      Add new items.
            // items: Array
            //      The items added.
            // existingItemIndex: Number
            //      The index of an existing item.
            // before: Boolean
            //      Indicates that the new item should be added before the existing item.
            // tags:
            //      public

            if (!items) {
                return;
            }
            var targetIndex;
            if (typeof existingItemIndex !== "number") {
                targetIndex = this.valueStore.data.length;
            } else {
                targetIndex = before ? existingItemIndex : existingItemIndex + 1;
            }
            var newItems = this._convertContentDataToListItems(items);

            var allItems = this._getAllItemsInCorrectOrder(newItems, targetIndex);

            this._updateIndexOnItems(allItems);
            return newItems;
        },

        moveItems: function (idsOfItemsToMove, existingItemIndex, before) {
            // summary:
            //      Move existing items.
            // idsOfItemsToMove: Array
            //      The ids of the items to move.
            // existingItemIndex: Number
            //      The index of an existing item.
            // before: Boolean
            //      Indicates that the items to be moved should be moved before the reference item.
            // tags:
            //      public

            if (typeof existingItemIndex != "number") {
                return;
            }

            var targetIndex = before ? existingItemIndex : existingItemIndex + 1;

            var itemsToMove = idsOfItemsToMove.map(function (id) {
                return this.valueStore.get(id);
            }, this);
            itemsToMove.sort(function (itemA, itemB) {
                return itemA.index - itemB.index;
            });
            var allItems = this._getAllItemsInCorrectOrder(itemsToMove, targetIndex);

            this._updateIndexOnItems(allItems);
        },

        removeItems: function (idsOfItemsToRemove) {
            // summary:
            //      Removes the items on the defined ids.
            // idsOfItemsToRemove: Array
            //      The ids of the items to be removed.
            // tags:
            //      public

            if (!idsOfItemsToRemove) {
                return;
            }
            idsOfItemsToRemove.forEach(lang.hitch(this, function (id) {
                this.valueStore.remove(id);
            }));

            //we need to reset index on all remaining items
            var allItems = this.valueStore.query(this.query.query, this.query.queryOptions);
            this._updateIndexOnItems(allItems);
        },

        _getAllItemsInCorrectOrder: function (targetItems, targetIndex) {
            // summary:
            //      Gets all items that should be updated in the correct order.
            // tags:
            //      private

            var idsOfTargetItems = targetItems.map(function (item) {
                return item.id;
            });

            var itemsWithGreaterIndex = this.valueStore.query(function (item) {
                var targetItem = idsOfTargetItems.indexOf(item.id) >= 0;
                return !targetItem && item.index >= targetIndex;
            }, this.query.queryOptions);

            var itemsWithLowerIndex = this.valueStore.query(function (item) {
                var targetItem = idsOfTargetItems.indexOf(item.id) >= 0;
                return !targetItem && item.index < targetIndex;
            }, this.query.queryOptions);

            return itemsWithLowerIndex.concat(targetItems).concat(itemsWithGreaterIndex);
        },

        _updateIndexOnItems: function (items) {
            // summary:
            //      Updates all items in the value store with correct index so that sorting will work
            // tags:
            //      private

            items.forEach(function (item, index) {
                item.index = index;
                this.valueStore.put(item);
            }, this);
        },

        addContentLink: function (contentLink) {
            // summary:
            //      Adds the detailed value for the contentLink and updates this models value
            // tags:
            //      public

            return this._getDetailedValue([contentLink]).then(lang.hitch(this, function (detailedValue) {
                return this.addItems(detailedValue);
            }));
        },

        _getDetailedValue: function (contentLinks) {
            // summary:
            //      Get a model containing additional values for each of the content references in
            //      the input array.
            // tags:
            //      private
            if (!contentLinks || !contentLinks.length) {
                return when([]);
            }

            return when(this._getDetails(contentLinks)).then(lang.hitch(this, function (items) {
                return this._mapDetails(contentLinks, items);
            }));
        },

        _mapDetails: function (contentLinks, contentModels) {
            // summary:
            //      Creates a model for each content reference in the contentLinks array with
            //      additional data from correspondig items in the contentModels array, with
            //      fallback to default values from _getDefaultContentModel
            // tags:
            //      private
            var modelHash = {};
            if (contentModels) {
                array.forEach(contentModels, function (model) {
                    if (model && model.contentLink) {
                        modelHash[model.contentLink] = model;
                    }
                });

                return array.map(contentLinks, function (contentLink) {
                    return modelHash[contentLink] || this._getDefaultContentModel(contentLink);
                }, this);
            }
        },

        _getDefaultContentModel: function (contentLink) {
            // summary:
            //      Creates a content model containing default values for when a referenced
            //      content is not found.
            // tags:
            //      private
            return {
                name: this.res.contentnotfound,
                accessMask: 1,
                contentLink: contentLink,
                saved: epiDate.transformDate(new Date(0))
            };
        },

        _getDetails: function (contentLinks) {
            // summary:
            //      Gets content models from the "light" content store.
            // tags:
            //      private
            return this.store.executeMethod("List", null, contentLinks);
        },

        _createCommands: function () {
            // summary:
            //		Create the commands for the context menu.
            // tags:
            //		private
            var self = this;

            this.add("commands", new ChangeContext({
                category: "menuWithSeparator"
            }));

            this.add("commands", new DelegateCommand({
                name: "moveUp",
                category: "itemContext",
                label: sharedResources.action.moveup,
                iconClass: "epi-iconUp",
                isAvailable: true,
                delegate: lang.hitch(this, this.moveItemUpDelegate),
                _onModelChange: function () {
                    if (this.model.ids.length !== 1) {
                        this.set("canExecute", false);
                        return;
                    }

                    var id = this.model.ids[0];
                    var item = self.valueStore.get(id);
                    this.set("canExecute", item.index !== 0 && !self.get("readOnly"));
                }
            }));

            this.add("commands", new DelegateCommand({
                name: "moveDown",
                category: "menuWithSeparator",
                label: sharedResources.action.movedown,
                iconClass: "epi-iconDown",
                isAvailable: true,
                delegate: lang.hitch(this, this.moveItemDownDelegate),
                _onModelChange: function () {
                    if (this.model.ids.length !== 1) {
                        this.set("canExecute", false);
                        return;
                    }

                    var id = this.model.ids[0];
                    var item = self.valueStore.get(id);
                    var indexOfLastItem = self.valueStore.data.length - 1;
                    this.set("canExecute", item.index !== indexOfLastItem && !self.get("readOnly"));
                }
            }));

            this.add("commands", new DelegateCommand({
                name: "remove",
                category: "itemContext",
                label: sharedResources.action.remove,
                iconClass: "epi-iconTrash",
                _onModelChange: function () {
                    this.set("canExecute", !self.get("readOnly"));
                },
                isAvailable: true,
                delegate: lang.hitch(this, this.removeItemDelegate)
            }));
        },

        removeItemDelegate: function (cmd) {
            // summary:
            //      execute delegate for remove command.
            // tags:
            //      protected

            if (!cmd || !cmd.model) {
                return;
            }
            this.removeItems(cmd.model.ids);
        },

        moveItemUpDelegate: function (cmd) {
            // summary:
            //      execute delegate for move up command.
            // tags:
            //      protected

            if (!cmd || !cmd.model) {
                return;
            }
            var currentId = cmd.model.ids[0];
            var currentIndex = this.valueStore.get(currentId).index;
            this.moveItems([currentId], currentIndex - 1, true);
        },

        moveItemDownDelegate: function (cmd) {
            // summary:
            //      execute delegate for move down command.
            // tags:
            //      protected

            if (!cmd || !cmd.model) {
                return;
            }
            var currentId = cmd.model.ids[0];
            var currentIndex = this.valueStore.get(currentId).index;
            this.moveItems([currentId], currentIndex + 1, false);
        },

        navigateToItem: function (item) {
            // summary:
            //      Requests a context change to the content link on the specified item.
            // tags:
            //      public

            if (!ContentActionSupport.hasAccess(item.accessMask, ContentActionSupport.accessLevel.Read)) {
                return;
            }
            var uri = "epi.cms.contentdata:///" + item.contentLink;

            // Request a context change
            topic.publish("/epi/shell/context/request", { uri: uri }, { sender: this });
        },

        updateCommandModel: function (model) {
            // summary:
            //		Updates the model for the commands.
            // tags:
            //		public override
            array.forEach(this.commands, function (command) {
                if (command.isInstanceOf(ChangeContext)) {
                    if (model.ids.length === 1) {
                        var selectedId = model.ids[0];
                        command.set("model", this.valueStore.get(selectedId));
                    } else {
                        command.set("model", null);
                    }
                } else {
                    command.set("model", model);
                }
            }, this);
        }
    });
});
