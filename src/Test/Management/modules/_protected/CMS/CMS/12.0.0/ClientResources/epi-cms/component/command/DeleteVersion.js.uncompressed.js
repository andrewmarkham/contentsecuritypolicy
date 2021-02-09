define("epi-cms/component/command/DeleteVersion", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "epi-cms/ApplicationSettings",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/dependency",
    "epi/i18n!epi/cms/nls/episerver.cms.components.versions",
    "epi/shell/command/_Command"
], function (declare, lang, when, ApplicationSettings, ContentActionSupport, dependency, resources, _Command) {

    return declare([_Command], {
        // summary:
        //      A command which deletes the current version when executed.
        //
        // tags:
        //      internal

        // label: [public] String
        //		The action text of the command to be used in visual elements.
        label: resources.deletemenuitemtitle,

        // iconClass: [public] String
        //		The icon class of the command to be used in visual elements.
        iconClass: "epi-iconTrash",

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

            this._content = this.storeRegistry.get("epi.cms.contentdata");
            this._versions = this.storeRegistry.get("epi.cms.contentversion");
        },

        _execute: function () {
            // summary:
            //		Executes this command assuming canExecute has been checked.
            // tags:
            //		protected

            return this._versions.remove(this.model.contentLink);
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            if (ApplicationSettings.disableVersionDeletion) {
                this.set("isAvailable", false);
                return;
            }

            this.set("isAvailable", true);

            if (!this.model.allowToDelete) {
                this.set("canExecute", false);
                return;
            }

            when(this._content.get(this.model.contentLink), lang.hitch(this, function (content) {

                var action = ContentActionSupport.action,
                    hasSufficientAccessRight = content && ContentActionSupport.isActionAvailable(content, action.Delete);

                this.set("canExecute", hasSufficientAccessRight);
            }));
        }
    });
});
