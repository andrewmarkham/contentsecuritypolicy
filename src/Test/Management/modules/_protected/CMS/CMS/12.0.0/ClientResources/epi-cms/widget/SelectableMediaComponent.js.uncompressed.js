define("epi-cms/widget/SelectableMediaComponent", [
    "dojo/_base/declare",
    "dojo/dom-style",
    "dojo/Evented",
    "dojo/topic",
    "dojo/when",
    "epi/shell/TypeDescriptorManager",
    "epi-cms/_ContentContextMixin",
    "epi-cms/core/ContentReference",
    "epi-cms/ApplicationSettings",
    "epi-cms/component/Media"
], function (
    declare,
    domStyle,
    Evented,
    topic,
    when,
    TypeDescriptorManager,
    _ContentContextMixin,
    ContentReference,
    ApplicationSettings,
    Media
) {
    return declare([Media, _ContentContextMixin, Evented], {
        // summary:
        //      Represents a wrapper of the Media component that allows to set/get selected value.
        // tags:
        //      internal xproduct

        // componentId: [readonly] String
        //      The id of this component.
        componentId: "SelectableMediaComponent",

        // root: [readonly] ContentReference|String
        //      Id of the root content, used by epi-cms/widget/ContentTreeStoreModel.
        root: ApplicationSettings.rootPage,

        // additionalTreeClass: [public] String
        //      Additional CSS class that will be applied to the tree element.
        additionalTreeClass: "",

        postMixInProperties: function () {
            this.inherited(arguments);
            this.model.containedTypes = this.allowedTypes;
            this.model.changeContextOnItemSelection = false;
            this.model.treeStoreModel.forThisFolderEnabled = this._currentContext.currentMode !== "create";
            this.own(topic.subscribe("/epi/cms/upload", this._focusGrid.bind(this)));
        },

        postCreate: function () {
            this.inherited(arguments);

            this.list.set("selectionMode", "single");
            this.searchResultList.set("selectionMode", "single");

            this.resize({ h: 370, w: 680, l: 0, t: 0 });
            this.tree.set({ region: "left", splitter: true });
            domStyle.set(this.tree.domNode, "width", "250px");
            this.listContainer.set({ region: "center", splitter: false });

            this.own(this.model.selection.watch("data", this._dataChanged.bind(this)));
        },

        setInitialValue: function () {
            when(this.getCurrentContent()).then(function (content) {
                var assetsFolderLink;
                if (this._currentContext.currentMode === "create") {
                    assetsFolderLink = ApplicationSettings.globalAssetsFolder;
                } else {
                    assetsFolderLink = new ContentReference(content.assetsFolderLink).createVersionUnspecificReference().toString();
                }
                this.set("value", assetsFolderLink);
            }.bind(this));
        },

        _getValueAttr: function () {
            return this.model.selection.data[0].data.contentLink;
        },

        _setValueAttr: function (value) {
            this._set("value", value);
            if (value) {
                this.model.selectItemsByContentReference(value, true);
                this._focusGrid();
            } else {
                this.model.set("treePaths", null);
            }
        },

        _focusGrid: function () {
            // summary:
            //      Set focus on grid element
            // tags:
            //      private

            this._focusManager.focus(this.list.grid.domNode);
        },

        _dataChanged: function (name, oldValue, newValue) {
            // summary:
            //      Propagate the new value to the dialog to make sure it is not possible to select a folder
            // tags:
            //      private

            if (!newValue || newValue.length !== 1 || !newValue[0].data || !this.allowedTypes.some(function (allowedType) {
                return TypeDescriptorManager.isBaseTypeIdentifier(newValue[0].data.typeIdentifier, allowedType);
            })) {
                this.emit("data-changed", null);
                return;
            }

            var contentLink = newValue[0].data.contentLink;
            this.emit("data-changed", contentLink);
        },

        contextChanged: function () {
            // summary:
            //    Hide the dialog on every context change
            // tags:
            //    protected

            this.emit("close-diaog");
        }
    });
});
