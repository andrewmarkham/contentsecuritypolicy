define("epi-cms/contentediting/ExpirationNotification", [
// dojo
    "dojo/_base/declare",
    "dojo/Stateful",

    "dojo/string",
    // epi
    "epi/datetime",
    "epi/dependency",

    "epi-cms/ApplicationSettings",

    "epi/i18n!epi/cms/nls/episerver.cms.widget.expirationeditor",
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.versionstatus"
],

function (
// dojo
    declare,
    Stateful,

    string,
    // epi
    epiDatetime,
    dependency,

    ApplicationSettings,

    expirationeditorResources,
    versionstatusResources
) {

    return declare([Stateful], {
        // summary:
        //      Provides notifications for content that has an expiration set.
        // tags:
        //      internal

        // order: [public] Number
        //      Sort order of notification
        order: 60,

        postscript: function () {
            this.inherited(arguments);

            this._notificationPeriod = ApplicationSettings.expirationNotificationPeriod;

            this._setupCommands();
        },

        _valueSetter: function (/*Object*/context) {
            // summary:
            //      Updates the notification when the property changes.
            // tags:
            //      private

            var expireBlock = context.contentData.properties.iversionable_expire;

            this._updateNotification(expireBlock);

        },

        _updateNotification: function (expireBlock) {
            var serverTime = epiDatetime.serverTime();

            var stopPublish = expireBlock ? expireBlock.stopPublish : null,
                expiration = new Date(stopPublish);

            var text = null;
            if (stopPublish && epiDatetime.isDateValid(expiration)) {
                if (new Date(serverTime.getTime() + this._notificationPeriod * 1000) > expiration) {
                    text = expiration < serverTime
                        ? versionstatusResources.expired
                        : string.substitute(expirationeditorResources.expiretimetext, [epiDatetime.timeToGo(expiration)]);
                }
            }
            if (!text) {
                this.set("notification", null); //clear notification
            } else {
                this.set("notification", { content: text, commands: [this._editingCommands.manageExpiration] });
            }
        },

        _viewModelValueHandler: null,

        _setupCommands: function () {
            if (!this._editingCommands) {
                this._editingCommands = dependency.resolve("epi.cms.contentEditing.command.Editing");
            }

            if (this._commandsWatchHandler) {
                this._commandsWatchHandler.unwatch();
            }

            var self = this;
            self._commandsWatchHandler = this._editingCommands.manageExpiration.watch("viewModel", function (name, oldViewModel, viewModel) {

                // remove the old observer
                if (self._viewModelValueHandler) {
                    self._viewModelValueHandler.unwatch();
                }

                self._viewModelValueHandler = viewModel.watch("value", function (name, oldValue, value) {
                    self._updateNotification(value);
                });
            });
        }

    });

});
