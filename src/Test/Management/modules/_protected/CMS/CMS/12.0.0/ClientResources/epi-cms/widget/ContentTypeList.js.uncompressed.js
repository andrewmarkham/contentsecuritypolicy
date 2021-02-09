define("epi-cms/widget/ContentTypeList", [
// dojo
    "dojo/_base/declare",

    "dojo/dom-class",

    "dojo/promise/all",
    "dojo/when",

    // dijit
    "dijit/layout/_LayoutWidget",
    // epi
    "epi/shell/TypeDescriptorManager",
    "epi-cms/widget/ContentTypeGroup",
    "epi-cms/widget/viewmodel/ContentTypeListViewModel",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contenttypelist"
],

function (
// dojo
    declare,

    domClass,

    all,
    when,
    // dijit
    _LayoutWidget,
    // epi
    TypeDescriptorManager,
    ContentTypeGroup,
    ContentTypeListViewModel,
    i18n
) {

    return declare([_LayoutWidget], {
        // summary:
        //      A list of suggested and available content types for content creation.
        // description:
        //      Displays a list of suggested and available content types for content creation.
        // tags:
        //      internal

        // parentLink: [public] String
        //      Link to parent content which the new content will be created beneath.
        parentLink: null,

        // requestedType: [public] String
        //      Specify the content type to be shown on the list.
        requestedType: null,

        // shouldSkipContentTypeSelection: [public] Boolean
        //      Indicate that we have only 1 available type, so type selection can be skipped.
        shouldSkipContentTypeSelection: null,

        // allowedTypes: [public] Array
        //      The types which are allowed. i.e used for filtering based on AllowedTypesAttribute
        allowedTypes: null,

        // restrictedTypes: [public] Array
        //      The types which are restricted.
        restrictedTypes: null,

        postMixInProperties: function () {
            // summary:
            //      Initiates the store if none has been mixed in.
            // tags:
            //      protected

            this.inherited(arguments);

            this.model = new ContentTypeListViewModel();

            this.own(this.model);
        },

        buildRendering: function () {
            // summary:
            //      Construct the base UI with suggested content types.
            // tags:
            //      protected

            this.inherited(arguments);

            var suggested = new ContentTypeGroup();
            this.connect(suggested, "onSelect", function (item) {
                this.onContentTypeSelected(item);
            });
            this.addChild(suggested);
            this._suggestedContentTypes = suggested;
        },

        refresh: function () {
            // summary:
            //      Refresh the content and rendered view of the list.
            // tags:
            //      public

            // Clear any existing data first to stop flickering in the UI.
            this.clear();

            this._setupWidgetTemplate();

            when(all({
                types: this.model.getSortedSuggestedContentTypes(),
                groups: this.model.getSortedGroupContentTypes()
            })).then(function (result) {
                var types = result.types,
                    groups = result.groups,
                    grouped = groups.grouped,
                    contentTypes = groups.contentTypes;

                // Setup the suggested content types.
                if (types.length <= 0) {
                    // Hide suggested content types only
                    this._suggestedContentTypes.setVisibility(false);
                } else {
                    // Setup the suggested content types.
                    domClass.add(this._suggestedContentTypes.titleNode, "epi-ribbonHeaderSpecial");
                    this._suggestedContentTypes.set("title", this._suggestedTypesTitle);
                    this._suggestedContentTypes.set("contentTypes", types);
                    this._suggestedContentTypes.setVisibility(true);
                }

                // Clear and load the available content types sorted into groups.
                var key, group;

                // Update remaining groups with new content types.
                for (key in grouped) {
                    group = this._getOrCreateGroup(key);
                    group.set("contentTypes", grouped[key]);
                }

                if (contentTypes instanceof Array && contentTypes.length === 1) {
                    // If we have 1 child only, hide all
                    this.setVisibility(false);

                    this.set("shouldSkipContentTypeSelection", true);

                    // Automatically select page type in case only one page type is allowed under the selected container.
                    this.onContentTypeSelected(contentTypes[0]);
                } else {
                    this.set("shouldSkipContentTypeSelection", false);
                }
            }.bind(this));
        },

        setVisibility: function (display) {
            // summary:
            //      The common method to show / hide this widget
            // display: Boolean
            //      The flag to show or hide.
            // tags:
            //      pubic

            this.getChildren().forEach(function (group) {
                group.setVisibility(display);
            }, this);
        },

        _setupWidgetTemplate: function () {
            this._suggestedTypesTitle = TypeDescriptorManager.getResourceValue(this.requestedType, "suggestedtypes");
            this.model.otherTypesTitle = TypeDescriptorManager.getResourceValue(this.requestedType, "othertypes");
        },

        clear: function () {
            // summary:
            //      Removes all the content types groups from the current view, except for
            //      suggested content types which will only have it's children removed.
            // tags:
            //      public

            this._suggestedContentTypes.clear();

            this.model.clear();
        },

        _getOrCreateGroup: function (name) {
            var group = this.model.groups[name];
            if (!group) {
                group = new ContentTypeGroup({ title: name });
                this.connect(group, "onSelect", function (item) {
                    this.onContentTypeSelected(item);
                });
                this.addChild(group);
                this.model.groups[name] = group;
            }

            return group;
        },

        _setLocalAssetAttr: function (localAsset) {
            this._set("localAsset", localAsset);
            this.model.set("localAsset", localAsset);

            if (this.requestedType && this.parentLink) {
                this.refresh();
            }
        },

        _setParentLinkAttr: function (value) {
            this._set("parentLink", value);
            this.model.set("parentLink", value);

            if (this.requestedType) {
                this.refresh();
            }
        },

        _setRequestedTypeAttr: function (value) {
            this._set("requestedType", value);
            this.model.set("requestedType", value);
        },
        _setAllowedTypesAttr: function (value) {
            this._set("allowedTypes", value);
            this.model.set("allowedTypes", value);
        },
        _setRestrictedTypesAttr: function (value) {
            this._set("restrictedTypes", value);
            this.model.set("restrictedTypes", value);
        },

        onContentTypeSelected: function (/*===== item =====*/) {
            // summary:
            //      Event raised when a content type widget on the list
            //      is clicked.
            // tags:
            //      callback
        }
    });

});
