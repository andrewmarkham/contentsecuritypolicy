require({cache:{
'url:epi-cms/activity/templates/ActivityComment.html':"<div class=\"epi-activity-comment\">\r\n    <header>\r\n        <span class=\"dijitReset dijitInline epi-username\" data-dojo-attach-point=\"usernameNode\"></span>\r\n        <span class=\"dijitReset dijitInline epi-event__timestamp\" data-dojo-attach-point=\"timestampNode\"></span>\r\n        <span class=\"dijitReset dijitInline epi-iconEdited\" data-dojo-attach-point=\"editedIconNode\"></span>\r\n    </header>\r\n    <div data-dojo-type=\"epi-cms/activity/ActivityCommentForm\"\r\n         data-dojo-props=\"model: this.model\"\r\n         data-dojo-attach-point=\"commentForm\"></div>\r\n</div>\r\n"}});
define("epi-cms/activity/ActivityComment", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "epi/datetime",
    "epi/username",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "epi/shell/widget/_ModelBindingMixin",
    // Resources
    "dojo/text!./templates/ActivityComment.html",
    "epi/i18n!epi/cms/nls/episerver.cms.activities.activity.message",
    // Widgets in template
    "./ActivityCommentForm",
    "dijit/form/Button"
], function (
    declare,
    lang,
    domClass,
    datetime,
    username,
    // Parent class and mixins
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _ModelBindingMixin,
    // Resources
    template,
    localizations
) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      A widget used to display an activity comment.
        // tags:
        //      internal

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // Declare view model binding
        modelBindingMap: {
            hasChanged: ["hasChanged"]
        },

        _setHasChangedAttr: function (hasChanged) {
            // summary:
            //      Sets the has changed flag and toggles the visibility
            //      of the edited icon based on whether there are changes.
            // tags:
            //      protected

            this._set("hasChanged", hasChanged);

            var lastUpdated = lang.replace(localizations.editedformat, {
                updated: datetime.toUserFriendlyString(this.model.lastUpdated)
            });

            this.editedIconNode.title = lastUpdated;
            domClass.toggle(this.editedIconNode, "dijitHidden", !hasChanged);
        },

        buildRendering: function () {
            this.inherited(arguments);

            var user = this.model.changedBy || this.model.author;
            this.usernameNode.textContent = username.toUserFriendlyString(user, null, false, false, true);
            this.timestampNode.textContent = datetime.toUserFriendlyString(this.model.created);
        }
    });
});
