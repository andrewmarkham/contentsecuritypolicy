define("epi-cms/contentediting/InUseNotificationManager", [
// Dojo
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/when",
    "dojo/date",
    "dojo/aspect",

    //EPi
    "epi",
    "epi/username",
    "epi/dependency",
    "epi-cms/ApplicationSettings",
    "epi-cms/core/ContentReference",

    // Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.permanenteditindication"
],

function (
// Dojo
    lang,
    array,
    declare,
    when,
    dojoDate,
    aspect,

    //EPi
    epi,
    username,
    dependency,
    ApplicationSettings,
    ContentReference,

    // Resources
    res
) {

    return declare([], {
        // summary:
        //    Helper class to work with in use notifications.
        // tags:
        //    internal

        contextTypeName: "",

        _postFlag: false,

        _inUseNotificationStore: null,

        _currentUsername: null,

        _messageService: null,

        currentModel: null,

        _eventHandlers: null,

        // ignoreOthersNotifications: Boolean
        //      Set to true will make the getOtherUsersInUseNotifications return nothing.
        ignoreOthersNotifications: null,

        constructor: function (params) {
            // summary:
            //	    Creates a new in use notification manager.
            // tags:
            //      public

            this.inherited(arguments);

            lang.mixin(this, params);

            this._inUseNotificationStore = this.store || dependency.resolve("epi.storeregistry").get("epi.cms.inusenotification");
            this._currentUsername = this.username || ApplicationSettings.userName;
            this._messageService = this.messageService || dependency.resolve("epi.shell.MessageService");

            this._eventHandlers = [];
        },

        updateCommandModel: function (model) {
            // summary:
            //	    Creates a new in use notification manager.
            // tags:
            //      public
            this.inherited(arguments);

            // reset ignore flag if the new content is taking over.
            if (this.currentModel &&
                !ContentReference.compareIgnoreVersion(this.currentModel.contentData.contentLink, model.contentData.contentLink)) {
                this.ignoreOthersNotifications = false;
            }

            this.currentModel = model;

            //Disconnect the event handlers for the previous model object.
            array.forEach(this._eventHandlers, function (eventHandler) {
                eventHandler.remove();
            });

            this.updateMessageService(this.currentModel.contentData);

            this._eventHandlers = [
                aspect.after(model, "suspend", lang.hitch(this, this._onViewModelSuspended)),
                aspect.after(model, "destroyed", lang.hitch(this, this._onViewModelSuspended)),
                aspect.after(model, "onPropertyEdited", lang.hitch(this, this._onPropertyEdited)),
                aspect.around(model, "canChangeContent", lang.hitch(this, this._canChangeContentAdvisor))
            ];
        },

        _canChangeContentAdvisor: function (originalMethod) {
            return lang.hitch(this, function () {
                if (!this.ignoreOthersNotifications) {
                    var othersInUseNotifications = this.getOtherUsersInUseNotifications(this.currentModel.contentData.inUseNotifications);
                    if (othersInUseNotifications && othersInUseNotifications.length) {
                        return false;
                    }
                }

                return originalMethod.apply(this.currentModel, arguments);
            });
        },

        _onViewModelSuspended: function () {
            // summary:
            //	    Removed any automatic in use notifications for the suspended model.
            // tags:
            //      private

            var model = this.currentModel.contentData;
            this.removeAutomaticInUseNotification(model);
        },

        _onPropertyEdited: function () {
            // summary:
            //	    Ensures that we have a in use notification for the current view model or creates one.
            // tags:
            //      private

            var model = this.currentModel.contentData;
            this.ensureAutomaticInUseNotification(model);
        },

        ensureAutomaticInUseNotification: function (model) {
            // summary:
            //		Adds a new automatically created notification if the model does not currently have any notifications for the current user.
            // model:
            //      The model to add the notification for.
            // tags:
            //    public

            var existingNotification;
            array.some(model.inUseNotifications, function (item) {
                if (item.userName.toLowerCase() === this._currentUsername.toLowerCase()) {
                    existingNotification = item;
                    return true;
                }
            }, this);

            if (!existingNotification) {
                return this.put(this._createNotification(model, false), model.inUseNotifications);
            } else if (existingNotification.addedManually) {
                //We don't have to update manual notifications.
                return;
            } else {
                var modifiedDate = new Date(existingNotification.modified);
                if (dojoDate.difference(modifiedDate, new Date(), "minute") > 30) {
                    return this.put(existingNotification, model.inUseNotifications);
                }
            }
        },

        removeAutomaticInUseNotification: function (model) {
            // summary:
            //		Removes any automatically creates notifications for the given model.
            // notification:
            //      The model to add the notification for.
            // tags:
            //    public
            array.forEach(model.inUseNotifications, function (item) {
                if (item.userName.toLowerCase() === this._currentUsername.toLowerCase() && !item.addedManually) {
                    this.remove(item, model.inUseNotifications);
                }
            }, this);
        },

        _createNotification: function (model, addedManually) {
            var currentDate = (new Date()).toISOString();
            return {
                contentLink: model.contentLink,
                languageBranch: model.currentLanguageBranch && model.currentLanguageBranch.languageId,
                addedManually: addedManually,
                created: currentDate,
                modified: currentDate
            };
        },

        put: function (notification, inUseNotifications) {
            // summary:
            //		Adds or updates an in use notification object to the specified page.
            // notification:
            //      The notification to save.
            // tags:
            //    public

            //Update the modified date on the client.
            notification.modified = (new Date()).toISOString();

            // Setup flag to ensure that inusenotification post to server until received response.
            if (!this._postFlag) {
                this._postFlag = true;

                return when(this._inUseNotificationStore.put(notification), lang.hitch(this, function (newNotification) {
                    var indexOfItem;
                    var hasIndex = array.some(inUseNotifications, function (item, index) {
                        if (newNotification.id === item.id) {
                            indexOfItem = index;
                            return true;
                        }
                        return false;
                    });
                    if (hasIndex && indexOfItem >= 0) {
                        inUseNotifications[indexOfItem] = newNotification;
                    } else {
                        inUseNotifications.push(newNotification);
                    }
                    this._updateDependentStores(notification.contentLink, inUseNotifications);
                    this._postFlag = false;
                }));
            }
        },

        remove: function (notification, inUseNotifications) {
            // summary:
            //		Deletes a notification.
            // inUseNotifications:
            //      The list of current notifications.
            // sync: boolean
            //      A boolean to determine if the XHR call should be synchronous or asynchronous. True will cause the browser to stop the chain of execution until the data is returned
            // tags:
            //		public

            return when(this._inUseNotificationStore.remove(notification.id), lang.hitch(this, function () {
                var index = array.indexOf(inUseNotifications, notification);
                inUseNotifications.splice(index, 1);
                this._updateDependentStores(notification.contentLink, inUseNotifications);
            }));
        },

        _updateDependentStores: function (contentLink, inUseNotifications) {
            var patchObject = { contentLink: contentLink, inUseNotifications: inUseNotifications };
            this._inUseNotificationStore.updateDependentStores(patchObject);
        },

        togglePermanentEditIndication: function (model, convertExistingIndication) {
            // summary:
            //      Adds or removes a permanent editing notification.
            // model:
            //      The model object to the notification for.
            // convertExistingIndication:
            //      If the toggle should convert to non permanent indications to/from permanent notifications.
            // tags:
            //		public

            var existingNotification;
            var manualNotificationExists = array.some(model.inUseNotifications, function (item) {
                if (item.userName.toLowerCase() === this._currentUsername.toLowerCase()) {
                    existingNotification = item;
                    if (item.addedManually) {
                        return true;
                    }
                }
            }, this);

            if (manualNotificationExists) {
                if (convertExistingIndication && existingNotification.convertedFromAutomaticNotification) {
                    existingNotification.addedManually = false;
                    return this.put(existingNotification, model.inUseNotifications);
                } else {
                    return this.remove(existingNotification, model.inUseNotifications);
                }
            } else {
                if (existingNotification && convertExistingIndication) {
                    existingNotification.convertedFromAutomaticNotification = true;
                    existingNotification.addedManually = true;
                } else {
                    existingNotification = this._createNotification(model, true);
                }
                return this.put(existingNotification, model.inUseNotifications);
            }
        },

        updateMessageService: function (model) {
            // summary:
            //    Removes any displaying page lock notification, and displays a new notification message when manual lock has been turned on.
            // inUseNotifications: array
            //    The in use notifications for the current object.
            // tags:
            //    private

            var itemKey = model.contentLink + "_permanentEdit";
            this._messageService.remove({ externalItemId: itemKey });
            var notification = this._getManualInUseNotification(model.inUseNotifications);
            if (notification) {
                this._notificationHandlerId = this._messageService.put("note", res.permanenteditison, this.contextTypeName, model.contentLink, itemKey, null);
            }
        },

        _getManualInUseNotification: function (inUseNotifications) {
            var manualIndication;
            array.forEach(inUseNotifications, function (item) {
                if (item.userName.toLowerCase() === this._currentUsername.toLowerCase() && item.addedManually) {
                    manualIndication = item;
                }
            }, this);
            return manualIndication;
        },

        currentUserHasInUseNotification: function (inUseNotifications, onlyCheckManual) {
            return array.some(inUseNotifications, function (item) {
                return item.userName.toLowerCase() === this._currentUsername.toLowerCase()
                    && (!onlyCheckManual || item.addedManually);
            }, this);
        },

        getOtherUsersInUseNotifications: function (inUseNotifications) {
            // summary
            //      Return list of users rather than the current user who have in use notification on the given list.

            var result = [];

            array.forEach(inUseNotifications, function (item) {
                if (item.userName.toLowerCase() !== this._currentUsername.toLowerCase()) {
                    var userName = username.toUserFriendlyString(item.userName, this._currentUsername);
                    result.push(userName);
                }
            }, this);

            return result;
        },

        hasInUseNotificationWarning: function (inUseNotifications) {
            if (this.ignoreOthersNotifications) {
                return false;
            }

            return this.getOtherUsersInUseNotifications(inUseNotifications).length;
        }
    });
});
