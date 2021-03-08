define([], function () {
    return {
        findFrameName: function (frames, frameId) {
            var filteredFrames = frames.filter(function (frame) {
                return frame.id === frameId;
            });
            if (filteredFrames && filteredFrames.length > 0) {
                return filteredFrames[0].name;
            }

            return "";
        },

        findFrameId: function (frames, frameName) {
            var filteredIds = frames.filter(function (frame) {
                return frame.name === frameName;
            });

            if (filteredIds && filteredIds.length > 0) {
                return filteredIds[0].id;
            }

            return "";
        },

        findNamedAnchors: function (allLinks) {
            var anchors = [{text: "", value: ""}];

            allLinks.forEach(function (anchor) {
                var value = anchor.id || anchor.name;

                if (!!value && !anchor.href) {
                    anchors.push({
                        text: value,
                        value: "#" + value
                    });
                }
            });

            return anchors.sort(function (a, b) {
                return a.text.toLowerCase() > b.text.toLowerCase() ? 1 : -1;
            });
        },

        getFirstAnchorWidget: function (widgetList) {
            if (!widgetList) {
                return null;
            }

            var anchors = widgetList.filter(function (wrapper) {
                return wrapper.name === "Anchor";
            });

            if (anchors.length === 0) {
                return null;
            }

            return anchors[0];
        },

        getAnchorElement: function (editor, selectedElm) {
            //The code below is copied from tinymce link plugin:
            //https://github.com/tinymce/tinymce/blob/a4add2940715dd27ef7be8ef42065a8292038787/src/plugins/link/main/ts/core/Utils.ts#L41
            selectedElm = selectedElm || editor.selection.getNode();
            if (this._isImageFigure(selectedElm)) {
                // for an image contained in a figure we look for a link inside the selected element
                return editor.dom.select("a[href]", selectedElm)[0];
            } else {
                return editor.dom.getParent(selectedElm, "a[href]");
            }
        },

        _isImageFigure: function (node) {
            //The code below is copied from tinymce link plugin:
            //https://github.com/tinymce/tinymce/blob/a4add2940715dd27ef7be8ef42065a8292038787/src/plugins/link/main/ts/core/Utils.ts#L73
            return node && node.nodeName === "FIGURE" && /\bimage\b/i.test(node.className);
        },

        hasValidSelection: function (editor, selectedElm) {
            selectedElm = selectedElm || editor.selection.getNode();
            if (this._isNotEditable(selectedElm) && !this._isImageFigure(selectedElm)) {
                return false;
            } else {
                return !editor.selection.isCollapsed();
            }
        },

        _isNotEditable: function (node) {
            return node && !node.isContentEditable;
        },

        linkImageFigure: function (editor, fig, attrs) {
            var img = editor.dom.select("img", fig)[0];
            if (img) {
                var a = editor.dom.create("a", attrs);
                img.parentNode.insertBefore(a, img);
                a.appendChild(img);
            }
        }
    };
});
