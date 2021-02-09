define("epi-cms/_MultilingualMixin", [
// Dojo
    "dojo/_base/declare",
    "dojo/Deferred",
    "dojo/when",
    "dojo/_base/lang",

    // Epi
    "epi/dependency",
    "epi-cms/ApplicationSettings",
    "epi-cms/component/SiteTreeModel"
],

function (
// Dojo
    declare,
    Deferred,
    when,
    lang,

    // Epi
    dependency,
    ApplicationSettings,
    SiteTreeModel
) {

    return declare([], {
        // summary:
        //    A Mixin to check for Multilingual capability
        // tags:
        //    internal

        // isMultilingual: [readonly] Boolean
        //      Flag which indicates whether to support multi-languages
        isMultilingual: false,

        // _application: Object
        //      Instance of CMS application
        _application: null,

        // _siteTreeModel: Object
        //      Instance of SiteTreeModel
        _siteTreeModel: null,

        // _cachedValue: Object
        //      A cached value for the _isSiteMultilingualQuery
        _cachedValue: undefined,

        constructor: function (options) {
            // summary:
            //      Mixin properties of the object for injection later.
            // tags:
            //      protected

            lang.mixin(this, options);
        },

        _isSiteMultilingual: function () {
            // summary:
            //      Check whether current site allows multilingual
            // tags:
            //      protected
            var deferred = new Deferred();

            if (this._cachedValue !== undefined) {
                deferred.resolve(this._cachedValue);
                return deferred;
            }

            if (!this._siteTreeModel) {
                var registry = dependency.resolve("epi.storeregistry"),
                    siteStructureStore = registry.get("epi.cms.sitestructure");
                this._siteTreeModel = new SiteTreeModel({store: siteStructureStore});
            }

            when(this._siteTreeModel.getAllLanguagesForCurrentSite(), lang.hitch(this, function (items) {
                this._cachedValue = items.length >= 2;
                deferred.resolve(this._cachedValue);
            }));

            return deferred;
        },

        _contentExistsInCurrentLanguage: function (/*Object*/contentItem) {
            // summary:
            //      Check if the language branch for the current content differs from the current content language for the application.
            // contentItem:
            //      Content item.
            // tags:
            //      protected

            if (!contentItem) {
                return false;
            }

            //If the content does not support languages then the content exists for the current language
            if (contentItem.capabilities && !contentItem.capabilities.language) {
                return true;
            }

            if (!contentItem.currentLanguageBranch) {
                return false;
            }

            return ApplicationSettings.currentContentLanguage === contentItem.currentLanguageBranch.languageId;
        }
    });
});
