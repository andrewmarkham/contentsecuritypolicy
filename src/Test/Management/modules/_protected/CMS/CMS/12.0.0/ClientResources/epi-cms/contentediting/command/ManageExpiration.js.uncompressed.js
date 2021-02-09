define("epi-cms/contentediting/command/ManageExpiration", [

// Dojo
    "dojo/_base/connect",
    "dojo/_base/declare",
    "dojo/when",

    // EPi CMS
    "epi-cms/contentediting/ExpirationDialog",
    "epi-cms/contentediting/viewmodel/ExpirationDialogViewModel",
    "epi-cms/contentediting/ContentActionSupport",

    // EPi Framework
    "epi/shell/command/_Command",
    "epi/shell/DialogService",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.widget.expirationeditor",
    "epi/i18n!epi/nls/episerver.shared"
], function (

// Dojo
    connect,
    declare,
    when,

    // EPi CMS
    ExpirationDialog,
    ExpirationDialogViewModel,
    ContentActionSupport,

    // EPi Framework
    _Command,
    dialogService,

    // Resources
    resources,
    sharedResources
) {

    return declare([_Command], {
        // summary:
        //      Displays the manage expiration dialog for the current content.
        //
        // tags:
        //      internal xproduct

        label: resources.dialogtitle,

        tooltip: resources.dialogtitle,

        viewModel: null,

        cssClass: "epi-chromelessButton epi-visibleLink",

        // expirationDialogClass: [public] Function
        //      The constructor function for the expiration dialog
        expirationDialogClass: ExpirationDialog,

        // expirationDialogViewModelClass: [public] Function
        //      The constructor function for the expiration dialog view model
        expirationDialogViewModelClass: ExpirationDialogViewModel,

        _execute: function () {
            // summary:
            //		Toggles the value of the given property on the model.
            // tags:
            //		protected

            var dialogViewModel = this.get("viewModel");

            var content = new this.expirationDialogClass({ model: dialogViewModel });

            dialogService.dialog({
                defaultActionsVisible: false,
                confirmActionText: sharedResources.action.save,
                content: content,
                title: resources.dialogtitle
            }).then(function (value) {
                var model = this.get("model");
                model.saveAndPublishProperty("iversionable_expire", value, ContentActionSupport.saveAction.SkipValidation);
            }.bind(this));
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute after the model has been updated.
            // tags:
            //		protected

            var model = this.get("model");
            if (!model || !model.contentData) {
                this.set("canExecute", false);
                return;
            }

            var properties = model.contentData.properties,
                expireBlock = properties.iversionable_expire;

            var canExecute = model.canChangeContent() &&
                             ContentActionSupport.hasAccess(model.contentData.accessMask, ContentActionSupport.accessLevel.Publish); // Ensure the user has Publish access right

            // Command is not available until the metadata resolves
            this.set("canExecute", false);

            when(model.getPropertyMetaData("iversionable_expire"))
                .then(function (metadata) {
                    this.set("viewModel", new this.expirationDialogViewModelClass({
                        metadata: metadata,
                        contentLink: model.contentLink,
                        contentName: model.contentData.name,
                        value: expireBlock,
                        minimumExpireDate: properties.iversionable_startpublish
                    }));

                    this.set("canExecute", canExecute);
                }.bind(this),
                function (res) {
                    if (res && res.status === 409) {
                        dialogService.alert(sharedResources.messages.unexpectederror);
                    }
                });
        }
    });
});
