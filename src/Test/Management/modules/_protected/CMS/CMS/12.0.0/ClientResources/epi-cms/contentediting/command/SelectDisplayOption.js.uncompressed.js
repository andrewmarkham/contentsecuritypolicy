define("epi-cms/contentediting/command/SelectDisplayOption", [
    // General application modules
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",

    "epi/dependency",

    "epi-cms/contentediting/command/_ContentAreaCommand",
    "epi-cms/contentediting/viewmodel/ContentBlockViewModel",

    "epi-cms/widget/DisplayOptionSelector",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea.displayoptions"
], function (declare, lang, when, dependency, _ContentAreaCommand, ContentBlockViewModel, DisplayOptionSelector, resources) {

    return declare([_ContentAreaCommand], {
        // tags:
        //      internal

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: resources.label,

        // category: [readonly] String
        //      A category which hints that this item should be displayed as an popup menu.
        category: "popup",

        _labelAutomatic: lang.replace(resources.label, [resources.automatic]),

        constructor: function () {
            this.popup = new DisplayOptionSelector();
        },

        postscript: function () {
            this.inherited(arguments);

            if (!this.store) {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get("epi.cms.displayoptions");
            }

            when(this.store.get(), lang.hitch(this, function (options) {
                // Reset command's available property in order to reset dom's display property of the given node
                this._setCommandAvailable(options);

                this.popup.set("displayOptions", options);
            }));
        },

        destroy: function () {
            this.inherited(arguments);

            this.popup && this.popup.destroyRecursive();
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model value has changed.
            // tags:
            //      protected

            this.inherited(arguments);

            var options = this.popup.displayOptions,
                selectedOption = this.model.get("displayOption"),
                isAvailable = options && options.length > 0;

            isAvailable = isAvailable && (this.model instanceof ContentBlockViewModel);

            this._setCommandAvailable(options);

            if (!isAvailable) {
                this.set("label", this._labelAutomatic);
                return;
            }

            this.popup.set("model", this.model);

            if (!selectedOption) {
                this.set("label", this._labelAutomatic);
            } else {
                this._setLabel(selectedOption);
            }

            this._watch("displayOption", function (property, oldValue, newValue) {
                if (!newValue) {
                    this.set("label", this._labelAutomatic);
                } else {
                    this._setLabel(newValue);
                }
            }, this);
        },

        _setCommandAvailable: function (/*Array*/displayOptions) {
            // summary:
            //      Set command available
            // displayOptions: [Array]
            //      Collection of a content display mode
            // tags:
            //      private

            this.set("isAvailable", displayOptions && displayOptions.length > 0 && this.model instanceof ContentBlockViewModel);
        },

        _setLabel: function (displayOption) {
            when(this.store.get(displayOption), lang.hitch(this, function (option) {
                this.set("label", lang.replace(resources.label, [option.name]));

            }), lang.hitch(this, function (error) {

                console.log("Could not get the option for: ", displayOption, error);

                this.set("label", this._labelAutomatic);
            }));
        },

        _onModelValueChange: function () {
            this.set("canExecute", !!this.model && this.model.contentLink && !this.model.get("readOnly"));
        }
    });
});
