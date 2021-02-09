define("epi-cms/component/command/DeleteLanguageBranch", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "epi/dependency",
    "epi/shell/command/_Command",
    "epi-cms/_MultilingualMixin",
    "epi-cms/ApplicationSettings",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/ContentActionSupport"
], function (
    declare,
    lang,
    when,
    dependency,
    _Command,
    _MultilingualMixin,
    ApplicationSettings,
    ContentReference,
    ContentActionSupport
) {

    return declare([_Command, _MultilingualMixin], {
        // summary:
        //      A command which deletes all versions belonging to a language branch when executed.
        //
        // tags:
        //      internal xproduct

        // label: [public] String
        //		The action text of the command to be used in visual elements.
        label: "",

        // iconClass: [public] String
        //		The icon class of the command to be used in visual elements.
        iconClass: "",

        // category: [readonly] String
        //		A category which provides a hint about how the command could be displayed.
        category: "context",

        postscript: function () {
            // summary:
            //		Constructs the object and sets up the reference to the content data and version stores.
            // tags:
            //		public

            this.inherited(arguments);

            this.storeRegistry = this.storeRegistry || dependency.resolve("epi.storeregistry");

            this._versions = this.storeRegistry.get("epi.cms.contentversion");
            this._structure = this.storeRegistry.get("epi.cms.content.light");
        },

        _execute: function () {
            // summary:
            //		Executes this command assuming canExecute has been checked.
            // tags:
            //		protected

            var reference = ContentReference.toContentReference(this.model.contentLink);

            return when(this._versions.remove(reference, { deleteLanguageBranch: true }), lang.hitch(this, function () {
                // TODO: Make sure all stores that can have deleted version gets notitifed.
                return this._structure.refresh(reference.createVersionUnspecificReference().toString());
            }));
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var model = this.model,

                isAvailable = !!(model && model.currentLanguageBranch && model.capabilities.deleteLanguageBranch &&
                    !ApplicationSettings.disableVersionDeletion),

                canExecute = isAvailable && !model.currentLanguageBranch.isMasterLanguage &&
                    ContentActionSupport.isActionAvailable(model, ContentActionSupport.action.Delete);

            this.set("canExecute", canExecute);
            this.set("isAvailable", isAvailable);
        }
    });
});
