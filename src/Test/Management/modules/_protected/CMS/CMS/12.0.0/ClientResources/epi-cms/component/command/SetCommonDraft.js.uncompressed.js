define("epi-cms/component/command/SetCommonDraft", [
    "dojo/_base/declare",
    "dojo/topic",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/dependency",
    "epi/i18n!epi/cms/nls/episerver.cms.components.versions",
    "epi/shell/command/_Command"
], function (declare, topic, ContentActionSupport, dependency, resources, _Command) {

    return declare([_Command], {
        // summary:
        //      A command which sets the current version as the common draft when executed.
        //
        // tags:
        //      public

        // label: [public] String
        //		The action text of the command to be used in visual elements.
        label: resources.setcommondraftitemtitle,

        // iconClass: [public] String
        //		The icon class of the command to be used in visual elements.
        iconClass: "epi-iconPrimary",

        // category: [readonly] String
        //		A category which provides a hint about how the command could be displayed.
        category: "context",

        constructor: function () {
            // summary:
            //		Constructs the object and sets up the reference to the content version store.
            // tags:
            //		public

            var registry = dependency.resolve("epi.storeregistry");
            this.store = registry.get("epi.cms.contentversion");
        },

        _execute: function () {
            // summary:
            //		Executes this command assuming canExecute has been checked.
            // tags:
            //		protected

            var store = this.store;

            //Patch the object in the store
            return store.patch({ isCommonDraft: true, contentLink: this.model.contentLink }, { id: this.model.contentLink })
                .then(function (item) {
                    topic.publish("/epi/cms/content/statuschange/", "common-draft", { id: item.contentLink });
                    return store.patchCache(item);
                });
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var model = this.model,
                status = ContentActionSupport.versionStatus,
                canExecute = model && !model.isCommonDraft && (model.status === status.CheckedOut || model.status === status.Rejected);

            this.set("canExecute", !!canExecute);
        }
    });
});
