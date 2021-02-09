define("epi-cms/project/viewmodels/_ProjectFeedViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/i18n!epi/cms/nls/episerver.cms.activities.activity",
    // Parent class and mixins
    "epi-cms/activity/viewmodels/_ActivityViewModel",
    "dojo/Evented"
], function (
    declare,
    lang,
    localizations,
    // Parent class and mixins
    _ActivityViewModel,
    Evented
) {

    return declare([_ActivityViewModel, Evented], {
        // summary:
        //      Base view model for the project feeds. Handles setting query and store state as well as
        //      saving new message activities.
        // tags:
        //      internal abstract

        // hideOnPost: [public] Boolean
        //      Indicates whether buttons should be hidden when a post is triggered.
        hideOnPost: false,

        // isEditEnabled: [public] Boolean
        //      Indicates whether to allow edit capabilities.
        isEditEnabled: false,

        // isSingleItemSelected: [readonly] Boolean
        //      Indicates whether there is only a single item selected.
        isSingleItemSelected: false,

        // readOnly: [public] Boolean
        //      Indicates whether the widget is read only.
        readOnly: false,

        // selectedProjectId: [public] Integer
        //      The currently selected project Id
        selectedProjectId: null,

        // noDataMessage: [readonly] String
        //      The message displayed when no data is available
        noDataMessage: "",

        _save: function (message) {
            // summary:
            //      Saves the given message as a new message activity.
            // tags:
            //      protected

            var promise =  this.activityService.addMessage(this.selectedProjectId, this._contentLink, message);
            promise.then(this.emit.bind(this, "save"));
            return promise;
        },

        _placeholderNameSetter: function (placeholderName) {
            this.placeholderName = placeholderName;

            // If there is a placeholder name then generate the placeholder text, otherwise default
            // to an empty string.
            var placeholder = placeholderName ?
                lang.replace(localizations.textareaplaceholder, { name: placeholderName }) : "";

            this.set("placeholderText", placeholder);
        }
    });
});
