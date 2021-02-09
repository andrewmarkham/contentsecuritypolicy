define("epi-cms/contentediting/viewmodel/_ContainerViewModel", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "epi/shell/DestroyableByKey",
    "./_ViewModelMixin"
], function (array, declare, DestroyableByKey, _ViewModelMixin) {

    return declare([_ViewModelMixin, DestroyableByKey], {
        // summary:
        //      Base class for container view models.
        // remarks:
        //      Classes inheriting this class should own all child related handles using the child.id, as they will
        //      be destroyed by this class.
        // tags:
        //      internal

        constructor: function () {
            this._data = [];
        },

        destroy: function () {
            this.inherited(arguments);

            // Recursively destroy child view models.
            this._data.forEach(function (item) {
                if (item.destroy) {
                    item.destroy();
                }
            });
        },

        addChild: function (child, index) {
            // summary:
            //      Adds a child to the view model at the given index or at the end of the collection.
            // remarks:
            //      The child will get an 'id' property if it does not already have one. This id should be used ownByKey
            //      when owning any handles from the child.
            // child: Object
            //      The child to be added.
            // index: Number?
            //      The index where to the child will be inserted.
            // tags:
            //      public

            child.set("parent", this);
            child.set("readOnly", this.readOnly);

            // Set the id property to the contentLink or group name so that we have unique children.
            child.id = this._hash(child);

            if (typeof index == "number") {
                this._data.splice(index, 0, child);
            } else {
                this._data.push(child);
            }

            this._emitChildrenChanged();
        },

        getChild: function (item) {
            // summary:
            //      Get the first child whose properties match the properties on the given item.
            // tags:
            //      public
            var children = this._data;

            for (var i = children.length - 1; i >= 0; i--) {
                if (children[i].equals(item)) {
                    return children[i];
                }
            }

            return null;
        },

        getChildById: function (id) {
            //TODO: Consider removing this
            var children = this._data;

            for (var i = children.length - 1; i >= 0; i--) {
                if (children[i].id === id) {
                    return children[i];
                }
            }

            return null;
        },

        getChildByIndex: function (index) {
            // summary:
            //      Return the indexed child.
            // tags:
            //      public
            return this._data[index];
        },

        getChildren: function () {
            // summary:
            //      Get the children of the view model.
            // tags:
            //      public
            return this._data;
        },

        removeChild: function (child, recursive) {
            // summary:
            //      Remove a child from the view model.
            // tags:
            //      public
            var index = this.indexOf(child);

            if (index < 0) {
                if (recursive) {
                    this.getChildren().slice().forEach(function (item) {
                        if (typeof item.removeChild === "function") {
                            item.removeChild(child, recursive);
                        }
                    });
                }
                return;
            }

            // Ensure child is a model instance.
            child = this.getChildByIndex(index);

            // Destroy all handles related to this child before destroying the child
            this.destroyByKey(child.id);
            child.destroy();
            this._data.splice(index, 1);

            this._emitChildrenChanged();
        },

        move: function (child, index) {
            // summary:
            //      Moves the child to a specific index
            // child: Object
            //      The child to be moved.
            // index: Number
            //      The index where to the child will be moved to.
            // tags:
            //      public
            var sourceIndex = this.indexOf(child);

            // Remove the child
            this._data.splice(sourceIndex, 1);

            // Insert it again at the new index
            this._data.splice(index, 0, child);

            this._emitChildrenChanged();
        },

        indexOf: function (child) {
            // summary:
            //      Returns the index of the child in the list of children
            // child: Object
            //      The child to find the index for
            var result = this._data.indexOf(child);

            if (result >= 0 || !child || typeof child.id === "undefined") {
                return result;
            }

            // fallback to finding child by id
            for (var i = 0; i < this._data.length; i++) {
                if (this._data[i].id === child.id) {
                    return i;
                }
            }
            return -1;
        },

        _hash: function (child) {
            // summary:
            //      Creates a hash for the given child.
            // tags:
            //      abstract
        },

        _readOnlySetter: function (readOnly) {
            this.readOnly = readOnly;

            array.forEach(this.getChildren(), function (child) {
                child.set("readOnly", readOnly);
            }, this);
        },

        _emitChildrenChanged: function (sender) {
            // summary:
            //      Emits children changed event
            // sender: Object?
            //      The sender
            // tags:
            //      protected, internal

            var length = this._data.length;
            array.forEach(this._data, function (child, index) {
                child.set("canMoveNext", index < (length - 1));
                child.set("canMovePrevious", index > 0 && index <= (length - 1));
                child.set("hasSiblings", length > 1);
            });

            this.set("count", length || 0);

            this.emit("childrenChanged", sender ? sender : this);
        }
    });
});
