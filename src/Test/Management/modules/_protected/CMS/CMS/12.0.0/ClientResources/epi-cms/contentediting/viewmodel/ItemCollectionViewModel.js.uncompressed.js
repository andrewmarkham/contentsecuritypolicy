define("epi-cms/contentediting/viewmodel/ItemCollectionViewModel", [
// Dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Deferred",
    "dojo/promise/all",
    "dojo/when",

    // EPi CMS
    "epi-cms/contentediting/viewmodel/_ViewModelMixin",                                 // mixed into me
    "epi-cms/contentediting/viewmodel/LinkItemModel"                                    // Required for

], function (
// Dojo
    declare,
    lang,
    Deferred,
    all,
    when,

    // EPi CMS
    _ViewModelMixin,
    LinkItemModel
) {
    return declare([_ViewModelMixin], {
        // summary:
        //      The link collection editor view model.
        // description:
        //      That supports Move next/previous/remove logic
        // tags:
        //    internal

        // _instanceId: [private] String
        //      The identity for each instance.
        _instanceId: null,

        // _autoId: [private] Number
        //      The item's index
        _autoId: 0,

        // _selectedItem: [private] Object
        //      The current selected item.
        _selectedItem: null,

        // _data: [private] Array
        //      Array of <itemModelClass> that represent for the editor value
        _data: null,

        // itemModelClass: [public] Class
        //      The item's class got from itemModelType.
        itemModelClass: null,

        // itemModelType: [public] String
        //      The item model's class name can be injected from inheritance or caller.
        itemModelType: null,

        constructor: function (/*Object[]*/data, /*Object*/options) {
            // summary:
            //      Create new instance of ItemCollectionViewModel
            //      Parse original data to <itemModelClass>
            // data: Array
            //      The value of link collection property
            // options: Object
            //      Parameters to inject some argument from caller.
            //      For instance: itemModelClass

            declare.safeMixin(this, options);
        },

        postscript: function (data) {

            require([this.itemModelType], lang.hitch(this, function (modelClass) {
                this.itemModelClass = modelClass;
                this._instanceId = new Date().getTime();
                this._init(data);
            }));
        },

        moveNext: function () {
            // summary:
            //      The method used in "MoveToNext" command
            // tags:
            //      public

            this._move(1) && this.emit("changed");
        },

        movePrevious: function () {
            // summary:
            //      The method used in "MoveToPrevious" command
            // tags:
            //      public

            this._move(-1) && this.emit("changed");
        },

        remove: function () {
            // summary:
            //      The method used in "BlockRemove" command
            // tags:
            //      public

            if (!this.get("canEdit")) {
                return;
            }

            var index = this.getItemIndex(this._selectedItem);
            this._data.splice(index, 1);

            var len = this._data.length;
            this.set("selectedItem", this._data[index >= len ? len - 1 : index] || null);

            this.emit("changed");
        },

        addTo: function (/*Object*/newItem, /*Object*/item, /*Boolean*/before) {
            // summary:
            //      The method used when drag and drop item into LinkCollectionEdtior
            // tags:
            //      public

            if (!newItem) {
                return false;
            }

            if (this.getItemIndex(newItem) >= 0) {
                this.moveTo(newItem, null, false);
                this.emit("changed");
            } else {
                var self = this;
                when(self._createItemModel(newItem), function (model) {
                    if (!item) {
                        self._data.push(model);
                    } else {
                        // insert newItem to selected index rely on item's index
                        var targetIndex = self.getItemIndex(item) + (before ? 0 : 1);
                        self._data.splice(targetIndex, 0, model);
                    }

                    self.emit("changed", { uiChanged: false });
                });
            }
        },

        moveTo: function (/*Object*/selectedItem, /*Object*/item, /*Boolean*/before) {
            // summary:
            //      The method used when drag and drop selected item to reorder
            // tags:
            //      public

            if (!selectedItem && !this._selectedItem) {
                return false;
            }

            // set new selected item if drag another
            this.set("selectedItem", selectedItem || this._selectedItem);

            var sourceIndex = this.getItemIndex(this._selectedItem);
            // remove selected item first
            this._data.splice(sourceIndex, 1);

            // insert selectedItem to new index, if new index not exist then set to last index
            var targetIndex = (item ? this.getItemIndex(item) : (this._data.length - 1)) + (before ? 0 : 1);
            this._data.splice(targetIndex, 0, this._selectedItem);

            this.emit("changed");
        },

        updateItemData: function (/*Object*/ item) {
            // summary:
            //      Provides a consistant way to update the model.
            // value: Object
            //      The new data of selected item
            // tags:
            //      private

            var index = this.getItemIndex(this._selectedItem);
            if (index < 0) {
                return;
            }

            var self = this;
            when(self._createItemModel(item), function (model) {
                self._selectedItem = self._data[index] = model;
                self.emit("changed");
            });
        },

        swap: function (/*Object*/sourceIndex, /*Object*/targetIndex) {
            // summary:
            //      Swap 2 items by index
            // sourceIndex: Number
            //      Position (index) of 1st item
            // targetIndex: Number
            //      Position (index) of 2nd item
            // tags:
            //      private

            if (!this._data[sourceIndex] || !this._data[targetIndex]) {
                return false;
            }

            var temp = this._data[sourceIndex];
            this._data[sourceIndex] = this._data[targetIndex];
            this._data[targetIndex] = temp;

            return true;
        },

        getItemIndex: function (/*Object*/item) {
            // summary:
            //      Get item index in the data array
            // item: Object
            //      The item data

            var index = -1;
            if (!item || !(item instanceof this.itemModelClass)) {
                return index;
            }

            this._data.some(function (i, o) {
                if (i.id === item.id) {
                    index = o;
                    return true;
                }

                return false;
            }, this);

            return index;
        },

        _init: function (data) {
            // summary:
            //      Initialize the mode
            // data: Array
            //      The native array data

            var self = this,
                itemDfds;

            this.set("selectedItem", null);

            if (!(data instanceof Array)) {
                this._data = [];
            } else {
                itemDfds = data.map(function (item) {
                    return this._createItemModel(item);
                }, this);

                all(itemDfds).then(function (results) {
                    self._data = results;
                    self.emit("initCompleted");
                });
            }
        },

        _generateItemId: function () {
            // summary:
            //      Create new item identity.
            // tags:
            //      private

            return this._instanceId + "_" + this._autoId++;
        },

        _createItemModel: function (/*Object*/ item) {
            // summary:
            //      Create new link item model
            // item: Object
            //      The object's data to work with.
            // tags:
            //      private

            var modelClass = this.itemModelClass,
                id = { id: this._generateItemId() },
                model,
                dfd = new Deferred();

            // Return item directly if it is mine.
            if (this.getItemIndex(item) >= 0) {
                return item;
            }

            if (item instanceof modelClass) {
                model = lang.mixin(lang.clone(item), id);
            } else {
                model = new modelClass(lang.mixin(lang.clone(item), id));
            }

            when(model.parse(true), function () {
                dfd.resolve(model);
            });

            return dfd;
        },

        _move: function (/*Number*/direction) {
            // summary:
            //      The generic method used for "moveNext" or "movePrevious" methods.
            // direction: Number
            //      Can be "1" or "-1" represent for "next" or "previous" action
            // tags:
            //      private

            var index = this.getItemIndex(this._selectedItem);
            if (index < 0) {
                return false;
            }

            return this.swap(index, index + direction);
        },

        _canMoveNextGetter: function () {
            // summary:
            //      Override the get('canMoveNext') method that used in command

            var index = this.getItemIndex(this._selectedItem);
            return !!(this._selectedItem && index >= 0 && index < (this._data.length - 1));
        },

        _canMovePreviousGetter: function () {
            // summary:
            //      Override the get('canMovePrevious') method that used in command

            var index = this.getItemIndex(this._selectedItem);
            return !!(this._selectedItem && index > 0 && index <= (this._data.length - 1));
        },

        _canEditGetter: function () {
            // summary:
            //      The method used in "canEdit" link item command
            // tags:
            //      public

            return !this.readOnly && !!this._selectedItem;
        },

        _valueGetter: function () {
            // summary:
            //      Override base "get('value')" method to return array of serialized data.
            // tags:
            //      public override

            return this._data.map(function (item) {
                return item.serialize();
            }, this);
        },

        _dataGetter: function () {
            // summary:
            //      Override base "get('data')" method to return array of serialized data.
            // tags:
            //      public override

            return this._data || [];
        },

        _dataSetter: function (data) {
            // summary:
            //      Override base "set('data')" method to init data of this model.
            // tags:
            //      public override

            this._init(data);
        },

        _selectedItemGetter: function () {
            // summary:
            //      Override base "get('selectedItem')" method to return selected item.
            // tags:
            //      public override

            return this._selectedItem;
        },

        _selectedItemSetter: function (value) {
            // summary:
            //      Override base "set('selectedItem')" method to set selected item.
            // tags:
            //      public override

            this._selectedItem = value;
        }
    });
});
