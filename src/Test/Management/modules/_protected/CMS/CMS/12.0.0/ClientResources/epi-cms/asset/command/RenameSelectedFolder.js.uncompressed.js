define("epi-cms/asset/command/RenameSelectedFolder", [
    "dojo/_base/declare",
    "epi",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/shell/command/_Command",
    "epi/shell/command/_SelectionCommandMixin",
    "epi/shell/TypeDescriptorManager"
],

function (
    declare,
    epi,
    ContentActionSupport,
    _Command,
    _SelectionCommandMixin,
    TypeDescriptorManager
) {

    return declare([_Command, _SelectionCommandMixin], {
        // summary:
        //      A command that causes the model to switch to an edit mode.
        //
        // tags:
        //      public

        label: epi.resources.action.rename,

        contentActionSupport: null,

        // iconClass: [readonly] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconRename",

        renameDelegate: null,

        typeIdentifier: "episerver.core.contentfolder",

        postscript: function () {
            this.inherited(arguments);

            this.contentActionSupport = this.contentActionSupport || ContentActionSupport;
        },

        _execute: function () {
            // summary:
            //      Executes this command; publishes a context change request to change to the selected item.
            // tags:
            //      protected

            this.renameDelegate(this._getSingleSelectionData());
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected

            var target = this._getSingleSelectionData();
            // The model is the folder tree node, which has a label widget for editing the name.
            var isAvailable = !!target && TypeDescriptorManager.isBaseTypeIdentifier(target.typeIdentifier, this.typeIdentifier)
                    && !((this.model.isContextualContent && this.model.isContextualContent(target))
                        || this.model.isRoot(target.contentLink));

            var canExecute = isAvailable &&
                    this.renameDelegate &&
                    this.contentActionSupport.hasAccess(target.accessMask, ContentActionSupport.accessLevel[ContentActionSupport.action.Edit]);

            this.set("isAvailable", isAvailable);
            this.set("canExecute", canExecute);
        }
    });
});
