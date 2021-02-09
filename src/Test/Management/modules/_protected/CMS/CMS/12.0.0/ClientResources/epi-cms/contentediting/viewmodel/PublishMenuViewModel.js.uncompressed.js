define("epi-cms/contentediting/viewmodel/PublishMenuViewModel", [
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/when",
    "dojo/Deferred",
    "dijit/Destroyable",
    "dojox/html/entities",
    "epi",
    "epi/datetime",
    "epi/dependency",
    "epi/Url",
    "epi/string",
    "epi/username",
    "epi-cms/content-approval/ApprovalEnums",
    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/PageShortcutTypeSupport",
    "epi-cms/contentediting/viewmodel/_ContentViewModelObserver",
    "epi/shell/command/_CommandConsumerMixin",
    "epi/shell/command/_GlobalCommandProviderMixin",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editactionpanel.publishactionmenu"
],

function (
    declare,
    lang,
    when,
    Deferred,
    Destroyable,
    entities,
    epi,
    epiDate,
    dependency,
    Url,
    epistring,
    username,
    ApprovalEnums,
    ContentActionSupport,
    PageShortcutTypeSupport,
    _ContentViewModelObserver,
    _CommandConsumerMixin,
    _GlobalCommandProviderMixin,
    res
) {

    return declare([_ContentViewModelObserver, _CommandConsumerMixin, _GlobalCommandProviderMixin, Destroyable], {
        // tags:
        //      internal

        commandKey: "epi.cms.publishmenu",

        contentActionSupport: null,
        inUseNotificationManager: null,

        _currentUser: null,

        // Declare view model properties
        // ---------------------------------------------------------------------

        commands: null,
        mainButtonCommand: null,
        lastExecutedCommand: null,

        mainButtonSectionVisible: null,

        lastChangeStatus: null,

        // topInfoSectionVisible: [public] Boolean
        //      Indicates if the top info section should be visible
        topInfoSectionVisible: null,

        // bottomInfoSectionVisible: [public] Boolean
        //      Indicates if the bottom info section should be visible
        bottomInfoSectionVisible: null,

        publishInfoSectionVisible: null,
        lastPublishedText: null,
        lastPublishedViewLinkVisible: null,
        lastPublishedViewLinkHref: null,

        additionalInfoSectionVisible: null,
        additionalInfoText: null,

        isOpen: null,

        typeIdentifier: null,

        // Methods
        // ---------------------------------------------------------------------
        postscript: function () {
            this.inherited(arguments);

            this.res = this.res || res;
            this.projectService = this.projectService || dependency.resolve("epi.cms.ProjectService");
            this.approvalService = this.approvalService || dependency.resolve("epi.cms.ApprovalService");
            this.contentActionSupport = this.contentActionSupport || ContentActionSupport;
            this.initializeCommandProviders();
        },

        onDataModelChange: function (name, oldValue, value) {
            // when data model changes, update view model properties accordingly.
            var contentData = this.dataModel.contentData,
                contentHasPublishedVersion = this._contentHasPublishedVersion(contentData);

            // Update commands
            this._updateCommands();

            // Update other properties
            // -----------------------------------------------------------------------------

            // Set menu sections and texts to defaults before calling specific setters (e.g. _setApprovalInfo etc).
            this.set("topInfoSectionVisible", this._getTopInfoSectionVisible(contentData));
            this.set("bottomInfoSectionVisible", this._getBottomInfoSectionVisible());
            this.set("publishInfoSectionVisible", this._getPublishInfoSectionVisible(contentData));
            this.set("lastPublishedTitle", this._getLastPublishedTitle(contentData));
            this.set("lastPublishedTitleVisible", contentHasPublishedVersion);
            this.set("lastPublishedText", this._getLastPublishedText(contentData));
            this.set("lastPublishedViewLinkVisible", this._getLastPublishedViewLinkVisible(contentData, contentHasPublishedVersion));
            this.set("lastPublishedViewLinkHref", this._getLastPublishedHref(contentData));

            // Set menu sections and text based on specific scenarios.
            this.set("typeIdentifier", contentData.typeIdentifier);
            this._setAdditionalInfo(contentData);

            if (this._shouldShowApprovalInfo()) {
                this._setApprovalInfo(contentData);
            } else {
                this._setLastChangeStatus(contentData);
            }
        },

        onCommandsChanged: function (name, removed, added) {

            // Remove existing handles
            if (removed) {
                removed.forEach(function (command) {
                    this.destroyByKey(command);
                }, this);
            }

            added.forEach(function (command) {
                if (command.options && command.options.isMain) {
                    this.ownByKey(command, command.watch("canExecute", function () {
                        this._calculateMainButtonCommand();
                    }.bind(this)));
                }
            }, this);
        },

        _dataModelSetter: function (value) {
            this.updateCommandModel(value);
            this.inherited(arguments);
        },

        _shouldShowApprovalInfo: function () {
            // summary:
            //      Indicates if the content is in awaiting approval state
            //      and if the context needs translation
            // returns:
            //      true/false
            // tags:
            //      private

            var awaitingApproval = this.dataModel.contentData.status === ContentActionSupport.versionStatus.AwaitingApproval;
            var translationNeeded = this.dataModel.languageContext && this.dataModel.languageContext.isTranslationNeeded;
            return awaitingApproval && !translationNeeded;
        },

        _isOpenSetter: function (isOpen) {
            this.isOpen = isOpen;
            if (isOpen) {
                var contentData = this.dataModel.contentData;
                if (this._shouldShowApprovalInfo()) {
                    this._setApprovalInfo(contentData);
                } else {
                    this._setLastChangeStatus(contentData);
                }
            }
        },

        _setApprovalInfo: function (contentData) {
            // summary:
            //      Retrieve and renders the approval information if found.
            // contentData:
            //      The content data object
            // tags:
            //      private

            return this.approvalService.getApproval(contentData.contentLink).then(lang.hitch(this, function (approval) {
                // If the content is in an AwaitingApproval state, when there's no approval in review, the content
                // is stuck in limbo. Help the user get back their content to an editable state.
                if (!approval || approval.status !== ApprovalEnums.status.inReview) {
                    if (this.dataModel.contentData.status === ContentActionSupport.versionStatus.AwaitingApproval) {
                        this._setAbortInfo(contentData);
                    }

                    return null;
                }

                var heading = lang.replace(this.res.approvalinfo.timepassed, {
                    timepassed: epiDate.timePassed(new Date(approval.startDate))
                });

                var stepInfo = " <br /> " + lang.replace(this.res.approvalinfo.stepinfo, {
                    activeStepIndex: approval.activeStepIndex + 1,
                    totalsteps: approval.totalSteps
                });

                // render the top heading
                var topInfoSection = heading + (approval.status === ApprovalEnums.status.inReview ? stepInfo : "");
                this.set("topInfoSectionVisible", true);
                this.set("lastChangeStatus", topInfoSection);

                var requestedBy = lang.replace(this.res.approvalinfo.requestedby, {
                    username: this._getFriendlyUsername(approval.startedBy, true),
                    time: epiDate.toUserFriendlyHtml(approval.startDate)
                });

                // render who requested/started the approval
                this.set("publishInfoSectionVisible", true);
                this.set("lastPublishedText", requestedBy);

                // hide everything else.
                this.set("lastPublishedTitleVisible", false);
                this.set("lastPublishedViewLinkVisible", false);
                return approval;
            })).otherwise(function () {
                return null;
            });
        },

        _setAbortInfo: function (contentData) {
            // summary:
            //      Renders abort information for content that's stuck in AwaitingApproval.
            // contentData:
            //      The content data object
            // tags:
            //      private

            // render the top heading
            this.set("topInfoSectionVisible", true);
            this._setLastChangeStatus(contentData);

            // render who requested/started the approval
            this.set("publishInfoSectionVisible", true);

            // render error message
            this.set("lastPublishedText", this.res.approvalinfo.approvalmissing);

            // hide everything else.
            this.set("lastPublishedTitleVisible", false);
            this.set("lastPublishedViewLinkVisible", false);
        },

        _updateCommands: function () {
            this._calculateMainButtonCommand();

            this.set("commands", this.getCommands());
        },

        _calculateMainButtonCommand: function () {
            var commands = this.getCommands(),
                mainCommand = null;

            commands.forEach(function (command) {
                if (command.canExecute &&
                    command.options && command.options.isMain && command.options.priority && (!mainCommand || mainCommand.options.priority < command.options.priority)) {

                    mainCommand = command;
                }
            });

            this.set("mainButtonCommand", mainCommand);
            this.set("mainButtonSectionVisible", mainCommand !== null);
        },

        _getBottomInfoSectionVisible: function () {
            // summary:
            //      Bottom info section should only be visible if there are visible commands in it.
            // tags:
            //      private

            return this.getCommands().some(function (command) {
                // If the visible command is the main command then it's not in the bottom info section.
                return command.isAvailable && command !== this.mainButtonCommand;
            }.bind(this));
        },

        _getTopInfoSectionVisible: function (contentData) {
            // summary:
            //      Top info section should be invisible if there is no main command and content is non-commondraft published version.
            // tags:
            //      private

            return this.mainButtonCommand || !((contentData.status === ContentActionSupport.versionStatus.Published ||
                contentData.status === ContentActionSupport.versionStatus.Expired) && !contentData.isCommonDraft);
        },

        _getPublishInfoSectionVisible: function (contentData) {
            // REMARK: Make it possible to do this in a plugin

            var hasInUseNotificationWarning = this.inUseNotificationManager.hasInUseNotificationWarning(contentData.inUseNotifications),
                originallyEditable = this._isOriginallyEditable();

            return !(hasInUseNotificationWarning && originallyEditable);
        },

        _getLastPublishedViewLinkVisible: function (contentData, contentHasPublishedVersion) {
            return contentHasPublishedVersion && !!contentData.publicUrl;
        },

        _setLastChangeStatus: function (contentData) {

            var defaultText, lastChangeStatus,
                self = this;

            var saveDate = this.dataModel.get("lastSaved");
            lastChangeStatus = defaultText = this._getTemplatedText(this.res.lastchangestatus, contentData.changedBy, saveDate);

            if (this.lastExecutedCommand && this.lastExecutedCommand.options && this.lastExecutedCommand.options.successStatus) {
                var successStatus = this.lastExecutedCommand.options.successStatus;
                this.lastExecutedCommand = this.mainButtonCommand;
                lastChangeStatus = successStatus;
            }

            if (contentData.missingLanguageBranch && contentData.missingLanguageBranch.isTranslationNeeded) {
                lastChangeStatus = lang.replace(this.res.nottranslated, {
                    languageName: epi.resources.language[contentData.missingLanguageBranch.languageId],
                    languageId: contentData.missingLanguageBranch.languageId
                });
            }

            if (contentData.status === ContentActionSupport.versionStatus.Published ||
                contentData.status === ContentActionSupport.versionStatus.Expired) {
                lastChangeStatus = this.res.notmodifiedsincelastpublish;
            }

            if (contentData.status === ContentActionSupport.versionStatus.PreviouslyPublished) {
                lastChangeStatus = this._getTemplatedText(this.res.previouslypublished, contentData.versionCreatedBy, contentData.versionCreatedTime);
            }

            if (contentData.status === ContentActionSupport.versionStatus.Rejected) {
                lastChangeStatus = this._getTemplatedText(this.res.rejectedapproval, contentData.versionCreatedBy, contentData.versionCreatedTime);
            }

            if (contentData.status === ContentActionSupport.versionStatus.DelayedPublish) {
                lastChangeStatus = this.projectService.getProjectsForContent(contentData.contentLink).then(function (projects) {
                    projects = projects.filter(function (project) {
                        return project.status === "delayedpublished";
                    });

                    if (projects.length) {
                        return lang.replace(self.res.projectdelayedpublish, {
                            date: epiDate.toUserFriendlyHtml(contentData.properties.iversionable_startpublish),
                            project: entities.encode(projects[0].name)
                        });
                    }
                    return defaultText;
                });
            }

            when(lastChangeStatus, lang.hitch(this, "set", "lastChangeStatus"));
        },

        _getLastPublishedTitle: function (contentData) {
            return contentData.status === ContentActionSupport.versionStatus.PreviouslyPublished ?
                this.res.currentlypublished : this.res.lastpublishedby;
        },

        _getLastPublishedText: function (contentData) {
            return (this._contentHasPublishedVersion(contentData)) ?
                this._getTemplatedText(this.res.publishedtime, contentData.publishedBy, contentData.lastPublished, true) :
                this.res.notpublishedbefore;
        },

        _getLastPublishedHref: function (contentData) {
            if (!contentData.publicUrl) {
                return null;
            }

            var url = new Url(contentData.publicUrl);
            if (contentData.properties.pageShortcutType === PageShortcutTypeSupport.pageShortcutTypes.Shortcut) {
                url.query.id = new Date().valueOf();
            }

            return url.toString();
        },

        _setAdditionalInfo: function (contentData) {
            // REMARK: Make it possible to do this in a plugin

            var hasInUseNotificationWarning = this.inUseNotificationManager.hasInUseNotificationWarning(contentData.inUseNotifications),
                originallyEditable = this._isOriginallyEditable(),
                visible = hasInUseNotificationWarning && originallyEditable;

            this.set("additionalInfoSectionVisible", visible);

            if (visible) {
                var userList = this.inUseNotificationManager.getOtherUsersInUseNotifications(contentData.inUseNotifications);
                this.set("additionalInfoText", this._getTemplatedText(this.res.inusewarning, userList.join(",")));
            }
        },

        _isOriginallyEditable: function () {
            // Temporarily ignore inuse notification warning to check original editable status
            var ignoreFlag = this.inUseNotificationManager.ignoreOthersNotifications;
            this.inUseNotificationManager.ignoreOthersNotifications = true;

            var originallyEditable = this.dataModel.canChangeContent();

            this.inUseNotificationManager.ignoreOthersNotifications = ignoreFlag;

            return originallyEditable;
        },

        _getFriendlyUsername: function (name, capitalizeUsername) {
            // summary:
            //      Get friendly username: if the username to be displayed is the same
            //      as the current username, this will returns "you"
            // name:
            //      the username to be displayed
            // capitalizeUsername:
            //      If the first character should always be displayed with upper case.
            // tags:
            //      private

            return username.toUserFriendlyHtml(name, null, capitalizeUsername);
        },

        _getTemplatedText: function (template, username, datetime, capitalizeUsername) {
            // summary:
            //      Return text represent last update time
            // tags:
            //      private

            var date = new Date(datetime);

            return lang.replace(template, {
                username: this._getFriendlyUsername(username, capitalizeUsername),
                time: epiDate.toUserFriendlyHtml(date),
                timepassed: epiDate.timePassed(date)
            });
        },

        _canTransitionTo: function (contentData, transition) {
            return contentData.transitions.some(function (item) {
                return item.name === transition;
            });
        },

        _contentHasPublishedVersion: function (contentData) {
            // summary:
            //      Detect whether a content has a published version based on its status
            //      (Published, PreviouslyPublished) or lastPublished is not null
            //      This approach is used to avoid the case when custom providers
            //      do not set the person who published (publishedBy)
            // tags:
            //      private

            if (!contentData) {
                return false;
            }

            var hasDate = contentData.lastPublished && contentData.lastPublished !== "0001-01-01T00:00:00Z";
            if (hasDate) {
                return true;
            }

            return contentData.status === ContentActionSupport.versionStatus.Published ||
                contentData.status === ContentActionSupport.versionStatus.PreviouslyPublished;
        }
    });
});
