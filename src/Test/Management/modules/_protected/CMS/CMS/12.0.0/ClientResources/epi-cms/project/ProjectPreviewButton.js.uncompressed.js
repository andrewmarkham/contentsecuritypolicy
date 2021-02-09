define("epi-cms/project/ProjectPreviewButton", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/dom-class",
    "dojo/Deferred",
    "dojo/topic",
    "epi/dependency",
    // Resources
    "epi/i18n!epi/nls/episerver.cms.components.project.preview",
    // Parent class
    "epi/shell/widget/DeferredDropDownButton",
    // Dropdown widget
    "epi-cms/project/ProjectSelectorList"
], function (
    declare,
    lang,
    domClass,
    Deferred,
    topic,
    dependency,
    // Resources
    localization,
    // Parent class
    DeferredDropDownButton,
    // Dropdown widget
    ProjectSelectorList
) {

    return declare([DeferredDropDownButton], {
        // summary:
        //      The button for the project preview view settings options. Handles creating the project
        //      preview selector and reading and setting the selected project value to the view setting.
        // tags:
        //      internal

        // iconClass: [public] String
        //      The CSS class that adds the button icon.
        iconClass: "epi-icon--medium epi-iconProject",

        baseClass: "",

        postMixInProperties: function () {
            // summary:
            //      Called after the parameters to the widget have been read-in,
            //      but before the widget template is instantiated.
            // tags:
            //      protected
            this.inherited(arguments);

            this.store = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.project");
        },

        buildRendering: function () {
            // summary:
            //      Construct the UI for this widget, setting this.domNode and this.dropdown.
            // tags:
            //      protected
            this.inherited(arguments);
            domClass.add(this.domNode, ["epi-chromeless", "epi-mediumButton"]);

            // Construct the drop down menu if it doesn't exist.
            if (!this.dropDown) {
                this.dropDown = new ProjectSelectorList({
                    baseClass: "dijitMenu",
                    enableDefaultValue: true,
                    defaultValueText: localization.defaultoption,
                    store: this.store,
                    header: localization.header,
                    loadStoreOnStartup: true
                });
            }
        },

        postCreate: function () {
            // summary:
            //      Processing after the DOM fragment is created. Sets up event handlers.
            // tags:
            //      protected
            this.inherited(arguments);

            var self = this,
                // Get the initial state from the view settings manager.
                projectId = dependency.resolve("epi.viewsettingsmanager").getSettingProperty("project"),
                // Resolve the project based on the ID stored in view settings.
                promise = projectId ? this.store.get(parseInt(projectId)) : new Deferred().resolve();

            promise
                .then(function (project) {
                    self.dropDown.set("selectedProject", project);
                    self._updateButtonState(project);
                })
                .always(function () {
                    // Handle changes to the selected project in the selector.
                    self.own(
                        self.dropDown.watch("selectedProject", lang.hitch(self, "_selectedProjectChanged"))
                    );
                });
        },

        loadAndOpenDropDown: function () {
            // summary:
            //      Opens the drop down and refreshes the content.
            // returns: Promise
            //      Promise for the drop down widget that resolves when
            //      the drop down is created and loaded.
            // tags:
            //      protected

            if (this.isLoaded()) {
                // If the drop down has already been loaded then we need to do a refresh after opening.
                return this.inherited(arguments).then(lang.hitch(this, function () {
                    return this.dropDown.refresh();
                }));
            }

            return this.inherited(arguments);
        },

        _selectedProjectChanged: function (name, oldValue, value) {
            // summary:
            //      The callback method for when the selected project changes on the selector.
            // tags:
            //      private
            var projectId = value ? value.id : null;

            topic.publish("/epi/cms/action/viewsettingvaluechanged", "project", projectId);

            this._updateButtonState(value);
        },

        _updateButtonState: function (project) {
            // summary:
            //      Updates the UI state of the button, setting the title attribute and marking
            //      it as checked depending on whether a project is selected.
            // tags:
            //      private
            var tooltip = localization.defaulttooltip;

            // Set a specific tooltip if there is a project selected.
            if (project) {
                tooltip = lang.replace(localization.tooltip, { project: project.name });
            }

            this.set("title", tooltip);

            // Mark the button as checked if there is a project selected.
            domClass.toggle(this.iconNode, "epi-icon--active", !!project);
        }
    });
});
