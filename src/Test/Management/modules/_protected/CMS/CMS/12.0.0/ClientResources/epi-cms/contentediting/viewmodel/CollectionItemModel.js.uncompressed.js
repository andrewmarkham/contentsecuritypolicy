define("epi-cms/contentediting/viewmodel/CollectionItemModel", [
// Dojo
    "dojo/_base/declare",

    // EPi CMS
    "epi-cms/contentediting/viewmodel/_ViewModelMixin"                                      // mixed into me

], function (
// Dojo
    declare,

    // EPi CMS
    _ViewModelMixin
) {

    return declare([_ViewModelMixin], {
        // summary:
        //      The item view model.
        // description:
        //      That is a base class for all collection item models.
        //      <see cref = "epi-cms/contentediting/viewmodel/LinkItemModel" />
        // tags:
        //    internal

        // id: [public] Number
        //      The identifier of this.
        id: null,

        // nameKey: [public] String
        //      Property name for the text value.
        textKey: "text",

        // titleKey: [public] String
        //      Property name for the title value.
        titleKey: null,

        // iconTypeKey: [public] String
        //      Property name for the IconType value.
        iconTypeKey: "typeIdentifier",

        // typeIdentifier: [public] String
        //      The item's content type.
        typeIdentifier: null,

        serialize: function () {
            // summary:
            //      Serialize data to be accepted by server that should be implemented by deliver class
            // tags:
            //      public abstract
        },

        parse: function (/*Boolean*/ tryUpdateItem) {
            // summary:
            //      User can be dnd some kind of data, so we need an generic method to process allover.
            //      That should be implemented by deliver class
            // tryUpdateItem: [Boolean]
            //      The flag to indicate that should try update item or not.
            // tags:
            //      pubic virtual

            if (tryUpdateItem) {
                return this._onTryUpdateItemModel();
            }

            return null;
        },

        _onTryUpdateItemModel: function () {
            // summary:
            //      Callback method that called when we need updated item's model
            // tags:
            //      protected abstract
        },

        _getPropertyValue: function (/*String*/keyName, /*String*/propName) {
            // summary:
            //      The common method to get property value by key name.
            // tags:
            //      private

            // Avoid recursive loop.
            if (keyName === propName) {
                return this[keyName];
            }
            return this.get(keyName);
        },

        _nameGetter: function () {
            return this._getPropertyValue(this.textKey, "name");
        },

        _textGetter: function () {
            return this._getPropertyValue(this.textKey, "text");
        },

        _titleGetter: function () {
            return this._getPropertyValue(this.titleKey, "title") || this._getPropertyValue(this.textKey, "title");
        },

        _iconTypeIdentifierGetter: function () {
            return this._getPropertyValue(this.iconTypeKey, "iconTypeIdentifier");
        }
    });
});
