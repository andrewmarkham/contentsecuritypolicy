define("epi-cms/version/LanguageSelector", [
    "dojo/_base/declare",
    // Resources
    "epi/i18n!epi/nls/episerver.cms.languageselector",
    // Parent class
    "dijit/form/Select"
], function (
    declare,
    // Resources
    localization,
    // Parent class
    Select
) {

    return declare([Select], {
        // tags:
        //      internal

        // defaultOption: [readonly] Object
        //      The default option for all languages.
        defaultOption: null,

        // languages: [public] Array
        //      The languages to display in the selector.
        languages: null,

        // currentLanguage: [public] String
        //      The language code for the language of the current content.
        currentLanguage: null,

        constructor: function () {
            this.defaultOption = {
                label: localization.alllanguages,
                value: "all"
            };
        },

        _setLanguagesAttr: function (languages) {
            // summary:
            //      Sets the languages to be displayed in the selector.
            // tags:
            //      protected
            this._set("languages", languages);

            // Set the options to an empty array and do an early exit if there are no languages.
            if (!languages || !languages.length) {
                this.set("options", []);
                return;
            }

            this.set("options", this._convertLanguagesToOptions(languages));
        },

        _setCurrentLanguageAttr: function (language) {
            // summary:
            //      Sets the current language of the site. The matching option will be marked in the selector.
            // tags:
            //      protected
            this._set("currentLanguage", language);

            var languages = this.languages;
            if (languages && languages.length) {
                this.set("options", this._convertLanguagesToOptions(languages));
            }
        },

        _convertLanguagesToOptions: function (languages) {
            var value = this.value,
                current = this.currentLanguage;

            // Map the supported languages into options with label and value properties.
            var options = languages.map(function (item) {
                var isCurrent = item.languageId === current;
                return {
                    label: item.name + (isCurrent ? " (" + localization.currentlanguage + ")" : ""),
                    value: item.languageId
                };
            });

            // Concatenate the default option together with the language options.
            options = [this.defaultOption, { /*Separator*/ }].concat(options);

            // Set the selected property based on the current value.
            options.forEach(function (item) {
                item.selected = item.value === value;
            });

            return options;
        }
    });
});
