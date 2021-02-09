define("epi/shell/Downloader", [
// Dojo
    "dojo/_base/lang",
    "dojo/dom-construct"
],
function (
// Dojo
    lang,
    domConstruct
) {
    return {
        // summary:
        //      Downloader static class that used to force download media file from browser by javascript.
        // tags:
        //      internal xproduct

        _classicalDownload: function (/*String*/url, /*String*/name) {
            // summary:
            //      Classical method to download file by direct url.
            // tags:
            //      private

            // Create a temporary anchor link, trigger click event and then destroy it!
            var bodyNode = document.getElementsByTagName("body")[0],
                dowloadLinkAttributes = {
                    href: url,
                    download: name,
                    target: "_blank",
                    style: { display: "none;" }
                },
                downloadLinkNode = domConstruct.create("a", dowloadLinkAttributes, bodyNode, "last");

            downloadLinkNode.click();
            domConstruct.destroy(downloadLinkNode);
        },

        download: function (/*String*/url, /*String*/name) {
            // summary:
            //      Download and save a blob content to local device.
            // tags:
            //      public virtual

            if (url) {
                return this._classicalDownload(url, name);
            }
        }
    };
});
