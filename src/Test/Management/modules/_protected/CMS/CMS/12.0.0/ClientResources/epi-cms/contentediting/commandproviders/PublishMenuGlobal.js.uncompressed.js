define("epi-cms/contentediting/commandproviders/PublishMenuGlobal", [
    "dojo/_base/declare",

    "epi/shell/command/withConfirmation",
    "epi/shell/command/_CommandProviderMixin",
    "epi/shell/DestroyableByKey",

    "epi-cms/command/TranslateContent",
    "epi-cms/contentediting/command/ForPublishMenu",
    "epi-cms/contentediting/command/RevertToPublished",
    "epi-cms/contentediting/command/SendForReview",
    "epi-cms/contentediting/command/Publish",
    "epi-cms/contentediting/command/CreateDraft",
    "epi-cms/contentediting/command/EditCommonDraft",
    "epi-cms/contentediting/command/Withdraw",
    "epi-cms/contentediting/command/ScheduleForPublish",
    "epi-cms/contentediting/command/CancelAndEdit",

    "epi-cms/content-approval/command/AbortReview",
    "epi-cms/content-approval/command/ApproveChanges",
    "epi-cms/content-approval/command/CancelReview",
    "epi-cms/content-approval/command/ForceCompleteApproval",
    "epi-cms/content-approval/command/RejectChanges",
    "epi-cms/content-approval/command/ReadyForReview",

    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editactionpanel.publishactionmenu",
    "epi/i18n!epi/nls/episerver.cms.contentapproval.command",
    "epi/i18n!epi/nls/episerver.shell.resources.texts"
], function (
    declare,

    withConfirmation,
    _CommandProviderMixin,
    DestroyableByKey,

    TranslateContentCommand,
    ForPublishMenu,
    RevertToPublishedCommand,
    SendForReviewCommand,
    PublishCommand,
    CreateDraftCommand,
    EditCommonDraft,
    WithdrawCommand,
    ScheduleForPublishCommand,
    CancelAndEditCommand,

    AbortReviewCommand,
    ApproveChangesCommand,
    CancelReviewCommand,
    ForceCompleteApprovalCommand,
    RejectChangesCommand,
    ReadyForReviewCommand,

    res,
    commandRes,
    shellResources
) {

    return declare([_CommandProviderMixin, DestroyableByKey], {
        // summary:
        //      Builtin Command provider for publish menu.
        // tags:
        //      internal

        commandMap: null,

        constructor: function () {
            this.commandMap = {
                abortreview: ForPublishMenu(withConfirmation(new AbortReviewCommand(), null, {
                    title: commandRes.abortreview.label,
                    description: commandRes.abortreview.description,
                    confirmActionText: shellResources.ok,
                    cancelActionText: shellResources.cancel
                })),
                approvechanges: ForPublishMenu(new ApproveChangesCommand(), {
                    isMain: true,
                    priority: 10000,
                    mainButtonClass: "epi-success"
                }),
                cancelreview: ForPublishMenu(withConfirmation(new CancelReviewCommand(), null, {
                    title: commandRes.cancelreview.label,
                    description: commandRes.cancelreview.description,
                    confirmActionText: commandRes.cancelreview.ok,
                    cancelActionText: shellResources.cancel
                })),
                forcecompleteapproval: ForPublishMenu(new ForceCompleteApprovalCommand()),
                publish: ForPublishMenu(new PublishCommand(), {
                    resetLabelAfterExecution: true,
                    isMain: true,
                    priority: 9000,
                    mainButtonClass: "epi-success",
                    keepMenuOpen: false,
                    successStatus: res.successfullypublished
                }),
                readyforreview: ForPublishMenu(new ReadyForReviewCommand(), {
                    isMain: true,
                    priority: 10000,
                    mainButtonClass: "epi-success"
                }),
                readytopublish: ForPublishMenu(new SendForReviewCommand(), {
                    isMain: true,
                    priority: 8000,
                    mainButtonClass: "epi-success",
                    keepMenuOpen: true
                }),
                rejectchanges: ForPublishMenu(new RejectChangesCommand()),
                removescheduling: ForPublishMenu(new CancelAndEditCommand()),
                scheduleforpublish: ForPublishMenu(new ScheduleForPublishCommand()),
                withdraw: ForPublishMenu(new WithdrawCommand(), {
                    resetLabelAfterExecution: false,
                    keepMenuOpen: true
                })
            };

            this.commandMap.abortreview.order = 0;
            this.commandMap.approvechanges.order = 100;
            this.commandMap.forcecompleteapproval.order = 200;
            this.commandMap.rejectchanges.order = 300;
            this.commandMap.publish.order = 400;
            this.commandMap.readyforreview.order = 500;
            this.commandMap.readytopublish.order = 600;
            this.commandMap.removescheduling.order = 700;
            this.commandMap.scheduleforpublish.order = 800;
            this.commandMap.cancelreview.order = 900;
            this.commandMap.withdraw.order = 1000;
        },

        updateCommandModel: function (model) {
            // summary:
            //        Creates commands based on the status transitions available for the content as
            //        well as several additional commands that are not status based.
            // tags:
            //        private

            this.destroyByKey("builtinCommands");
            var commands = [];

            model.contentData.transitions.forEach(function (transition) {
                var command = this.commandMap[transition.name];
                if (command) {
                    commands.push(command);
                }
            }, this);

            // Adds builtin commands

            // Translate
            var translateContentCommand = new TranslateContentCommand();
            translateContentCommand.order = 1100;
            commands.push(ForPublishMenu(translateContentCommand, {
                isMain: true,
                priority: 10000,
                mainButtonClass: "epi-primary"
            }));
            this.ownByKey("builtinCommands", translateContentCommand);

            // Edit the common draft
            var editCommonDraft = new EditCommonDraft();
            editCommonDraft.order = 1200;
            commands.push(ForPublishMenu(editCommonDraft));
            this.ownByKey("builtinCommands", editCommonDraft);

            // Create new draft from here
            var draftCommand = new CreateDraftCommand();
            draftCommand.order = 1300;
            commands.push(ForPublishMenu(draftCommand));
            this.ownByKey("builtinCommands", draftCommand);

            // Revert to publish version
            var revertToPublishedCommand = new RevertToPublishedCommand();
            revertToPublishedCommand.order = 1400;
            commands.push(ForPublishMenu(withConfirmation(
                revertToPublishedCommand, null, {
                    title: res.reverttopublishconfirmation.dialogtitle,
                    heading: res.reverttopublishconfirmation.confirmquestion,
                    description: res.reverttopublishconfirmation.description
                }
            )));
            this.ownByKey("builtinCommands", revertToPublishedCommand);

            this.set("commands", commands);

            this.inherited(arguments);
        }
    });
});
