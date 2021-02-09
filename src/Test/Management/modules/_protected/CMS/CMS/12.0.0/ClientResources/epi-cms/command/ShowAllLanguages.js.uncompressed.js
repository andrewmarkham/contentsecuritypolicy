define("epi-cms/command/ShowAllLanguages", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "dojox/html/entities",

    "epi/dependency",
    "epi-cms/ApplicationSettings",
    "epi/shell/command/ToggleCommand",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.command"
],

function (
    declare,
    lang,
    when,
    entities,

    dependency,
    ApplicationSettings,
    ToggleCommand,
    resources
) {

    return declare([ToggleCommand], {
        // summary:
        //      A command that toggles whether all languages are shown.
        //
        // tags:
        //      public

        // property: [public] String
        //      The name of the property on the model which this command will toggle.
        property: "showAllLanguages",

        // category: [readonly] String
        //      A category which provides a hint about how the command could be displayed.
        category: "setting",

        // order: [readonly] Integer
        //      An ordering indication used when generating a ui for this command.
        //      Commands with order indication will be placed before commands with no order indication.
        order: 50,

        _watchHandle: null,

        postscript: function () {
            this.inherited(arguments);

            this.currentContentLanguage = this.currentContentLanguage || ApplicationSettings.currentContentLanguage;

            this.store = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.language");

            when(this.store.get(this.currentContentLanguage), lang.hitch(this, function () {
                this.set("label", resources.showonlycontentin);
            }));
        },

        _execute: function () {
            // summary:
            //		Overidde base class, toggles the value of the given property on the model.
            // tags:
            //		protected

            // Toggles the active state
            this.set("active", !this.active);

            // If active state is true, we will show only contents in current language,
            // otherwise show contents in all languages
            this.model.set(this.property, !this.active);
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected

            if (this.model && this.model._isSiteMultilingual) {
                when(this.model._isSiteMultilingual(), lang.hitch(this, function (value) {
                    this.set("canExecute", value);
                }));
            }
        }
    });
});
