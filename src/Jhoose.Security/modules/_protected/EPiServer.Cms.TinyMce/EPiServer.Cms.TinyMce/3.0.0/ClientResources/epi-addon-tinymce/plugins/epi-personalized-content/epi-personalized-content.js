define([
    "epi/dependency",
    "epi-cms/ApplicationSettings",
    "epi-addon-tinymce/tinymce-loader",
    "./personalizedContentEdit",
    "./personalizedContentDialog",

    "epi/i18n!epi/cms/nls/episerver.cms.tinymce.plugins.epipersonalizedcontent"
], function (
    dependency,
    ApplicationSettings,
    tinymce,
    personalizedContentEdit,
    personalisedContentDialog,
    pluginResources
) {

    tinymce.PluginManager.add("epi-personalized-content", function (editor) {

        if (ApplicationSettings.limitUI) {
            return;
        }

        var defs = {
            selector: "div[class=epi_pc]",
            contentSelector: ".epi_pc_content"
        };

        function getPersonalizedContent(elm) {
            return editor.dom.getParent(elm, defs.selector);
        }

        function getSelectedPersonalizedContent() {
            return getPersonalizedContent(editor.selection.getStart());
        }

        editor.on("dragstart", function () {
            // Make the content area non-editable when dragging a personalized content.
            // This stops dropping personalized content inside another personalized content.
            if (this.$(this.selection.getNode()).is(defs.selector)) {
                this.$(defs.contentSelector).attr("contenteditable", "false");
            }
        });

        editor.on("drop", function (args) {
            editor.$(defs.contentSelector).attr("contenteditable", "true");
            editor.$(defs.contentSelector, args.targetClone).attr("contenteditable", "true");
        });

        var store = null;

        editor.addCommand("epiEditPersonalizedContent", function () {
            if (!store) {
                store = dependency.resolve("epi.storeregistry").get("epi.cms.personalized.content");
            }

            var selectedPersonalizedContent = getSelectedPersonalizedContent();
            var parameters = personalizedContentEdit.getParameters(editor, selectedPersonalizedContent);

            // tinymce does store bookmark when opening a window but only for browser IE or inline editor
            // therefore, in general we need to store the bookmark ourselves
            var bookmark = editor.selection.getBookmark();

            function onHide() {
                editor.selection.moveToBookmark(bookmark);
                editor.fire("CloseWindow", {
                    win: null
                });
            }

            function onCallback(callbackObject) {
                editor.selection.moveToBookmark(bookmark);
                personalizedContentEdit.onDialogComplete(editor, callbackObject, defs, selectedPersonalizedContent);
            }

            editor.fire("OpenWindow",
                {
                    win: null
                });
            personalisedContentDialog(store, parameters, onHide, onCallback);
        });

        // whitespace in the "icon" setting is intentional
        // TinyMCE adds "mce-i-" prefix to an icon
        // while now there will be two classes "mce-i- epi-iconUsers"
        editor.addButton("epi-personalized-content", {
            tooltip: pluginResources.title,
            icon: " epi-iconUsers",
            cmd: "epiEditPersonalizedContent",
            onPostRender: function () {
                editor.on("SelectionChange", function (e) {
                    var isPersonalizedContentBlock = !!editor.dom.getParent(e.element || editor.selection.getNode(), defs.selector);
                    this.active(isPersonalizedContentBlock);
                    this.disabled(!isPersonalizedContentBlock && editor.selection.isCollapsed());
                }.bind(this));
            }
        });

        return {
            getMetadata: function () {
                return {
                    name: "Personalized Content (epi)",
                    url: "https://www.episerver.com"
                };
            }
        };
    });
});
