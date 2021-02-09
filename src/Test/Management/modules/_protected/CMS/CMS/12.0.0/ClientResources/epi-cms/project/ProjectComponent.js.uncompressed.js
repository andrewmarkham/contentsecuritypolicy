require({cache:{
'url:epi-cms/project/templates/ProjectComponent.html':"﻿<div>\r\n    <div data-dojo-type=\"epi-cms/project/ProjectItemList\"\r\n         data-dojo-attach-point=\"itemList\"\r\n         data-dojo-props=\"commandSource: this.model, listItemType: 'card-compact'\">\r\n        <section data-epi-section=\"toolbarSection\">\r\n            <span data-dojo-type=\"epi-cms/project/ProjectSelector\"\r\n                  data-dojo-attach-point=\"projectSelector\"\r\n                  data-dojo-props=\"store:this.model.projectStore\"\r\n                  data-dojo-attach-event=\"onSortChanged:_projectSelectorSortChanged, onChange:_projectSelectorChange\"></span>\r\n            <div data-dojo-type=\"dijit/form/DropDownButton\"\r\n                 data-dojo-attach-point=\"publishContainer\"\r\n                 data-dojo-props=\"iconClass: 'epi-iconPublishProject', showLabel: false, label: this.res.publishdropdown.label\"\r\n                 data-dojo-attach-event=\"openDropDown:_publishMenuClickHandler\"\r\n                 class=\"epi-flat epi-chromeless epi-chromeless--with-arrow\">\r\n                <span></span>\r\n                <div data-dojo-type=\"epi-cms/project/PublishMenu\"\r\n                     data-dojo-attach-point=\"publishMenu\"\r\n                     data-dojo-props=\"commandSource: this.model\">\r\n                    <section data-epi-section=\"primarySection\">\r\n                        <span data-dojo-attach-point=\"projectStatusMessageNode\"></span>\r\n                    </section>\r\n                    <section data-epi-section=\"statusSection\">\r\n                        <ul>\r\n                            <li>\r\n                                ${res.view.createdby} <span data-dojo-attach-point=\"createdByNode\" class=\"epi-username\"></span>,\r\n                                <span data-dojo-attach-point=\"createdNode\" class=\"epi-timestamp\"></span>\r\n                            </li>\r\n                        </ul>\r\n                    </section>\r\n                </div>\r\n            </div>\r\n            <div data-dojo-attach-point=\"toolbarGroupNode\" class=\"epi-floatRight\"></div>\r\n        </section>\r\n\r\n        <section data-epi-section=\"listContainer\">\r\n            <div data-dojo-attach-point=\"placeholderNode\" class=\"epi-project-gadget__placeholder dijitHidden\">\r\n                <div class=\"epi-project-gadget__placeholder-content\">\r\n                    <button data-dojo-type=\"dijit/form/Button\" type=\"button\"\r\n                            data-dojo-props=\"iconClass: 'epi-iconPlus'\"\r\n                            data-dojo-attach-event=\"onClick:_newProjectButtonClickHandler\"\r\n                            class=\"epi-flat epi-chromeless\">${res.command.newproject.label}</button>\r\n                    <div data-dojo-attach-point=\"createProjectInfoNode\" class=\"epi-project-gadget__placeholder-info\"></div>\r\n                </div>\r\n            </div>\r\n        </section>\r\n    </div>\r\n</div>\r\n"}});
define("epi-cms/project/ProjectComponent", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/dom-class",
    "dojo/dom-geometry",
    "dojo/on",
    "dojo/when",

    // epi
    "epi/shell/command/_WidgetCommandBinderMixin",

    // epi-cms
    "./_ProjectView",
    "./viewmodels/ProjectComponentViewModel",

    // template
    "dojo/text!./templates/ProjectComponent.html",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.project",

    // Widgets in template
    "dijit/DropDownMenu",
    "dijit/form/Button",
    "dijit/form/DropDownButton",
    "dijit/Toolbar",
    "./ProjectItemList",
    "./ProjectSelector",
    "./PublishMenu"
],

function (
// dojo
    declare,
    lang,
    aspect,
    domClass,
    domGeometry,
    on,
    when,

    // epi
    _WidgetCommandBinderMixin,

    // epi-cms
    _ProjectView,
    ProjectComponentViewModel,

    // template
    template,

    // Resources
    res
) {
    function show(list) {
        list.forEach(function (node) {
            domClass.remove(node, "dijitHidden");
        });
    }

    function hide(list) {
        list.forEach(function (node) {
            domClass.add(node, "dijitHidden");
        });
    }

    lang.delegate(_ProjectView.prototype.modelBindingMap, { placeHolder: ["placeHolder"] });

    return declare([_ProjectView, _WidgetCommandBinderMixin], {
        // summary:
        //
        // tags:
        //      internal

        "class": "epi-project-component",

        modelBindingMap: {
            projectItemQuery: ["projectItemQuery"],
            projectItemSortOrder: ["projectItemSortOrder"],
            selectedProject: ["selectedProject"],
            created: ["created"],
            createdBy: ["createdBy"],
            createProjectInfo: ["createProjectInfo"],
            dndEnabled: ["dndEnabled"],
            placeholderState: ["placeholderState"],
            notificationMessage: ["notificationMessage"],
            projectStatus: ["projectStatus"],
            contentLanguage: ["contentLanguage"]
        },

        res: res,

        templateString: template,

        layout: function () {
            this.inherited(arguments);

            this.itemList.resize(this._contentBox, this._contentBox);
        },

        _createViewModel: function () {
            // summary:
            //    Setting up the view model
            // tags:
            //    private

            return new ProjectComponentViewModel();
        },

        _projectSelectorSortChanged: function (sortOrder) {
            this.model.set("projectSortOrder", sortOrder);
        },

        _projectSelectorChange: function (project) {
            this.model.set("selectedProject", project);
        },

        _newProjectButtonClickHandler: function () {
            this.model.namedCommands.addProject.execute();
        },

        _setCreateProjectInfoAttr: { node: "createProjectInfoNode", type: "innerText" },

        _setSelectedProjectAttr: function (value) {
            this.projectSelector.set("value", value);
        },

        _setPlaceholderStateAttr: function (value) {
            // summary:
            //    Sets the placeholderState
            // tags:
            //    private

            if (this.get("_placeholderState") === value) {
                return;
            }

            this._set("_placeholderState", value);

            switch (value) {

                case "noProjects":
                    show([this.placeholderNode]);
                    hide([this.projectSelector.domNode, this.publishContainer.domNode]);

                    break;

                case "noSelectedProject":
                    show([this.projectSelector.domNode, this.placeholderNode]);
                    hide([this.publishContainer.domNode]);

                    break;

                default:
                    show([this.projectSelector.domNode, this.publishContainer.domNode]);
                    hide([this.placeholderNode]);

            }
        }
    });
});
