define("epi-cms/widget/MultipleFileUploadConfirmation", [
// dojo
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",

    "dojo/dom-class",

    "dojo/aspect",
    "dojo/Deferred",
    "dojo/when",
    // epi
    "epi/string",

    "epi/shell/widget/dialog/Dialog",

    "epi-cms/widget/ReadOnlyContentList",
    // resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.uploadmultiplefiles.replaceconfirmdialog"
],

function (
// dojo
    array,
    declare,
    lang,

    domClass,

    aspect,
    Deferred,
    when,
    // epi
    epiString,

    Dialog,

    ReadOnlyContentList,
    // resources
    resources
) {

    return declare(null, {
        // summary:
        //      Confirmation dialog for multiple file upload widget
        // tags:
        //      internal

        showConfirmation: function (/*Array*/existingContents, /*Array*/uploadingFiles, /*Array*/newFiles) {
            // summary:
            //      Show confirmation dialog to replace/skip the existing contents when uploading file(s) by multiple file upload widget.
            // existingContents: [Array]
            //      Filtered existing content(s) on the server
            // uploadingFiles: [Array]
            //      The uploading file(s) given from multiple file upload widget
            // newFiles: [Array]
            //      Filtered new file(s) that are not existing on the server
            // returns: [dojo.Deferred]
            //      An instance of Array for filtered file list to upload to server.
            //      This list can be the whole original selected file(s) or just the new file(s) that not existed on the server.
            // tags:
            //      public

            var deferred = new Deferred(),
                dialog = this._getDialog(existingContents.length),
                content = this._getContentList();

            dialog.set("content", content);
            dialog.set("onAction", function (replace) {
                deferred.resolve(replace ? uploadingFiles : newFiles);
            });

            when(dialog.show(), function () {
                content.grid.renderArray(existingContents);
            });

            return deferred;
        },

        // =======================================================================
        // Private functions

        _getDialog: function (/*Integer*/totalExistingFiles) {
            // summary:
            //      Get confirmation dialog
            // totalExistingFiles: [Integer]
            //      Total filtered existing files on the server
            // returns: [epi/shell/widget/dialog/Dialog]
            //      Confirmation dialog that included existing file list grid
            // tags:
            //      private

            var self = this,
                heading = epiString.toHTML(totalExistingFiles > 1 ? lang.replace(resources.multiple.heading, [totalExistingFiles]) : resources.single.heading),
                description = epiString.toHTML(totalExistingFiles > 1 ? resources.multiple.description : resources.single.description);

            var dialog = new Dialog({
                closeIconVisible: false,
                title: resources.title,
                heading: heading,
                description: description,
                dialogClass: "epi-dialog--auto-height",
                getActions: function () {
                    return self._getActions(this, totalExistingFiles === 1);
                }
            });

            return dialog;
        },

        _getActions: function (/*epi/shell/widget/dialog/Dialog*/dialog, /*Boolean*/single) {
            // summary:
            //      Overridden from Dialog base to assemble the action collection
            // dialog: [epi/shell/widget/dialog/Dialog]
            //      Confirmation dialog
            // single: [Boolean]
            //      Indicates that we must show text for single item or multiple items
            // returns:
            //      A collection of action definitions that can be added to the action pane.
            // tags:
            //      private

            return [
                {
                    name: "replaceFiles",
                    label: single ? resources.single.buttons.replace : resources.multiple.buttons.replace,
                    title: null,
                    action: function () {
                        when(dialog.hide(), function () {
                            return dialog.onAction(true);
                        });
                    }
                },
                {
                    name: "skipFiles",
                    label: single ? resources.single.buttons.skip : resources.multiple.buttons.skip,
                    title: null,
                    action: function () {
                        when(dialog.hide(), function () {
                            return dialog.onAction(false);
                        });
                    }
                }
            ];
        },

        _getContentList: function () {
            // summary:
            //      Get readonly thumbnail grid for existing contents on the server
            // returns: [epi-cms/widget/ReadOnlyContentList]
            //      Readonly grid with thumbnail enabled
            // tags:
            //      private

            var readOnlyList = new ReadOnlyContentList();
            domClass.add(readOnlyList.grid.domNode, "epi-thumbnailContentList");

            return readOnlyList;
        }

    });

});
