define([
    "dojo/_base/lang",
    "dojo/on",
    "epi/shell/widget/dialog/Dialog",
    "epi-cms/ApplicationSettings",
    "epi-cms/widget/LinkEditor",
    "epi-addon-tinymce/tinymce-loader",
    "epi-addon-tinymce/plugins/epi-link/linkViewModel",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.editlink",
    "epi/i18n!epi/cms/nls/episerver.cms.tinymce.plugins.epilink"
], function (lang, on, Dialog, ApplicationSettings, LinkEditor, tinymce, linkViewModel, resource, pluginResource) {

    tinymce.PluginManager.add("epi-link", function (editor) {
        editor.addCommand("mceEPiLink", function () {
            var href = "",
                s = editor.selection,
                dom = editor.dom,
                linkObject = {};

            // When link is at the beginning of a paragraph, then IE (and FF?) returns the paragraph from getNode,
            // the getStart() and getEnd() however returns the anchor.
            var node = s.getStart() === s.getEnd() ? s.getStart() : s.getNode(),
                selectedLink = linkViewModel.getAnchorElement(editor, node);

            // No selection and not in link
            if (s.isCollapsed() && !selectedLink) {
                return;
            }

            if (selectedLink) {
                href = dom.getAttrib(selectedLink, "href");
            }

            if (href.length) {
                linkObject.href = href;
                linkObject.targetName = dom.getAttrib(selectedLink, "target");
                linkObject.title = dom.getAttrib(selectedLink, "title");
            }

            var callbackMethod = function (value) {
                if (value && value.href) {
                    var linkAttributes = {
                        href: value.href,
                        title: value.title,
                        target: value.target ? value.target : null
                    };

                    if (selectedLink) {
                        dom.setAttribs(selectedLink, linkAttributes);
                    } else {
                        if (linkViewModel._isImageFigure(node)) {
                            linkViewModel.linkImageFigure(editor, node, linkAttributes);
                        } else {
                            // When opening the link properties dialog in OPE mode an inline iframe is used rather than a popup window.
                            // When using IE clicking in this iframe causes the selection to collapse in the TinyMCE iframe which
                            // breaks the link creation immediately below. The workaround is to store the selection range before
                            // opening, and restoring it before creating the link.
                            s.setRng(s.getRng());
                            // To make sure we dont get nested links and have the same behavior as the default tiny
                            // link dialog we unlink any links in the selection before we create the new link.
                            editor.getDoc().execCommand("unlink", false, null);
                            editor.execCommand("mceInsertLink", false, "#mce_temp_url#", {skip_undo: 1});

                            var elementArray = tinymce.grep(dom.select("a"), function (n) {
                                return dom.getAttrib(n, "href") === "#mce_temp_url#";
                            });
                            for (var i = 0; i < elementArray.length; i++) {
                                dom.setAttribs(elementArray[i], linkAttributes);
                            }

                            //move selection into the link content to be able to recognize it when looking at selection
                            if (elementArray.length > 0) {
                                var range = editor.dom.createRng();
                                range.selectNodeContents(elementArray[0]);
                                editor.selection.setRng(range);
                            }
                        }
                    }
                } else if (selectedLink) {
                    // pressed delete?
                    dom.setOuterHTML(selectedLink, selectedLink.innerHTML);
                    editor.undoManager.add();
                }
            };

            linkObject.target = linkViewModel.findFrameId(ApplicationSettings.frames, linkObject.targetName);

            var linkEditor = new LinkEditor({
                baseClass: "epi-link-item",
                //TODO: hardcoded for now
                modelType: "EPiServer.Cms.Shell.UI.ObjectEditing.InternalMetadata.LinkModel",
                hiddenFields: ["text"] // hide text field from UI
            });

            //Find all Anchors in the document and add them to the Anchor list
            var allLinks = editor.getDoc().querySelectorAll("a[id],a[name]");

            // If the user is using IE 11 or lower we need to convert the
            // nodeList to a regular array
            // HACK: IE11
            if (tinymce.Env.ie && tinymce.Env.ie < 12) {
                allLinks = Array.prototype.slice.call(allLinks);
            }

            var anchors = linkViewModel.findNamedAnchors(allLinks);

            linkEditor.on("fieldCreated", function (fieldname, widget) {
                if (fieldname === "href") {
                    // in this case, widget is HyperLinkSelector
                    var hyperLinkSelector = widget;
                    var anchor = linkViewModel.getFirstAnchorWidget(hyperLinkSelector.get("wrappers"));

                    if (anchor && anchor.inputWidget) {
                        anchor.inputWidget.set("selections", anchors);
                    } else {
                        widget.on("selectorsCreated", function (hyperLinkSelector) { // when all selector have been created
                            var anchorWidget = linkViewModel.getFirstAnchorWidget(hyperLinkSelector.get("wrappers"));

                            if (anchorWidget && anchorWidget.inputWidget) {
                                anchorWidget.inputWidget.set("selections", anchors);
                                anchorWidget.domNode.style.display = "block";
                            }
                        });
                    }

                    if (anchor) {
                        anchor.domNode.style.display = "block";
                    }
                }
            });

            var dialogTitle = lang.replace(selectedLink ? resource.title.template.edit : resource.title.template.create, resource.title.action);

            var dialog = new Dialog({
                title: dialogTitle,
                dialogClass: "epi-dialog-portrait",
                content: linkEditor,
                defaultActionsVisible: false
            });
            dialog.startup();

            //Set the value when the provider/consumer has been initialized
            linkEditor.set("value", linkObject);

            dialog.show();
            editor.fire("OpenWindow", {
                win: null
            });

            dialog.on("execute", function () {

                var value = linkEditor.get("value");
                var linkObject = lang.clone(value);

                if (linkObject && linkObject.target) {
                    // get target frame name, instead of integer value
                    linkObject.target = linkViewModel.findFrameName(ApplicationSettings.frames, linkObject.target);
                }

                //Destroy the editor when the dialog closes
                linkEditor.destroy();
                linkEditor = null;

                callbackMethod(linkObject);
            });

            dialog.on("hide", function () {
                editor.fire("CloseWindow", {
                    win: null
                });
            });
        });

        // Register buttons
        editor.addButton("epi-link", {
            title: pluginResource.title,
            cmd: "mceEPiLink",
            icon: "link",
            onPostRender: function () {
                editor.on("SelectionChange", function (e) {
                    var anchorElement = linkViewModel.getAnchorElement(editor, e.element);
                    var invalidSelection = !linkViewModel.hasValidSelection(editor, e.element);
                    this.disabled(invalidSelection && !anchorElement);
                    this.active(!editor.readonly && !!anchorElement);
                }.bind(this));
            }
        });

        editor.shortcuts.add("ctrl+k", pluginResource.title, function () {
            editor.execCommand("mceEPiLink");
        });

        return {
            getMetadata: function () {
                return {
                    name: "Link (epi)",
                    url: "https://www.episerver.com"
                };
            }
        };
    });
});
