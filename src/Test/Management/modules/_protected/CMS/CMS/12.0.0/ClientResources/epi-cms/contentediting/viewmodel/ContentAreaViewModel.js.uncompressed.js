define("epi-cms/contentediting/viewmodel/ContentAreaViewModel", [
    // General application modules
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/promise/all",
    "dojo/when",
    "dojox/uuid/generateRandomUuid",
    "epi/dependency",
    "epi-cms/contentediting/viewmodel/ContentBlockViewModel",
    "epi-cms/contentediting/viewmodel/PersonalizedGroupViewModel",
    "epi-cms/contentediting/ContentActionSupport",
    // Parent class and mixins
    "epi-cms/contentediting/viewmodel/_ContainerViewModel",
    "epi-cms/_ContentContextMixin"
], function (
    array,
    declare,
    lang,
    all,
    when,
    generateRandomUuid,
    dependency,
    ContentBlockViewModel,
    PersonalizedGroupViewModel,
    ContentActionSupport,
    // Parent class and mixins
    _ContainerViewModel,
    _ContentContextMixin
) {

    return declare([_ContainerViewModel, _ContentContextMixin], {
        // summary:
        //      The view model for the content area when editing in on-page mode and forms mode.
        // tags:
        //      internal

        /*=====

        // value: [public] Array
        //      The value of the content area property.
        value: null,

        =====*/

        // selectedItem: [public] Object
        //      The model for the selected content.
        selectedItem: null,

        postscript: function () {
            this.inherited(arguments);

            this.contentTypeService = this.contentTypeService || dependency.resolve("epi.cms.ContentTypeService");

            if (!this._contentTypeStore) {
                var registry = dependency.resolve("epi.storeregistry");
                this._contentTypeStore = registry.get("epi.cms.contenttype");
            }
        },

        addChild: function (child /*=====, index =====*/) {
            // summary:
            //      Adds a child to the view model at the given index or at the end of the collection.
            // child: Object
            //      The child to be added.
            // index: Number?
            //      The index where to the child will be inserted.
            // tags:
            //      public

            //TODO: make this code more generic
            // and merge with _transformValueToModels

            // We cannot own the child handles by id until the child has been added and received an id, so store them
            // in this array and own them all by id at the end.
            var childHandles = [];

            if (!(child instanceof ContentBlockViewModel) && !(child instanceof PersonalizedGroupViewModel)) {
                var model = new ContentBlockViewModel(child);

                // If the model has a content group add it to the groups view model.
                if (model.contentGroup) {
                    child = this._groups[model.contentGroup];

                    if (!child) {
                        // Create the group if it doesn't exist and add it to the data.
                        child = this._createGroup(model.contentGroup);
                    }

                    child.addChild(model);
                } else {
                    // Else add the model directly to the data for this view model.
                    child = model;
                }
            } else {
                child.set("contentGroup", null);

                if (child instanceof PersonalizedGroupViewModel) {
                    childHandles.push(child.on("childrenChanged", lang.hitch(this, function () {

                        //Propagate changes of the group
                        this._emitChildrenChanged(child);

                        //If there are no more children, remove the group
                        if (child.getChildren().length === 0) {
                            this.removeChild(child);
                            this._emitChanged();
                        }
                    })));
                } else if (child instanceof ContentBlockViewModel) {
                    child.resetRoleIdentities();
                }
            }

            // Propagate changed event from the child to the content area.
            childHandles.push(child.on("changed", this._emitChanged.bind(this)));

            this.inherited(arguments);

            childHandles.push(child.on("selected", lang.hitch(this, "set", "selectedItem")));

            childHandles.forEach(function (handle) {
                this.ownByKey(child.id, handle);
            }, this);
        },

        canCreateBlock: function (allowedTypes, restrictedTypes) {
            // summary:
            //      Determines whether the user can create blocks on this content area.
            // tags:
            //      internal

            var contentTypeservice = this.contentTypeService;
            return all([this.getCurrentContext(), this.getCurrentContent()])
                .then(function (results) {
                    var context = results[0],
                        contentData = results[1];

                    // If there is no context or content data then it shouldn't be possible
                    // to create a block for this content area. So return false.
                    if (!context || !contentData) {
                        return false;
                    }

                    var hasCreatePermission = ContentActionSupport.isActionAvailable(
                        contentData,
                        ContentActionSupport.action.Create,
                        ContentActionSupport.providerCapabilities.Create,
                        true);

                    // Check whether the current user has create permission. Also check if the current content is
                    // resourcable and finally check whether we are in a mode where create should not be available.
                    if (!hasCreatePermission ||
                        !context.capabilities.resourceable ||
                        context.currentMode === "create" || context.currentMode === "translate") {
                        return false;
                    }


                    return when(contentTypeservice.getAcceptedChildTypes(contentData.contentLink, true, ["episerver.core.blockdata"], allowedTypes, restrictedTypes)).then(function (availableTypes) {
                        return !!availableTypes.length;
                    });

                });
        },

        moveVisible: function (child, moveToNext) {
            // summary:
            //      Moves the child to a specific index based on visibility of children.
            // tags:
            //      public
            var children = array.filter(this.getChildren(), function (item) {
                    return item.get("visible");
                }),
                delta = moveToNext ? 1 : -1, // Delta indicating if this is a move next or move previous.
                target = array.indexOf(children, child) + delta, // The target visible index to move to.
                index = this.indexOf(children[target]); // The actual index of the target in the model.

            this.modify(lang.hitch(this, function () {
                this.move(child, index);
            }));
        },

        moveOutsideGroup: function (child) {
            // summary:
            //      Move the child out from the group
            // child: Object
            //      The child to move
            //
            if (!child.contentGroup) {
                console.debug("The child does not belong to any group", child);

                return;
            }

            var group = this.getChild({
                    name: child.contentGroup
                }),
                index = this.indexOf(group);

            this.modify(lang.hitch(this, function () {
                //Remove the child from the group but do not emit the change event
                group.removeChild(child);

                //Add the child to this model
                this.addChild(child, index);
            }));
        },

        personalize: function (child) {
            // summary:
            //      Personalizes the child
            // child: ContentBlockViewModel
            //      The block to personalize
            // tags:
            //      internal

            // Remove the item from the model.
            var index = this.indexOf(child);
            this.removeChild(child);

            // Create a new personalized group and add the item to it.
            var group = new PersonalizedGroupViewModel({
                name: "group_" + Date.now(),
                expandOnAdd: true
            });
            child.set("ensurePersonalization", true);
            group.addChild(child);

            // Add the group to the model.
            this.addChild(group, index);
        },

        _valueGetter: function () {
            var value = [];
            array.forEach(this.getChildren(), function (child) {
                value = value.concat(child.serialize());
            });
            return value;
        },

        _valueSetter: function (value) {
            this._transformValueToModels(value);
        },

        _selectedItemSetter: function (value) {
            if (this.selectedItem) {
                this.selectedItem.set("selected", false);
            }
            this.selectedItem = value;
        },

        _transformValueToModels: function (value) {
            // summary:
            //      Transforms the current value into a tree representation using observable stores.
            // tags:
            //      private

            // Remove the existing children since we are recreating all the data.
            this.modify(function () {
                var children = this.getChildren();
                for (var i = children.length - 1; i >= 0; i--) {
                    this.removeChild(children[i]);
                }

                // Clear the groups since we are recreating all the data.
                this._groups = {};

                array.forEach(value, function (child) {
                    var model = new ContentBlockViewModel(child);
                    // If the model has a content group add it to the groups view model.
                    if (model.contentGroup) {
                        var group = this._groups[model.contentGroup];

                        if (!group) {
                            // Create the group if it doesn't exist and add it to the data.
                            group = this._createGroup(model.contentGroup);
                            this.addChild(group);
                        }

                        // Add the child at the end
                        group.addChild(model, group.getChildren().length);
                    } else {
                        // Else add the model directly to the data for this view model.
                        this.addChild(model);
                    }
                }, this);
            }, this, false);
        },

        _emitChanged: function () {
            // tags:
            //      private
            this.emit("changed");
        },

        _createGroup: function (name) {
            // summary:
            //      Creates the group with the given name and adds it to the groups map.
            // tags:
            //      private
            var group = new PersonalizedGroupViewModel({
                name: name
            });

            this._groups[name] = group;

            return group;
        },

        _hash: function (child) {
            // summary:
            //      Creates a hash for the given child.
            // tags:
            //      protected
            return (child.contentLink || child.name) + "_" + generateRandomUuid();
        }
    });
});
