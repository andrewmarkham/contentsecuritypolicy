define("epi/shell/command/builder/OptionsBuilderMixin", [
    "epi",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojox/html/entities",
    "dijit/CheckedMenuItem",
    "../OptionGroup",
    "epi/shell/widget/MenuHeaderSeparator",
    "epi/shell/DestroyableByKey"
], function (
    epi,
    declare,
    lang,
    on,
    entities,
    CheckedMenuItem,
    OptionGroup,
    MenuHeaderSeparator,
    DestroyableByKey) {

    return declare([DestroyableByKey], {
        // summary:
        //      Mixin class for creating option menu items from the options collection provided by an OptionCommand and add them to the dijit/Menu
        // tags:
        //      internal

        // optionItemClass: [public] String
        //      An optional CSS class added to all created menu items
        optionItemClass: "",

        constructor: function (options) {
            declare.safeMixin(this, options);
        },

        startup: function () {
            this.inherited(arguments);

            //Add the options
            this._addOptionMenuItems();
        },

        _addOptionMenuItems: function () {
            // summary:
            //      Adds the menu items from the options collection in the model to the menu
            // tags:
            //      private

            // We only want to create the menu items when the widget has started
            if (!this._started) {
                return;
            }

            // Destroy the old options
            this.getChildren().forEach(function (child) {
                this.removeChild(child);
                if (typeof child.destroy === "function") {
                    child.destroy();
                }
            }, this);

            this._createOptionMenuItems(this.model).forEach(this.addChild.bind(this));
        },

        _createOptionMenuItems: function (model) {
            // summary:
            //      Creates menu items from the options collection in the supplied model.
            //      Where model is an OptionCommand or an OptionGroup
            //
            // returns:
            //      An array with the created menu items
            //
            // tags:
            //      protected

            var items = [];

            var options = model.get("options");
            if (!lang.isArray(options)) {
                return items;
            }

            if (model.optionsLabel) {
                items.push(new MenuHeaderSeparator({label: model.optionsLabel}));
            }

            options.forEach(function (option) {
                if (option instanceof OptionGroup) {
                    items.push(new MenuHeaderSeparator({label: option.label}));
                    items = items.concat(this._createOptionMenuItems(option));
                } else {
                    items.push(this._createMenuItem(option, model));
                }
            }, this);

            return items;
        },

        _setModelAttr: function (model) {
            this._set("model", model);

            // Listen to changes on the options property and re-create the options if it has changed
            this.destroyByKey("optionsWatch");
            this.ownByKey("optionsWatch", model.watch("options", this._addOptionMenuItems.bind(this)));
        },

        _createMenuItem: function (option, model) {
            // summary:
            //      Creates a menu item from an option and binds it to the model
            //
            // tags: private

            var menuItem = new CheckedMenuItem({
                label: entities.encode(option.label),
                checked: epi.areEqual(model.get("selected"), option.value),
                "class": this.optionItemClass
            });
            menuItem.own(on(menuItem, "click", function () {
                model.set("selected", option.value);
            }));
            menuItem.own(model.watch("selected", function (name, oldValue, newValue) {
                menuItem.set("checked", epi.areEqual(newValue, option.value));
            }));

            return menuItem;
        }

    });
});
