define([
    "dojo/_base/lang",
    "dojo/when",
    "dojo/on",
    "dojo/_base/window",
    "dojo/dom-construct",
    "dojo/topic",
    "epi-addon-tinymce/tinymce-loader",
    "epi/dependency",
    "epi/shell/_ContextMixin",
    "epi-cms/widget/viewmodel/MultipleFileUploadViewModel",
    "epi-cms/widget/MultipleFileUpload",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.uploadmultiplefiles"
], function (
    lang,
    when,
    on,
    win,
    domConstruct,
    topic,
    tinymce,
    dependency,
    _ContextMixin,
    MultipleFileUploadViewModel,
    MultipleFileUpload,
    resources
) {

    tinymce.PluginManager.add("epi-image-uploader", function (editor) {
        var context = new _ContextMixin();
        var registry = dependency.resolve("epi.storeregistry");
        var store = registry.get("epi.cms.contentdata");
        var structureStore = registry.get("epi.cms.content.light");
        var imgTemplate = "img[src='{0}']";
        var generateFileName = false;

        function destroyTemporaryImageObject(blobInfo) {
            var img = editor.dom.select(lang.replace(imgTemplate, [blobInfo.blobUri()]));
            if (img.length === 1) {
                editor.focus();
                domConstruct.destroy(img[0]);
                editor.fire("Change");
                return true;
            }
            return false;
        }

        function toggleTinyMceWindows(value) {
            tinymce.activeEditor.windowManager.windows.forEach(function (w) {
                if (value) {
                    w.show();
                } else {
                    w.hide();
                }
            });
        }

        function ensureUniqueFilename(fileName) {
            if (!generateFileName) {
                return fileName;
            }

            // TinyMCE uses a default filename when pasting a raw image, in such case we should make the filename unique
            // or otherwise every subsequent paste operation will override the previous one.
            // This issue is reported in the TinyMCE repository #3852
            return "image" + Math.random().toString(36).slice(8) + ".png";
        }

        editor.settings.images_upload_handler = function (blobInfo, success, failure) {
            var uploader = new MultipleFileUpload({
                model: new MultipleFileUploadViewModel({
                    store: structureStore,
                    query: { query: "getchildren", allLanguages: true }
                }),
                createAsLocalAsset: true
            });

            function resetUploader() {
                generateFileName = false;
                uploader.destroyRecursive();
            }

            function onUploadFailed(status) {
                if (destroyTemporaryImageObject(blobInfo)) {
                    // when the temporary image was not added to the editor,
                    // then failure should not be called because it contains method
                    // that won't be resolved properly
                    failure(status);
                }
            }

            var uploadCompleteHandle = uploader.on("uploadComplete", function (files) {
                uploadCompleteHandle.remove();

                if (!files) {
                    onUploadFailed();
                    resetUploader();
                    tinymce.activeEditor.windowManager.close();
                    return;
                }

                var file = files[0];
                if (file.statusMessage) {
                    onUploadFailed(file.statusMessage);
                    resetUploader();
                } else {
                    when(store.get(file.contentLink)).then(function (content) {
                        topic.publish("/epi/cms/contentdata/updated", {
                            contentLink: content.contentLink
                        });

                        // set ALT attribute
                        var img = editor.dom.select(lang.replace(imgTemplate, [blobInfo.blobUri()]));
                        if (img.length === 1) {
                            img[0].alt = content.name;
                        }
                        success(content.previewUrl);
                        var assetsFolderLink = uploader.model.query.references[0];
                        topic.publish("/epi/cms/upload", assetsFolderLink);
                        editor.fire("Change");
                    }).otherwise(function () {
                        onUploadFailed(resources.uploadform.errormessage);
                    }).always(function () {
                        resetUploader();
                        toggleTinyMceWindows(true);
                    });
                }
            });

            when(context.getCurrentContext()).then(function (content) {
                store.refresh(content.id).then(function (refreshedContent) {
                    toggleTinyMceWindows(false);
                    uploader.model.query.references = [refreshedContent.assetsFolderLink];
                    uploader.set("uploadDirectory", content.id);
                    uploader.upload([tinymce.Env.ie ? blobInfo.blob() : new File([blobInfo.blob()], ensureUniqueFilename(blobInfo.filename()))]);
                });
            });
        };

        editor.on("dragover", function (e) {
            editor.fire("FileDragged");
            e.stopPropagation();
        });

        editor.on("paste", function () {
            generateFileName = true;
        });

        var dragOverHandle = on(win.doc, "dragover", function () {
            editor.fire("FileDragging");
        });

        var dragLeaveHandle = on(win.doc, "dragleave", function () {
            editor.fire("FileStoppedDragging");
        });

        editor.on("remove", function () {
            dragOverHandle.remove();
            dragLeaveHandle.remove();
        });

        return {
            getMetadata: function () {
                return {
                    name: "Image Uploader (epi)",
                    url: "https://www.episerver.com"
                };
            }
        };
    });
});
