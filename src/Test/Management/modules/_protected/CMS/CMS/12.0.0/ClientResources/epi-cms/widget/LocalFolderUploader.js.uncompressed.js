define("epi-cms/widget/LocalFolderUploader", [
// dojo
    "dojo/_base/declare",
    "dojo/when",
    "dojo/on",
    // epi-cms
    "epi-cms/_ContentContextMixin",
    "epi-cms/widget/MultipleFileUpload"
], function (
    // dojo
    declare,
    when,
    on,
    // epi
    _ContentContextMixin,
    MultipleFileUpload
) {

    var emptyImage = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";

    return declare([MultipleFileUpload, _ContentContextMixin], {
        // summary:
        //      Single file uploader to Local Asset Folders. It comes with preview & progress capabilities.
        // tags:
        //      internal

        constructor: function (params) {
            declare.safeMixin(this, params);
        },

        postCreate: function () {
            this.inherited(arguments);
            when(this.getCurrentContent()).then(function (contentItem) {
                this.set("uploadDirectory", contentItem.contentLink);
                // all images d&d to the editor should be saved to 'For this page'
                this.set("createAsLocalAsset", true);
            }.bind(this));

            var fileBytes, fileName;

            var uploadedFilesHandle = this._fileListModel.watch("uploadFiles", function (name, oldValue, newValue) {
                var file = newValue[0];
                fileName = file.name;
                // only generate thumbnails for image files with size lower than 'thumbnailMaxFileSize'
                if (file.size > this.thumbnailMaxFileSize) {
                    fileBytes = emptyImage;
                } else {
                    var reader = new FileReader();
                    reader.onload = function (file) {
                        fileBytes = file.target.result;
                    }.bind(this);
                    reader.readAsDataURL(file);
                }
                uploadedFilesHandle.remove();
            }.bind(this));

            this.own(this._fileListModel.watch("progress", function (name, oldValue, newValue) {
                var progress = parseInt(newValue.percent.replace("%", ""));
                if (progress <= this.uploadProgressThreshold && fileBytes) {
                    // only show the preview if the progress is not too fast
                    this.emit("uploadFilePreview", fileBytes, fileName);
                }
                this.emit("uploadProgress", progress);
            }.bind(this)));
        }
    });
});
