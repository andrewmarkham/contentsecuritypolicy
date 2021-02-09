define("epi-cms/contentediting/command/Editing", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    "epi/shell/command/withConfirmation",
    "epi-cms/command/TranslateContent",
    "epi-cms/contentediting/command/RevertToPublished",
    "epi-cms/contentediting/command/SendForReview",
    "epi-cms/contentediting/command/Publish",
    "epi-cms/contentediting/command/CreateDraft",
    "epi-cms/contentediting/command/Withdraw",
    "epi-cms/contentediting/command/ManageExpiration",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editactionpanel.publishactionmenu"
],

function (
    declare,
    lang,
    Stateful,
    withConfirmation,
    TranslateContentCommand,
    RevertToPublishedCommand,
    SendForReviewCommand,
    PublishCommand,
    CreateDraftCommand,
    WithdrawCommand,
    ManageExpiration,
    actionRes
) {
    //Shared instance

    var Editing = declare([Stateful], {
        // summary:
        //      Exposes all available editing commands
        //
        // tags:
        //      internal

        model: null,

        revertToPublished: null,
        translate: null,
        createDraft: null,
        sendForReview: null,
        publish: null,
        withdraw: null,
        manageExpiration: null,

        constructor: function (settings) {
            lang.mixin(this, settings);

            //Wrap the revert to publish command in a confirmation dialog
            this.revertToPublished = withConfirmation(new RevertToPublishedCommand(), null, {
                title: actionRes.reverttopublishconfirmation.dialogtitle,
                heading: actionRes.reverttopublishconfirmation.confirmquestion,
                description: actionRes.reverttopublishconfirmation.description
            });
            this.translate = new TranslateContentCommand();
            this.createDraft = new CreateDraftCommand();
            this.sendForReview = new SendForReviewCommand();
            this.publish = new PublishCommand();
            this.withdraw = new WithdrawCommand();
            this.manageExpiration = new ManageExpiration();
        },

        _modelSetter: function (model) {
            this.model = model;

            //Update the model on the commands
            this.revertToPublished.set("model", model);
            this.translate.set("model", model);
            this.createDraft.set("model", model);
            this.sendForReview.set("model", model);
            this.publish.set("model", model);
            this.withdraw.set("model", model);
            this.manageExpiration.set("model", model);
        }
    });

    return new Editing();
});
