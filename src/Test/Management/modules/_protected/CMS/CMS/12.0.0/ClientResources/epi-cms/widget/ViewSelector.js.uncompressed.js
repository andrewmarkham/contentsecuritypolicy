define("epi-cms/widget/ViewSelector", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/when",

    // dijit
    "dijit/MenuSeparator",

    // Resouces
    "epi/i18n!epi/cms/nls/episerver.cms.widget.viewselector",

    // Widgets used in template
    "epi-cms/widget/SelectorMenuBase",
    "epi/shell/widget/CheckedMenuItem"
], function (
    array,
    declare,
    lang,
    topic,
    when,

    // dijit
    MenuSeparator,

    // Resouces
    resources,

    SelectorMenuBase,
    CheckedMenuItem
) {

    return declare([SelectorMenuBase], {
        // summary:
        //      Used for selecting display options for a block in a content area
        // tags:
        //      internal

        // viewConfigurations: [protected] Object
        //      The view configurations
        viewConfigurations: null,

        headingText: resources.title,

        _setViewConfigurationsAttr: function (value) {
            // summary:
            //      Set view configurations attribute.
            // tags:
            //      protected

            this._set("viewConfigurations", value);

            this._setup();
        },

        onExecute: function () {
            // summary:
            //	    Triggered when a menu item selected.
            // tags:
            //		public callback
        },

        onCancel: function () {
            // summary:
            //	    Triggered when the menu closed.
            // tags:
            //		public callback
        },

        _setup: function () {
            if (!this.viewConfigurations) {
                return;
            }

            // Remove the old menu items
            this.getChildren().forEach(function (item) {
                this.removeChild(item);
                item.destroyRecursive();
            }, this);

            var currentView = this.viewConfigurations.viewName,
                availableViews = this.viewConfigurations.availableViews;

            var lastCategory = "";
            array.forEach(availableViews, function (view) {
                if (view.hideFromViewMenu) {
                    return;
                }

                var category = view.category || "";
                if (category !== lastCategory) {
                    this.addChild(new MenuSeparator({ baseClass: "epi-menuSeparator" }));
                }
                lastCategory = category;

                var item = new CheckedMenuItem({
                    label: view.name,
                    title: view.description,
                    iconClass: view.iconClass,
                    checked: view.key === currentView
                });

                item.own(item.on("click", function () {
                    this.onExecute();
                    item.set("checked", !item.checked); // we dont want to switch checked state on this item when clicking it.
                    if (currentView === "view") {
                        topic.publish("/epi/cms/action/disablepreview");
                    }
                    topic.publish("/epi/shell/action/changeview", view.key, null, null, true);
                }.bind(this)));

                this.addChild(item);
            }, this);
        }
    });
});
