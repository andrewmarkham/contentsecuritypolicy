define("epi-cms/command/RenameFolder", [
    "dojo/_base/declare",
    "epi/obsolete",

    "epi",
    "epi-cms/_MultilingualMixin",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/shell/command/_Command"
],

function (
    declare,
    obsolete,

    epi,
    _MultilingualMixin,
    ContentActionSupport,
    _Command
) {

    return declare([_Command, _MultilingualMixin], {
        // summary:
        //      A command that causes the model to switch to an edit mode.
        //
        // tags:
        //      public deprecated

        label: epi.resources.action.rename,

        contentActionSupport: null,

        // iconClass: [readonly] String
        //      The icon class of the command to be used in visual elements.
        iconClass: "epi-iconRename",

        renameDelegate: null,

        typeIdentifier: "episerver.core.contentfolder",

        postscript: function () {
            this.inherited(arguments);

            obsolete("epi-cms/command/RenameFolder", "Use epi-cms/asset/command/RenameSelectedFolder instead", "11.0");

            this.contentActionSupport = this.contentActionSupport || ContentActionSupport;
        },

        _execute: function () {
            // summary:
            //      Executes this command; publishes a context change request to change to the model item.
            // tags:
            //      protected

            this.renameDelegate(this.model);
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected

            // The model is the folder tree node, which has a label widget for editing the name.

            var canExecute = this.renameDelegate && this.model &&
                this.model.typeIdentifier === this.typeIdentifier &&
                this.contentActionSupport.hasAccess(this.model.accessMask, ContentActionSupport.accessLevel[ContentActionSupport.action.Edit]) &&
                this._contentExistsInCurrentLanguage(this.model);

            this.set("canExecute", canExecute);
        }
    });
});
