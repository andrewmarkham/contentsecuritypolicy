define("epi-cms/contentediting/editors/model/CollectionEditorItemModel", [
// Dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful"
], function (
// Dojo
    array,
    declare,
    lang,
    Stateful
) {

    return declare([Stateful], {
        // summary:
        //      Item model class for collection editor.
        //
        // tags:
        //      internal

        // _itemDataProperties: Array
        //      An array populated with the property names of the source item
        _itemDataPropertyNames: null,

        _nameGetter: function () {
            // summary:
            //      Used by dnd avatar creation to get the avatar text.
            return this.name || this.text || "*";
        },

        fromItemData: function (itemData, typeIdentifier) {
            // summary:
            //      Create item model object from raw item data.
            // itemData: Object
            //      The raw item data.
            // typeIdentifier: String
            //      The meta data identifier of the backing data type
            // tags:
            //      public

            lang.mixin(this, itemData);

            this._itemDataPropertyNames = [];
            for (var propertyName in itemData) {
                if (itemData.hasOwnProperty(propertyName)) {
                    this._itemDataPropertyNames.push(propertyName);
                }
            }

            this.typeIdentifier = typeIdentifier && typeIdentifier.toLowerCase();
        },

        toItemData: function () {
            // summary:
            //      Unwrap item model and return raw item data.
            // tags:
            //      public

            var result = {};

            array.forEach(this._itemDataPropertyNames, function (propertyName) {
                result[propertyName] = this.get(propertyName);
            }, this);

            return result;
        }
    });
});
