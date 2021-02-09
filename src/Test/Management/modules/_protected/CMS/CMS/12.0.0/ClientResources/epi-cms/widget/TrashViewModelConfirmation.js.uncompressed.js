define("epi-cms/widget/TrashViewModelConfirmation", [
// Dojo base
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/_base/lang",
    "dojo/aspect",
    "dojo/when",

    // Epi Framework
    "epi/dependency",
    "epi/string",
    "epi/shell/TypeDescriptorManager",
    "epi/shell/widget/dialog/Dialog",
    "epi/shell/DialogService",

    // Epi CMS
    "epi-cms/widget/ContentSelectorDialog",
    "epi-cms/contentediting/ContentActionSupport",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.components.trash"
], function (
// Dojo base
    array,
    declare,
    Deferred,
    lang,
    aspect,
    when,

    // Epi Framework
    dependency,
    epistring,
    TypeDescriptorManager,
    Dialog,
    dialogService,

    // Epi CMS
    ContentSelectorDialog,
    ContentActionSupport,

    // Resources
    resources
) {

    return function (model) {
        // summary:
        //      Attaches confirmation to the restore method of trash view model
        // tags:
        //      internal

        var _showConfirmation = function (title, description, parentLink) {
            // summary:
            //      Wrap epi/shell/widget/dialog/Confirmation for short type
            //      and return deferred object
            // description:
            //      String : Text to display on dialog
            // parentLink:
            //      Old parent link of specific content
            // tags:
            //		private

            return dialogService.confirmation({
                description: epistring.toHTML(description),
                title: epistring.toHTML(title)
            }).then(function () {
                return parentLink;
            });
        };

        var _getcontainedTypes = function (typeIdentifier) {
            // summary:
            //      Returns all the contained types (for the content repository descriptors)
            // typeIdentifier: [String]
            // tags:
            //		private

            var contentRepositoryDescriptors = dependency.resolve("epi.cms.contentRepositoryDescriptors");


            var containedTypes = [];
            contentRepositoryDescriptors.list().forEach(function (key) {
                contentRepositoryDescriptors.get(key).containedTypes.forEach(function (type) {
                    if (TypeDescriptorManager.isBaseTypeIdentifier(typeIdentifier, type)) {
                        containedTypes = containedTypes.concat(contentRepositoryDescriptors.get(key).containedTypes);
                    }
                });
            });

            return containedTypes;
        };

        var _showContentSelectorDialog = function (content, roots, description) {
            // summary:
            //      Show contentSelector dialog for User select new parent for content
            // content: [Object]
            //      The specific content
            // roots: [Object]
            //      Root of content provider
            // description: [String]
            //      The text show on title of dialog
            // tags:
            //		private

            var df = new Deferred(),
                dialogResources = resources.restore.dialog,
                containerTypes = TypeDescriptorManager.getValue(content.typeIdentifier, "containerTypes"),
                settings = {
                    showButtons: false,
                    roots: roots,
                    multiRootsMode: true,
                    canSelectOwnerContent: false,
                    allowedTypes: containerTypes || _getcontainedTypes(content.typeIdentifier),
                    selectedContentType: content.typeIdentifier,
                    showAllLanguages: true
                };

            var pageSelector = new ContentSelectorDialog(settings);

            var dialog = new Dialog({
                title: epistring.toHTML(dialogResources.title),
                description: description || epistring.toHTML(dialogResources.description),
                confirmActionText: epistring.toHTML(resources.restore.label),
                content: pageSelector
            });

            var _setStateOkButton = function (value) {
                when(model.contentStore.query({ id: value }), function (selectedContent) {
                    dialog.onActionPropertyChanged({ name: "ok" }, "disabled", !selectedContent);
                });
            };

            // listen for onChange event to enable/disable OK button
            pageSelector.on("change", function (value) {
                if (value) {
                    _setStateOkButton(value);
                } else {
                    dialog.onActionPropertyChanged({ name: "ok" }, "disabled", true);
                }
            });

            dialog.on("execute", function () {
                df.resolve(pageSelector.get("value"));
            });
            dialog.on("onHide", function () {
                df.cancel();
            });
            dialog.show();
            // this need to be executed after show, in order to have reference to the button
            // make sure OK button will be disabled on load, since no page has been selected.
            pageSelector.onChange(null);

            return df;
        };

        var _isPermissionValid = function (content, parentContent) {
            // summary:
            //      Check permission of parent content and language permission for content
            // content: [Object]
            //      The content need to restore
            // parentContent: [Object]
            //      The destination parent content
            // tags:
            //      private

            var action = ContentActionSupport.action.Create,
                createProviderCapability = ContentActionSupport.providerCapabilities.Create,
                canExecute = parentContent && !(parentContent.isWastebasket || parentContent.isDeleted) &&  // Ensure a parent content is available and it isn't deleted
                           ContentActionSupport.isActionAvailable(parentContent, action, createProviderCapability, true, true);  // Ensure the create action is available to the user on parent node.

            if (!canExecute) {
                dialogService.alert(epistring.toHTML(resources.restore.userdonothavepermission));
                return false;
            }
            return true;
        };

        var _getRoots = function (content) {
            var contentRepositoryDescriptors = dependency.resolve("epi.cms.contentRepositoryDescriptors");
            var roots = [];

            contentRepositoryDescriptors.list().forEach(function (key) {
                var descriptor = contentRepositoryDescriptors.get(key);

                descriptor.containedTypes.forEach(function (type) {
                    if (TypeDescriptorManager.isBaseTypeIdentifier(content.typeIdentifier, type)) {
                        descriptor.roots.forEach(function (root) {

                            if (roots.indexOf(root) === -1) {
                                roots.push(root);
                            }
                        });
                    }
                });
            });

            return roots;
        };

        var _executeRestore = function (model, content, parentLink, isConfirmation, callbackMethod, description) {
            // summary:
            //      Execute restore content to parent
            // model: [Object]
            //      The model of module
            // content: [Object]
            //      The content need to restore
            // parentLink: [Object]
            //      The destination parent content
            // isConfirmation: [Boolean]
            //      The flag to indicator dialog will show
            // callbackMethod: [Function]
            //      The method will execute restore
            // description: [String]
            //      The text show on title of dialog
            // tags:
            //      private
            var confirmation;

            if (!callbackMethod || !model || !content) {
                return false;
            }


            if (isConfirmation && parentLink) {
                confirmation = _showConfirmation(resources.restore.label, resources.restore.confirmquestion, parentLink);
            } else {
                confirmation = _showContentSelectorDialog(content, _getRoots(content), description);
            }
            when(confirmation, function (parentLink) {
                when(model.contentStore.get(parentLink), function (parentContent) {
                    if (!_isPermissionValid(content, parentContent)) {
                        return false;
                    }
                    return callbackMethod.apply(model, [content, parentLink]);
                });
            }, function () {
                return false;
            });
        };

        aspect.around(model, "restore", function (originalMethod) {
            return function (deletingContent, targetLink) {

                return when(model.contentStore.query({ id: deletingContent.contentLink }),
                //Success callback
                    lang.hitch(this, function (content) {
                        var description = null;
                        var action = null;

                        if (content.hasOwnProperty("statusCode") && (content.statusCode === 401 || content.statusCode === 403)) {
                            description = epistring.toHTML(resources.restore.userdonothavepermission);
                        }

                        if (content.hasOwnProperty("isDeleted") && !content.isDeleted) {
                            description = epistring.toHTML(resources.restore.contentalreadyrestored);
                            action = function () {
                                model.updateTrash(model.get("currentTrash"));
                            };
                        }

                        if (description) {
                            dialogService.alert(description).then(action);
                            return false;
                        }

                        var currentTrash = model.get("currentTrash");
                        if (content.parentLink !== currentTrash.wasteBasketLink) {
                            return when(_showContentSelectorDialog(content, _getRoots(content)), function (parentLink) {
                                when(model.contentStore.get(parentLink), function (parentContent) {
                                    if (!_isPermissionValid(content, parentContent)) {
                                        return false;
                                    }
                                    return originalMethod.apply(model, [content, parentLink]);
                                });
                            }, function () {
                                return false;
                            });
                        } else {
                            return when(model.getOldParent(content.contentLink), function (parentContent) {
                                // Restore to old parent of content, otherwise select new destination to restore
                                var parentLink = parentContent ? parentContent.contentLink : null;
                                _executeRestore(model, content, parentLink, parentLink != null, originalMethod);
                            });
                        }
                    }),
                    //Error callback
                    lang.hitch(this, function (error) {
                        dialogService.alert(epistring.toHTML(resources.restore.contentdeletedpermanently))
                            .then(function () {
                                model.updateTrash(model.get("currentTrash"));
                            });
                        return false;
                    })
                );
            };
        });

        return model;
    };
});
