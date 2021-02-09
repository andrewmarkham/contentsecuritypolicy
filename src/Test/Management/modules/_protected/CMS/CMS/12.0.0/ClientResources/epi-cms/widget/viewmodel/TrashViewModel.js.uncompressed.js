define("epi-cms/widget/viewmodel/TrashViewModel", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/when",
    "dojo/Stateful",
    "dojo/_base/json",

    // EPi Framework
    "epi/epi",
    "epi/shell/TypeDescriptorManager",
    "epi/dependency",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.trash"
],

function (
// Dojo
    array,
    declare,
    lang,
    topic,
    when,
    Stateful,
    json,

    // EPi Framework
    epi,
    TypeDescriptorManager,
    dependency,

    // Resources
    resources
) {
    return declare([Stateful], {
        // summary:
        //      The view model for trash component widget
        //
        // tags:
        //      internal

        resources: resources,

        // trashes: [List]
        //      List of trash, including system and content provider's trash.
        trashes: null,

        // currentTrash: [Object]
        //      Current active trash to get content from.
        currentTrash: null,

        // queryOptions: [Object]
        //      Query options object, which contains query object and options object, to get content for a specific trash.
        queryOptions: null,

        // isEmptyTrash: [Boolean]
        //      State of Empty Trash action.
        isEmptyTrash: false,

        // storeRegistry: [Object]
        //      The store registry.
        storeRegistry: null,

        // contentStore: [Object]
        //      Represents the REST store to get data.
        contentStore: null,

        // contentService: [epi-cms/contentediting/ContentHierarchyService]
        //      A service to perform changes to the content structure
        contentService: null,

        // contentStore: [Object]
        //      Represents the REST store to get trashes.
        trashStore: null,

        // showAllLanguages: [bool]
        //      Flag to indicate whether should we get all language for content in trash.
        showAllLanguages: true,

        // _contentRepositoryDescriptors: [Object]
        //      Contains settings for different content repositories, like root and contained types.
        _contentRepositoryDescriptors: null,

        postscript: function () {
            this.inherited(arguments);

            this.storeRegistry = this.storeRegistry || dependency.resolve("epi.storeregistry");

            this.contentStore = this.contentStore || this._getStore();
            this.contentService = this.contentService || dependency.resolve("epi.cms.ContentHierarchyService");
            this.trashStore = this.trashStore || this.storeRegistry.get("epi.cms.wastebasket");

            this._contentRepositoryDescriptors = this._contentRepositoryDescriptors || dependency.resolve("epi.cms.contentRepositoryDescriptors");

            if (!this.trashes) {
                this._createTrashes();
            }
        },

        destroy: function () {
            epi.removeDelegateAspects(this.contentStore);
        },

        _getStore: function () {
            var store = this.storeRegistry.get("epi.cms.content.light"),
                model = this;
            var hierarchicalStore = epi.delegate(store, {
                // the Tree plugin for dGrid needs these 2 functions to be available in store:
                getChildren: function (parent, options) {
                    var currentTrash = model.get("currentTrash"),
                        queryOptions = model._createQueryOptions(currentTrash);

                    lang.mixin(queryOptions.query, { referenceId: parent.contentLink });
                    return this.query(queryOptions.query, queryOptions.options);
                },

                mayHaveChildren: function (parent) {
                    return parent.hasChildren;
                }
            }, ["notify"]);

            return hierarchicalStore;
        },

        _createTrashes: function () {
            when(this.trashStore.query(), function (trashes) {
                this.set("trashes", lang.clone(trashes));
            }.bind(this));
        },

        _currentTrashSetter: function (trash) {
            // summary:
            //      Sets current trash
            // tags:
            //      private
            this.currentTrash = trash;

            if (trash.isRequireLoad) {
                this.updateTrash(trash);
                trash.isRequireLoad = false;
            }
        },

        getEmptyTrashConfirmMessage: function (trashName) {
            // summary:
            //      Get the empty trash confirm message
            // trashName: String
            //      The name of the trash to append to the confirm message if there are more than one provider
            // tags:
            //      public

            var confirmMessage = resources.emptytrash.singleproviderdescription;

            if (this.trashes.length > 1) {
                confirmMessage = resources.emptytrash.description.replace("{0}", trashName);
            }

            return confirmMessage;
        },

        updateTrash: function (trash) {
            // summary:
            //      Process active trash only, otherwise return empty list.
            // tags:
            //      public

            if (trash && trash.active) {
                this.set("queryOptions", this._createQueryOptions(trash)); // ask widget to update UI, by using this query
            } else {
                this.set("queryOptions", null);
            }
        },

        _createQueryOptions: function (trash) {
            // summary:
            //      Creates a query options object from input trash.
            // tags:
            //      private

            var query = { referenceId: trash.wasteBasketLink, query: "getchildren" };
            var options = { ignore: ["query"], comparers: this._createComparers() };

            if (this.showAllLanguages) {
                lang.mixin(query, { allLanguages: this.showAllLanguages });
                options.ignore.push("allLanguages");
            }

            if (trash.isSearchable) {
                lang.mixin(query, { isSearchable: trash.isSearchable });
                options.ignore.push("isSearchable");
            }

            if (trash.queryText) {
                lang.mixin(query, {
                    query: "searchdeletedcontent",
                    matchProvider: true,
                    queryText: trash.queryText
                });
            }

            return { query: query, options: options };
        },

        _createComparers: function () {
            // summary:
            //      Creates a comparer which check type identifier, to be used in CustomQueryEngine to filter content by type identifier.
            // tags:
            //      private

            return {
                referenceId: function (required, object) {
                    return required === object.parentLink;
                }
            };
        },

        emptyTrash: function (trashId) {
            // summary:
            //      Delete all items from a specific trash.
            // tags:
            //      public

            if (!trashId) {
                return;
            }

            when(this.trashStore.executeMethod("Empty", trashId), function (response) {
                // Get all trashes that have specific trash id.
                var trashes = array.filter(this.get("trashes"), function (trash) {
                    return trash && trash.wasteBasketLink === trashId;
                });

                // loop through all affected trashes, turn the isRequireLoad flag to true
                array.forEach(trashes, function (trash) {
                    trash.isRequireLoad = true;
                });

                this.isEmptyTrash = true;
                topic.publish("/epi/cms/trash/empty", response.extraInformation);

                // let's refresh the data of current trash now
                if (this.currentTrash.wasteBasketLink === trashId) {
                    this.set("currentTrash", this.currentTrash);
                }

                // ask UI to show alert message if needed
            }.bind(this), function (response) {
                if (response.status === 403) {
                    this.set("actionResponse", resources.emptytrash.accessdenied);
                }
            }.bind(this));
        },

        deleteContent: function (contentLink) {
            // summary:
            //      Delete a specific content from a specific trash.
            //      Request to update UI in the case of deleting content successfully
            //  contentId: ContentLink
            //      The content link to delete
            // tags:
            //      public

            if (!contentLink) {
                return;
            }
            when(this.trashStore.executeMethod("PermanentDelete", contentLink)
                .then(function (response) {
                    var self = this;
                    var trashes = this.get("trashes");
                    var trashIndex;

                    trashes.some(function (trash, index) {
                        if (response.extraInformation === trash.wasteBasketLink) {
                            trashIndex = index;
                            trash.isRequireLoad = true;
                            self.set("currentTrash", trash);
                            return true;
                        }
                        return false;
                    });

                    // update isRequireLoad to true for the matching wasteBasketLink
                    // because the currentTrash setter which is called in the trashes.some function above resets isRequireLoad to false
                    if (trashIndex) {
                        trashes[trashIndex].isRequireLoad = true;
                    }
                }.bind(this))
                .otherwise(function (response) {
                    if (response.status === 403) {
                        this.set("actionResponse", resources.singledelete.accessdenied);
                    } else if (response.status === 400) {
                        this.set("actionResponse", resources.singledelete.notfromwastebasket);
                    }
                }.bind(this)));
        },

        restore: function (sourceContent, targetLink) {
            // summary:
            //      Restore content from a specific trash to specific content.
            //  source: Content
            //      The content source to restore
            // targetLink: ContentLink
            //      The target link to restore
            // tags:
            //      public

            if (!(sourceContent && sourceContent.contentLink && sourceContent.isDeleted && targetLink)) {
                return;
            }

            return this.contentService.move(sourceContent.contentLink, targetLink);
        },

        getOldParent: function (contentLink) {
            // summary:
            //      Get old parent of specific contentLink.
            // tags:
            //      public

            var query = {
                referenceId: contentLink,
                query: "getrestorepoint",
                allLanguages: true
            };

            return when(this.contentStore.query(query)).then(function (parentContent) {
                var parent = parentContent && lang.isArray(parentContent) && parentContent.length > 0 ? parentContent[0] : null;
                return parent;
            });
        }
    });
});
