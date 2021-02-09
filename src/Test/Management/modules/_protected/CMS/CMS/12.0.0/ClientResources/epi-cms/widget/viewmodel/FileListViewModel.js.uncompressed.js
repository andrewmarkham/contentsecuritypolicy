define("epi-cms/widget/viewmodel/FileListViewModel", [
    // dojo
    "dojo/_base/declare",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/Stateful",

    // epi
    "epi-cms/widget/UploadUtil",

    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.uploadmultiplefiles"
],

function (
    // dojo
    declare,
    array,
    lang,
    Stateful,

    // epi
    UploadUtil,

    // resources
    resources
) {
    return declare([Stateful], {
        // summary:
        //      The view model for multiple file upload widget
        //
        // tags:
        //      internal

        // progress: [Object]
        //      Progress of uploading files
        progress: null,

        // uploadFiles: [Array]
        //      List of uploading files
        uploadFiles: null,

        // showProgressBar: [Boolean]
        //      Indicates that progress bar should show or hide
        showProgressBar: false,

        _progressSetter: function (value) {
            this.progress = value;

            var files = this.get("uploadFiles");
            var totalFileSize = 0;
            files.forEach(function (fileViewModel) {
                totalFileSize += fileViewModel.size;
                if (fileViewModel.status === resources.uploadform.uploading && value.bytesLoaded >= totalFileSize) {
                    fileViewModel.status = resources.uploadform.uploaded;
                }
            }, this);
            this.set("uploadFiles", files);
        },

        _uploadFilesSetter: function (/* Array */files) {
            // summary:
            //      Uploading files need to send to server
            // tags:
            //      private

            if (!UploadUtil.validUploadFiles(files)) {
                return;
            }

            var fileList = [];
            array.forEach(files, function (file) {
                fileList.push({ fileName: file.name, size: file.size, status: resources.uploadform.uploading });
            }, this);
            this.uploadFiles = fileList;
        },

        update: function (/* Array */newlyUploadedFiles) {
            // summary:
            //      Update the status and contentLink of the uploaded files
            // tags:
            //      public

            if (!newlyUploadedFiles || newlyUploadedFiles.length === 0) {
                return;
            }

            var files = this.get("uploadFiles");

            newlyUploadedFiles.forEach(function (uploadedFile) {
                // Find the view model of that file in the upload list
                var fileViewModel = array.filter(files, function (file) {
                    return uploadedFile.fileName === file.fileName;
                })[0];

                fileViewModel.contentLink = uploadedFile.contentLink;

                // Update status of file upload
                if (uploadedFile.errorMessage) {
                    fileViewModel.status = resources.uploadform.failed;
                    fileViewModel.statusMessage = uploadedFile.errorMessage;
                } else {
                    fileViewModel.status = resources.uploadform.uploaded;
                }
            }, this);

            this.set("uploadFiles", files);
        },

        error: function () {
            // summary:
            //      Mark all files as failed
            // tags:
            //      public

            var files = this.get("uploadFiles");

            array.forEach(files, function (fileViewModel) {
                fileViewModel.status = resources.uploadform.failed;
                fileViewModel.statusMessage = resources.uploadform.errormessage;
            });

            this.set("uploadFiles", files);
        },

        clear: function () {
            // summary:
            //      Clear all temporaries upload file information before
            // tags:
            //      public

            this.set("uploadFiles", null);
        }
    });
});
