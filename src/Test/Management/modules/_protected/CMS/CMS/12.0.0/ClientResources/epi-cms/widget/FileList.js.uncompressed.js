require({cache:{
'url:epi-cms/widget/templates/FileList.html':"﻿<div class=\"epi-multiFileUpload-list\">\r\n    <div data-dojo-type=\"dijit/ProgressBar\" data-dojo-attach-point=\"progressBar\" data-dojo-props=\"maximum:100\"></div>\r\n</div>"}});
﻿define("epi-cms/widget/FileList", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/dom-class",
    "dojo/dom-style",
    // dojox
    "dojox/form/uploader/Base",
    // dgrid
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dgrid/Keyboard",
    // dijit
    "dijit/ProgressBar",
    // epi
    "epi/shell/widget/_ModelBindingMixin",
    "epi/shell/dgrid/Formatter",

    "epi-cms/widget/UploadUtil",
    //resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.uploadmultiplefiles.uploadform",
    // template
    "dojo/text!./templates/FileList.html"
],
function (
// dojo
    declare,
    lang,

    domAttr,
    domConstruct,
    domClass,
    domStyle,
    // dojox
    formUploaderBase,
    // dgrid
    OnDemandGrid,
    dgridSelection,
    Keyboard,
    // dijit
    ProgressBar,
    // epi
    _ModelBindingMixin,
    Formatter,

    UploadUtil,
    // resources
    resources,
    // template
    template
) {
    return declare([formUploaderBase, _ModelBindingMixin], {
        // summary:
        //      Widget to show uploading file(s).
        // tags:
        //      internal

        templateString: template,

        // Map property name in view model to a list of properties in this widget
        modelBindingMap: {
            showProgressBar: ["showProgressBar"],
            progress: ["progress"],
            uploadFiles: ["uploadFiles"]
        },

        postCreate: function () {
            this.inherited(arguments);

            this._buildGrid();
        },

        _setUploadFilesAttr: function (/* Array */files) {
            // summary:
            //      Give new data (upload files) for grid
            // tags:
            //      private

            this._bindData(files);
        },

        _setShowProgressBarAttr: function (/* Boolean */show) {
            // summary:
            //      Toggle visibility of progress bar
            // tags:
            //      private

            UploadUtil.toggleVisibility(this.progressBar.domNode, show);
        },

        _setProgressAttr: function (/* Object */progressObject) {
            // summary:
            //      Update uploading progress of progress bar
            // tags:
            //      private

            if (!progressObject) {
                return;
            }

            // update upload progress, by updating progress bar.
            this.progressBar.update({ progress: progressObject.percent.replace("%", "") });
        },

        _bindData: function (data) {
            // summary:
            //      Refresh and bind new data to grid
            // tags:
            //      private

            data = data || [];

            this._grid.refresh();
            this._grid.renderArray(data);
        },

        _buildGrid: function () {
            // summary:
            //      Build file(s) upload grid and append it to container
            // tags:
            //      private

            var gridClass = declare([OnDemandGrid, Keyboard, Formatter]);
            this._grid = new gridClass({
                columns: {
                    fileName: {
                        label: resources.uploadfilename,
                        field: "fileName",
                        htmlEncode: true
                    },
                    size: {
                        label: resources.uploadfilesize,
                        field: "size",
                        get: lang.hitch(this, function (file) {
                            var fileSizeValue = this.convertBytes(file.size).value;

                            if (isNaN(fileSizeValue)) {
                                return fileSizeValue;
                            }

                            var byteText = fileSizeValue === 0 ? resources.bytetext : resources.bytestext;
                            return lang.replace("{0} {1}", [fileSizeValue, byteText]);
                        })
                    },
                    status: {
                        label: resources.uploadfilestatus,
                        field: "status",
                        renderCell: lang.hitch(this, function (item, value, node, options) {
                            domAttr.set(node, "title", item.statusMessage ? item.statusMessage : "");
                            domClass.toggle(node, "epi-failedStatus", item.status === resources.failed);
                            node.innerHTML = item.status;
                        })
                    }
                }
            });

            this.own(this._grid);
            domConstruct.place(this._grid.domNode, this.domNode);
        }
    });
});
