define("epi-cms/component/MediaViewModel", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",

    "dojo/when",
    "dojo/topic",
    // epi
    "epi",
    "epi/shell/widget/dialog/Dialog",

    "epi-cms/core/ContentReference",

    "epi-cms/asset/view-model/HierarchicalListViewModel",
    "epi-cms/widget/viewmodel/MultipleFileUploadViewModel",
    "epi-cms/widget/MultipleFileUpload",

    "epi-cms/command/UploadContent",
    "epi-cms/command/DownloadMedia",
    "epi-cms/asset/command/UploadContentToSelection",
    // resource
    "epi/i18n!epi/cms/nls/episerver.cms.components.media"
],

function (
// dojo
    array,
    declare,
    lang,

    domClass,

    when,
    topic,
    // epi
    epi,
    Dialog,

    ContentReference,

    HierarchicalListViewModel,
    MultipleFileUploadViewModel,
    MultipleFileUpload,

    UploadContentCommand,
    DownloadCommand,
    UploadContentToSelectionCommand,
    // resources
    resources
) {

    return declare([HierarchicalListViewModel], {
        // summary:
        //      Handles search and tree to list browsing widgets.
        // tags:
        //      internal

        // dropZoneSettings: Object
        //      Settings for the drop zone containing enabled and validSelection properties.
        dropZoneSettings: null,

        // Dialog widget for uploading new media
        _dialog: null,

        postscript: function () {
            this.inherited(arguments);

            this.own(topic.subscribe("/epi/cms/upload", function (targetId) {
                this.set("selectedTreeItems", this.get("selectedTreeItems"));

                if (this.isPseudoContextualRoot({ contentLink: targetId }) && this.treeStoreModel && typeof this.treeStoreModel.refreshRoots === "function") {
                    this.treeStoreModel.refreshRoots(this);
                }
            }.bind(this)));
        },

        _getTypesToCreate: function () {
            // No create commands for media since upload is used instead.
            return [];
        },

        _setupCommands: function () {
            // summary:
            //      Creates and registers the commands used.
            // tags:
            //      protected

            this.inherited(arguments);

            var settings = {
                selection: this.selection
            };
            var uploadCommand = new UploadContentCommand(lang.mixin({
                iconClass: "epi-iconPlus",
                label: resources.command.label,
                resources: resources,
                viewModel: this
            }, settings));
            var customCommands = {
                uploadDefault: {
                    command: uploadCommand
                },
                upload: {
                    command: new UploadContentToSelectionCommand(lang.mixin({
                        category: "context",
                        iconClass: "epi-iconUpload",
                        label: resources.linktocreateitem,
                        viewModel: this
                    }, settings)),
                    order: 2
                },
                download: {
                    command: new DownloadCommand(lang.mixin({
                        category: "context",
                        label: resources.command.download
                    }, settings)),
                    order: 4
                }
            };

            this.own(uploadCommand.watch("canExecute", this._onUploadCommandUpdated.bind(this)));

            this._commandRegistry = lang.mixin(this._commandRegistry, customCommands);

            this.pseudoContextualCommands.push(this._commandRegistry.uploadDefault.command);
            this.pseudoContextualCommands.push(this._commandRegistry.upload.command);
        },

        _onUploadCommandUpdated: function (name, oldValue, canExecute) {
            // summary:
            //      When the upload command is updated we will update the drop zone settings.
            // tags:
            //      private

            var uploadCommand = this._commandRegistry.uploadDefault.command;
            var commandModel = uploadCommand.get("model");
            var validSelection = commandModel ? commandModel.length === 1 : false;
            var dropFolderName = validSelection ? commandModel[0].name : null;
            var isSearching = this.get("isSearching");
            var dropZoneSettings = {
                dropFolderName: dropFolderName,
                validSelection: validSelection,
                // disable drop zone when searching or when the user does not have permission to upload.
                enabled: !isSearching && (canExecute || !validSelection)
            };
            this.set("dropZoneSettings", dropZoneSettings);
        },

        _selectedTreeItemsSetter: function (items) {
            // summary:
            //      Update model of commands in case selected content is folder
            // tags:
            //      private

            //The default upload command should only update when the list is updated.
            //It needs to be updated before the pseudocommanddecorator is applied.
            this._commandRegistry.uploadDefault.command.set("model", items);

            this.inherited(arguments);
        },

        upload: function (/*Array*/fileList, /*String?*/targetId, /*Boolean?*/createAsLocalAsset) {
            // summary:
            //      Upload multiple files.
            // fileList: [Array]
            //      List files to upload.
            //      When null, only show upload form to select files for uploading.
            //      Otherwise, upload files in list.
            // targetId: [String?]
            //      Parent content id
            // createAsLocalAsset: [Boolean?]
            // tags:
            //      protected

            // only create dialog if it is not available, otherwise, re-use it.
            var uploader = new MultipleFileUpload({
                model: new MultipleFileUploadViewModel({
                    store: this.get("store"),
                    query: this.get("listQuery")
                })
            });

            uploader.on("beforeUploaderChange", lang.hitch(this, function () {
                this._uploading = true;
            }));

            // close multiple files upload dialog when stop uploading
            uploader.on("close", lang.hitch(this, function (uploading) {
                this._dialog && (uploading ? this._dialog.hide() : this._dialog.destroy());
            }));

            // Reload current folder of tree, to reflect changes
            uploader.on("uploadComplete", lang.hitch(this, function (/*Array*/uploadFiles) {
                // Set current tree item again to reload items in list.
                if (uploader.createAsLocalAsset) {
                    when(this.treeStoreModel && typeof this.treeStoreModel.refreshRoots === "function" && this.treeStoreModel.refreshRoots(this), lang.hitch(this, function () {
                        // Turn-off createAsLocalAsset
                        uploader.set("createAsLocalAsset", false);
                        // Update uploading directory after create a new real one local asset folder for the given content
                        uploader.set("uploadDirectory", this.get("selectedTreeItems")[0].id);
                        // Update content list query after create a new real one local asset folder for the given content
                        uploader.model.set("query", this.get("listQuery"));
                        // Publish the local asset created topic so that all the other media component is refreshed
                        topic.publish("/epi/cms/action/createlocalasset", this.treeStoreModel);
                    }));
                } else {
                    this.onListItemUpdated(uploadFiles);
                    topic.publish("/epi/cms/upload", targetId);
                    this.selectListItemsByContentReferences(uploadFiles.map(function (uploadFile) {
                        var contentReference = ContentReference.toContentReference(uploadFile.contentLink);
                        return contentReference.createVersionUnspecificReference().toString();
                    }));
                }

                if (this._dialog && !this._dialog.open) {
                    this._dialog.destroy();
                }

                this._uploading = false;
            }));

            this._dialog = new Dialog({
                title: resources.linktocreateitem,
                dialogClass: "epi-dialog-upload",
                content: uploader,
                autofocus: true,
                defaultActionsVisible: false,
                closeIconVisible: false,
                destroyOnHide: false
            });

            // only show close button for multiple files upload dialog
            this._dialog.definitionConsumer.add({
                name: "close",
                label: epi.resources.action.close,
                action: function () {
                    uploader.close();
                }
            });

            this._dialog.resize({ w: 700 });
            this._dialog.show();

            // we can only upload when a single item is selected so its ok to use index 0;
            var selectedContent = this.get("selectedTreeItems")[0];
            // Update breadcumb on upload dialog.
            this._buildBreadcrumb(selectedContent, uploader);

            // Set destination is current tree item.
            uploader.set("uploadDirectory", targetId || selectedContent.id);
            uploader.set("createAsLocalAsset", createAsLocalAsset);

            uploader.upload(fileList);
        },

        onListItemUpdated: function (updatedItems) {
            // summary:
            //      Refresh the editing media if it have a new version
            // updatedItems: [Array]
            //      Collection of the updated item. In this case, they are files.
            // tags:
            //      public, extension

            var store = this.store;

            return when(this.getCurrentContext(), function (currentContext) {
                var contentWithoutVersion = (new ContentReference(currentContext.id)).createVersionUnspecificReference().toString();

                return when(store.get(contentWithoutVersion), function (currentContent) {
                    var editingMedia = array.filter(updatedItems, function (updatedItem) {
                        return currentContent.name.toLowerCase() === updatedItem.fileName.toLowerCase();
                    })[0];
                    return editingMedia ? currentContent : null;
                });
            });
        },

        _buildBreadcrumb: function (contentItem, uploader) {
            // summary:
            //      Build breadcrumb for the provided content
            // contentItem: Object
            //      The provided content
            // uploader: Object
            //      The multiple file upload control
            // tags:
            //      private

            if (!uploader) {
                return;
            }

            // Do not add more items when current content is sub root
            if (this.treeStoreModel.isTypeOfRoot(contentItem)) {
                uploader.set("breadcrumb", [contentItem]);
                return;
            }

            this.treeStoreModel.getAncestors(contentItem.contentLink, lang.hitch(this, function (ancestors) {
                var ancestor,
                    paths = [contentItem];

                for (var i = ancestors.length - 1; i >= 0; i--) {
                    ancestor = ancestors[i];
                    paths.unshift(ancestor);

                    // Break after first sub root or context root
                    if (this.treeStoreModel.isTypeOfRoot(ancestor)) {
                        break;
                    }
                }

                uploader.set("breadcrumb", paths);
            }));
        }
    });

});
