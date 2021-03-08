define([
    "epi-addon-tinymce/tinymce-loader",
    "epi-addon-tinymce/plugins/epi-dnd-processor/dndDropProcessor"
], function (tinymce, DndDropProcessor) {

    window.tinymce.PluginManager.add("epi-dnd-processor", function (editor, url) {
        editor.addCommand("mceEPiProcessDropItem", function (ui, dropItem) {
            var processor = new DndDropProcessor(editor);
            processor.processData(dropItem);
        });

        return {
            getMetadata: function () {
                return {
                    name: "DnD Processor (epi)",
                    url: "https://www.episerver.com"
                };
            }
        };
    });
});
