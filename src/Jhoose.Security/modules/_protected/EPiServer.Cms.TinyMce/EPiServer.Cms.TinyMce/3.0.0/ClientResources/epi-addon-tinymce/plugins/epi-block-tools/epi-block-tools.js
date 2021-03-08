define([
    "dojo/topic",
    "epi-addon-tinymce/tinymce-loader",
    "epi-addon-tinymce/ContentService",
    "epi/i18n!epi/cms/nls/episerver.cms.tinymce.plugins.epiblocktools"
], function (topic, tinymce, ContentService, pluginResources) {

    tinymce.PluginManager.add("epi-block-tools", function (editor) {
        function isBlock(el) {
            var selectorMatched = editor.dom.is(el, "div.epi-contentfragment:not([mceItem])");
            return selectorMatched;
        }

        function addToolbars() {
            editor.addContextToolbar(
                isBlock,
                "epi-gotoblock"
            );
        }

        var contentService = new ContentService();

        var updateButton = function (button) {
            var selectedElement = editor.selection.getNode();

            if (isBlock(selectedElement)) {
                var contentLink = selectedElement.dataset && selectedElement.dataset.contentlink;
                if (!contentLink) {
                    button.disabled(true);
                    button.settings.tooltip = pluginResources.error;
                    return;
                }
                contentService.getContent(contentLink)
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
        editor.addButton("epi-gotoblock", {
            text: pluginResources.gotoblock,
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

        addToolbars();

        return {
            getMetadata: function () {
                return {
                    name: "Block tools (epi)",
                    url: "https://www.episerver.com"
                };
            }
        };
    });
});
