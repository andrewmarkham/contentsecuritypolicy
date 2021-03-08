define([
    "epi/shell/DialogService",
    "epi-cms/ApplicationSettings",

    "epi/i18n!epi/nls/episerver.shared",
    "epi/i18n!epi/cms/nls/episerver.cms.tinymce.plugins.epipersonalizedcontent",
    "epi/i18n!epi/cms/nls/editor.tools.dynamiccontent",
    "epi/i18n!epi/cms/nls/edit.grouplisteditor",
    "xstyle/css!epi-cms/contentediting/AdminWidgets.css"
], function (
    dialogService,
    ApplicationSettings,

    sharedResources,
    pluginResources,
    dynamiccontentResources,
    grouplisteditorResources
) {
    function showPersonalizedContentDialog(store, parameters, onHide, onCallback) {
        require(["epi-cms/contentediting/AdminWidgets"], function (AdminWidgets) {

            var resources = Object.assign({},
                {
                    grouplistheading: dynamiccontentResources.grouplistheading,
                    add: sharedResources.action.add,
                    save: sharedResources.action.save,
                    cancel: sharedResources.action.cancel
                },
                grouplisteditorResources);

            store.query({}).then(function (availableVisitorGroups) {
                var dialogValue = {};

                var content = new AdminWidgets.PersonalizedContent({
                    resources: resources,
                    helpLink: ApplicationSettings.userGuideUrl + "#personalizedcontent",
                    defaultSelectedVisitorGroups: parameters.groups ? parameters.groups.split(",") : [],
                    defaultPersonalizedGroup: parameters.contentGroup || "",
                    defaultPersonalizedGroupSelected: !!parameters.contentGroup,
                    availableVisitorGroups: availableVisitorGroups,
                    defaultPersonalizationGroups: parameters.allContentGroups ? parameters.allContentGroups.split(",") : [],
                    onChange: function (value) {
                        dialogValue = value;
                    }
                });

                dialogService.dialog({
                    dialogClass: "epi-dialog-portrait epi-dialog-portrait__autosize epi-dialog--wide",
                    defaultActionsVisible: false,
                    content: content,
                    title: pluginResources.title
                }).then(function () {
                    var personalizedGroupName =
                        dialogValue.personalizedGroupSelected ? dialogValue.personalizedGroupName : "";
                    store.query({
                        visitorGroups: dialogValue.visitorGroups,
                        personalizedGroupName: personalizedGroupName
                    }).then(function (result) {
                        onCallback(result);
                        setTimeout(function () {
                            onHide();
                        }, 1);
                    });
                }).otherwise(function () {
                    onHide();
                });
            });
        });
    }

    return showPersonalizedContentDialog;
});
