require({cache:{
'url:epi-cms/project/templates/ProjectModeToolbar.html':"﻿<div class=\"epi-project-mode-toolbar\">\r\n\t<span data-dojo-attach-point=\"projectIconNode\" class=\"dijitReset dijitInline epi-project-mode-toolbar__icon-node\">\r\n\t\t<span class=\"dijitReset dijitInline dijitIcon epi-iconProject\"></span>\r\n    </span>\r\n    <span data-dojo-attach-point=\"projectLabelNode\" class=\"dijitInline\">${localizations.label}</span>\r\n    <span data-dojo-attach-point=\"projectSelectorNode\"></span>\r\n    <span class=\"dijitInline epi-project-mode-toolbar__warning-label\">${localizations.projectdoesnotexists.currentprojectdoesnotexists}</span>\r\n    <span data-dojo-attach-point=\"contextMenu\" class=\"epi-project-mode-toolbar__contextmenu\"></span>\r\n    <span data-dojo-attach-point=\"projectOverviewButtonNode\"></span>\r\n</div>\r\n",
'url:epi-cms/project/templates/CurrentProjectDoesNotExistsWarning.html':"<div class=\"epi-project-mode-project-deleted-warning\">${warning}</div>\r\n<p>${description}</p>"}});
﻿define("epi-cms/project/ProjectModeToolbar", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/has",
    "dojo/on",
    "dojo/dom-style",
    "dojo/dom-class",
    "dojo/string",

    // dijit
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/_LayoutWidget",
    "dijit/form/Button",

    // epi
    "epi/shell/DialogService",
    "epi/shell/widget/_ModelBindingMixin",
    "./ProjectSelector",
    "./viewmodels/ProjectModeToolbarViewModel",
    "epi/dependency",
    "epi/shell/command/builder/DropDownButtonBuilder",
    "epi/shell/command/builder/MenuAssembler",

    // template
    "dojo/text!./templates/ProjectModeToolbar.html",
    "dojo/text!./templates/CurrentProjectDoesNotExistsWarning.html",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project.toolbar"
], function (
// dojo
    declare,
    lang,

    has,
    on,
    domStyle,
    domClass,
    string,

    // dijit
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _LayoutWidget,
    Button,

    // epi
    dialogService,
    _ModelBindingMixin,
    ProjectSelector,
    ProjectModeToolbarViewModel,
    dependency,
    DropDownButtonBuilder,
    MenuAssembler,

    // template
    template,
    projectDoesNotExistsWarningTemplate,

    // Resources
    localizations
) {

    return declare([_LayoutWidget, _TemplatedMixin, _WidgetsInTemplateMixin, _ModelBindingMixin], {
        // summary:
        //      Project mode toolbar for selecting the project to work with
        // tags:
        //      internal

        templateString: template,

        localizations: localizations,

        _projectDoesNotExistWarning: "",

        postscript: function () {
            this.inherited(arguments);

            this.projectService = this.projectService || dependency.resolve("epi.cms.ProjectService");
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.model) {
                this.own(
                    this.model = new ProjectModeToolbarViewModel()
                );
            }

            this._projectDoesNotExistWarning = string.substitute(projectDoesNotExistsWarningTemplate, {
                warning: localizations.projectdoesnotexists.alert.warning,
                description: localizations.projectdoesnotexists.alert.description
            });
        },

        buildRendering: function () {

            this.inherited(arguments);

            this._setupContextMenu();

            var dialogContent = this._projectDoesNotExistWarning;

            this.own(
                this.projectOverviewButton = new Button({
                    showLabel: true,
                    "class": "dijitHidden epi-chromeless",
                    label: localizations.overview.label
                }, this.projectOverviewButtonNode),

                this.projectOverviewButton.on("click", lang.hitch(this, "_openProjectOverview")),

                this.projectSelector = new ProjectSelector({
                    iconClass: "dijitNoIcon",
                    "class": "epi-chromeless epi-chromeless--inverted epi-chromeless--with-arrow epi-project-mode-toolbar__selector",
                    enableDefaultValue: true,
                    defaultValueText: localizations.defaultoption,
                    store: this.model.projectStore
                }, this.projectSelectorNode),

                this.model.on("currentProjectDoesNotExists", function () {
                    dialogService.alert(dialogContent);
                })
            );
        },

        _toggleOverviewButton: function (isVisible) {
            // summary:
            //      Toggles the overview button
            // isVisible: Boolean
            // tags:
            //      private
            var projectOverviewButtonNode = this.projectOverviewButton.domNode;
            domClass.toggle(projectOverviewButtonNode, "dijitHidden", !isVisible);
        },

        startup: function () {
            this.inherited(arguments);

            this.own(this.model.watch("overviewButtonVisible", lang.hitch(this, function (property, oldValue, newValue) {
                this._toggleOverviewButton(newValue);
            })));

            var model = this.model;
            this.model.initialize().then(lang.hitch(this, function () {
                var domNode = this.domNode;

                this.own(this.projectSelector.watch("value", lang.hitch(this, function (property, oldValue, newValue) {
                    domClass.toggle(domNode, "epi-project-mode-toolbar--project-selected", !!newValue);
                    domClass.remove(domNode, "epi-project-mode-toolbar--project-deleted");
                    model.set("currentProject", newValue);
                })));

                this.projectSelector.set("value", model.get("currentProject"));
            }));

            this.own(this.projectService.on("currentProjectChanged", lang.hitch(this, function (currentProject) {
                this.projectSelector.set("value", currentProject);
            })));

            this.own(this.model.on("animateToolbar", lang.hitch(this, function () {
                domClass.add(this.domNode, "epi-project-mode-toolbar--flash");

                var animationend = on(this.domNode, "animationend", lang.hitch(this, function () {
                    domClass.remove(this.domNode, "epi-project-mode-toolbar--flash");
                    animationend.remove();
                }));
            })));

            this.own(this.model.watch("currentProject", lang.hitch(this, function (property, oldValue, newValue) {
                if (newValue && newValue.isDeleted) {
                    domClass.add(this.domNode, "epi-project-mode-toolbar--project-deleted");
                }
            })));

        },

        _openProjectOverview: function () {
            // summary:
            //      Click handler for opening project overview
            // tags:
            //      private

            var project = this.projectSelector.get("value");
            if (project) {
                this.model.showProjectOverview(project.id);
            }
        },


        _setupContextMenu: function () {
            // summary:
            //      Set up the project sort menu
            // tags:
            //      private

            this.own(
                new MenuAssembler({
                    configuration: [{
                        builder: new DropDownButtonBuilder({
                            settings: {
                                "class": "epi-chromeless",
                                iconClass: "epi-iconContextMenu",
                                showLabel: false,
                                label: localizations.contextmenu.label
                            },
                            optionClass: ""
                        }),
                        category: "context",
                        target: this.contextMenu
                    }],
                    commandSource: this.model
                })
            );
        }
    });
});
