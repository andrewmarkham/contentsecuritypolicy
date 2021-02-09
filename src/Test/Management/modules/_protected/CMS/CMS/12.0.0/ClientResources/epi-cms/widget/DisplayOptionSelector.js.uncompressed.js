define("epi-cms/widget/DisplayOptionSelector", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",

    "dijit/MenuSeparator",

    "epi/shell/DestroyableByKey",
    "epi-cms/widget/SelectorMenuBase",

    // Resouces
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea.displayoptions",

    // Widgets used in template
    "epi/shell/widget/RadioMenuItem"
], function (
    array,
    declare,
    lang,
    when,

    MenuSeparator,

    DestroyableByKey,
    SelectorMenuBase,

    // Resouces
    resources,

    RadioMenuItem
) {

    return declare([SelectorMenuBase, DestroyableByKey], {
        // summary:
        //      Used for selecting display options for a block in a content area
        //
        // tags:
        //      internal

        // model: [public] epi-cms/contentediting/viewmodel/ContentBlockViewModel
        //      View model for the selector
        model: null,

        // _resources: [private] Object
        //      Resource object used in the template
        headingText: resources.title,

        _rdAutomatic: null,

        postCreate: function () {
            // summary:
            //      Create the selector template and query for display options

            this.inherited(arguments);

            this.own(this._rdAutomatic = new RadioMenuItem({ label: resources.automatic, value: "" }));
            this.addChild(this._rdAutomatic);
            this.own(this._rdAutomatic.on("change", lang.hitch(this, this._restoreDefault)));
        },

        destroy: function () {
            this._removeMenuItems();

            this.inherited(arguments);
        },

        _restoreDefault: function () {
            this.model.modify(function () {
                this.model.set("displayOption", null);
            }, this);
        },

        _setModelAttr: function (model) {
            this._set("model", model);

            this._setup();
        },

        _setDisplayOptionsAttr: function (displayOptions) {
            this._set("displayOptions", displayOptions);

            this._setup();
        },

        _setup: function () {

            if (!this.model || !this.displayOptions) {
                return;
            }

            //Destroy the old menu items
            this._removeMenuItems();

            var selectedDisplayOption = this.model.get("displayOption");

            array.forEach(this.displayOptions, function (displayOption) {

                var item = new RadioMenuItem({
                    label: displayOption.name,
                    iconClass: displayOption.iconClass,
                    displayOptionId: displayOption.id,
                    checked: selectedDisplayOption === displayOption.id,
                    title: displayOption.description
                });

                this.ownByKey("items", item.watch("checked", lang.hitch(this, function (property, oldValue, newValue) {
                    if (!newValue) {
                        return;
                    }
                    //Modify the model
                    this.model.modify(function () {
                        this.model.set("displayOption", displayOption.id);
                    }, this);
                })));

                this.addChild(item);
            }, this);

            this._rdAutomatic.set("checked", !selectedDisplayOption);
        },

        _removeMenuItems: function () {
            var items = this.getChildren();
            this.destroyByKey("items");
            items.forEach(function (item) {
                if (item === this._rdAutomatic) {
                    return;
                }
                this.removeChild(item);
                item.destroy();
            }, this);
        }
    });
});
