define("epi-cms/activity/ActivityService", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Evented",
    "dijit/Destroyable",
    "epi/dependency"
],
function (declare, lang, Evented, Destroyable, dependency) {

    return declare([Evented, Destroyable], {
        // summary:
        //      A service for interacting with activities and activity comments
        // tags:
        //      internal

        // activityStore: [readonly] Store
        //      A REST store for interacting with activities.
        activityStore: null,

        // activityCommentStore: [readonly] Store
        //      A REST store for interacting with activity comments.
        activityCommentStore: null,

        constructor: function (params) {
            declare.safeMixin(this, params);

            this.activityStore = this.activityStore || dependency.resolve("epi.storeregistry").get("epi.cms.activities");
            this.activityCommentStore = this.activityCommentStore || dependency.resolve("epi.storeregistry").get("epi.cms.activities.comments");

            this.own(
                this.activityCommentStore.on("update", this._onActivityCommentUpdated.bind(this))
            );
        },

        addMessage: function (projectId, contentLink, message) {
            // summary:
            //     Adds a message activity to the project. If a content link is also given then the
            //     activity will also be associated with the content.
            // projectId: Number
            //      The id of the project to associate with the message activity
            // contentLink: String
            //      The content link of the content to associate with the message activity;
            //      otherwise null
            // message: String,
            //      The message to be added to the project
            // tags:
            //      public

            var obj = {
                projectId: projectId,
                contentLink: contentLink,
                message: message
            };
            return this.activityStore.add(obj);
        },

        saveMessage: function (messageActivityId, message) {
            // summary:
            //     Updates a message activity with a new message.
            // messageActivityId: Number
            //      The id of the message activity to update
            // message: String
            //      The updated message for the message activity
            // tags:
            //      public

            var obj = {
                id: messageActivityId,
                message: message
            };
            return this.activityStore.put(obj);
        },

        addComment: function (activityId, comment) {
            // summary:
            //     Adds a "comment" to an activity
            //
            // activityId: Number
            //      The id of the activity to add a comment for
            // comment: String,
            //      The comment
            // tags:
            //      public

            var obj = {
                activityId: activityId,
                message: comment
            };
            return this.activityCommentStore.add(obj);
        },

        saveComment: function (commentId, comment) {
            // summary:
            //     Saves an already existing "comment"
            //
            // commentId: Number
            //      The id of the comment to update
            // activityId: Number
            //      The id of the activity the comment belongs to
            // comment: String,
            //      The comment
            // tags:
            //      public

            var obj = {
                id: commentId,
                message: comment
            };

            return this.activityCommentStore.put(obj);
        },

        _onActivityCommentUpdated: function (event) {
            // summary:
            //      Emits 'activity-comment-updated' when an ActivityComment gets added or updated.
            // tags:
            //      private

            this.emit("activity-comment-updated", event.target);
        }
    });
});
