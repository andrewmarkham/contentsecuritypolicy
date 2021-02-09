define("epi-cms/contentediting/viewmodel/ContentActivityFeedViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",

    "epi/dependency",
    // Parent class and mixins
    "epi-cms/project/viewmodels/_ProjectFeedViewModel"
], function (
    declare,
    lang,
    when,

    dependency,
    // Parent class and mixins
    _ProjectFeedViewModel
) {

    return declare([_ProjectFeedViewModel], {
        // summary:
        //      View model for the content activity feed. Handles setting query and store state as well as
        //      saving new message activities.
        // tags:
        //      internal

        // isSingleItemSelected: [readonly] Boolean
        //      Indicates whether there is only a single item selected.
        isSingleItemSelected: true,

        // _contentLink: [private] String
        //      Content link of the current content.
        _contentLink: null,

        // isActivitiesVisible: [readonly] Boolean
        //      A flag which indicates whether the activities panel
        //      should be visible.
        isActivitiesVisible: false,

        // _activityFeedSettings: [readonly] Object
        //      Persist value for the ActivityFeed pane
        _activityFeedSettings: null,

        postscript: function () {
            this.inherited(arguments);

            this.store = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.activities");
            this.profile = this.profile || dependency.resolve("epi.shell.profile");

            this._activityFeedSettings = {};
            when(this.profile.get(this._getActivityFeedProfileKey())).then(function (result) {
                this._activityFeedSettings = result;

                // set to false if isActivitiesVisible hasn't been stored
                this.set("isActivitiesVisible", !!(result && result.isActivitiesVisible));
            }.bind(this));
        },

        _contentLinkSetter: function (contentLink) {
            // summary:
            //      Sets the content link and updates the query.
            // tags:
            //      private

            // Set parameters needed by the add message function.
            this._contentLink = contentLink;
            this._updateQuery();
        },

        _isActivitiesVisibleSetter: function (value) {
            this.isActivitiesVisible = value;
            this._updateQuery();

            this._persistActivityFeedSettings({ isActivitiesVisible: value });
        },

        _updateQuery: function () {
            if (this.isActivitiesVisible && this._contentLink) {
                this.set("query", {
                    contentReferences: [this._contentLink]
                });
            } else {
                this.set("query", null);
            }
        },

        _nameSetter: function (name) {
            // summary:
            //      Sets the name of the content and updates the placeholder.
            // tags:
            //      private
            this.set("placeholderName", name);
        },

        _persistActivityFeedSettings: function (settings) {
            // summary:
            //      Saves activity feed settings
            // tags:
            //      private

            this._activityFeedSettings = lang.mixin(this._activityFeedSettings, settings);
            this.profile.set(this._getActivityFeedProfileKey(), this._activityFeedSettings);
        },

        getActivityFeedSettings: function () {
            // summary:
            //      Gets the activity feed settings

            return this._activityFeedSettings;
        },

        _getActivityFeedProfileKey: function () {
            // summary:
            //    Get prefixed key name
            // tags:
            //    private

            return this.componentTypeName + "activity-feed";
        }
    });
});
