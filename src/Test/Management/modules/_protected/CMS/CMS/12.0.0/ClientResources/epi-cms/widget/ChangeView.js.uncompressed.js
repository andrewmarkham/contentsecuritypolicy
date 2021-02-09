define("epi-cms/widget/ChangeView", [
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/dom-class",
    "dojo/dom-style",

    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",

    "epi-cms/widget/ViewSwitchButton",
    "epi-cms/widget/ViewSelectorDropDownButton",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
], function (
    declare,
    array,
    domClass,
    domStyle,

    _Widget,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    ViewSwitchButton,
    ViewSelectorDropDownButton,
    res
) {

    return declare([_Widget, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      Container widget for ViewSwitchButton and ViewSelectorDropDownButton
        //      Responsible for managing visibility of view selectors
        // tags:
        //      internal

        templateString: "<div class=\"dijitInline epi-trailingContainer\"></div>",

        buildRendering: function () {
            this.inherited(arguments);

            this._createViewSelector();
            this._createSwitchButton();
        },

        _createViewSelector: function () {
            this._viewSelectorDropDownButton = new ViewSelectorDropDownButton({
                showLabel: false,
                "class": "epi-mediumButton"
            });
            this._viewSelectorDropDownButton.placeAt(this.domNode);
        },

        _createSwitchButton: function () {
            this._viewSwitchButton = new ViewSwitchButton({
                firstButtonSettings: {
                    title: res.onpageedit.title,
                    label: res.onpageedit.label,
                    iconClass: "epi-iconLayout",
                    showLabel: false
                },
                secondButtonSettings: {
                    title: res.formedit.title,
                    label: res.formedit.label,
                    iconClass: "epi-iconForms",
                    showLabel: false
                }
            });
            this._viewSwitchButton.placeAt(this.domNode);
        },

        _setStateAttr: function (value) {
            this.inherited(arguments);
            this._viewSwitchButton.set("state", value);
        },

        _setViewNameAttr: function (viewName) {
            var isOnPageEditRelated = viewName === "onpageedit" || viewName === "sidebysidecompare" || viewName === "view" || viewName === "allpropertiescompare";
            this._viewSwitchButton.set("isFirstButtonActive", isOnPageEditRelated);
        },

        _setCurrentContextAttr: function (context) {
            this._currentContext = context;
        },

        _setViewConfigurationsAttr: function (viewConfigurations) {
            this._viewSelectorDropDownButton.set("viewConfigurations", viewConfigurations);

            var hasCustomViews = this._hasCustomViews(viewConfigurations.availableViews);
            var hasBuiltInViews = this._hasBuiltInViews(viewConfigurations.availableViews);

            this._setVisibility(this._viewSwitchButton, !hasCustomViews && hasBuiltInViews && this._currentContext.hasTemplate);
            this._setVisibility(this._viewSelectorDropDownButton, hasCustomViews);
        },

        _hasCustomViews: function (availableViews) {
            // summary:
            //      Determines whether available views contains custom views.
            // tags:
            //      private
            return array.filter(availableViews, function (view) {
                return !view.hideFromViewMenu && view.key !== "onpageedit" && view.key !== "formedit";
            }).length;
        },

        _hasBuiltInViews: function (availableViews) {
            // summary:
            //      Determines whether both on-page edit and all properties edit are available views.
            // tags:
            //      private
            return array.filter(availableViews, function (view) {
                return view.key === "onpageedit" || view.key === "formedit";
            }).length === 2;
        },

        _setVisibility: function (/*widget*/widget, /*Boolean*/visible) {
            // summary:
            //    sets item widget visibility.
            // tags:
            //    private

            domStyle.set(widget.domNode, { display: (visible ? "" : "none") });
            widget.set("itemVisibility", visible);
        }
    });
});
