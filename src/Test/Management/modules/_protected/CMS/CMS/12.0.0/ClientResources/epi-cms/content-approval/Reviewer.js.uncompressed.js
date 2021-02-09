require({cache:{
'url:epi-cms/content-approval/templates/Reviewer.html':"<div class=\"epi-reviewer\">\r\n    <button class=\"epi-button--round epi-reviewer__remove-button\"\r\n            tabindex=\"-1\"\r\n            data-dojo-type=\"dijit/form/Button\"\r\n            type=\"button\">\r\n        <span class=\"dijitInline dijitIcon dijitReset epi-iconMinus epi-icon--inverted\"></span>\r\n    </button>\r\n    <span data-dojo-attach-point=\"selectedReviewerNode\">\r\n        <span data-dojo-attach-point=\"reviewerIcon\" class=\"dijitInline dijitIcon\"></span>\r\n        <span class=\"dijitInline epi-reviewer__name\" data-dojo-attach-point=\"userDisplayNameNode\"></span>\r\n    </span>\r\n    <span class=\"epi-reviewer__language-selector epi-chromeless epi-chromeless--icon-only epi-chromeless--with-arrow\"\r\n          data-dojo-attach-point=\"languageSelector\"\r\n          data-dojo-type=\"epi-cms/contentediting/editors/CheckboxListDropDown\"\r\n          data-dojo-props=\"iconClass: 'epi-iconWebsite', header: '${resources.selectlanguage}', selectAllText: '${resources.anylanguage}'\"></span>\r\n    <span class=\"dijitInline\" data-dojo-attach-point=\"languageSettingsNode\"></span>\r\n</div>\r\n"}});
﻿define("epi-cms/content-approval/Reviewer", [
    "dojo/_base/declare",
    "dojo/dom-class",
    "dojo/dom-construct",
    "dojo/dom-style",
    "dojo/keys",
    "dojo/store/Memory",
    // Parent class and mixins
    "dijit/_WidgetBase",
    "dijit/Tooltip",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "epi/shell/widget/_ModelBindingMixin",
    "./groupMembersListFormatter",
    "./ApprovalEnums",
    //Resources
    "dojo/text!./templates/Reviewer.html",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.reviewer",
    // Widgets in template
    "epi-cms/contentediting/editors/CheckboxListDropDown"
], function (
    declare,
    domClass,
    domConstruct,
    domStyle,
    keys,
    Memory,
    // Parent class and mixins
    _WidgetBase,
    Tooltip,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _ModelBindingMixin,
    groupMembersListFormatter,
    ApprovalEnums,
    //Resources
    template,
    localization
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      Responsible for displaying a single reviewer and its settings in the approval step.
        // tags:
        //      internal

        // model: [readonly] ReviewerViewModel
        //      The view model of the reviewer.
        model: null,

        // modelBindingMap: [protected] Object
        //      The binding mappings from model properties to local properties.
        modelBindingMap: {
            canApprove: ["canApprove"]
        },

        // templateString: [protected] String
        //      A string that represents the widget template.
        templateString: template,

        // resources: [protected] Object
        //      An object containing resource strings in the current language.
        resources: localization,

        // tooltip: [private] dijit/Tooltip
        tooltip: null,

        postMixInProperties: function () {
            // summary:
            //      Checks whether the model have been set before the template instantiated.
            // tags:
            //      protected

            // a model must be provided before creating this component.
            if (!this.model) {
                throw new Error("An instance of ReviewerViewModel must be provided in order to create an Reviewer component.");
            }
        },

        buildRendering: function () {
            // summary:
            //      Builds the reviewer
            // tags:
            //      protected

            this.inherited(arguments);

            if (this.model.reviewerType === ApprovalEnums.reviewerType.role) {
                this.own(this.tooltip = new Tooltip({
                    connectId: [this.selectedReviewerNode],
                    label: this._formatMembersTooltipLabel(),
                    position: ["below-centered", "above-centered"]
                }));
            }

            this.set("displayName", this.model.get("displayName"));

            var store = new Memory({
                idProperty: "value",
                data: this.languageOptions || []
            });

            this.languageSelector.set("store", store);

            if (this.model.languages) {
                this.languageSelector.set("value", this.model.languages, false);
            }

            // Toggle the language selector visibility depending on whether there are any languages.
            domClass.toggle(this.languageSelector.domNode, "dijitHidden", !this.languageOptions);

            // Set the reviewer icon based on the reviewer type
            domClass.add(this.reviewerIcon, this.model.get("icon"));

            this.own(
                this.on(".epi-reviewer__remove-button:click", this._removeReviewer.bind(this)),
                this.on("keydown", this._removeReviewer.bind(this)),
                this.languageSelector.on("change", function (languages) {
                    this.model.set("languages", languages);
                    this._renderSelectedLanguages();
                }.bind(this))
            );

            this._renderSelectedLanguages();
        },

        _formatMembersTooltipLabel: function () {
            var roleFirstUsersNames = this.model.get("roleFirstUsersNames");
            if (!roleFirstUsersNames || roleFirstUsersNames.length === 0) {
                return localization.nogroupmembers;
            }

            var tooltipLabel = "<div class='epi-approval-group-tooltip'>" + groupMembersListFormatter.renderList(roleFirstUsersNames);
            var numberOfOtherUsers = this.model.get("numberOfOtherUsers");
            if (numberOfOtherUsers > 0) {
                tooltipLabel += "<div>+" + numberOfOtherUsers + "</div>";
            }

            tooltipLabel += "</div>";

            return tooltipLabel;
        },

        _removeReviewer: function (evt) {
            // summary:
            //      Handles when DELETE has been pressed while focusing an reviewer
            //      or the minus icon is clicked.
            // tags:
            //      private

            // only deletes reviewer on click on delete button or DELETE key press.
            if (evt.type === "click" || evt.keyCode === keys.DELETE) {
                evt.stopPropagation();
                this.emit("remove-reviewer", this.model);
            }
        },

        _renderSelectedLanguages: function () {

            // clear all current languages
            domConstruct.empty(this.languageSettingsNode);

            // No language render needed when only one language is available
            if (!this.languageOptions) {
                return;
            }

            var self = this;

            // Creates the language specific dom element for given input
            function toLanguageDom(language) {

                var languageBranch = self.languageSelector.store.get(language),
                    cssClasses = "dijitInline epi-lozenge";

                //Language set on the reviewer that is disabled will change apperance.
                if (!languageBranch && self.model.languages.length > 0) {
                    cssClasses += " epi-lozenge--inactive";
                }

                var properties = {
                    innerHTML: language,
                    "class": cssClasses,
                    title: languageBranch ? languageBranch.label : language
                };

                domConstruct.create("span", properties, self.languageSettingsNode);
            }

            if (this.model.languages) {

                // empty array represents all languages
                if (this.model.languages.length < 1) {
                    toLanguageDom(localization.alllanguages);
                    return;
                }

                this.model.languages.forEach(toLanguageDom);
            }
        },

        _setDisplayNameAttr: { node: "userDisplayNameNode", type: "innerHTML" },

        _setCanApproveAttr: function (canApprove) {
            this._set("canApprove", canApprove);
            domStyle.set(this.domNode, "display", canApprove ? "" : "none");
        }
    });
});
