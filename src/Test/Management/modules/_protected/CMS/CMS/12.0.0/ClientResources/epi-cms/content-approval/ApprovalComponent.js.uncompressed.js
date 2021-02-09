require({cache:{
'url:epi-cms/content-approval/templates/ApprovalComponent.html':"﻿<div class=\"epi-content-approval\">\r\n    <div class=\"epi-localToolbar epi-viewHeaderContainer\" data-dojo-type=\"dijit/Toolbar\">\r\n        <div class=\"epi-toolbarGroupContainer\">\r\n            <div class=\"epi-toolbarGroup epi-toolbarLeading\">\r\n                <div data-dojo-attach-point=\"breadcrumb\" data-dojo-type=\"epi-cms/content-approval/Breadcrumb\" data-dojo-props=\"displayAsText:false, showCurrentNode:false\"></div>\r\n                <div data-dojo-attach-point=\"breadcrumbCurrentItem\" data-dojo-type=\"epi-cms/widget/BreadcrumbCurrentItem\"></div>\r\n            </div>\r\n            <div class=\"epi-toolbarGroup epi-toolbarTrailing\" data-dojo-attach-point=\"commandNode\">\r\n                <div data-dojo-attach-point=\"validation\" data-dojo-type=\"epi-cms/widget/NotificationStatusBar\"></div>\r\n            </div>\r\n        </div>\r\n    </div>\r\n    <div data-dojo-attach-point=\"containerNode\" class=\"epi-content-approval__container\">\r\n        <div class=\"epi-content-approval__header\">\r\n            <hgroup class=\"epi-heading-group\">\r\n                <h1 class=\"epi-heading\"><span class=\"epi-heading-icon\" data-dojo-attach-point=\"contentIcon\"></span> <span data-dojo-attach-point=\"contentName\"></span></h1>\r\n                <h2 class=\"epi-heading\">${resources.title}</h2>\r\n            </hgroup>\r\n            <p>${resources.instructions.reviewers}</p>\r\n            <p>${resources.instructions.steps}</p>\r\n            <div class=\"epi-content-approval__settings clearfix\" data-dojo-type=\"dijit/form/Form\" data-dojo-attach-point=\"form\">\r\n                <span class=\"dijitInline\">\r\n                    <input id=\"enable-approval\" data-dojo-attach-point=\"enableButton\" data-dojo-type=\"dijit/form/RadioButton\" data-dojo-props=\"name:'status', value:${ApprovalDefinitionStatus.enabled}\">\r\n                    <label class=\"dijitInline\" for=\"enable-approval\">${resources.states.enabled}</label>\r\n                </span>\r\n                <span class=\"dijitInline\">\r\n                    <input id=\"inherit-approval\" data-dojo-attach-point=\"inheritButton\" data-dojo-type=\"dijit/form/RadioButton\" data-dojo-props=\"name:'status', value:${ApprovalDefinitionStatus.inherited}\">\r\n                    <label class=\"dijitInline\" for=\"inherit-approval\">${resources.states.inherited}</label>\r\n                </span>\r\n                <span class=\"dijitInline\">\r\n                    <input id=\"disabled-approval\" data-dojo-attach-point=\"disableButton\" data-dojo-type=\"dijit/form/RadioButton\" data-dojo-props=\"name:'status', value:${ApprovalDefinitionStatus.disabled}\">\r\n                    <label class=\"dijitInline\" for=\"disabled-approval\">${resources.states.disabled}</label>\r\n                </span>\r\n                <fieldset class=\"dijitInline\" data-dojo-attach-point=\"demandCommentFieldsetNode\">\r\n                    <div>\r\n                        <input id=\"demandcomment-start\" data-dojo-attach-point=\"demandStartCommentButton\" data-dojo-type=\"dijit/form/CheckBox\">\r\n                        <label class=\"dijitInline\" for=\"demandcomment-start\">${resources.demandcomment.start}</label>\r\n                    </div>\r\n                    <div>\r\n                        <input id=\"demandcomment-approve-approval\" data-dojo-attach-point=\"demandApproveCommentButton\" data-dojo-type=\"dijit/form/CheckBox\">\r\n                        <label class=\"dijitInline\" for=\"demandcomment-approve-approval\">${resources.demandcomment.label} ${resources.demandcomment.approve}</label>\r\n                    </div>\r\n                    <div>\r\n                        <input id=\"demandcomment-approval\" data-dojo-attach-point=\"demandDeclineCommentButton\" data-dojo-type=\"dijit/form/CheckBox\">\r\n                        <label class=\"dijitInline\" for=\"demandcomment-approval\">${resources.demandcomment.label} ${resources.demandcomment.decline}</label>\r\n                    </div>\r\n                    <div>\r\n                        <input id=\"prevent-self-approve\" data-dojo-attach-point=\"preventSelfApproveButton\" data-dojo-type=\"dijit/form/CheckBox\">\r\n                        <label class=\"dijitInline\" for=\"prevent-self-approve\">${resources.preventselfapprove}</label>\r\n                    </div>\r\n                </fieldset>\r\n            </div>\r\n        </div>\r\n        <div class=\"epi-content-approval__disabled-warning\" data-dojo-attach-point=\"warningNode\">\r\n            <span data-dojo-attach-point=\"warningMessage\"></span><a class=\"epi-visibleLink\" data-dojo-attach-point=\"goToInheritedSequence\" data-dojo-attach-event=\"onclick:_goToInheritedSequence\">${resources.gotoinheritedsequence}</a>\r\n        </div>\r\n        <div class=\"epi-content-approval__filter\" data-dojo-attach-point=\"filterNode\">\r\n            <span class=\"dijitInline\">${resources.languagefilter.description}</span>\r\n            <div data-dojo-attach-point=\"languageFilter\" data-dojo-type=\"dijit/form/Select\" class=\"epi-chromeless epi-chromeless--with-arrow epi-visibleLink\"></div>\r\n        </div>\r\n        <div data-dojo-attach-point=\"stepList\" data-dojo-type=\"epi-cms/content-approval/ApprovalStepList\"></div>\r\n    </div>\r\n</div>\r\n"}});
﻿define("epi-cms/content-approval/ApprovalComponent", [
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/dom-class",
    "epi/shell/DialogService",
    "epi/shell/command/builder/ButtonBuilder",
    "epi-cms/content-approval/ApprovalEnums",
    "epi-cms/content-approval/viewmodels/ContentApprovalViewModel",
    // Parent class and mixins
    "dijit/layout/_LayoutWidget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "epi/shell/widget/_ModelBindingMixin",
    // Resources
    "dojo/text!./templates/ApprovalComponent.html",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.component",
    "epi/i18n!epi/nls/episerver.shared.action",
    // Widgets in template
    "dijit/Toolbar",
    "dijit/form/CheckBox",
    "dijit/form/RadioButton",
    "dijit/form/Select",
    "dijit/form/Form",
    "./Breadcrumb",
    "epi-cms/widget/BreadcrumbCurrentItem",
    "epi-cms/widget/NotificationStatusBar",
    "epi-cms/content-approval/ApprovalStepList"
], function (
    lang,
    declare,
    Deferred,
    domClass,
    dialogService,
    ButtonBuilder,
    ApprovalEnums,
    ContentApprovalViewModel,
    // Parent class and mixins
    _LayoutWidget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _ModelBindingMixin,
    // Resources
    template,
    localization,
    sharedLocalization
) {

    function toggleVisibility(domNode, visible) {
        domClass.toggle(domNode, "dijitHidden", !visible);
    }

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      The view for the content approval component; responsible for creating the content
        //      approval view model and creating child view components.
        // tags:
        //      internal

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // languageWarningTemplate: [protected] String
        //      HTML template for showing a warning on languageFilter items that has validation issues.
        languageWarningTemplate: " <span class='dijitInline dijitReset dijitIcon epi-iconWarning' title='" + localization.languagefilter.warningmessage + "'></span>",

        // resources: [protected] Object
        //      An object containing resource strings in the current language.
        resources: localization,

        // ApprovalDefinitionStatus: [readonly] epi-cms/content-approval/ApprovalEnums.definitionStatus
        //      Exposes the different approval definition statuses to the template
        ApprovalDefinitionStatus: ApprovalEnums.definitionStatus,

        // _iconThumbnailTemplate: [private] String
        //      HTML template for showing an image thumbnail as the header icon.
        _iconThumbnailTemplate: "<img class=\"epi-heading-icon-thumbnail\" src=\"{url}\" />",

        // _iconContentTemplate: [private] String
        //      HTML template for showing a content icon in the header.
        _iconContentTemplate: "<span class=\"dijitInline dijitReset dijitIcon epi-icon--large {iconClass} \"></span>",

        modelBindingMap: {
            approvalLink: ["approvalLink"],
            content: ["content"],
            isOptionsEnabled: ["isOptionsEnabled"],
            isDeclineCommentRequired: ["isDeclineCommentRequired"],
            isApproveCommentRequired: ["isApproveCommentRequired"],
            isStartCommentRequired: ["isStartCommentRequired"],
            selfApprove: ["selfApprove"],
            isReadOnly: ["isReadOnly"],
            filterOptions: ["filterOptions"],
            status: ["status"],
            approvalInheritedFrom: ["approvalInheritedFrom"]
        },

        postMixInProperties: function () {
            // summary:
            //      Processing after the parameters to the widget have been read-in, but before the
            //      widget template is instantiated.
            // tags:
            //      protected

            this.inherited(arguments);

            // Create the view model if one has not been injected in the constructor.
            this.model = this.model || new ContentApprovalViewModel();
            this.own(this.model);
        },

        buildRendering: function () {
            // summary:
            //      Build the approval component rendering from the template and then create buttons
            //      for the commands.
            // tags:
            //      protected

            this.inherited(arguments);

            // Generate buttons based on commands available in the view model
            var builder = new ButtonBuilder(),
                commands = this.model.get("commands");

            commands.forEach(function (command) {
                builder.create(command, this.commandNode);
            }, this);
        },

        postCreate: function () {
            // summary:
            //        Processing after the DOM fragment is created
            // tags:
            //        protected

            this.inherited(arguments);

            this.stepList.set("model", this.model);

            this.own(
                this.enableButton.on("click", this._updateStatus.bind(this, ApprovalEnums.definitionStatus.enabled)),
                this.disableButton.on("click", this._updateStatus.bind(this, ApprovalEnums.definitionStatus.disabled)),
                this.inheritButton.on("click", this._updateStatus.bind(this, ApprovalEnums.definitionStatus.inherited)),
                this.demandDeclineCommentButton.on("click", this._updateDemandDeclineComment.bind(this)),
                this.demandApproveCommentButton.on("click", this._updateDemandApproveComment.bind(this)),
                this.demandStartCommentButton.on("click", this._updateDemandStartComment.bind(this)),
                this.preventSelfApproveButton.on("click", this._updateSelfApprove.bind(this)),
                this.languageFilter.on("change", this._updateSelectedLanguage.bind(this))
            );
        },

        updateView: function () {
            // summary:
            //		This will be invoked by WidgetSwitcher when displaying Approval component.
            // tags:
            //		public

            this._focus();
        },

        _updateSelectedLanguage: function (language) {
            this.model.set("selectedLanguage", language);
        },

        _setNotificationContext: function (contentLink) {
            // summary:
            //      Set the validation message query to filter what messages on
            //      messageService should display in the NotificationStatusBar.
            // tags:
            //      private

            this.validation.set("notificationContext", {
                contextTypeName: "epi.cms.approval",
                contextId: contentLink
            });
        },

        _setBreadcrumb: function (content) {
            // summary:
            //      Sets up the breadcrumb to show where the content belonging to the edited approval definition is,
            //      and what content type it is.
            // tags:
            //      private

            this.breadcrumb.set("contentLink", content.contentLink);

            this.breadcrumbCurrentItem.set("currentItemInfo", {
                name: content.name,
                dataType: content.typeIdentifier
            });
        },

        _setContentIcon: function (thumbnailUrl) {
            // summary:
            //      Set content icon to make it clearer what approval definition is being edited.
            //      Will use content thumbnail if available.
            // tags:
            //      private

            // Show the icon to start with, in case it was previously hidden.
            toggleVisibility(this.contentIcon, true);

            // If a content thumbnail is available, use it as the icon.
            if (thumbnailUrl) {
                this.contentIcon.innerHTML = lang.replace(this._iconThumbnailTemplate, { url: thumbnailUrl });
                return;
            }

            // Use the content icon if available, otherwise set no icon.
            var contentIcon = this.model.iconClass();
            if (contentIcon) {
                this.contentIcon.innerHTML = lang.replace(this._iconContentTemplate, {iconClass: contentIcon});
                return;
            }

            // Hide the icon since no icon was found.
            toggleVisibility(this.contentIcon, false);
        },

        _setContentName: function (contentName) {
            // summary:
            //      Set content name to make it clearer what content's approval definition is being edited.
            // tags:
            //      private

            this.contentName.textContent = contentName;
        },

        _setApprovalLinkAttr: function (approvalLink) {
            // summary:
            //      Set the content link for the current approval definition being edited.
            // tags:
            //      private

            this._set("approvalLink", approvalLink);

            this._setNotificationContext(approvalLink);
        },

        _setContentAttr: function (content) {
            // summary:
            //      Set the current content for the content approval definition being edited.
            // tags:
            //      private

            this._set("content", content);

            if (!content) {
                return;
            }

            this._setBreadcrumb(content);
            this._setContentName(content.name);
            this._setContentIcon(content.thumbnailUrl);
        },

        _setStatusAttr: function (status) {
            this._set("status", status);
            this.form.set("value", {status: status});

            this._focus();

            toggleVisibility(this.demandCommentFieldsetNode, (this.model.get("isEnabled")));

            // Toggle the visibility of the step list, the filter node and the disabled warning node
            toggleVisibility(this.stepList.domNode, this.model.get("isEnabled"));
            toggleVisibility(this.filterNode, this.model.get("isEnabled") && !!this.model.get("filterOptions"));

            this._updateWarningMessage();
        },

        _focus: function () {
            this.enableButton.get("checked") && this.enableButton.focus();
            this.disableButton.get("checked") && this.disableButton.focus();
            this.inheritButton.get("checked") && this.inheritButton.focus();
        },

        _setApprovalInheritedFromAttr: function (approvalInheritedFrom) {
            this._set("approvalInheritedFrom", approvalInheritedFrom);
            this._updateWarningMessage();
        },

        _updateWarningMessage: function () {
            toggleVisibility(this.warningNode, (!this.model.get("isEnabled") || this.model.get("isInherited")));
            toggleVisibility(this.goToInheritedSequence, this.model.get("isInherited"));
            this.warningMessage.textContent = this.model.getWarningMessage();
        },

        _setIsDeclineCommentRequiredAttr: function (isDeclineCommentRequired) {
            this._set("isDeclineCommentRequired", isDeclineCommentRequired);
            this.demandDeclineCommentButton.set("checked", isDeclineCommentRequired);
        },

        _setIsApproveCommentRequiredAttr: function (isApproveCommentRequired) {
            this._set("isApproveCommentRequired", isApproveCommentRequired);
            this.demandApproveCommentButton.set("checked", isApproveCommentRequired);
        },

        _setIsStartCommentRequiredAttr: function (isStartCommentRequired) {
            this._set("isStartCommentRequired", isStartCommentRequired);
            this.demandStartCommentButton.set("checked", isStartCommentRequired);
        },

        _setSelfApproveAttr: function (selfApprove) {
            this._set("selfApprove", selfApprove);
            this.preventSelfApproveButton.set("checked", !selfApprove);
        },

        _setIsOptionsEnabledAttr: function (isOptionsEnabled) {
            this._set("isOptionsEnabled", isOptionsEnabled);
            this.demandDeclineCommentButton.set("disabled", !isOptionsEnabled);
            this.demandApproveCommentButton.set("disabled", !isOptionsEnabled);
            this.demandStartCommentButton.set("disabled", !isOptionsEnabled);
            this.preventSelfApproveButton.set("disabled", !isOptionsEnabled);
        },

        _setIsReadOnlyAttr: function (isReadOnly) {
            this._set("isReadOnly", isReadOnly);
            this.enableButton.set("disabled", isReadOnly);
            this.disableButton.set("disabled", isReadOnly);
            this.inheritButton.set("disabled", isReadOnly);
        },

        _setFilterOptionsAttr: function (filterOptions) {
            // summary:
            //      Shows or hides the filter widget and also sets its options.
            // tags:
            //      private

            this._set("filterOptions", filterOptions);

            var showFilter = !!filterOptions && this.model.get("isEnabled");
            toggleVisibility(this.filterNode, showFilter);
            if (!filterOptions) {
                return;
            }

            // Clone the object so changes to it won't affect the model.
            filterOptions = lang.clone(filterOptions);
            // Keep track of the selected options. If it's "All Languages" use an empty string.
            var selectedLanguage = this.model.get("selectedLanguage") || "";
            filterOptions.forEach(function (filter) {
                if (!filter.isValid && this.model.get("showValidations")) {
                    filter.label += this.languageWarningTemplate;
                }

                filter.selected = selectedLanguage === filter.value;
            }, this);

            // Reset the filter options, and the selected item to update the displayed value.
            this.languageFilter.set("options", filterOptions);
            this.languageFilter.set("value", selectedLanguage);
        },

        _goToInheritedSequence: function () {
            this.model.goToInheritedSequence();
        },

        _updateStatus: function (nextStatus) {
            var promise;
            switch (nextStatus) {
                case ApprovalEnums.definitionStatus.inherited:
                    promise = this._confirmInherit();
                    break;
                case ApprovalEnums.definitionStatus.enabled:
                    this.model.enable();
                    promise = new Deferred().resolve();
                    break;
                case ApprovalEnums.definitionStatus.disabled:
                    promise = this._confirmDisable();
                    break;
            }

            // Reset the status if the user cancels the dialog.
            promise.otherwise(this.set.bind(this, "status", this.status));
        },

        _updateDemandDeclineComment: function (e) {
            var checked = e.target.checked;
            this.model.set("isDeclineCommentRequired", checked);
            this.demandDeclineCommentButton.set("checked", checked);
        },

        _updateDemandApproveComment: function (e) {
            var checked = e.target.checked;
            this.model.set("isApproveCommentRequired", checked);
            this.demandApproveCommentButton.set("checked", checked);
        },

        _updateDemandStartComment: function (e) {
            var checked = e.target.checked;
            this.model.set("isStartCommentRequired", checked);
            this.demandStartCommentButton.set("checked", checked);
        },

        _updateSelfApprove: function (e) {
            var checked = e.target.checked;
            this.model.set("selfApprove", !checked);
            this.preventSelfApproveButton.set("checked", checked);
        },

        _confirmDisable: function () {
            var settings = {
                title: this.resources.disable.title,
                description: this.resources.disable.description,
                confirmActionText: sharedLocalization.disable,
                cancelActionText: sharedLocalization.cancel
            };

            return dialogService.confirmation(settings)
                .then(this.model.disable.bind(this.model));
        },

        _confirmInherit: function () {
            var settings = {
                title: this.resources.inherit.title,
                description: this.resources.inherit.description,
                confirmActionText: this.resources.inherit.okbutton,
                cancelActionText: sharedLocalization.cancel,
                setFocusOnConfirmButton: false
            };

            return dialogService.confirmation(settings)
                .then(this.model.inheritDefinition.bind(this.model));
        }
    });
});
