define([
    // dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dojo/Deferred",
    "dojo/dom-construct",
    "dojo/on",
    "dojo/Stateful",
    "dojo/when",

    // dojox
    "dojox/html/entities",

    // epi
    "epi/shell/DialogService",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/conversion/ObjectConverterRegistry",

    "epi/i18n!epi/cms/nls/episerver.cms.tinymce"
], function (
    declare,
    lang,
    win,
    Deferred,
    domConstruct,
    on,
    Stateful,
    when,

    // dojox
    htmlEntities,

    // epi
    epiDialogService,
    TypeDescriptorManager,
    ObjectConverterRegistry,

    resources
) {
    return function (editor, dialogService) {
        // summary:
        //      Module responsible for processing TinyMCE DnD data
        // tags:
        //      internal

        // dialogService: [private] epi/shell/DialogService
        this._dialogService = dialogService || epiDialogService;

        function _insertHtml(html) {
            editor.focus();
            if (editor.execCommand("mceInsertContent", false, html)) {
                editor.fire("change");
            }
        }

        function _createImage(data) {
            var strTemplate = "<img alt=\"{alt}\" src=\"{src}\" width=\"{width}\" height=\"{height}\" />";

            var imgSrc = data.previewUrl || data.url;
            var imgPreviewNode = domConstruct.create("img", {
                alt: data.text,
                src: imgSrc,
                style: { display: "none;" }
            }, win.body(), "last");

            var deferred = new Deferred();
            // Use a temporary image to get it loaded and obtain the correct geometric attributes
            // Then use the original url since the browser adds hostname to the src attribute which is not always wanted.
            on.once(imgPreviewNode, "load", function (event) {
                _insertHtml(lang.replace(strTemplate, {
                    alt: event.target.alt,
                    width: event.target.width,
                    height: event.target.height,
                    src: imgSrc
                }));
                // destroy temporary image preview dom node.
                domConstruct.destroy(imgPreviewNode);
                deferred.resolve();
            }.bind(this));
            return deferred.promise;
        }

        function _insertLink(url) {
            editor.focus();
            editor.execCommand("CreateLink", false, url);
        }

        function _createLink(data) {
            if (!editor.selection.isCollapsed()) {
                _insertLink(data.url);
            } else {
                var strTemplate = "<a href=\"{0}\" title=\"{1}\">{1}</a>";
                _insertHtml(lang.replace(strTemplate, [data.url, htmlEntities.encode(data.text)]));
            }
        }

        function _insertContent(model) {
            var html = "<div data-contentlink=\"" +
                            model.contentLink +
                            "\" data-classid=\"36f4349b-8093-492b-b616-05d8964e4c89\" class=\"epi-contentfragment\" contenteditable=\"false\">" +
                            htmlEntities.encode(model.name) +
                            "</div>";
            _insertHtml(html);
        }

        this.processData = function (dropItem) {
            // summary:
            //    Insert HTML to editor based on dropItem
            // tags:
            //    internal

            return when(dropItem.data).then(function (model) {

                // TODO: move this to TinyMCE plugins instead. could be one which will be called to execute content
                // and one which knows how to insert the specific content

                // TODO: calculate drop position relative to tiny editor, send this to the plugin so it
                // could handle content depending on where the drop was done

                var type = dropItem.type;

                if (type && type.indexOf("link") !== -1) {
                    _createLink(model);
                    return;
                } else if (type && type.indexOf("fileurl") !== -1) {
                    _createImage(model);
                    return;
                }

                var typeId = model.typeIdentifier;

                var editorDropBehaviour = TypeDescriptorManager.getValue(typeId, "editorDropBehaviour");

                if (editorDropBehaviour) {

                    if (editorDropBehaviour === 1) {
                        //Default: Create a content object
                        _insertContent(model);
                        return;
                    }

                    var converter, baseTypes = TypeDescriptorManager.getInheritanceChain(typeId);

                    for (var i = 0; i < baseTypes.length; i++) {
                        var baseType = baseTypes[i];
                        converter = ObjectConverterRegistry.getConverter(baseType, baseType + ".link");
                        if (converter) {
                            break;
                        }
                    }

                    if (!converter) {
                        return;
                    }

                    return when(converter.convert(typeId, typeId + ".link", model)).then(function (data) {

                        if (!data.url) {
                            //If the page does not have a public url we do nothing.
                            this._dialogService.alert({ description: resources.notabletocreatelinkforpage });
                        } else {
                            switch (editorDropBehaviour) {
                                case 2: //Link
                                    _createLink(data);
                                    break;
                                case 3: //Image
                                    return _createImage(data);
                            }
                        }
                    }.bind(this));
                }
            }.bind(this));
        };
    };
});
