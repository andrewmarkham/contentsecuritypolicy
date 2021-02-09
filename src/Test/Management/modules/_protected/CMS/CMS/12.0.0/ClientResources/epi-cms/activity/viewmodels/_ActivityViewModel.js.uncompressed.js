define("epi-cms/activity/viewmodels/_ActivityViewModel", [
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/regexp",
    "dojo/when",
    "dojox/html/entities",
    "epi/dependency",
    "epi/string",
    // Parent class and mixins
    "dojo/Stateful",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.activities.activity",
    "epi/i18n!epi/cms/nls/episerver.shared.action",
    "epi/i18n!epi/cms/nls/episerver.cms.notification.autocomplete"
],
function (
    declare,
    Deferred,
    all,
    regexp,
    when,
    entities,
    dependency,
    string,
    // Parent class and mixins
    Stateful,
    // Resources
    activitiesResources,
    actionResources,
    notificationResources
) {

    return declare([Stateful], {
        // summary:
        //      Base class view model for the activity components.
        // tags:
        //      internal abstract

        activityService: null,

        editLabel: actionResources.edit,

        // comment: [public] String
        //      The main comment for this activity. Use this.getComment() to access it.
        comment: null,

        // sendLabel: [public] String
        //      Label for sending form
        sendLabel: actionResources.post,

        // resetLabel: [public] String
        //      Label for reset form
        resetLabel: actionResources.cancel,

        // errorMessage: [public] String
        //      Error message when post fails
        errorMessage: "",

        // isEditEnabled: [public] Boolean
        //      A flag indicating whether to allow edit capabilities
        isEditEnabled: true,

        // readOnly: [public] boolean
        //      A flag indicating if the widget should be read only
        readOnly: true,

        // hideOnPost: [public] Boolean
        //      Indicates whether buttons should be hidden when a post is triggered.
        hideOnPost: true,

        // placeholderText: [public] String
        //      Placeholder text for textarea
        placeholderText: "",

        // noNotificationUserMessage: [public] String
        //      The message to show when there are no notification users
        //      returned from the server.
        noNotificationUserMessage: notificationResources.nodatamessage,

        // notificationUserStore: [public] Object
        //      The store to query for notification users.
        notificationUserStore: null,

        postscript: function () {
            this.inherited(arguments);

            this.activityService = this.activityService || dependency.resolve("epi.cms.ActivityService");
            this.profile = this.profile || dependency.resolve("epi.shell.Profile");
            this.notificationUserStore = this.notificationUserStore || dependency.resolve("epi.storeregistry").get("epi.cms.notification.users");
        },

        getComment: function () {
            // summary:
            //      Returns this.comment html encoded.
            // tags:
            //      public

            var comment = this.comment;
            if (!comment) {
                return "";
            }
            return this._formatText(comment);
        },

        save: function (message) {
            // summary:
            //      Saves the message by updating or creating as appropriate.
            // tags:
            //      public
            var promise = this._save(message);

            promise.otherwise(this._handleError.bind(this));

            return promise;
        },

        _save: function (message) {
            // summary:
            //      Called by save method. Should be overridden is subclasses.
            // tags:
            //      protected abstract
        },

        _formatText: function (text) {
            // summary:
            //      Clean up HTML tags and newlines. Encode the entire message.
            // tags:
            //      private

            if (!text) {
                return "";
            }

            var map = entities.html;

            text = entities.encode(text, map);
            text = text.replace(/\r\n|\n|\r/ig, "<br/>");
            return text;
        },

        _handleError: function () {
            // summary:
            //      Sets error message
            // tags:
            //      private
            this.set("errorMessage", activitiesResources.errormessage);
        },

        _isEditEnabledGetter: function () {
            // summary:
            //      Returns whether edit should be enabled
            // description:
            //      Overridden to disallow editing for others than original authors
            // tags:
            //      private

            // If message property is set, we do not want offer other users than the original author to edit
            if (this.message) {
                return (this.author || this.changedBy) === this.profile.userName;
            }
            return this.isEditEnabled;
        },

        _messageSetter: function (message) {
            // summary:
            //      Sets the message and notifies observers that the formatted message has also
            //      changed as a result of this.
            // tags:
            //      private

            this.message = message;
            this._changeAttrValue("formattedMessage", this.get("formattedMessage"));
        },

        _formattedMessageGetter: function () {
            // summary:
            //      Gets an HTML formatted string with the tags converted to the display name of the
            //      user if they exist.
            // tags:
            //      private

            var message = this._formatText(this.message);

            // Early exit if there is no message or the notification user store is not set.
            if (!message || !this.notificationUserStore) {
                return new Deferred().resolve(message);
            }

            // Extract strings beginning with @ to match with users
            var regex = /\B@([^\s":;|=,+*?<>[\]]+)/g,
                matches = message.match(regex) || [],
                matchMap = {},
                promises = matches.map(function (match) {
                    // Get the username by removing the @ symbol
                    var username = match.replace(/^@/, "");

                    // Get the user data for each matched tag.
                    return when(this.notificationUserStore.query({name: username, exactMatch: true}))
                        .then(function (user) {
                            matchMap[username] = user.displayName;
                        })
                        .otherwise(function () {
                            // Non-existing usernames will return a 404 so we swallow the error in
                            // order for the all(promises) not to fail.
                        });
                }.bind(this));

            // Replace all the matched tags with the user's display name.
            return all(promises).then(function () {
                message = message.replace(regex, function (match, key) {
                    return matchMap[key] ? "<strong>" + string.encodeForWebString(matchMap[key]) + "</strong>" : match;
                });

                return message;
            });
        }
    });
});
