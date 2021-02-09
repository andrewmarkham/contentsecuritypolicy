define("epi-cms/contentediting/StandardToolbar", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/promise/all",
    "dojo/when",
    "dijit/form/DropDownButton",
    "epi/shell/layout/ToolbarContainer",
    "epi/shell/widget/ToolbarLabel",
    "epi/shell/widget/ToolbarSet",
    "epi-cms/plugin-area/edit-view-filters",
    // Used by widget factory
    "epi-cms/widget/Breadcrumb",
    "epi-cms/widget/BreadcrumbCurrentItem",
    "epi-cms/widget/ChangeView"
], function (declare, lang, all, when, DropDownButton, ToolbarContainer, ToolbarLabel, ToolbarSet, editViewFilters, Breadcrumb, BreadcrumbCurrentItem) {

    return declare([ToolbarSet], {
        // tags:
        //      public

        // currentContext: [public] Object
        //      An object with the current context information.
        currentContext: null,

        // availableViews: [public] Array
        //      List of available views.
        availableViews: null,

        // viewName: [public] String
        //      The current view name.
        viewName: null,

        // _setupPromise: [private] String
        //      The setup children promise.
        _setupPromise: null,

        constructor: function () {
            this.viewConfigurations = {};
        },

        buildRendering: function () {
            // summary:
            //      Constructs the toolbar container and starts the children setup process.
            // tags:
            //      protected

            this.inherited(arguments);

            // Setup the children items in the toolbar.
            when(this._setupPromise = this.setupChildren(), lang.hitch(this, function () {
                // Update the toolbar items with the current model.
                this.updateChildren();
            }));
        },

        isSetup: function () {
            // summary:
            //      Wait for setup to finish.
            // tags:
            //      protected

            return this._setupPromise;
        },

        setupChildren: function (/* Object[]? */ optionalToolbarGroups, /* Object[]? */ optionalToolbarItems) {
            // summary:
            //      Setup the items in the toolbar. Inheriting classes should extend this to add more items to the toolbar.
            // tags:
            //      protected

            var toolbarGroups = [{
                name: "leading",
                type: "toolbargroup",
                settings: { region: "leading" }
            }, {
                name: "center",
                type: "toolbargroup",
                settings: { region: "center" }
            }, {
                name: "trailing",
                type: "toolbargroup",
                settings: { region: "trailing" }
            }];

            var toolbarItems = [{
                parent: "leading",
                name: "breadcrumbs",
                widgetType: "epi-cms/widget/Breadcrumb",
                settings: {
                    displayAsText: false,
                    showCurrentNode: false
                }
            }, {
                parent: "trailing",
                name: "viewselect",
                widgetType: "epi-cms/widget/ChangeView"
            }, {
                parent: "leading",
                name: "currentcontent",
                widgetType: "epi-cms/widget/BreadcrumbCurrentItem"
            }];

            toolbarGroups = optionalToolbarGroups ? optionalToolbarGroups.concat(toolbarGroups) : toolbarGroups;
            toolbarItems = optionalToolbarItems ? optionalToolbarItems.concat(toolbarItems) : toolbarItems;

            return this.add(toolbarGroups).then(lang.hitch(this, function () {
                return this.add(toolbarItems);
            }));
        },

        updateChildren: function () {
            // summary:
            //      Update the toolbar items. This method is called on startup and whenever the current context is set.
            // tags:
            //      protected

            var context = this.currentContext,
                contentLink = context && context.id;

            this.setItemProperty("breadcrumbs", "contentLink", contentLink);
            this.setItemProperty("viewselect", "currentContext", this.currentContext);
            this.setItemProperty("viewselect", "viewName", this.viewConfigurations.viewName);
            this.setItemProperty("viewselect", "viewConfigurations", this.viewConfigurations);
            if (context) {
                this.setItemProperty("currentcontent", "currentItemInfo", {
                    name: context.name,
                    dataType: context.dataType
                });
            }
        },

        update: function (data) {
            // summary:
            //      Update the toolbar with new data.
            // data:
            //      Toolbar data model. Expected properties are: currentContext and viewConfigurations
            // tags:
            //      public

            if (!data) {
                return;
            }

            var viewConfigurations = data.viewConfigurations;

            // Run the defined view filters to allow partners to decide what should be
            // visible in the View menu
            editViewFilters.get().forEach(function (filter) {
                viewConfigurations = filter(viewConfigurations, data.contentData, data.currentContext);
            }, this);

            this.currentContext = data.currentContext;
            this.viewConfigurations = viewConfigurations;

            when(this.isSetup(), lang.hitch(this, this.updateChildren));
        }
    });
});
