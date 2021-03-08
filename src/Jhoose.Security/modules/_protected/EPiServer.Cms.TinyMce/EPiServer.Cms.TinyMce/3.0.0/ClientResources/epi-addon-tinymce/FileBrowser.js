define([
    "dojo/on",
    "dojo/dom-style",
    "dojo/when",
    "epi/dependency",
    "epi/UriParser",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/widget/SelectableMediaComponent",
    "epi/shell/widget/dialog/Dialog",

    "./tinymce-loader",

    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentselector"
], function (
    on,
    domStyle,
    when,
    dependency,
    UriParser,
    ContentActionSupport,
    SelectableMediaComponent,
    Dialog,
    tinymce,
    res
) {
    var getAllowedTypes = function (type) {
        switch (type) {
            case "image":
                return ["episerver.core.icontentimage"];
            case "media":
                return ["episerver.core.icontentmedia"];
            default:
                return ["episerver.core.pagedata"];
        }
    };

    var getFiletype = function (type) {
        switch (type) {
            case "image":
            case "media":
                return "media";
            default:
                return "pages";
        }
    };

    var toggleTinyMceDialog = function (value) {
        var modalInstance = tinymce.activeEditor.windowManager.getWindows()[0].$el;
        var modalBlock = tinymce.$("#mce-modal-block");
        if (value) {
            modalInstance.show(value);
            modalBlock.show(value);
        } else {
            modalInstance.hide(value);
            modalBlock.hide(value);
        }
    };

    return function (settings, registry, store, contextStore, contentRepositoryDescriptors) {
        // summary:
        //      Adds a callback method for the file_picker_callback that makes it possible to pick
        //      content in the system using our Content Selector
        // settings: TinyMCE settings object
        //      The TinyMCE settings object to add the callback to
        //
        // returns:
        //      The settings object that was provided
        // tags:
        //      internal

        registry = registry || dependency.resolve("epi.storeregistry");
        store = store || registry.get("epi.cms.content.light");
        contextStore = contextStore || registry.get("epi.shell.context");
        contentRepositoryDescriptors = contentRepositoryDescriptors || dependency.resolve("epi.cms.contentRepositoryDescriptors");

        // By hooking up the file_picker_callback this code will inject a dialog wherever you can "pick" stuff in tiny
        settings.file_picker_types = "file image media";
        settings.file_picker_callback = function (callback, value, meta) {

            var settings = contentRepositoryDescriptors.get(getFiletype(meta.filetype));

            var mediaComponent = new SelectableMediaComponent({
                roots: settings.roots,
                repositoryKey: settings.key,
                allowedTypes: getAllowedTypes(meta.filetype)
            });
            var dialog = new Dialog({
                title: res.title,
                dialogClass: null,
                contentClass: "epi-wrapped epi-mediaSelector",
                content: mediaComponent
            });
            dialog.own(mediaComponent);

            dialog.own(
                on(mediaComponent, "data-changed", function (contentLink) {
                    if (!contentLink) {
                        dialog.definitionConsumer.setItemProperty(dialog._okButtonName, "disabled", true);
                        return;
                    }

                    when(store.get(contentLink), function (content) {
                        var hasAccessRights = !ContentActionSupport.hasAccess(content.accessMask, ContentActionSupport.accessLevel.Read);
                        dialog.definitionConsumer.setItemProperty(dialog._okButtonName, "disabled", hasAccessRights);
                    });
                }.bind(this)),
                on(mediaComponent, "close-diaog", function () {
                    if (dialog) {
                        dialog.hide();
                    }
                })
            );

            // Set the selected item when editing an existing file.
            if (value) {
                var result = contextStore.query({ url: value });
                when(result).then(function (context) {
                    var uri = new UriParser(context.versionAgnosticUri);
                    mediaComponent.set("value", uri.getId());
                });
            } else {
                mediaComponent.setInitialValue();
            }

            on.once(dialog, "show", toggleTinyMceDialog.bind(this, false));
            on.once(dialog, "hide", toggleTinyMceDialog.bind(this, true));

            dialog.show();

            on.once(dialog, "execute", function () {
                var contentLink = mediaComponent.get("value");
                if (!contentLink) {
                    return;
                }

                // Load the content object and use the preview url
                when(store.get(contentLink)).then(function (content) {
                    callback(content.previewUrl);
                });
            });
        };

        return settings;
    };
});
