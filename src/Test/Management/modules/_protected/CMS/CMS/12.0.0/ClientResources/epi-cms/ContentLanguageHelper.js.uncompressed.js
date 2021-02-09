define("epi-cms/ContentLanguageHelper", [
    "dojo/_base/lang",
    "dojo/_base/declare",
    "dojo/_base/Deferred",
    "dojo/promise/all",

    "epi/dependency",
    "epi/shell/TypeDescriptorManager"
], function (lang, declare, Deferred, all, dependency, TypeDescriptorManager) {

    return {
        // summary:
        //      Helper methods for working with content languages
        //
        // tags:
        //      internal

        getMissingLanguageMessage: function (contentItem) {
            // summary:
            //      Gets a user friendly message explaining why the language is missing
            // contentItem: Object
            //      The content item to read the missing language information from
            // tags:
            //      public

            if (!contentItem || !contentItem.missingLanguageBranch) {
                return "";
            }

            this._languageStore = this._languageStore || dependency.resolve("epi.storeregistry").get("epi.cms.language");

            var def = new Deferred();

            var missingLanguageBranch = contentItem.missingLanguageBranch;

            all([this._languageStore.get(missingLanguageBranch.preferredLanguage),
                this._languageStore.get(missingLanguageBranch.language)
            ]).then(lang.hitch(this, function (languages) {

                var reason = missingLanguageBranch.reason;
                var resourceKey = "languagenotifications.";
                if (reason === 6) {
                    // None
                    resourceKey += "missing";
                } else if (reason === 3 || reason === 5) {
                    //Replacement or ReplacementFallback
                    resourceKey += "replacement";
                } else if (reason === 4) {
                    //Fallback
                    resourceKey += "fallback";
                }

                var resourceValue = TypeDescriptorManager.getResourceValue(contentItem.typeIdentifier, resourceKey);
                resourceValue = lang.replace(resourceValue, [languages[0].name, languages[1].name]);

                def.resolve(resourceValue);

            }), function () {
                def.resolve("");
            });
            return def;
        }
    };
});
