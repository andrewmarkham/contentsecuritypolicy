define("epi-cms/widget/viewmodel/ContentReferencesViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/store/util/QueryResults",
    "dojo/when",
    "epi/shell/TypeDescriptorManager",
    // Parent class and mixins
    "dojo/Stateful",
    "dijit/Destroyable",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentreferences"
], function (
    declare,
    lang,
    aspect,
    QueryResults,
    when,
    TypeDescriptorManager,
    // Parent class and mixins
    Stateful,
    Destroyable,
    // Resources
    resources
) {
    return declare([Stateful, Destroyable], {
        // tags:
        //      internal

        // contentItems: [public] Content[]
        //      The content items whose references the widget should show.
        contentItems: null,

        // mode: [public] String
        //      What mode the content references widget should be in.
        mode: null,

        // notification: [public] String
        //      The notification text.
        notification: null,

        // notificationBarStyle: [public] Number
        //      The notification text style. 1 for green, 2 for orange and yellow for everything else.
        notificationBarStyle: null,

        // numberOfReferences: [public] Number
        //      How many references the content items have.
        numberOfReferences: null,

        // showToolbar: [public] Boolean
        //      Flag to indicate if the tool bar should show.
        showToolbar: null,

        // showGrid: [public] Boolean
        //      Flag to indicate if the content reference grid should show.
        showGrid: null,

        // totalLinks: [public] String
        //      The text for the number of references.
        totalLinks: null,

        getUpdatedStore: function (store) {
            // summary:
            //      Updates the store with functionality to support the tree structure of the data.
            // store: dojo/store
            //      The store to update.
            // tags:
            //      public

            var updatedStore = lang.delegate(store, {
                getChildren: function (object) {
                    return new QueryResults(object.references);
                },

                mayHaveChildren: function (object) {
                    return !!object.references && object.references.length > 0;
                }
            });

            this.own(aspect.after(updatedStore, "query", function (results) {
                when(results).then(this._afterStoreQuery.bind(this));
                return results;
            }.bind(this)));

            return updatedStore;
        },

        _afterStoreQuery: function (results) {
            // summary:
            //      Sets the values of properties that are dependent on the results from the store.
            // results: ReferenceItem[]
            //      An array of referenced items that will be used when getting the number of references.
            // tags:
            //      private

            var total = this._getReferencesCount(results);
            this._updateReferenceProperties(total);
            this.set("showToolbar", total > 0);
            this.set("showGrid", total > 0);
        },

        _getReferencesCount: function (results) {
            // summary:
            //      Counts the number of references in the results.
            // results: ReferenceItem[]
            //      An array of referenced items that will be used when getting the number of references.
            // tags:
            //      private

            return results.reduce(function (previousValue, referenceItem) {
                return previousValue + referenceItem.references.length;
            }, 0);
        },

        _updateReferenceProperties: function (number) {
            // summary:
            //      sets the number of references, and widget notification, styles based on the number.
            // tags:
            //      private

            var contentItems = this.contentItems,
                contentData = contentItems[0],
                hasReferences = number > 0,
                isSingleItem = contentItems.length === 1,
                // Determine if any item has children
                hasChildren = contentItems.some(function (item) {
                    return item.hasChildren;
                }),
                hasPublicUrls = contentItems.some(function (item) {
                    return !!item.publicUrl;
                });

            var setNotification = function (resourceKey, styleType) {
                resourceKey = "reference." + (isSingleItem ? "single" : "multiple") + "." + resourceKey;

                // Remarks: the typeIdentifier might be wrong if the user has selected more than one item
                // but most of the time it will display the correct resource value
                var text = TypeDescriptorManager.getResourceValue(contentData.typeIdentifier, resourceKey);

                this.set("notification", text);
                this.set("notificationBarStyle", styleType);
            }.bind(this);

            if (hasReferences) {
                setNotification(hasChildren ? "usedwithchildren" : "used", 2);
            } else if (hasPublicUrls) {
                setNotification(hasChildren ? "publicwithchildren" : "public", 2);
            } else {
                setNotification(hasChildren ? "notusedwithchildren" : "notused", hasChildren ? 2 : 1);
            }

            // build number of links text
            if (hasReferences) {
                var resourceText = number === 1 ? resources.totallink : resources.totallinks;
                var numberOfLinks = lang.replace(resourceText, [number]);
                this.set("totalLinks", numberOfLinks);
            }

            this.set("numberOfReferences", number);
        }

    });
});
