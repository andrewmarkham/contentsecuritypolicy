define([
    "dojo/topic",
    "epi/Url",
    "epi-addon-tinymce/tinymce-loader",
    "epi-addon-tinymce/ContentService",
    "epi/i18n!epi/cms/nls/episerver.cms.tinymce.plugins.epiimagetools"
], function (topic, Url, tinymce, ContentService, pluginResources) {

    tinymce.PluginManager.add("epi-image-tools", function (editor) {

        var contentService = new ContentService();

        var updateButton = function (button) {
            var selectedElement = editor.selection.getNode();

            //Check if its a standardimage
            if (selectedElement && selectedElement.tagName === "IMG" && editor.dom.getAttrib(selectedElement, "class").indexOf("mceItem") === -1) {
                var url = new Url(selectedElement.src);
                contentService.getContentFromUrl(url.path)
                    .then(function (content) {
                        button.uri = content.uri;
                        return contentService.getPathToContent(content);
                    })
                    .then(function (imagePath) {
                        button.settings.tooltip = imagePath;
                        button.disabled(false);
                    })
                    .otherwise(function () {
                        button.disabled(true);
                        button.settings.tooltip = pluginResources.error;
                    });
            }
        };

        // Register buttons
        editor.addButton("epi-gotomedia", {
            text: pluginResources.gotomedia,
            icon: false,
            //Needs to be set so that we can update it
            tooltip: "default tooltip",
            onclick: function () {
                editor.fire("blur");
                topic.publish("/epi/shell/context/request", { uri: this.uri }, { sender: this });
            },
            onPostRender: function () {
                //Set tooltip the first time tinymce starts after browser refresh
                updateButton(this);

                editor.on("NodeChange", function (e) {
                    //Update the tooltip
                    updateButton(this);
                }.bind(this));
            }
        });

        return {
            getMetadata: function () {
                return {
                    name: "Image tools (epi)",
                    url: "https://www.episerver.com"
                };
            }
        };
    });
});
