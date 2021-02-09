define("epi-cms/contentediting/command/LanguageSettings", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "epi/dependency",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/shell/command/_Command",
    "epi/shell/DialogService",
    "epi-cms/ApplicationSettings",

    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.contentdetails.command.languagesettings",
    "epi/i18n!epi/shell/nls/edit.languagesettings",
    "epi/i18n!epi/shell/nls/button",
    "epi/i18n!epi/nls/episerver.shared",
    "xstyle/css!epi-cms/contentediting/AdminWidgets.css"
], function (
    declare,
    lang,
    when,
    dependency,
    ContentActionSupport,
    _Command,
    dialogService,
    ApplicationSettings,
    commandResources,
    uiResources,
    buttonResources,
    sharedResources) {

    function LanguageSettingsViewModel(store, contentLink) {

        return {
            getLanguageSettings: function () {
                return store.get(contentLink);
            },
            saveInheritSettings: function (inheritSettings) {
                return store.executeMethod("UpdateInheritSettings", contentLink, {
                    inheritSettings: inheritSettings,
                    //TODO: remove this, it's already in contentLink parameter
                    id: contentLink
                });
            },
            saveAvailableLanguages: function (availableLanguages) {
                return store.executeMethod("UpdateAvailableLanguages", contentLink, {
                    availableLanguages: availableLanguages,
                    id: contentLink,
                    inheritSettingsAvailable: false,
                    inheritSettings: false,
                    languages: null,
                    replacementLanguages: null,
                    fallbackLanguages: null
                });
            },
            saveFallbackLanguages: function (fallbackLanguages) {
                return store.executeMethod("UpdateFallbackLanguages", contentLink, {
                    fallbackLanguages: fallbackLanguages,
                    id: contentLink
                });
            },
            saveReplacementLanguages: function (replacementLanguages) {
                return store.executeMethod("UpdateReplacementLanguages", contentLink, {
                    replacementLanguages: replacementLanguages,
                    id: contentLink
                });
            }
        };
    }

    return declare([_Command], {
        // summary:
        //      Toggles permanent in use notification on/off.
        //
        // tags:
        //      internal
        name: "LanguageSettings",
        label: commandResources.label,
        tooltip: commandResources.tooltip,
        store: null,

        constructor: function () {
            this.store = dependency.resolve("epi.storeregistry").get("epi.cms.languagesettings");
            this.contentStore = dependency.resolve("epi.storeregistry").get("epi.cms.content.light");
        },

        _execute: function () {
            // summary:
            //		Toggles the value of the given property on the model.
            // tags:
            //		protected

            require(["epi-cms/contentediting/AdminWidgets"], function (AdminWidgets) {
                when(this.contentStore.get(this.model.contentData.parentLink)).then(function (parentContent) {
                    var resources = Object.assign({}, uiResources,
                        {
                            heading: lang.replace(uiResources.heading, [this.model.contentData.name]),
                            inheritsettings: parentContent ? lang.replace(uiResources.inheritsettings, [parentContent.name]) : uiResources.inheritsettings,
                            change: buttonResources.change,
                            save: buttonResources.save,
                            ok: buttonResources.ok,
                            cancel: buttonResources.cancel
                        });
                    var model = LanguageSettingsViewModel(this.store, this.model.contentData.contentLink);

                    model.getLanguageSettings().then(function (settings) {
                        var content = new AdminWidgets.LanguageSettings({
                            model: model,
                            resources: resources,
                            defaultSettings: settings,
                            helpLink: ApplicationSettings.userGuideUrl + "#languagesettings"
                        });
                        dialogService.dialog({
                            dialogClass: "epi-dialog-portrait epi-dialog-portrait__autosize epi-dialog--wide",
                            defaultActionsVisible: false,
                            confirmActionText: sharedResources.action.save,
                            content: content,
                            title: commandResources.label
                        });
                    });
                }.bind(this));
            }.bind(this));
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute and isAvailable after the model has been updated.
            // tags:
            //		protected

            var contentData = this.model.contentData;
            var hasAdminAccess =
                ContentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Administer);

            this.set("canExecute", contentData.capabilities.languageSettings && hasAdminAccess);
        }
    });
});
