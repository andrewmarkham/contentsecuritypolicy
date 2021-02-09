define("epi-cms/asset/command/NewFolder", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/topic",

    "dojo/when",
    // epi
    "epi/shell/command/_Command",
    "epi/shell/command/_SelectionCommandMixin",
    "epi/shell/TypeDescriptorManager",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentActionSupport"
],

function (
// dojo)
    array,
    declare,
    lang,

    topic,

    when,
    // epi
    _Command,
    _SelectionCommandMixin,
    TypeDescriptorManager,

    ContentReference,

    ContentActionSupport
) {

    return declare([_Command, _SelectionCommandMixin], {
        // summary:
        //      A command that creates a new folder under the current selection.
        // tags:
        //      internal

        iconClass: "epi-iconFolder",

        // typeIdentifier: [public] String
        //      The identifier for the type to be created.
        typeIdentifier: null,

        // createAsLocalAsset: [public] Boolean
        //      Indicate if the content should be created as local asset of its parent.
        createAsLocalAsset: false,

        // _defaultName: [private] String
        //      Manages settings for different content classes like css class for the item types.
        _defaultName: null,

        postscript: function () {
            this.inherited(arguments);

            var identifier = this.typeIdentifier;

            this._defaultName = TypeDescriptorManager.getResourceValue(identifier, "newitemdefaultname");

            var translatedLabel = TypeDescriptorManager.getResourceValue(identifier, "create");
            this.set("label", translatedLabel);
            this.set("tooltip", translatedLabel);
        },

        _execute: function () {
            // summary:
            //      Executes this command; publishes a context change request to change to the model item.
            // tags:
            //      protected

            var self = this,
                parentItem = self._getSingleSelectionData(),
                parentLink = (new ContentReference(parentItem.contentLink)).createVersionUnspecificReference().toString(),
                createAsLocalAsset = self.createAsLocalAsset;

            var addNewFolder = function (parentItem) {
                self.model.getChildren(parentItem, function (childs) {
                    // Add new folder
                    when(self.model.add({
                        parentLink: parentLink,
                        name: self._getUniqueFolderName(childs, self._defaultName),
                        contentTypeIdentifier: self.typeIdentifier,
                        createAsLocalAsset: createAsLocalAsset
                    }, self.onRefreshSelection), function (newItem) {

                        // REMARK: This is not a very good place to do this, but when we can't rely on the
                        // store notfications for the contextual content we need to do this
                        // If the item got a new parent, publish the local asset created topic
                        if (newItem.parentLink !== parentLink) {
                            topic.publish("/epi/cms/action/createlocalasset");
                        }
                    });
                });
            };

            if (createAsLocalAsset) {
                when(self.model.store.refresh(parentLink), function (parentItem) {
                    when(self.model.store.get(parentItem.assetsFolderLink), addNewFolder);
                });
            } else {
                addNewFolder(parentItem);
            }
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected

            var target = this._getSingleSelectionData(),
                createAction = ContentActionSupport.action.Create,
                createProviderCapability = ContentActionSupport.providerCapabilities.Create,
                canExecute = !!this.model &&  // Ensure that there is a model available.
                             !!target &&  // Ensure there is something selected.
                             ContentActionSupport.isActionAvailable(target, createAction, createProviderCapability, true),  // Ensure the action is available to the user.
                isAvailable = canExecute &&
                              TypeDescriptorManager.isBaseTypeIdentifier(target.typeIdentifier, this.typeIdentifier);
            this.set("isAvailable", isAvailable);
            this.set("canExecute", canExecute);
        },

        _getUniqueFolderName: function (arr, defaultName) {
            // summary:
            //      Return the unique folder name for create
            // arr: [Array]
            //      List of object
            // defaultName: [String]
            //      The default folder name
            // tags:
            //      private

            var constructName = function (times) {
                var name = times > 0 ? lang.replace(defaultName + " {0}", [times]) : defaultName;
                if (times > 1000) {
                    return name;
                }

                // Check exists with the name
                var isExisted = array.some(arr, function (child) {
                    return lang.trim(child.name).toLowerCase() === lang.trim(name).toLowerCase();
                });

                // If there are any the same name, call recursive
                if (isExisted) {
                    times = times + 1;
                    return constructName(times);
                }

                return name;
            };

            // Return unique folder name get
            return constructName(0);
        }

    });

});
