define("epi-cms/compare/views/AllPropertiesCompareView", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/when",

    "../viewmodels/AllPropertiesCompareViewModel",
    "../AllPropertiesTransformer",
    "../FormField",
    "epi/shell/widget/FormContainer",

    // Parent class and mixins
    "epi-cms/contentediting/FormEditing",
    "epi/shell/widget/_ModelBindingMixin"
], function (
    declare,
    lang,
    Deferred,
    when,

    AllPropertiesCompareViewModel,
    AllPropertiesTransformer,
    FormField,
    FormContainer,

    // Parent class and mixins
    FormEditing,
    _ModelBindingMixin
) {

    return declare([FormEditing, _ModelBindingMixin], {
        // summary:
        //      View for comparing all properties.
        // tags:
        //      internal

        modelBindingMap: {
            comparison: ["comparison"],
            rightMetadata: ["rightMetadata"]
        },

        postMixInProperties: function () {
            this.inherited(arguments);

            this._groupMap = {};

            this.own(
                this.model = new AllPropertiesCompareViewModel({ model: this.model })
            );
        },

        removeForm: function (form) {
            // summary:
            //      Remove the edit form.
            // tags:
            //      protected

            var selectedChild = form.containerLayout.selectedChildWidget;
            if (selectedChild) {
                // Save the selected tabs name so that we can restore it later.
                this._selectedTabName = selectedChild.name.toLowerCase();
            }

            // Reset the group map so that we don't update the old tabs whilst switching views.
            this._groupMap = {};

            // Clear all the editor wrapper mappings. This only other happens when changing
            // the context and it needs to happen when changing the right version as well.
            this._mappingManager.clear();

            return this.inherited(arguments);
        },

        _createForm: function () {
            // summary:
            //      Setup the edit form.
            // tags:
            //      private

            return new FormContainer(lang.mixin({
                readOnly: !this.viewModel.canChangeContent(),
                metadata: this.viewModel.metadata,
                metadataTransformer: new AllPropertiesTransformer({ model: this.model }),
                baseClass: "epi-cmsEditingForm epi-form-container epi-form-container--compare"
            }, this.formSettings));
        },

        _setupForm: function () {
            // summary:
            //      Setup the edit form and set the selected tab if there is one.
            // tags:
            //      private
            this.inherited(arguments);

            // When changing the right version we should keep the tab selection.
            var selectedTab = this._groupMap[this._selectedTabName];
            if (selectedTab) {
                this._form.containerLayout.selectChild(selectedTab);
            }
        },

        _setComparisonAttr: function (comparison) {
            this._set("comparison", comparison);
            for (var groupName in this._groupMap) {
                var group = this._groupMap[groupName];
                var changes = (comparison && comparison[groupName] && comparison[groupName].length) || 0;
                this._setGroupTitleWithChanges(group, changes);
            }
        },

        _setRightMetadataAttr: function (metadata) {
            this._set("rightMetadata", metadata);

            if (!this._started) {
                return;
            }

            this._removeAndDestroyForm();
            this.viewModel && this._setupForm();
        },

        onGroupCreated: function (groupName, widget, parentGroupWidget) {
            // summary:
            //      Triggerred when a group created.
            // tags:
            //      public callback
            this.inherited(arguments);

            // If the group has a parent group we do not want to add that to our group map and change the title of the tab
            if (parentGroupWidget) {
                return;
            }

            var name = groupName.toLowerCase(),
                comparison = this.comparison;
            widget.groupName = groupName;

            this._groupMap[name] = widget;
            this._setGroupTitleWithChanges(widget, comparison && comparison[name] && comparison[name].length);
        },

        _setViewModelAttr: function (viewModel) {
            this.inherited(arguments);

            this.model.set("contentViewModel", this.viewModel);
        },

        _setGroupTitleWithChanges: function (group, numberOfChanges) {
            // summary:
            //      Sets the title along with the number of changes on the group.
            // tags:
            //      internal
            var title = group.params.title;

            if (numberOfChanges) {
                title = lang.replace("{0}<span class=\"epi-compare-tab--has-changes\">{1}</span>", [title, numberOfChanges]);
            }

            group.set("title", title);
        }
    });
});
