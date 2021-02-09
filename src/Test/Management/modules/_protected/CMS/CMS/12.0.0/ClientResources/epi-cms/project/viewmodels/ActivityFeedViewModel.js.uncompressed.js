define("epi-cms/project/viewmodels/ActivityFeedViewModel", [
    "dojo/_base/declare",
    // Parent class and mixins
    "./_ProjectFeedViewModel"
], function (
    declare,
    // Parent class and mixins
    _ProjectFeedViewModel
) {

    return declare([_ProjectFeedViewModel], {
        // summary:
        //      View model for the activity feed. Handles setting query and store state as well as
        //      saving new message activities.
        // tags:
        //      internal

        // _contentLink: [private] String
        //      Content link of the selected project item.
        _contentLink: null,

        postscript: function () {
            this.inherited(arguments);

            // Set the default no data message to be no query.
            this.set("noDataMessage", this.noQueryMessage);
        },

        _selectedProjectItemsSetter: function (selectedItems) {

            selectedItems = selectedItems || [];

            // Map the selected items to a list of content references filtering out items that
            // don't have a content link, e.g. when user doesn't have access to the item.
            var references = selectedItems.filter(function (item) {
                return !!item.contentLink;
            });

            // Single selection is determined by whether there is one item selected and
            // whether the user has access to that item.
            var isSingleItem = selectedItems.length === 1 && references.length === 1;

            this.set("isSingleItemSelected", isSingleItem);

            // Set the placeholder text using the single items name.
            var placeholderName = isSingleItem ? references[0].name : "";
            this.set("placeholderName", placeholderName);

            // Set parameters needed by the add message function.
            this._contentLink = isSingleItem ? references[0].contentLink : null;

            // If there is no query then set the no data message to reflect that; otherwise
            // default to the no access message since an empty result set indicates that the
            // user has no access.
            this.set("noDataMessage", selectedItems.length ? this.noAccessMessage : this.noQueryMessage);

            // If there is no query then set the store to null so that the
            // dgrid doesn't query for everything.
            this.set("store", references.length ? this.activitiesStore : null);

            // Set the activity query if there are selected items otherwise set null.
            var query = {
                contentReferences: references.map(function (item) {
                    return item.contentLink;
                }),
                projectId: this.selectedProjectId
            };
            this.set("query", references.length ? query : null);
        }
    });
});
