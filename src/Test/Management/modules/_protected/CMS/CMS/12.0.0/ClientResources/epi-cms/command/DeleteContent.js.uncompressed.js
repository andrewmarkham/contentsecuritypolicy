define("epi-cms/command/DeleteContent", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/promise/all",
    "dojo/topic",
    "dojo/when",
    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/ContentActionSupport",

    // Parent class and mixins
    "epi/shell/command/_Command",
    "epi/shell/command/_ClipboardCommandMixin",
    "epi/shell/command/_SelectionCommandMixin",

    // Localization
    "epi/i18n!epi/cms/nls/episerver.cms.command",
    "epi/i18n!epi/nls/episerver.shared"
], function (
    declare,
    lang,
    promiseAll,
    topic,
    when,
    ApplicationSettings,
    ContentActionSupport,
    _Command,
    _ClipboardCommandMixin,
    _SelectionCommandMixin,
    resources,
    sharedResources
) {

    return declare([_Command, _ClipboardCommandMixin, _SelectionCommandMixin], {
        // summary:
        //      This command deletes the content in the selection. The actual operation that is executed depends on whether the selected content has a wastebasket. If the
        //      content has a wastebasket then a move operation is performed with the wastebasket as destination, otherwise if the content doesn't have a wastebasket then
        //      it will be removed permanently.
        //
        // tags:
        //      public

        // label: [readonly] String
        //      The action text of the command to be used in visual elements.
        label: resources.movetotrash,

        // iconClass: [readonly] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconTrash",

        // hasWastebasket: [readonly] Boolean
        //      Flag indicating whether the provider of current content has a wastebasket. This is set internally on model change.
        hasWastebasket: true,

        _execute: function () {
            // summary:
            //      Executes the move or remove method on the model depending on whether the wastebasket is supported. Also clears the clipboard
            //      if it contains one of the deleted items.
            // tags:
            //      protected

            var model = this.model,
                clipboard = this.clipboard,
                selection = this.selection.data,
                operation = this.hasWastebasket ? model.move(selection, { contentLink: ApplicationSettings.wastebasketPage, isWastebasket: true }) : model.remove(selection);

            return when(operation, lang.hitch(this, function () {
                var promises = [];

                // Check to see if any of the items that were removed are in the clipboard or are ancestors of items in the clipboard.
                if (clipboard && clipboard.data) {
                    selection.forEach(function (selectionItem) {
                        var map = clipboard.data.map(function (clipboardItem) {
                            return model.isAncestor(selectionItem.data, clipboardItem.data);
                        });

                        promises = promises.concat(map);
                    });
                }

                when(promiseAll(promises), function (results) {
                    var containedInClipboard = results.every(function (result) {
                        return result;
                    });

                    if (containedInClipboard) {
                        clipboard.clear();
                    }
                });
            }), lang.hitch(this, function () {
                topic.publish("/epi/cms/action/delete/error");
            }));
        },

        _hasWastebasketSetter: function (hasWastebasket) {
            // summary:
            //      Sets the hasWastebasket property as well as updating the label and iconClass properties to
            //      reflect the available action.
            // tags:
            //      protected
            this.hasWastebasket = hasWastebasket;

            this.set("iconClass", hasWastebasket ? "epi-iconTrash" : "epi-iconClose");
            this.set("label", hasWastebasket ? resources.movetotrash : sharedResources.action.deletelabel);
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected
            var model = this.model,
                selection = this.selection.data,
                canDelete = function (item) {
                    var content = item.data;
                    return content && !content.isDeleted && model.canDelete(content);
                },
                supportsWastebasket = function (item) {
                    var content = item.data;
                    return content && ContentActionSupport.hasProviderCapability(content.providerCapabilityMask, ContentActionSupport.providerCapabilities.Wastebasket);
                };

            // hasWastebasket is true when the selection is not empty and each item has a content provider which supports the wastebasket.
            this.set("hasWastebasket", !!selection.length && selection.every(supportsWastebasket));

            // canExecute is true when a model is set, the selection is not empty, and each item can be deleted, and all the selected items either support wastebasket or don't support wastebasket.
            this.set("canExecute", !!(model && selection.length) && selection.every(canDelete) && (this.hasWastebasket || !selection.some(supportsWastebasket)));
        }
    });
});
