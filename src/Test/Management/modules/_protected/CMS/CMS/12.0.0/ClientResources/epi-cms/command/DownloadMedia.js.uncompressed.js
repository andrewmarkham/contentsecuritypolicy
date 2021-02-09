define("epi-cms/command/DownloadMedia", [
// Dojo
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/dom-construct",
    "dojo/has",
    "dojo/sniff",
    "dojo/when",

    // EPi Framework
    "epi/shell/Downloader",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/command/_Command",
    "epi/shell/command/_SelectionCommandMixin",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.command"
],
function (
// Dojo
    declare,
    Deferred,
    domConstruct,
    has,
    sniff,
    when,

    // EPi Framework
    Downloader,
    TypeDescriptorManager,
    _Command,
    _SelectionCommandMixin,

    // Resources
    resources
) {
    return declare([_Command, _SelectionCommandMixin], {
        // summary:
        //      Download command that used to force download media file from browser by javascript.
        //
        // tags:
        //      internal

        label: resources.download,

        tooltip: resources.download,

        iconClass: "epi-iconDownload",

        _execute: function () {
            var contentData = this._getContentData();
            if (!contentData) {
                return;
            }

            Downloader.download(contentData.downloadUrl, contentData.name);
        },

        _onModelChange: function () {
            var contentData = this._getContentData(),
                isDowloadLinkAvailable = contentData && contentData.downloadUrl,
                typeIdentifier = contentData && contentData.typeIdentifier,
                typeShouldActAsAsset = typeIdentifier && TypeDescriptorManager.getValue(typeIdentifier, "actAsAnAsset"),
                canExecute = !!(typeShouldActAsAsset && isDowloadLinkAvailable);
            this.set("isAvailable", canExecute);
            this.set("canExecute", canExecute);
        },

        _getContentData: function () {
            // summary:
            //      Get current selected content data by selection
            // tags:
            //      private

            var selectionData = null;
            if (this.selection && this.selection.data && this.selection.data instanceof Array && this.selection.data.length === 1) {
                selectionData = this.selection.data[0].data;
            }

            return selectionData;
        }
    });
});
