define("epi-cms/contentediting/viewmodel/EditActionPanelViewModel", [
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/Stateful",
    "dojo/string",

    "dojox/html/entities",

    "epi-cms/contentediting/ContentActionSupport",
    "epi-cms/contentediting/viewmodel/_ContentViewModelObserver",
    "epi-cms/contentediting/viewmodel/PublishMenuViewModel",

    "epi/datetime",
    "epi/dependency",

    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.editactionpanel"
],

function (
    array,
    declare,
    lang,
    Stateful,
    dojoString,

    entities,

    ContentActionSupport,
    _ContentViewModelObserver,
    PublishMenuViewModel,

    datetime,
    dependency,

    res
) {

    return declare([_ContentViewModelObserver], {
        // tags:
        //      internal

        // public view model properties
        state: null,
        buttonText: null,
        statusText: null,
        statusIcon: null,
        additionalClass: null,
        nonEditableIndicator: null,
        visible: null,
        publishMenuViewModel: null,

        inUseNotificationManager: null,

        // Skip child model creation. Used in test environment.
        skipChildModels: false,

        // Private stuffs
        _virtualStatusEnum: {
            NotCreated: 0,
            NotPublishedYet: 1,
            NoChangeToPublish: 2,
            ChangesToPublish: 3,
            ReadyToPublish: 4,
            ScheduledPublish: 5,
            Published: 6,
            PreviouslyPublished: 7,
            Expired: 8,
            InUse: 9,
            Deleted: 10,
            AwaitingApproval: 11,
            Rejected: 12
        },
        _isSavingHandle: null,
        _virtualStatusCssState: [],
        _virtualStatusLocalization: [],
        _statusIcon: [],

        _statusMap: {},


        postscript: function () {
            //set up resources
            this.res = this.res || res;

            this.inherited(arguments);

            this.inUseNotificationManager = this.inUseNotificationManager || dependency.resolve("epi.cms.contentediting.inUseNotificationManager");

            // build up virtual status state, localization, and icon
            if (this._virtualStatusCssState.length === 0) {
                for (var status in this._virtualStatusEnum) {
                    this._virtualStatusCssState.push(status);
                    this._virtualStatusLocalization.push(this.res["status"][status.toLowerCase()]);
                }

                this._statusMap[ContentActionSupport.versionStatus.CheckedOut] = this._virtualStatusEnum.NotPublishedYet;
                this._statusMap[ContentActionSupport.versionStatus.CheckedIn] = this._virtualStatusEnum.ReadyToPublish;
                this._statusMap[ContentActionSupport.versionStatus.Rejected] = this._virtualStatusEnum.Rejected;
                this._statusMap[ContentActionSupport.versionStatus.DelayedPublish] = this._virtualStatusEnum.ScheduledPublish;
                this._statusMap[ContentActionSupport.versionStatus.Published] = this._virtualStatusEnum.Published;
                this._statusMap[ContentActionSupport.versionStatus.PreviouslyPublished] = this._virtualStatusEnum.PreviouslyPublished;
                this._statusMap[ContentActionSupport.versionStatus.Expired] = this._virtualStatusEnum.Expired;
                this._statusMap[ContentActionSupport.versionStatus.AwaitingApproval] = this._virtualStatusEnum.AwaitingApproval;

                this._statusIcon[ContentActionSupport.versionStatus.DelayedPublish] = "epi-iconClock";
                this._statusIcon[ContentActionSupport.versionStatus.Rejected] = "epi-icon--inverted epi-iconStop";
                this._statusIcon[ContentActionSupport.versionStatus.AwaitingApproval] = "epi-icon--inverted epi-iconGlasses";
            }

            //create child models
            if (!this.skipChildModels) {
                this.publishMenuViewModel = new PublishMenuViewModel({
                    inUseNotificationManager: this.inUseNotificationManager
                });
            }
        },

        destroy: function () {
            if (this.publishMenuViewModel) {
                this.publishMenuViewModel.destroy();
            }
            if (this._isSavingHandle) {
                this._isSavingHandle.unwatch();
            }
            this.inherited(arguments);
        },

        _dataModelSetter: function (value) {
            this.inherited(arguments);
            if (this.publishMenuViewModel) {
                this.publishMenuViewModel.set("dataModel", value);
            }
        },

        onDataModelChange: function () {
            // summary:
            //      Set properties when the data model is changed
            //
            // tags:
            //      internal

            var contentData = this.dataModel.contentData;

            if (this._isChangingContentStatusHandle) {
                this._isChangingContentStatusHandle.unwatch();
            }

            this._isChangingContentStatusHandle = this.dataModel.watch("isSaving", function (name, oldValue, value) {
                if (value) {
                    this.set("statusText", "");
                } else {
                    this._refresh(value);
                }
            }.bind(this));

            this._refresh((!this.dataModel.hasErrors && this.dataModel.hasPendingChanges) || this.dataModel.isSaving);

            if (contentData.isDeleted) {
                this.set("statusIcon", "");
                this.set("nonEditableIndicator", true);
            } else {
                this.set("statusIcon", this._getStatusIcon(contentData));

                var contentEditable = this.dataModel.canChangeContent(ContentActionSupport.action.Edit);
                var awaitingApproval = contentData.status === ContentActionSupport.versionStatus.AwaitingApproval;

                //Remove the none editable icon when awaiting approval.
                this.set("nonEditableIndicator", !contentEditable && !awaitingApproval);
            }

            this.set("visible", !contentData.isWastebasket);
        },

        _refresh: function (isSaving) {
            if (isSaving) {
                return;
            }

            var contentData = this.dataModel.contentData;
            var virtualStatus = this._getVirtualStatus(contentData);

            this.set("additionalClass", this._getVirtualStatus(contentData) === this._virtualStatusEnum.ChangesToPublish ? "animated8 shake" : "");
            this.set("state", this._virtualStatusCssState[virtualStatus]);
            this.set("statusText", this._getStatusText(virtualStatus, contentData));
            this.set("buttonText", this._getButtonText(virtualStatus, contentData));
        },

        _getStatusText: function (virtualStatus, contentData) {
            if (virtualStatus === this._virtualStatusEnum.Deleted) {
                // If the content is deleted, always set the same status text regardless of
                // the actual contentData.status
                return this._virtualStatusLocalization[virtualStatus];

            }

            if (contentData.status === ContentActionSupport.versionStatus.DelayedPublish) {
                return dojoString.substitute(this._virtualStatusLocalization[virtualStatus],
                    [datetime.toUserFriendlyHtml(contentData.properties.iversionable_startpublish)]);
            }

            if (virtualStatus === this._virtualStatusEnum.InUse) {
                var userList = this.inUseNotificationManager.getOtherUsersInUseNotifications(contentData.inUseNotifications);
                userList = userList.map(function (item) {
                    return entities.encode(item);
                }).join(",");
                return dojoString.substitute(this._virtualStatusLocalization[virtualStatus], [userList]);
            }

            if (contentData.status === ContentActionSupport.versionStatus.AwaitingApproval) {
                if (this._canApproveCurrentStep()) {
                    return this.res.awaitingyourapproval.label;
                }
                return this.res.currentlyinreview.label;
            }

            return this._virtualStatusLocalization[virtualStatus];
        },

        _getStatusIcon: function (contentData) {
            if (this._isRejected()) {
                return "";
            }

            return this._statusIcon[contentData.status] || "";
        },

        _getButtonText: function (virtualStatus, contentData) {
            if ((virtualStatus === this._virtualStatusEnum.NotPublishedYet ||
                virtualStatus === this._virtualStatusEnum.ChangesToPublish ||
                virtualStatus === this._virtualStatusEnum.ReadyToPublish) &&
                this.dataModel.canChangeContent(ContentActionSupport.action.Publish)) {

                return this.res.buttonlabel.publish;
            } else if (this._shouldShowApprovalButton(virtualStatus)) {
                return this.res.awaitingyourapproval.button;
            } else {
                return this.res.buttonlabel.option;
            }
        },

        _shouldShowApprovalButton: function (virtualStatus) {
            return virtualStatus === this._virtualStatusEnum.AwaitingApproval &&
                this._isContentInCurrentLanguage() &&
                this._canApproveCurrentStep();
        },

        _isContentInCurrentLanguage: function () {
            var contentData = this.dataModel.contentData;
            if (contentData && contentData.capabilities && !contentData.capabilities.language) {
                return true;
            }

            if (!this.dataModel.languageContext) {
                return false;
            }

            var currentEditingLanguage = this.dataModel.currentContentLanguage;
            var contentVersionLanguage = this.dataModel.languageContext.language;
            return currentEditingLanguage === contentVersionLanguage;
        },

        _getVirtualStatus: function (contentData) {
            if (contentData.isDeleted) {
                return this._virtualStatusEnum.Deleted;
            }

            var ignoreFlag, originallyEditable, hasInUseNotificationWarning;

            // Temporarily ignore inuse notification warning to check original editable status
            ignoreFlag = this.inUseNotificationManager.ignoreOthersNotifications;
            this.inUseNotificationManager.ignoreOthersNotifications = true;
            originallyEditable = this.dataModel.canChangeContent();
            this.inUseNotificationManager.ignoreOthersNotifications = ignoreFlag;

            hasInUseNotificationWarning = this.inUseNotificationManager.hasInUseNotificationWarning(contentData.inUseNotifications);

            if (hasInUseNotificationWarning && originallyEditable) {
                return this._virtualStatusEnum.InUse;
            }

            if (contentData.isCommonDraft) {
                if (contentData.status === ContentActionSupport.versionStatus.Published) {
                    return this._virtualStatusEnum.NoChangeToPublish;
                }
                if (contentData.status === ContentActionSupport.versionStatus.CheckedOut) {
                    return contentData.isMasterVersion ? this._virtualStatusEnum.NotPublishedYet : this._virtualStatusEnum.ChangesToPublish;
                }
            }

            // when no approvals then Rejected content should be shown as NotPublishedYet
            if (this._isRejected()) {
                return this._virtualStatusEnum.NotPublishedYet;
            }

            return this._statusMap[contentData.status];
        },

        _isRejected: function () {
            // when no approvals then Rejected content should be shown as NotPublishedYet
            return !this._canTransitionTo("readyforreview") && this._canTransitionTo("readytopublish");
        },

        _canApproveCurrentStep: function () {
            return this._canTransitionTo("approvechanges");
        },

        _canTransitionTo: function (transition) {
            return this.dataModel.contentData.transitions.some(function (item) {
                return item.name === transition;
            });
        }
    });
});
