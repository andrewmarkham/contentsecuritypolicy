define("epi-cms/widget/ViewSelectorDropDownButton", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/form/DropDownButton",
    "epi-cms/widget/ViewSelector",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.viewselector"
], function (
    array,
    declare,
    lang,
    DropDownButton,
    ViewSelector,
    resources) {

    return declare([DropDownButton], {
        // tags:
        //      internal

        buildRendering: function () {
            // summary:
            //      Constructs the toolbar container and starts the children setup process.
            // tags:
            //      internal

            this.inherited(arguments);
            this.set("title", resources.title);
            this.own(this.dropDown = new ViewSelector());
        },

        _setViewConfigurationsAttr: function (value) {
            // summary:
            //      Set view configurations attribute.
            // tags:
            //      protected

            if (!value) {
                return;
            }

            // Update the button's icon using the current view's icon
            array.some(value.availableViews, lang.hitch(this, function (view) {
                if (view.key === value.viewName) {
                    this.set("iconClass", view.iconClass);
                    return true;
                }
            }));

            this.dropDown.set("viewConfigurations", value);
        }
    });
});
