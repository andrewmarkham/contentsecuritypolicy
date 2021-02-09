define("epi-cms/asset/command/UploadContentToSelection", [
    "dojo/_base/declare",
    "epi/shell/command/_Command",
    "epi/shell/command/_SelectionCommandMixin",
    "epi/shell/DestroyableByKey",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/core/ContentReference",
    "epi/shell/TypeDescriptorManager"
], function (
    declare,
    _Command,
    _SelectionCommandMixin,
    DestroyableByKey,
    ContentActionSupport,
    ContentReference,
    TypeDescriptorManager
) {
    return declare([_Command, DestroyableByKey, _SelectionCommandMixin], {
        // summary:
        //      A command that starts the upload new content process when executed.
        // tags:
        //      internal

        // fileList: [public] Array
        //      A array of files to upload. When null, only show upload form to
        //      select files for uploading; otherwise, upload files in list.
        fileList: null,

        typeIdentifier: "episerver.core.contentfolder",

        // createAsLocalAsset: [public] Boolean
        //      Indicate if the content should be created as local asset of its parent.
        createAsLocalAsset: false,

        _execute: function () {
            // summary:
            //      Executes this command; call upload method from model.
            // tags:
            //      protected

            var contentLinkWithoutWorkId = ContentReference.toContentReference(this._getParentLink()).createVersionUnspecificReference();

            this.viewModel.upload(this.fileList, contentLinkWithoutWorkId.toString(), this.createAsLocalAsset);

            this.fileList = null; // clear fileList after uploading, to avoid of displaying last uploaded item on upload dialog.
        },

        _getParentLink: function () {
            // summary:
            //      Gets the link to the parent where the content should be created under.
            //      If the parent is a Content Asset folder the link to the owner content will be returned.
            // tags:
            //      private

            var model = this._getSingleSelectionData();

            if (this.createAsLocalAsset) {
                return model.ownerContentLink ? model.ownerContentLink : model.contentLink;
            }

            return model.contentLink;
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected

            var model = this._getSingleSelectionData(),
                canExecute = !!model && ContentActionSupport.hasProviderCapability(model.providerCapabilityMask, ContentActionSupport.providerCapabilities.Create) &&
                             ContentActionSupport.hasAccess(model.accessMask, ContentActionSupport.accessLevel.Create),
                isAvailable = canExecute && TypeDescriptorManager.isBaseTypeIdentifier(model ? model.typeIdentifier : "", this.typeIdentifier);

            this.set("isAvailable", isAvailable);
            this.set("canExecute", !!(canExecute && this.viewModel && !this.viewModel.get("isSearching")));
        },

        _viewModelSetter: function (value) {
            this.viewModel = value;
            this.destroyByKey("isSearchingWatch");
            this.viewModel && this.ownByKey("isSearchingWatch", this.viewModel.watch("isSearching", this._onModelChange.bind(this)));
        }
    });
});
