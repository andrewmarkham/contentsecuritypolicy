define([], function () {
    return {
        getParameters: function (editor, selectedPersonalizedContent) {
            function getAllContentGroups() {
                var dynamiccontentNodes = editor.dom.select("[data-contentgroup]");
                var allContentGroups = "";
                for (var i = 0; i < dynamiccontentNodes.length; i++) {
                    var value = dynamiccontentNodes[i].getAttribute("data-contentgroup");
                    if (value && value !== "") {
                        if ((allContentGroups === value) ||
                            (allContentGroups.indexOf("," + value) >= 0) ||
                            (allContentGroups.indexOf(value + ",") >= 0)) {
                            continue;
                        }
                        if (allContentGroups !== "") {
                            allContentGroups += "," + value;
                        } else {
                            allContentGroups += value;
                        }
                    }
                }
                return allContentGroups;
            }

            var parameters = {
                allContentGroups: getAllContentGroups()
            };

            if (selectedPersonalizedContent) {
                parameters.groups = editor.dom.getAttrib(selectedPersonalizedContent, "data-groups", "");
                parameters.contentGroup = editor.dom.getAttrib(selectedPersonalizedContent, "data-contentgroup", "");
            }

            return parameters;
        },

        onDialogComplete: function (editor, callbackObject, defs, selectedPersonalizedContent) {
            var innerContent, newContent;

            // If the dialog is closed with cancel then callbackObject is undefined.
            if (!callbackObject) {
                return;
            }

            if (callbackObject.removePersonalization) {
                innerContent = editor.$(defs.contentSelector, selectedPersonalizedContent).html();

                editor.selection.select(selectedPersonalizedContent);
                editor.selection.setContent(innerContent);

                return;
            }

            if (selectedPersonalizedContent) {
                innerContent = editor.$(defs.contentSelector, selectedPersonalizedContent).html();
                editor.selection.select(selectedPersonalizedContent);
            } else {
                innerContent = editor.selection.getStart() === editor.selection.getEnd()
                    && editor.selection.getStart().innerHTML === editor.selection.getContent() // make sure the whole element is selected
                    ? editor.selection.getNode().outerHTML
                    : editor.selection.getContent();
                if (innerContent === "") {
                    innerContent = "<p></p>";
                }
            }
            newContent = callbackObject.replace("[personalizedContentPlaceHolder]", innerContent);
            editor.selection.setContent(newContent);
        }
    };
});
