define("epi-cms/contentediting/viewmodel/PersonalizedGroupViewModel", [
    // General application modules
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    // Parent class
    "epi-cms/contentediting/viewmodel/_ContainerViewModel",

    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editors.contentarea.personalize"
], function (array, declare, lang, _ContainerViewModel, resources) {

    return declare([_ContainerViewModel], {
        // summary:
        //      The view model for a personalized group.
        //
        // tags:
        //      internal

        // name: [public] String
        //      The name of the personalized group.
        name: null,

        // name: [public] String
        //      The label used when displaying the group
        label: resources.grouplabel,

        addChild: function (child, index) {
            // summary:
            //      Adds a child to the view model at the given index or at the end of the collection.
            // child: Object
            //      The child to be added.
            // index: Number?
            //      The index where to the child will be inserted.
            // tags:
            //      public

            // Add new child first instead of last when no index is given
            this.inherited(arguments, [child, index || 0]);

            // Propagate all selection and changed events from children.
            this.ownByKey(child.id,
                child.on("selected", lang.hitch(this, "emit", "selected", child)),
                child.on("changed", lang.hitch(this, "emit", "changed"))
            );
        },

        serialize: function () {
            // summary:
            //      Serialize the view model's children to an array.
            // tags:
            //      public
            return array.map(this.getChildren(), function (child) {
                return child.serialize();
            });
        },

        equals: function (item) {
            // summary:
            //      Returns true if this groups name is the same as the name on the given item.
            // tags:
            //      public
            return this.name === item.name;
        },

        moveNext: function () {
            // summary:
            //      Move this instance to the next index in the parents child list
            // tags:
            //      internal

            var index = this.parent.indexOf(this);
            this.parent.modify(function () {
                this.parent.move(this, index + 1);
            }, this);
        },

        moveOutsideGroup: function (child) {
            this.parent.moveOutsideGroup(child);
        },

        movePrevious: function () {
            // summary:
            //      Move this instance to the previous index in the parents child list
            // tags:
            //      internal

            var index = this.parent.indexOf(this);
            this.parent.modify(function () {
                this.parent.move(this, index - 1);
            }, this);
        },

        remove: function () {
            // summary:
            //      Removes the group from the parent
            // tags:
            //      internal

            this.parent.modify(lang.hitch(this, function () {
                this.parent.removeChild(this);
            }));
        },

        _hash: function (child) {
            // summary:
            //      Creates a hash for the given child.
            // tags:
            //      protected
            return child.contentLink + "_" + Date.now();
        },

        _selectedSetter: function (selected) {
            this.selected = selected;
            if (selected) {
                this.emit("selected", this);
            }
        },

        _visibleGetter: function () {
            return array.some(this._data, function (item) {
                return item.get("visible");
            });
        }
    });
});
