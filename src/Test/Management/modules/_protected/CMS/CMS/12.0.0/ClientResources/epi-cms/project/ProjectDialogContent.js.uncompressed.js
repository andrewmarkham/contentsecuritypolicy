define("epi-cms/project/ProjectDialogContent", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/keys",
    "epi/dependency",
    // Parent class and mixins
    "epi/shell/widget/FormContainer",
    "epi/shell/widget/dialog/_DialogContentMixin"
], function (
    declare,
    lang,
    keys,
    dependency,
    // Parent class and mixins
    FormContainer,
    _DialogContentMixin
) {

    return declare([FormContainer, _DialogContentMixin], {
        // summary:
        //      This is an internal class to help with displaying the project dialog correctly.
        // tags:
        //      internal xproduct

        // _metadataManager: [readonly] Object
        //      The metadata manager used to request metadata about the type that will be displayed.
        _metadataManager: null,

        postMixInProperties: function () {
            this.inherited(arguments);

            if (!this.metadata) {
                // Resolve the metadata that will be used when constructing the view for this form.
                var metadataManager = this._metadataManager || dependency.resolve("epi.shell.MetadataManager");
                this.metadata = metadataManager.getMetadataForType("EPiServer.Cms.Shell.UI.Rest.Projects.Internal.Models.ProjectViewModel");
            }
        },

        postCreate: function () {
            this.inherited(arguments);

            this.on("keypress", lang.hitch(this, function (e) {
                if (e.keyCode === keys.ENTER && this.isValid()) {
                    this.executeDialog();
                }
            }));
        }
    });
});
