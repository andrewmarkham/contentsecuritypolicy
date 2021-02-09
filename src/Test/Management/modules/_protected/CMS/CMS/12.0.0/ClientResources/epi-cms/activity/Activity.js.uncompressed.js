require({cache:{
'url:epi-cms/activity/templates/Activity.html':"<div class=\"epi-event epi-activity\">\r\n    <div class=\"epi-event__title-wrapper\">\r\n        <span class=\"dijitInline\" data-dojo-attach-point=\"iconNode\"></span>\r\n        <span class=\"epi-event__title\" data-dojo-attach-point=\"titleNode\"></span>\r\n    </div>\r\n    <div class=\"epi-event__status\" data-dojo-attach-point=\"actionNode\">\r\n        <span class=\"dijitInline epi-event__status__icon\">\r\n            <span data-dojo-attach-point=\"actionIconNode\"></span>\r\n        </span><span class=\"epi-event__status__message\" data-dojo-attach-point=\"actionTextNode\"></span>\r\n    </div><div data-dojo-attach-point=\"messageNode\"></div\r\n    ><div class=\"epi-activity__comment\" data-dojo-attach-point=\"activityCommentNode\"></div\r\n    ><div class=\"epi-activity__comments\" data-dojo-attach-point=\"containerNode\"></div>\r\n    <div data-dojo-type=\"epi-cms/activity/ActivityCommentForm\" data-dojo-attach-point=\"commentForm\"></div>\r\n</div>\r\n"}});
define("epi-cms/activity/Activity", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "./ActivityComment",
    "./viewmodels/ActivityViewModel",
    "./viewmodels/ActivityCommentViewModel",
    "./viewmodels/MessageActivityViewModel",
    // Parent class and mixins
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "epi/shell/widget/_ModelBindingMixin",
    // Resources
    "dojo/text!./templates/Activity.html",
    "epi/i18n!epi/cms/nls/episerver.cms.activities.activity",
    //Widgets in the template
    "epi-cms/activity/ActivityCommentForm"
], function (
    declare,
    lang,
    domClass,
    ActivityComment,
    ActivityViewModel,
    ActivityCommentViewModel,
    MessageActivityViewModel,
    // Parent class and mixins
    _LayoutWidget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _ModelBindingMixin,
    // Resources
    template,
    localizations
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      A widget used to display an activity.
        // tags:
        //      internal

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // model: [protected] ActivityViewModel
        //      The view model which is a ActivityViewModel object.
        model: null,

        // modelBindingMap: [protected] Object
        //      A map contain bindings from the model to properties on this object.
        modelBindingMap: {
            upsertActivityComment: ["upsertActivityComment"]
        },

        buildRendering: function () {
            this.inherited(arguments);

            var activity = this.activity;

            var model = new ActivityViewModel({
                activity: activity
            });
            this.set("model", model);
            this.own(this.model);

            this.commentForm.set("model", model);

            this.titleNode.textContent = model.get("title");

            domClass.add(this.iconNode, model.get("iconClass"));

            // Set the color on the action node and the icon classes.
            domClass.add(this.actionIconNode, model.get("actionIconClass"));
            domClass.add(this.actionNode, model.get("actionClass"));

            this.actionTextNode.textContent = model.get("content");

            // If the activity has a message property create an ActivityComment widget
            // and render the message
            if (activity.message) {
                domClass.add(this.domNode, "epi-activity__message");
                this.own(this._messageForm = new ActivityComment({ model: new MessageActivityViewModel(activity) }, this.messageNode));
            }
            var comment = model.getComment();
            if (comment) {
                // we assign innerHTML instead of textContent to be consistent with other comments
                this.activityCommentNode.innerHTML = comment;
            } else {
                domClass.add(this.activityCommentNode, "dijitHidden");
            }

            // Create an ActivityComment widget for each comment
            if (activity.comments) {
                activity.comments.forEach(function (comment) {
                    this.set("upsertActivityComment", comment);
                }, this);
            }
        },

        startup: function () {
            this.inherited(arguments);

            //Start the message comment form if it has been created
            this._messageForm && this._messageForm.startup();
        },

        _getActivityCommentComponent: function (commentId) {
            // summary:
            //      Returns the ActivityComment component and its position if it has been added to the activity
            //      If comment isn't added yet then the position will be -1.
            // tags:
            //      private

            var index = -1;
            var existingComment = null;

            var allActivityComments = this.getChildren() || [];

            for (var i = 0; i < allActivityComments.length; i++) {
                index = i;
                var current = allActivityComments[i];
                if (current.get("model").id === commentId) {
                    existingComment = current;
                    break;
                }
            }

            return { position: (existingComment !== null ? index : -1), activityComment: existingComment };
        },

        _setUpsertActivityCommentAttr: function (comment) {
            // summary:
            //      Adds new or updates an existing ActivityComment to the the current Activity.
            // tags:
            //      private


            if (!comment) {
                return;
            }

            // find the comment and its position
            var foundActivityComment = this._getActivityCommentComponent(comment.id);
            var oldComment = foundActivityComment.activityComment;
            var position = (foundActivityComment.position === -1 ? this.getChildren().length : foundActivityComment.position);

            // if comment already added then remove it since its easy to remove and add again than to update the entire UI state
            if (oldComment) {

                // if the new comment is the same as existing then don't continue
                var oldCommentUpdatedAt = new Date(oldComment.get("model").lastUpdated).getTime();
                var newCommentUpdatedAt = new Date(comment.lastUpdated).getTime();
                if (oldCommentUpdatedAt === newCommentUpdatedAt) {
                    return;
                }

                // remove from activity and then destroy it
                this.removeChild(oldComment);
                oldComment.destroyRecursive();
            }

            // create new ActivityComment component and add it as a child component
            var activityComment = new ActivityComment({ model: new ActivityCommentViewModel(comment) });
            this.addChild(activityComment, position);
        }
    });
});
