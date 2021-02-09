define("epi-cms/contentediting/command/AccessRights", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "epi/dependency",
    "epi-cms/contentediting/ContentActionSupport",
    "epi/shell/command/_Command",
    "epi/shell/DialogService",
    "epi-cms/ApplicationSettings",
    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.contentdetails.command.accessrights",
    "epi/i18n!epi/shell/nls/admin.security",
    "epi/i18n!epi/shell/nls/edit.editsecurity",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.hierachicallist",
    "epi/i18n!epi/cms/nls/episerver.cms.widget.contentreferences",
    "epi/i18n!epi/shell/nls/button",
    "epi/i18n!epi/nls/episerver.shared",
    //Styles
    "xstyle/css!epi-cms/contentediting/AdminWidgets.css"
],

function (
    declare,
    lang,
    dependency,
    ContentActionSupport,
    _Command,
    dialogService,
    ApplicationSettings,
    resources,
    securityResources,
    editsecurityResources,
    hierachicalListResources,
    contentReferencesResources,
    buttonResources,
    sharedResources) {

    function AccessRightsViewModel(store) {

        return {
            searchEntities: function (searchPhrase) {
                return store.query({
                    includeRoles: true,
                    includeVisitorGroups: true,
                    name: searchPhrase
                }).then(function (results) {
                    return results.map(function (x) {
                        return {
                            key: x.name,
                            entityType: x.reviewerType
                        };
                    });
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

        name: "AccessRights",
        label: resources.label,
        tooltip: resources.tooltip,
        store: null,
        userNotificationsStore: null,

        constructor: function (params) {
            declare.safeMixin(this, params);
            this.store = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.accessrights");
            this.userNotificationsStore = this.userNotificationsStore || dependency.resolve("epi.storeregistry").get("epi.cms.notification.users");
        },

        _execute: function () {
            require(["epi-cms/contentediting/AdminWidgets"], function (AdminWidgets) {
                var resources = Object.assign({}, securityResources, editsecurityResources, buttonResources, hierachicalListResources, contentReferencesResources, {
                    heading: lang.replace(editsecurityResources.heading, [this.model.contentData.name]),
                    user: lang.replace(editsecurityResources.user, [ApplicationSettings.userName])
                });
                var model = AccessRightsViewModel(this.userNotificationsStore);

                this.store.get(this.model.contentData.contentLink).then(function (settings) {
                    var content = new AdminWidgets.ContentAccessRights({
                        model: model,
                        resources: resources,
                        helpLink: ApplicationSettings.userGuideUrl + "#editsecurity",
                        entries: settings.entries,
                        isInherited: settings.isInherited,
                        isInheritedEnabled: settings.isInheritedEnabled,
                        userGroups: settings.userGroups
                    });
                    dialogService.dialog({
                        dialogClass: "epi-dialog-portrait epi-dialog-portrait__autosize epi-dialog--wide",
                        defaultActionsVisible: true,
                        confirmActionText: sharedResources.action.save,
                        content: content,
                        title: editsecurityResources.title
                    }).then(function () {
                        this.store.executeMethod("Save", this.model.contentData.contentLink, {
                            entries: model.entries,
                            id: this.model.contentData.contentLink,
                            isInherited: model.isInherited
                        });
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute and isAvailable after the model has been updated.
            // tags:
            //		protected

            var contentData = this.model.contentData,
                hasAdminAccess = ContentActionSupport.hasAccess(contentData.accessMask, ContentActionSupport.accessLevel.Administer);

            this.set("canExecute", contentData.capabilities.securable && hasAdminAccess);
        }
    });
});
