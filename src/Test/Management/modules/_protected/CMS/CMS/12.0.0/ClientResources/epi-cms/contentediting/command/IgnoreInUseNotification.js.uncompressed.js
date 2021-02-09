define("epi-cms/contentediting/command/IgnoreInUseNotification", [
    "dojo/_base/declare",
    "dojo/topic",
    "epi/dependency",
    "epi/shell/command/_Command",

    //Resources
    "epi/i18n!epi/cms/nls/episerver.cms.contentediting.toolbar.buttons"
],

function (declare, topic, dependency, _Command, resource) {

    return declare([_Command], {
        // summary:
        //      Ignore in use notification and edit.
        //
        // tags:
        //      internal

        name: "IgnoreInUseNotification",
        label: resource.ignoreinusenotification.label,
        tooltip: resource.ignoreinusenotification.title,
        iconClass: "epi-iconPen",

        inUseNotificationManager: null,

        postscript: function () {
            this.inherited(arguments);

            if (this.inUseNotificationManager === null) {
                this.inUseNotificationManager = dependency.resolve("epi.cms.contentediting.inUseNotificationManager");
            }

            this.set("canExecute", true);
            this.set("isAvailable", true);
        },

        _execute: function () {
            // summary:
            //		Toggles permanent editing indication on/off.
            // tags:
            //		protected

            this.inUseNotificationManager.ignoreOthersNotifications = true;

            // reset view name to have the PageDataController load the correct view.
            this.model.viewName = null;

            this._requestContextChange(this.model.contentData.uri, true);
        },

        _onModelChange: function () {
            // summary:
            //		Updates canExecute and isAvailable after the model has been updated.
            // tags:
            //		protected

            var contentData = this.model.contentData,
                hasInUseNotificationWarning = this.inUseNotificationManager.hasInUseNotificationWarning(contentData.inUseNotifications),
                ignoreFlag,
                originallyEditable;

            // Temporarily ignore inuse notification warning to check original editable status
            ignoreFlag = this.inUseNotificationManager.ignoreOthersNotifications;
            this.inUseNotificationManager.ignoreOthersNotifications = true;
            originallyEditable = this.model.canChangeContent();
            this.inUseNotificationManager.ignoreOthersNotifications = ignoreFlag;

            // Available when the content is originally editable but is locked by notification warning
            this.set("isAvailable", hasInUseNotificationWarning && originallyEditable);
        },

        _requestContextChange: function (uri, forceContextChange) {
            var contextParameters = { uri: uri };
            var callerData = {
                sender: this,
                forceContextChange: forceContextChange
            };

            topic.publish("/epi/shell/context/request", contextParameters, callerData);
        }
    });
});
