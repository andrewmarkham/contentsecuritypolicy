require({cache:{
'url:epi-cms/project/templates/Overview.html':"<div class=\"epi-project-overview\">\r\n    <div data-dojo-attach-point=\"toolbar\" class=\"epi-project-overview__toolbar epi-viewHeaderContainer epi-editToolbarMedium\">\r\n        <h2 class=\"dijitInline\">\r\n            <div class=\"dijitInline epi-iconObjectProject epi-icon--large\"></div>\r\n            <span data-dojo-attach-point=\"projectNameNode\"></span>\r\n        </h2>\r\n        <div class=\"epi-project-overview__toolbar__trailing\">\r\n            <div data-dojo-type=\"dijit/form/DropDownButton\"\r\n                 data-dojo-attach-point=\"publishContainer\"\r\n                 data-dojo-props=\"showLabel: true, label: this.res.overview.publishdropdown.label\"\r\n                 data-dojo-attach-event=\"onClick:_publishMenuClickHandler\"\r\n                 class=\"epi-mediumButton epi-button--bold\">\r\n                <span></span>\r\n                <div data-dojo-type=\"epi-cms/project/PublishMenu\"\r\n                     data-dojo-attach-point=\"publishMenu\"\r\n                     data-dojo-props=\"commandSource: this.model\">\r\n                    <section data-epi-section=\"primarySection\">\r\n                        <span data-dojo-attach-point=\"projectStatusMessageNode\"></span>\r\n                    </section>\r\n                    <section data-epi-section=\"statusSection\">\r\n                        <ul>\r\n                            <li>\r\n                                ${res.view.createdby} <span data-dojo-attach-point=\"createdByNode\" class=\"epi-username\"></span>,\r\n                                <span data-dojo-attach-point=\"createdNode\" class=\"epi-timestamp\"></span>\r\n                            </li>\r\n                        </ul>\r\n                    </section>\r\n                </div>\r\n            </div>\r\n            <button data-dojo-type=\"dijit/form/Button\"\r\n                    data-dojo-attach-point=\"closeButton\"\r\n                    data-dojo-attach-event=\"onClick:_close\"\r\n                    data-dojo-props=\"showLabel: true, label: this.res.overview.closebutton.label\"\r\n                    class=\"epi-mediumButton epi-button--bold\"></button>\r\n        </div>\r\n    </div>\r\n\r\n    <div data-dojo-attach-point=\"tabs\" data-dojo-type=\"dijit/layout/TabContainer\">\r\n        <div data-dojo-type=\"epi-cms/project/ProjectItemList\"\r\n             data-dojo-attach-point=\"itemList\"\r\n             data-dojo-props=\"title: this.res.overview.title, commandSource: this.model, res: this.res.overview\">\r\n\r\n                <section data-epi-section=\"toolbarSection\">\r\n                    <div data-dojo-attach-point=\"toolbarTextNode\" class=\"epi-project-item-list__item-count-message-node\"></div>\r\n                    <div data-dojo-attach-point=\"toolbarGroupNode\" class=\"epi-floatRight\"></div>\r\n                </section>\r\n                <section data-epi-section=\"activitySection\">\r\n                    <div data-dojo-type=\"epi-cms/activity/ActivityFeed\"\r\n                         data-dojo-attach-point=\"activityFeed\"\r\n                         data-dojo-props=\"model: this.model.activityFeedModel\"></div>\r\n                </section>\r\n        </div>\r\n\r\n        <div data-dojo-type=\"epi-cms/activity/ActivityFeed\"\r\n             data-dojo-attach-point=\"projectComments\"\r\n             data-dojo-props=\"title: this.res.comments.title, model: this.model.projectCommentFeedModel\"\r\n             class=\"epi-project-comment-feed\">\r\n            <div data-dojo-type=\"dijit/Toolbar\"\r\n                 data-dojo-attach-point=\"projectCommentsToolbar\"\r\n                 class=\"epi-project-item-list__toolbar epi-flatToolbar\">\r\n            </div>\r\n         </div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/project/Overview", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-geometry",
    "dojo/on",
    "dojo/when",

    "epi/shell/_ContextMixin",
    "./_ProjectView",
    "./viewmodels/OverviewViewModel",

    // Template
    "dojo/text!./templates/Overview.html",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project",

    // Template widgets
    "dijit/Toolbar",
    "dijit/form/Button",
    "dijit/form/DropDownButton",
    "dijit/layout/TabContainer",
    "epi-cms/activity/ActivityFeed",
    "epi-cms/project/ProjectItemList",
    "epi-cms/project/PublishMenu"
], function (
//dojo
    declare,
    lang,
    domGeometry,
    on,
    when,

    //epi
    _ContextMixin,
    _ProjectView,
    OverviewViewModel,

    // Template
    template,

    // Resources
    res
) {

    return declare([_ProjectView], {
        // tags:
        //      internal

        modelBindingMap: {
            projectItemQuery: ["projectItemQuery"],
            projectItemSortOrder: ["projectItemSortOrder"],
            selectedProject: ["selectedProject"],
            created: ["created"],
            createdBy: ["createdBy"],
            dndEnabled: ["dndEnabled"],
            isActivitiesVisible: ["isActivitiesVisible"],
            notificationMessage: ["notificationMessage"],
            projectStatus: ["projectStatus"],
            contentLanguage: ["contentLanguage"],
            projectItemCountMessage: ["projectItemCountMessage"],
            projectName: ["projectName"]
        },

        res: res,

        templateString: template,

        postCreate: function () {
            // summary:
            //      Processing after the DOM fragment is created. Binds to events that can occur on
            //      child widgets.
            // tags:
            //      protected

            this.inherited(arguments);

            this.own(
                on(this.model, "refresh-activities", this.activityFeed.refresh.bind(this.activityFeed))
            );
        },

        _createViewModel: function () {
            // summary:
            //      Setting up the view model
            // tags:
            //      protected
            return new OverviewViewModel();
        },

        layout: function () {

            // Do not call resize unless we have been started
            if (!this._started) {
                return;
            }

            var toolbarSize = domGeometry.getMarginBox(this.toolbar),
                size = lang.mixin({}, this._contentBox, { h: this._contentBox.h - toolbarSize.h });
            this.tabs.resize(size);
        },

        _onShow: function () {
            // summary:
            //      Sets isProjectOverviewActive false when widgets is visible
            // tags:
            //      private
            this.model.set("isProjectOverviewActive", true);
        },

        onHide: function () {
            // summary:
            //      Sets isProjectOverviewActive true when widgets is hidden
            // tags:
            //      public
            this.model.set("isProjectOverviewActive", false);
        },

        _close: function () {
            // summary:
            //      Closes the overview
            // tags:
            //      private
            this.model.requestPreviousContext();
        },

        _setIsActivitiesVisibleAttr: function (isVisible) {
            // summary:
            //      Toggles whether the activities panel is visible in
            //      the overview.
            // tags:
            //      private
            this.itemList.toggleActivities(isVisible);
        },

        _setProjectNameAttr: { node: "projectNameNode", type: "innerText" },

        _setProjectItemCountMessageAttr: { node: "toolbarTextNode", type: "innerText" }

    });
});
