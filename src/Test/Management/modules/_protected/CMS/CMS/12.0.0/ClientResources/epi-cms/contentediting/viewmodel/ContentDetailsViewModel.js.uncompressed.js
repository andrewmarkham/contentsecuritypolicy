define("epi-cms/contentediting/viewmodel/ContentDetailsViewModel", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",

    // EPi Framework
    "epi",
    "epi/datetime",
    "epi/dependency",
    "epi/username",
    "epi-cms/contentediting/command/AccessRights",
    "epi-cms/contentediting/command/LanguageSettings",
    "epi/shell/command/_CommandConsumerMixin",
    "epi/shell/command/_GlobalCommandProviderMixin",

    // EPi CMS
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/core/ContentReference",
    "epi-cms/contentediting/viewmodel/_ContentViewModelObserver"
],

function (
    array,
    declare,
    lang,
    when,

    // EPi Framework
    epi,
    datetime,
    dependency,
    username,
    AccessRightsCmd,
    LanguageSettingsCmd,
    _CommandConsumerMixin,
    _GlobalCommandProviderMixin,

    // EPi CMS
    ContentActionSupport,
    ContentReference,
    _ContentViewModelObserver) {

    return declare([_ContentViewModelObserver, _CommandConsumerMixin, _GlobalCommandProviderMixin], {
        // tags:
        //      internal

        commandKey: "epi.cms.contentdetailsmenu",

        res: null,

        contentTypeName: null,
        contentId: null,
        visibleToEveryOne: null,
        existingLanguages: null,

        accessRightsCommand: null,
        languageSettingsCommand: null,
        expirationCommand: null,

        constructor: function (params) {
            declare.safeMixin(this, params);
        },

        postscript: function () {
            this.initializeCommandProviders();
            this.accessRightsCommand = this.accessRightsCommand || new AccessRightsCmd();
            this.languageSettingsCommand = this.languageSettingsCommand || new LanguageSettingsCmd();
            if (!this.expirationCommand) {
                //we use the global expiration command as the same command is used in expiration notification.
                var editingCommands = dependency.resolve("epi.cms.contentEditing.command.Editing");
                this.expirationCommand = editingCommands.manageExpiration;
            }

            if (!this.store) {
                var registry = dependency.resolve("epi.storeregistry");
                this.store = registry.get("epi.cms.contenttype");
            }

            this.inherited(arguments);
        },

        destroy: function () {
            this.accessRightsCommand.destroy();
            this.languageSettingsCommand.destroy();
            this.inherited(arguments);
        },

        _dataModelSetter: function (value) {
            this.updateCommandModel(value);

            this.accessRightsCommand.set("model", value);
            this.languageSettingsCommand.set("model", value);

            this.inherited(arguments);
        },

        onDataModelChange: function (name, oldValue, value) {
            var contentData = this.dataModel.contentData,
                contentRef = new ContentReference(contentData.contentLink);

            this.set("contentId", contentRef.id);

            this.set("existingLanguages", array.map(contentData.existingLanguageBranches, function (item) {
                return {
                    text: item.languageId,
                    urlSegment: item.urlSegment,
                    isCurrentLanguage: contentData.currentLanguageBranch && item.languageId === contentData.currentLanguageBranch.languageId,
                    contentLink: new ContentReference(item.commonDraftLink).createVersionUnspecificReference().toString()
                };
            }));

            this.set("visibleToEveryOne", contentData.visibleToEveryOne);

            when(this.store.get(contentData.contentTypeID), lang.hitch(this, function (type) {
                this.set("contentTypeName", type.localizedName);
            }));

            this.set("commands", this.getCommands());
        },

        getCommands: function () {
            var commands = this.inherited(arguments);

            return [this.languageSettingsCommand, this.expirationCommand].concat(commands);
        }
    });
});
