define("epi-cms/contentediting/viewmodel/LanguageSettingsModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/topic",
    "dojo/Stateful",
    "dojo/when",
    "dojo/Deferred",
    "epi/dependency",
    "epi-cms/component/SiteTreeModel"
], function (
    declare,
    lang,
    topic,
    Stateful,
    when,
    Deferred,
    dependency,
    SiteTreeModel,
    Destroyable
) {

    return declare([Stateful], {
        // summary:
        //      Model for settings related to property compare view settings
        // tags: internal

        // enabled: [public] Boolean
        //      A flag telling whether view mode is enabled
        enabled: false,

        // selectedLanguage: [public] String
        //      The current document language
        documentLanguage: "",

        // selectedLanguage: [public] String
        //      The currently active language
        selectedLanguage: "",

        // availableLanguages: [readonly] Array[object]
        //      An array of the available languages
        availableLanguages: [],

        // profile: Object
        //      Instance of profile
        profile: null,

        // siteTreeModel: Object
        //      Instance of SiteTreeModel
        siteTreeModel: null,

        postscript: function () {
            this.inherited(arguments);

            if (!this.siteTreeModel) {
                var registry = dependency.resolve("epi.storeregistry"),
                    siteStructureStore = registry.get("epi.cms.sitestructure");
                this.siteTreeModel = new SiteTreeModel({store: siteStructureStore});
            }

            this.profile = this.profile || dependency.resolve("epi.shell.Profile");

            //Get the content language
            this.siteTreeModel.getCurrentSite()
                .then(lang.hitch(this, "_setAvailableLanguages"))
                .then(lang.hitch(this, function () {
                    when(this.profile.getContentLanguage(), lang.hitch(this, function (language) {
                        this.set("documentLanguage", language);
                        this.set("selectedLanguage", language, false);
                    }));
                }));

        },

        _setAvailableLanguages: function (site) {
            if (site) {
                var def = new Deferred();
                this.siteTreeModel.getChildren({ url: site.currentSite }, lang.hitch(this, function (languages) {
                    var obj = languages.filter(function (item) {
                        return (item.languageId && item.name);
                    }).map(function (item) {
                        return { label: item.name, value: item.languageId };
                    });
                    this.set("availableLanguages", obj);
                    def.resolve();
                }));
                return def.promise;
            } else {
                return new Deferred().resolve();
            }
        },

        _enabledSetter: function (enabled) {
            if (this.enabled !== enabled) {
                this.enabled = enabled;
                topic.publish("/epi/cms/action/eyetoggle", enabled);
            }
        },

        _selectedLanguageSetter: function (value, evented) {
            if (evented !== false) {
                topic.publish("/epi/cms/action/viewsettingvaluechanged", "viewlanguage", value);
            }
        }

    });

});
