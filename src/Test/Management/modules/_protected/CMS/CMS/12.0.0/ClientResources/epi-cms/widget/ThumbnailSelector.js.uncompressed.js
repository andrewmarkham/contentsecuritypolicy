require({cache:{
'url:epi-cms/widget/templates/ThumbnailSelector.html':"<div data-dojo-attach-point=\"inputContainer, stateNode, dropAreaNode\" id=\"widget_${id}\"\r\n     class=\"dijitReset dijitInline dijitInputContainer epi-resourceInputContainer thumbnail-editor\">\r\n    <div class=\"dijitTextBox\" data-dojo-attach-point=\"_dropZone\" data-dojo-type=\"epi-cms/widget/FilesUploadDropZone\" data-dojo-attach-event=\"onDrop: _onDrop\" data-dojo-props=\"outsideDomNode: this.domNode\"></div>\r\n    <a class=\"thumbnail-button dijitTextBox\" href=\"#\" data-dojo-type=\"dijit/layout/_LayoutWidget\" data-dojo-attach-point=\"button\" data-dojo-attach-event=\"onClick: _onButtonClick\" >\r\n        <figure data-dojo-attach-point=\"displayNode\" class=\"dijitHidden\">\r\n            <img data-dojo-attach-point=\"thumbnail\"/>\r\n            <figcaption class=\"dijitInline dojoxEllipsis\">\r\n                <span data-dojo-attach-point=\"selectedContentNameNode\"></span>\r\n                <span data-dojo-attach-point=\"selectedContentLinkNode, resourceName\"></span>\r\n            </figcaption>\r\n        </figure>\r\n        <div data-dojo-type=\"dijit/ProgressBar\" data-dojo-attach-point=\"progressBar\" data-dojo-props=\"maximum:100\"></div>\r\n        <div data-dojo-attach-point=\"actionsContainer\" class=\"epi-content-area-actionscontainer\">\r\n            <span>${resources.selectimage}</span>\r\n        </div>\r\n    </a>\r\n\r\n    <a data-dojo-attach-point=\"clearButton\" href=\"#\" class=\"epi-clearButton\">&nbsp;</a>\r\n</div>\r\n"}});
define("epi-cms/widget/ThumbnailSelector", [
// dojo
    "dojo/_base/declare",
    "dojo/when",
    "dojo/on",
    "dojo/topic",
    "dojo/dom-class",
    // dijit
    "dijit/focus",
    "dijit/ProgressBar",
    // epi
    "epi/Url",
    "epi/routes",
    "epi/shell/dnd/Target",
    "epi/shell/DialogService",
    // epi-cms
    "epi-cms/core/ContentReference",
    "epi-cms/widget/MediaSelector",
    "epi-cms/contentediting/_ContextualContentContextMixin",
    "epi-cms/command/UploadContent",
    "epi-cms/widget/UploadUtil",
    "epi-cms/widget/viewmodel/MultipleFileUploadViewModel",
    "epi-cms/widget/LocalFolderUploader",
    "dojo/text!./templates/ThumbnailSelector.html",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.thumbnailselector",
    "epi-cms/widget/FilesUploadDropZone"
], function (
    // dojo
    declare,
    when,
    on,
    topic,
    domClass,
    // dijit
    focusManager,
    ProgressBar,
    // epi
    Url,
    routes,
    Target,
    dialogService,
    ContentReference,
    MediaSelector,
    _ContextualContentContextMixin,
    UploadContent,
    UploadUtil,
    MultipleFileUploadViewModel,
    LocalFolderUploader,
    template,
    resources
) {

    var defaultImageUrl = require.toUrl("epi-cms/themes/sleek/images/default-image.png");

    var _dropFileMixin = declare(_ContextualContentContextMixin, {
        // summary:
        //      This mixin is responsible for the local file upload
        // tags:
        //      internal

        // _dialogService: [private] epi/shell/DialogService
        //      The dialog service. Defaults to epi/shell/DialogService.
        _dialogService: null,

        // allowedExtensions: [public] Array
        //      List of file extensions that may be dropped onto the editor
        allowedExtensions: [],

        postCreate: function () {
            this.inherited(arguments);

            this._dialogService = this._dialogService || dialogService;

            if (this._currentContext.currentMode === "create") {
                return;
            }

            this.uploadCommand = new UploadContent({
                viewModel: this
            });

            when(this.getCurrentContent()).then(function (contentItem) {
                if (this._destroyed) {
                    return;
                }
                this._dropZone.set("settings", {
                    enabled: true,
                    validSelection: true,
                    dropFolderName: this.getContextualRootName(contentItem),
                    descriptionTemplate: resources.dropfile
                });
            }.bind(this));
        },

        _onButtonClick: function () {
            if (this.progressBar.progress && this.progressBar.progress !== this.progressBar.maximum) {
                return;
            }

            this.inherited(arguments);
        },

        upload: function (fileList) {
            var uploader = new LocalFolderUploader({
                model: new MultipleFileUploadViewModel({
                    store: this._store,
                    query: this.query
                }),
                // we decide to not show the thumbnail & progressbar if the first chunk is bigger than 40% of the whole image
                uploadProgressThreshold: 40,
                // show thumbnails on for images smaller than 50 megabytes to avoid hanging the browser by the File API
                thumbnailMaxFileSize: 50 * 1024 * 1024
            });

            uploader.own(on(uploader, "uploadProgress", function (progress) {
                if (this._destroyed) {
                    return;
                }

                this.progressBar.update({ progress: progress });
            }.bind(this)));

            uploader.own(on(uploader, "uploadFilePreview", function (fileBytes, fileName) {
                if (this._destroyed) {
                    return;
                }

                domClass.add(this.domNode, "uploading");
                this.set("selectedContentName", resources.uploading + fileName);
                this.set("previewUrl", fileBytes);
                this.thumbnail.src = fileBytes;
            }.bind(this)));

            uploader.own(uploader.on("uploadComplete", function (uploadFiles) {
                if (this._destroyed) {
                    return;
                }

                this.progressBar.update({ progress: 0 });
                focusManager.focus(this.button.domNode); // we need to focus the control so we can trigger the 'onChange' immediately
                domClass.remove(this.domNode, "uploading");

                // handle upload errors, first a general error that causes null to come back from server
                if (!uploadFiles) {
                    this.set("value", this.value);
                    this._dialogService.alert(resources.failed);
                    return;
                }

                // server call was successful however all files were skipped by the user
                if (uploadFiles.length === 0) {
                    return;
                }

                // handle a custom upload error, for example file size exceeded and similar
                if (uploadFiles[0].statusMessage) {
                    this.set("value", this.value);
                    this._dialogService.alert(uploadFiles[0].statusMessage);
                    return;
                }

                this.set("value", uploadFiles[0].contentLink);
                this.onChange(this.value);
                // publish this topic so that the uploaded image is shown in the Assets Pane immediately
                topic.publish("/epi/cms/upload", this.assetsFolderLink);
            }.bind(this)));

            uploader.upload(fileList);
        },

        _refreshTargetUploadContent: function () {
            // We need to handle scenarios when user drops images on a page that does not have assets folder yet.
            // We could try to reuse the logic from ContextualContentForestStoreModel.js & _ContextualContentContextMixin.js
            // The same issue happens in TinyMCE after d&d an image file to a new page that does not have a folder yet.
            var self = this;

            if (this.assetsFolderLink && !this.isPseudoContextualRoot({ contentLink: this.assetsFolderLink })) {
                return this.assetsFolderLink;
            }

            function getAssetsFolderLink(contentItem) {
                if (!self.isPseudoContextualRoot({ contentLink: contentItem.assetsFolderLink })) {
                    return contentItem.assetsFolderLink;
                }

                return self._store.refresh(contentItem.contentLink).then(function (refreshedContent) {
                    return refreshedContent.assetsFolderLink;
                });
            }

            return when(this.getCurrentContent()).then(function (contentItem) {
                return when(getAssetsFolderLink(contentItem)).then(function (contentAssetsLink) {
                    self.assetsFolderLink = new ContentReference(contentAssetsLink).createVersionUnspecificReference().toString();
                    self.query.references = [self.assetsFolderLink];
                    return when(self._store.get(contentAssetsLink)).then(function (contentAssetFolderContent) {
                        self.uploadCommand.set("model", contentAssetFolderContent);
                    });
                });
            });
        },

        _onDrop: function (evt, fileList) {
            // Accept only HTML5 img tag compliant file types, editors can still use the old Assets Pane
            // if they need any other file type like *.svg or *.tiff
            fileList = UploadUtil.filterFileOnly(fileList);
            if (!fileList || fileList.length !== 1) {
                this._dialogService.alert(resources.singleimage);
                return;
            }
            var fileName = fileList[0].name.split(".").pop().toLowerCase();
            if (this.allowedExtensions.indexOf(fileName) === -1) {
                this._dialogService.alert(resources.wrongfileformat);
                return;
            }

            when(this._refreshTargetUploadContent()).then(function () {
                this.uploadCommand.set("fileList", fileList);
                this.uploadCommand.execute();
            }.bind(this));
        }
    });

    return declare([MediaSelector, _dropFileMixin], {
        // summary:
        //      Represents the widget to select ContentReference.
        // tags:
        //      internal

        resources: resources,
        templateString: template,

        _setPreviewUrlAttr: function (value) {
            this.inherited(arguments);
            domClass.toggle(this.displayNode, "dijitHidden", !value);
            domClass.toggle(this.actionsContainer, "dijitHidden", value);
        },

        _getThumbnailUrl: function (content) {
            if (!content.capabilities.generateThumbnail) {
                return content.thumbnailUrl || defaultImageUrl;
            }
            var url = new Url(routes.getActionPath({
                moduleArea: "CMS",
                controller: "Thumbnail",
                action: "Generate"
            }));
            url.query = {
                contentLink: content.contentLink,
                "epi.preventCache": new Date().valueOf()
            };
            return url.toString();
        },

        _updateDisplayNode: function (content) {
            this.inherited(arguments);
            if (content) {
                this.thumbnail.src = this._getThumbnailUrl(content);
            }
            this.stateNode.title = content ? content.name : "";
        },

        postCreate: function () {
            this.inherited(arguments);
            this.query = { query: "getchildren", allLanguages: true };
        },

        _onButtonClick: function () {
            if (this.readOnly) {
                return;
            }

            this.inherited(arguments);
        },

        _setReadOnlyAttr: function (value) {
            this.inherited(arguments);
            this.button.domNode.style.display = "";
            this.button.set("readOnly", value);
        }
    });
});
