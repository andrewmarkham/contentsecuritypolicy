define("epi-cms/asset/command/TranslateSelectedContent", [
    "dojo/_base/declare",
    "dojo/topic",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons.translate",
    "epi/shell/command/_Command",
    "epi/shell/command/_SelectionCommandMixin"
], function (declare, topic, resources, _Command, _SelectionCommandMixin) {

    return declare([_Command, _SelectionCommandMixin], {
        // tags:
        //      internal xproduct

        // label: [public] String
        //      The action text of the command to be used in visual elements.
        label: resources.label,

        // executingLabel: [public] String
        //      The action text of the command when executing to be used in visual elements.
        executingLabel: resources.executinglabel,

        // tooltip: [public] String
        //      The description text of the command to be used in visual elements.
        tooltip: resources.title,

        // category: [const] String
        //      A category which provides a hint about how the command could be displayed.
        category: "context",

        _execute: function () {
            // summary:
            //      Publishes a change view request to change to the create language branch view.
            // tags:
            //      protected

            var model = this._getNormalizedModel();
            var data = {
                contentData: model.content,
                languageBranch: model.language.preferredLanguage
            };

            topic.publish("/epi/shell/action/changeview", "epi-cms/contentediting/CreateLanguageBranch", null, data);
        },

        _onModelChange: function () {
            // summary:
            //      Updates canExecute after the model has been updated.
            // tags:
            //      protected
            var model = this._getNormalizedModel(),
                language = model && model.language, // Null if multiple languages are not supported by the content provider on the server.
                isDeleted = model && model.content.isDeleted,
                isAvailable = language && language.isTranslationNeeded && !isDeleted,
                canExecute = isAvailable && language.hasTranslationAccess && language.isPreferredLanguageAvailable;

            if (model && typeof model.content.canTranslateContent === "function") {
                // Check if the model allows the current content to be translated.
                var canTranslate = model.content.canTranslateContent();

                isAvailable = isAvailable && canTranslate;
                canExecute = canExecute && canTranslate;
            }

            // Command is available if there is a translation needed.
            this.set("isAvailable", !!isAvailable);

            // Command is executable if the current user has sufficient privilege to translate and
            // that the preferred language is configured to be available for the current content.
            this.set("canExecute", !!canExecute);
        },

        _getNormalizedModel: function () {
            // summary:
            //      Gets a normalized model in order to handle the different possible inputs.
            // tags:
            //      private
            var model = this._getSingleSelectionData();
            if (model) {
                return {
                    content: model.contentData || model,
                    language: model.languageContext || model.missingLanguageBranch
                };
            }
        }
    });

});
