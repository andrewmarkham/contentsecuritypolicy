define("epi-cms/activity/viewmodels/ActivityViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/Destroyable",

    "epi/datetime",
    "epi/username",
    "epi/shell/TypeDescriptorManager",
    "epi-cms/ApplicationSettings",

    // Parent class and mixins
    "./_ActivityViewModel",
    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.activities.activity"
],
function (
    declare,
    lang,
    Destroyable,

    datetime,
    username,
    TypeDescriptorManager,
    ApplicationSettings,
    // Parent class and mixins
    _ActivityViewModel,
    // Resources
    localization
) {

    return declare([_ActivityViewModel, Destroyable], {
        // summary:
        //      The view model for an activity.
        // tags:
        //      internal


        // id: [readonly] number
        //      The id of the activity
        id: null,

        // hasMessage: [readonly] Boolean
        //      Indicates whether this activity has a message. Used to
        //      determine the edit label.
        hasMessage: false,

        // title: [readonly] string
        //      The title for the activity
        title: null,

        // content: [readonly] string
        //      The content for the activity
        content: null,

        // comment: [readonly] string
        //      The comment on the activity, if any
        comment: null,

        // actionIconClass: [readonly] string
        //      The actionIconClass for the activity
        actionIconClass: null,

        // actionClass: [readonly] string
        //      The actionClass for the activity
        actionClass: null,

        // iconClass: [readonly] string
        //      The iconClass for the activity
        iconClass: null,

        _resources: localization,

        postscript: function () {
            this.inherited(arguments);

            this.set({
                id: this.activity.id,
                hasMessage: !!this.activity.message,
                upsertActivityComment: null,
                comment: this.activity.comment,
                title: this.activity.name
            });

            this.own(
                this.activityService.on("activity-comment-updated", lang.hitch(this, this._activityCommentUpdated))
            );

            this.set("actionIconClass", lang.replace("epi-icon{actionIcon} epi-icon--{actionColor}", this.activity));
            this.set("actionClass", lang.replace("epi-event--{actionColor} epi-event--{actionColor}-{activityType}", this.activity));

            // Set the icon class from the type identifier or default to the project icon.
            this.set("iconClass", TypeDescriptorManager.getValue(this.activity.typeIdentifier, "iconClass") || "epi-iconProject");

            var activity = this.activity;
            // Set the message based on the user and date updated.
            var template = activity.delayPublishUntil ? this._resources.delaypublishmessagetemplate : this._resources.messagetemplate;
            var content = lang.replace(template, {
                event: activity.actionText,
                delaypublish: datetime.toUserFriendlyString(activity.delayPublishUntil),
                user: username.toUserFriendlyString(activity.changedBy),
                date: datetime.toUserFriendlyString(activity.created)
            });

            this.set("content", content);
        },

        _editLabelGetter: function () {
            // summary:
            //      Gets the edit label.
            // tags:
            //      private

            return this.hasMessage ? this._resources.message.reply.label : this._resources.message.comment.label;
        },

        _save: function (message) {
            // summary:
            //      Adds a new comment.
            // tags:
            //      protected

            return this.activityService.addComment(this.id, message);
        },

        _activityCommentUpdated: function (comment) {
            // summary:
            //     Sets the given comment as upsertActivityComment only if comment belongs to the current activity
            // tags:
            //      private

            // there could be many instances of activity but it should add/update comment to the relevant activity.
            if (comment && comment.activityId === this.id) {
                this.set("upsertActivityComment", comment);
            }
        },
        _titleSetter: function (title) {
            // summary:
            //      Sets title, and appends the language identifier to the title if the content language is different from
            //      the editing language.
            // tags:
            //      private

            var language = this.activity.language;
            if (language && language !== ApplicationSettings.currentContentLanguage) {
                title = lang.replace("{0} ({1})", [title, language]);
            }

            this.title = title;
        }
    });
});
