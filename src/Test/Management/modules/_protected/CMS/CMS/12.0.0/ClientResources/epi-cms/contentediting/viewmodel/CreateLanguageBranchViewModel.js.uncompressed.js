define("epi-cms/contentediting/viewmodel/CreateLanguageBranchViewModel", [
// dojo
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",

    // epi
    "epi/dependency",
    "epi-cms/contentediting/viewmodel/CreateContentViewModel",

    "epi/i18n!epi/cms/nls/episerver.cms.components.createpage.translate"
],

function (
// dojo
    declare,
    lang,
    when,

    // epi
    dependency,
    CreateContentViewModel,
    res
) {

    return declare([CreateContentViewModel], {
        // summary:
        //      View model of epi-cms/contentediting/CreateLanguageBranch component.
        // tags:
        //      internal

        // languageBranch: String
        //      Language branch on which the new content is created.
        languageBranch: null,

        // masterLanguageVersionId: String
        //      Content link of the master language version.
        masterLanguageVersionId: null,

        // contentNameHelpText: String
        //      Help text for the content name input
        contentNameHelpText: res.namehelptext,

        postscript: function () {

            // always start with second step
            this.wizardStep = 1;
            this.startWizardStep = 1;

            this.inherited(arguments);

            this._languageStore = this._languageStore || dependency.resolve("epi.storeregistry").get("epi.cms.language");
        },

        update: function (settings) {
            // summary:
            //      Update the component with new settings.
            // description:
            //      Override the base to set other properties (languageBranch, masterLanguageVersionId, contentName) with values provided by the component settings requested.
            // settings: Object
            //      The settings object.
            // tags:
            //      public

            var masterContent = settings.contentData;
            var languageBranch = settings.languageBranch;


            // If the masterContent does not have a public url (will not have url segment) we should not show the help text
            this.set("contentNameHelpText", masterContent.publicUrl ? res.namehelptext : "");

            var self = this;
            return when(this.contentDataStore.get(masterContent.parentLink))
                .then(function (parent) {
                    var baseResult = CreateContentViewModel.prototype.update.apply(self, [{
                        requestedType: masterContent.typeIdentifier,
                        parent: parent,
                        contentTypeId: masterContent.contentTypeID
                    }]);

                    self.set("languageBranch", languageBranch);
                    self.set("masterLanguageVersionId", masterContent.contentLink);
                    self.set("contentName", masterContent.name);

                    return baseResult;
                })
                .then(function (baseResult) {
                    //Change the heading text
                    return when(self._languageStore.get(self.languageBranch)).then(function (language) {
                        self.set("headingText", lang.replace(res.namelabel, [language.name]));

                        return baseResult;
                    });
                });
        },

        _hasRequiredProperties: function () {
            // summary:
            //      We always want to show the default create view, so we always say that we have required properties even though
            return true;
        },

        _isRequired: function (property) {
            // summary:
            //      Checks if the given property is required.
            // property: Object
            //      The metadata property.
            // tags:
            //      protected, extension

            return this.inherited(arguments) && (!this.languageBranch || property.settings.isLanguageSpecific === true);
        },

        buildContentObject: function () {
            // summary:
            //      Build up the content object to create from model properties.
            // description:
            //      Override to set languageBranch and masterLanguageVersionId on the result.
            // tags:
            //      protected

            var content = this.inherited(arguments);

            lang.mixin(content, {
                languageBranch: this.languageBranch,
                masterLanguageVersionId: this.masterLanguageVersionId
            });

            return content;
        }

    });

});
