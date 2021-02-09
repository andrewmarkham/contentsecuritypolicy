define("epi-cms/widget/overlay/ItemCollection", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    // EPi CMS
    "epi-cms/contentediting/viewmodel/ItemCollectionViewModel",                         // the injected model class
    "epi-cms/widget/overlay/Property"                                                   // mixin into me
], function (
// Dojo
    declare,
    lang,

    // EPi CMS
    ItemCollectionViewModel,
    Property
) {
    return declare([Property], {
        // summary:
        //      The new overlay item for property link collection.
        // description:
        //      Drag and drop page/media to create new link (at the bottom)
        // tags:
        //      internal xproduct

        // modelType: [public] String
        //      Used to inject model for this.
        modelType: "epi-cms/contentediting/viewmodel/ItemCollectionViewModel",

        // model: [public] Object
        //      Instance of modelClass
        model: null,

        postMixInProperties: function () {
            // summary:
            //      Create the view model if it doesn't exist.
            // tags:
            //      protected

            this.inherited(arguments);

            this._setupAllowedTypes();
            this._setupModel(this.contentModel.get(this.name));

            this.own(this.contentModel.watch(this.name, lang.hitch(this, function (name, oldValue, newValue) {
                this.model.set("data", newValue);
            })));
        },

        onDrop: function (target, value) {
            // summary:
            //      Handles onDrop and add new value to model then raise onValueChange event to save this.
            // target: [Object]
            //      The dnd target.
            // value: [Object || Array]
            //      The dnd data.
            // tags:
            //      private

            // Add new value to model at the bottom
            this.model.addTo(value, null, false);
        },

        _setupModel: function (/*Object*/data) {
            // summary:
            //      setup the viewmodel with latest value
            // tags:
            //      public

            require([this.modelType], lang.hitch(this, function (modelClass) {

                this.model = new modelClass(data, this.modelParams);

                this.own(
                    // Handle model value changed
                    this.model.on("changed", lang.hitch(this, function (result) {
                        // Raise event to save this
                        this.onValueChange({
                            propertyName: this.name,
                            value: this.model.get("value")
                        });
                    }))
                );
            }));
        },

        _setupAllowedTypes: function () {
            // summary:
            //      Setup the allowed types for drag and drop
            // tags:
            //      Protected

            var converterKey = this.modelParams.itemConverterKey,
                customTypeIdentifier = this.modelParams.customTypeIdentifier;

            this.allowedDndTypes = this.allowedDndTypes || [];

            if (converterKey) {
                this.allowedDndTypes = this.allowedDndTypes.map(function (type) {
                    return type + "." + converterKey;
                });
            }

            if (customTypeIdentifier) {
                this.allowedDndTypes.unshift(customTypeIdentifier);
            }
        }

    });
});
