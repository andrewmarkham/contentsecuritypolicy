define("epi-cms/widget/ContentTreeModelConfirmation", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/string",
    "dojo/when",
    "dojo/_base/json",

    // dojox
    "dojox/html/entities",

    // epi
    "epi/dependency",
    "epi/string",

    "epi/shell/TypeDescriptorManager",
    "epi/shell/DialogService",

    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/widget/sharedContentDialogHandler",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.pagetree",
    "epi/i18n!epi/cms/nls/episerver.cms.components.project"
],

function (
// dojo
    declare,
    lang,

    aspect,
    Deferred,
    string,
    when,
    json,

    // dojox
    htmlEntities,

    // epi
    dependency,
    epistring,

    TypeDescriptorManager,
    dialogService,

    ContentActionSupport,
    sharedContentDialogHandler,
    res,
    projectResources
) {

    return function (model) {
        // summary:
        //      Attaches confirmation to the pasteItem method of a dijit/tree.model instance.
        //      Looks at the paste parameters to show a confirmation before delting or moving items.
        //
        // tags:
        //      internal xproduct

        // NOTE: This pattern isn't really that nice, since it alters the aspect.around actually alters the underlying store.
        //      It's probably a better idea to use delegation, but that requires us to -implement set() and _set() to get
        //      model property changes updated on the underlying model and not the delegating facade.

        var _isFunction = function (object) {
            return object && typeof object == "function";
        };

        var _showNotification = function (message, callback) {
            // summary:
            //      Uses the alert dialog implementation to notify with the supplied message
            dialogService.alert(epistring.toHTML(message))
                .then(function () {
                    if (_isFunction(callback)) {
                        callback();
                    }
                });
        };

        var _showConfirmation = function (title, confirmationMessage) {
            // summary:
            //      Wrap epi/shell/widget/dialog/Confirmation for short type
            //      and return deferred object
            // confirmQuestion:
            //      String / Deferred : Text to display on dialog
            // tags:
            //		private

            return when(confirmationMessage).then(function (message) {
                return dialogService.confirmation({
                    description: epistring.toHTML(message),
                    title: title
                });
            });
        };

        var onResponse = function (result, callback) {
            // Checks the result of a call to pasteItem and shows error messages if result indicates a failure
            when(result,
                function (serverResponse) {
                    if (serverResponse && (serverResponse.message || serverResponse.statusDescription)) {
                        var message = serverResponse.message || serverResponse.statusDescription;
                        _showNotification(message, callback);
                    } else {
                        if (_isFunction(callback)) {
                            callback();
                        }
                    }
                },
                function (e) {
                    _showNotification(htmlEntities.encode(json.fromJson(e.xhr.responseText)));
                });
            return result;
        };

        var pasteItems = function (sourceItems, newParent, copy, sortIndex, originalMethod, originalArguments) {
            var source = sourceItems[0],
                localizationPrefix = sourceItems.length > 1 ? "move.multiple." : "move.single.";

            // If there are more than one type of content in the source array we fallback back
            // to the icontentdata typeIdentifier
            var typeIdentifier = sourceItems.every(function (element) {
                return element.typeIdentifier === source.typeIdentifier;
            }) ? source.typeIdentifier : "episerver.core.icontentdata";


            var moveTitle = TypeDescriptorManager.getResourceValue(typeIdentifier, localizationPrefix + "title");
            // Defaulting confirmation to an affirmative response in case we don't need a confirmation
            var confirmation = null;

            if (newParent.isWastebasket) {
                confirmation = sharedContentDialogHandler({ contentItems: sourceItems });
            } else if (sortIndex !== undefined && (newParent.properties.pageChildOrderRule !== ContentActionSupport.sortOrder.Index)) {

                // Page is copied/moved and sorted and the new parent sorting rule must be changed
                var message, title;
                if (copy) {
                    localizationPrefix = sourceItems.length > 1 ? "copy.multiple." : "copy.single.";
                    title = TypeDescriptorManager.getResourceValue(typeIdentifier, localizationPrefix + "title");
                    message = string.substitute(res.changepeerorderconfirmationcopy, [model.getLabel(newParent)]);
                } else {
                    // move
                    title = moveTitle;
                    message = string.substitute(res.changepeerorderconfirmation, [model.getLabel(newParent)]);
                }
                confirmation = _showConfirmation(title, message);
            } else if (!copy) {
                if (sourceItems.some(function (item) {
                    return !model.canCut(item);
                })) {
                    _showNotification(TypeDescriptorManager.getResourceValue(typeIdentifier, "moverequiresdeleteaccess"), function () {
                        return false;
                    });
                    return false;
                }

                var formatTemplate = "{0}<br/><br/>{1}",
                    confirmationText = lang.replace(TypeDescriptorManager.getResourceValue(typeIdentifier, localizationPrefix + "confirmation"), [sourceItems.length]),
                    description = lang.replace(formatTemplate, [
                        confirmationText,
                        TypeDescriptorManager.getResourceValue(typeIdentifier, "movedescription")
                    ]);

                var projectService = dependency.resolve("epi.cms.ProjectService");
                if (projectService.isProjectModeEnabled) {
                    description = lang.replace(formatTemplate, [description, projectResources.moveconfirmation]);
                }

                // Plain move
                confirmation = _showConfirmation(moveTitle, description);

            } else if (!model.canCopy(source)) {
                _showNotification(TypeDescriptorManager.getResourceValue(typeIdentifier, "copynotsupported"));
                return false;
            }

            return when(confirmation, function () {
                // Call pasteItem of the model
                return originalMethod.apply(model, originalArguments);
            }, function () {
                return false;
            });
        };

        aspect.around(model, "pasteItem", function (originalMethod) {
            return function (source, oldParent, newParent, copy, sortIndex) {
                return pasteItems([source], newParent, copy, sortIndex, originalMethod, arguments);
            };
        });

        aspect.around(model, "pasteItems", function (originalMethod) {
            return function (sourceItems, newParent, copy, sortIndex) {
                return pasteItems(sourceItems, newParent, copy, sortIndex, originalMethod, arguments);
            };
        });

        aspect.after(model, "pasteItem", function (result) {
            return result && onResponse(result);
        });

        aspect.after(model, "remove", function (result) {
            return result && onResponse(result);
        });

        return model;
    };

});
