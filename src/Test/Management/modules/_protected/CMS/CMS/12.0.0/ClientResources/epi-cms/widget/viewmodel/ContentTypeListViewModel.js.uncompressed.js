define("epi-cms/widget/viewmodel/ContentTypeListViewModel", [
    // dojo
    "dojo/_base/array",
    "dojo/_base/declare",

    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/when",
    "dojo/Stateful",

    // epi
    "epi/dependency"
],

function (
    // dojo
    array,
    declare,

    Deferred,
    all,
    when,
    Stateful,

    // epi
    dependency
) {
    return declare([Stateful], {
        // summary:
        //      The view model for ContentTypeList
        // tags:
        //      internal

        // store: [readonly] dojo/store
        //      Underlying store which will be queried for data to display.
        store: null,

        // parentLink: [public] String
        //      Link to parent content which the new content will be created beneath.
        parentLink: null,

        // groups: [public] Object
        //      Named value object containing the current content type groups.
        groups: null,

        // requestedType: [public] String
        //      Specify the content type to be shown on the list.
        requestedType: null,

        // allowedTypes: [public] Array
        //      The types which are allowed. i.e used for filtering based on AllowedTypesAttribute
        allowedTypes: null,

        // restrictedTypes: [public] Array
        //      The types which are restricted.
        restrictedTypes: null,

        contentTypeService: null,

        // localAsset: [public] Boolean
        //      TRUE if a new content will be created as a local asset
        localAsset: false,

        // otherTypesTitle: [public] String
        //      The title for otherTypes
        otherTypesTitle: null,

        postscript: function () {
            // summary:
            //      Initiates the store if none has been mixed in.
            // tags:
            //      protected

            this.inherited(arguments);

            this.groups = {};

            this.contentTypeService = this.contentTypeService || dependency.resolve("epi.cms.ContentTypeService");

            if (!this.store) {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get("epi.cms.contenttype");
            }
        },
        getSortedSuggestedContentTypes: function () {
            // summary:
            //      Sort the suggested content types
            // tags:
            //      private
            return when(this._getSuggestedContentTypes(this.requestedType)).then(function (types) {
                if (types.length > 1) {
                    this._sortContentTypes(types);
                }
                return types;
            }.bind(this));
        },
        getSortedGroupContentTypes: function () {
            // summary:
            //      Sort the suggested content types
            // tags:
            //      private
            return when(this._groupContentTypes()).then(function (groups) {
                // Clear and load the available content types sorted into groups.
                var grouped = groups.grouped;

                for (var key in grouped) {
                    this._sortContentTypes(grouped[key]);
                }

                return groups;
            }.bind(this));
        },
        clear: function () {
            for (var key in this.groups) {
                this.groups[key].destroyRecursive();
                delete this.groups[key];
            }
        },
        _getAvailableContentTypes: function (type) {
            // summary:
            //      Query for available content types based on the type.
            // tags:
            //      private

            return this.contentTypeService.getAcceptedChildTypes(this.parentLink, this.localAsset, [type], this.allowedTypes, this.restrictedTypes);
        },

        _getSuggestedContentTypes: function (type) {
            // summary:
            //      Query for suggested content types based on the parent page.
            // tags:
            //      private

            var result = this.store.query({
                query: "getsuggestedcontenttypes",
                localAsset: this.localAsset,
                parentReference: this.parentLink,
                requestedTypes: [type]
            });

            return this.contentTypeService.filterQueryResult(result, this.allowedTypes, this.restrictedTypes);
        },

        _groupContentTypes: function () {
            // summary:
            //      Group the available content types.
            // tags:
            //      private

            var grouped = {},
                deferred = new Deferred(),
                otherGroupType = this.otherTypesTitle;

            when(this._getAvailableContentTypes(this.requestedType))
                .then(function (available) {
                    var count = available.length;
                    array.forEach(available, function (item) {
                        when(item, function (type) {
                            var groupName = type.groupName || otherGroupType,
                                group = grouped[groupName] || [];

                            group.push(type);
                            grouped[groupName] = group;
                            count--;
                            if (count === 0) {
                                deferred.resolve({ grouped: grouped, contentTypes: available });
                            }
                        });
                    });
                }.bind(this));

            return deferred;
        },

        _sortContentTypes: function (types) {
            // summary:
            //      Sort a list of content types by localized name
            // tags:
            //      private

            if (types && types.length > 1) {
                types.sort(function (a, b) {
                    return a.localizedName <= b.localizedName ? -1 : 1;
                });
            }
        }
    });
});
